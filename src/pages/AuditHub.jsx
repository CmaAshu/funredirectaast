import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import { auditData } from '../data/audit_data.js'

const SECTIONS = ['All', 'Company Audit', 'Basic Concepts', 'Special Audits']

const SECTION_META = {
  'Company Audit':  { icon:'fa-building-columns', color:'text-blue-600',   bg:'bg-blue-50',   border:'border-blue-200',   grad:'from-blue-500 to-cyan-400'    },
  'Basic Concepts': { icon:'fa-book-open',         color:'text-violet-600', bg:'bg-violet-50', border:'border-violet-200', grad:'from-violet-500 to-purple-400' },
  'Special Audits': { icon:'fa-star',              color:'text-amber-600',  bg:'bg-amber-50',  border:'border-amber-200',  grad:'from-amber-500 to-orange-400'  },
}

const PROGRESS_KEY = 'prepogy_audit_progress_v1'
function loadProgress() { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}') } catch { return {} } }
function saveProgress(p) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)) } catch {} }

// ─── Extract colored block segments from rendered HTML ────────────
async function getColoredBlocks(html) {
  const host = document.createElement('div')
  // Apply base Tailwind/site styles by mounting in real DOM
  host.style.cssText = 'position:fixed;left:-9999px;top:0;width:720px;visibility:hidden;font-family:Poppins,Inter,system-ui,sans-serif;font-size:14px;color:#334155'
  host.innerHTML = html
  document.body.appendChild(host)
  // Wait one frame for styles to compute
  await new Promise(r => requestAnimationFrame(r))

  const blocks = []

  function walk(node, inheritColor, inheritWeight) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.replace(/\s+/g, ' ')
      if (t.trim()) blocks.push({ text: t, color: inheritColor, bold: parseInt(inheritWeight) >= 600 })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const cs  = window.getComputedStyle(node)
    const col = cs.color && cs.color !== 'rgba(0, 0, 0, 0)' ? cs.color : inheritColor
    const wt  = cs.fontWeight || inheritWeight
    const tag = node.tagName.toLowerCase()

    if (['p','h1','h2','h3','h4','h5','h6','li','div'].includes(tag) && blocks.length > 0) {
      blocks.push({ newline: true })
    }
    if (tag === 'li') blocks.push({ text: '• ', color: col, bold: false })

    for (const child of node.childNodes) walk(child, col, wt)

    if (['p','h1','h2','h3','h4','h5','h6','li','div'].includes(tag)) {
      blocks.push({ newline: true })
    }
  }

  for (const child of host.childNodes) walk(child, 'rgb(51,65,85)', '400')
  document.body.removeChild(host)
  return blocks
}

// ─── Load Poppins via FontFace API ────────────────────────────────
async function ensurePoppins() {
  if (document.fonts.check('bold 16px Poppins')) return
  const weights = [
    { w: '400', url: 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2' },
    { w: '600', url: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2' },
    { w: '800', url: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1xlFQ.woff2' },
  ]
  await Promise.all(weights.map(async ({ w, url }) => {
    try { const f = new FontFace('Poppins', `url(${url})`, { weight: w }); document.fonts.add(await f.load()) } catch {}
  }))
  await document.fonts.ready
}

// ─── Wrap a single run of text, returns array of lines ────────────
function wrapRun(ctx, text, maxW) {
  const words = text.split(' ')
  const lines = []; let cur = ''
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

// ─── Rounded rect helper ──────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
}

// ─── Main download function ───────────────────────────────────────
async function downloadQuestionImage(item) {
  await ensurePoppins()

  const DPR   = 2
  const W     = 800
  const PAD   = 36
  const INNER = W - PAD * 2
  const LH_A  = 22   // answer line height
  const LH_Q  = 27   // question line height

  const SEC_COLORS = {
    'Company Audit':  { pill:'#dbeafe', text:'#1d4ed8' },
    'Basic Concepts': { pill:'#ede9fe', text:'#6d28d9' },
    'Special Audits': { pill:'#fef3c7', text:'#b45309' },
  }
  const sc = SEC_COLORS[item.section] || { pill:'#e0e7ff', text:'#4f46e5' }

  // ── Step 1: extract coloured segments from rendered HTML ──
  const rawBlocks = await getColoredBlocks(item.answer)

  // ── Step 2: measure on scratch canvas ──
  const scratch = document.createElement('canvas')
  scratch.width  = W * DPR; scratch.height = 10
  const sctx = scratch.getContext('2d'); sctx.scale(DPR, DPR)

  // Question lines
  sctx.font = '800 17px Poppins, Inter, system-ui, sans-serif'
  const qLines = wrapRun(sctx, item.question, INNER)

  // Answer: convert blocks → display lines [{text, color, bold}]
  const ansLines = []
  let curLine = []
  let curX    = 0

  const flush = () => {
    if (curLine.length) ansLines.push(curLine)
    curLine = []; curX = 0
  }

  for (const blk of rawBlocks) {
    if (blk.newline) { flush(); continue }
    const font = blk.bold
      ? '700 13.5px Poppins, Inter, system-ui, sans-serif'
      : '400 13.5px Poppins, Inter, system-ui, sans-serif'
    sctx.font = font

    const words = blk.text.split(' ')
    for (const word of words) {
      if (!word) continue
      const ww = sctx.measureText(word + ' ').width
      if (curX + ww > INNER && curLine.length) { flush() }
      curLine.push({ word: word + ' ', color: blk.color, bold: blk.bold, font })
      curX += ww
    }
  }
  flush()

  // ── Step 3: calc total height ──
  const TOPBAR   = 6
  const HEADER_H = 52
  const PILLS_H  = 38
  const Q_H      = 18 + qLines.length * LH_Q + 8
  const DIV_H    = 32
  const A_LAB_H  = 28
  const A_BODY_H = ansLines.length * LH_A + 16
  const FOOTER_H = 44

  const H = TOPBAR + HEADER_H + PILLS_H + Q_H + DIV_H + A_LAB_H + A_BODY_H + FOOTER_H

  // ── Step 4: draw on real canvas ──
  const canvas = document.createElement('canvas')
  canvas.width  = W * DPR; canvas.height = H * DPR
  const ctx = canvas.getContext('2d'); ctx.scale(DPR, DPR)

  // Background
  ctx.fillStyle = '#f8faff'; ctx.fillRect(0, 0, W, H)
  roundRect(ctx, 0, TOPBAR, W, H - TOPBAR, 0, '#ffffff')

  // Top gradient bar
  const barG = ctx.createLinearGradient(0, 0, W, 0)
  barG.addColorStop(0, '#6366f1'); barG.addColorStop(1, '#a855f7')
  ctx.fillStyle = barG; ctx.fillRect(0, 0, W, TOPBAR)

  // ── Centre orange watermark ──
  ctx.save()
  ctx.translate(W / 2, H / 2); ctx.rotate(-35 * Math.PI / 180)
  ctx.font = '900 66px Poppins, Inter, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(249,115,22,0.07)'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('PREPOGY.IN', 0, 0)
  ctx.restore()

  let y = TOPBAR + 18

  // Header row
  ctx.font = '800 13px Poppins, Inter, system-ui, sans-serif'
  ctx.fillStyle = '#6366f1'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  ctx.fillText('Prepogy · Audit Revision Hub', PAD, y + 14)

  // ── Top-right black watermark ──
  ctx.save()
  ctx.font = '700 12px Poppins, Inter, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(0,0,0,0.60)'; ctx.textAlign = 'right'
  ctx.fillText('prepogy.in', W - PAD, y + 14)
  ctx.restore()

  y += HEADER_H - 18 + 4

  // Section + Topic pills
  const pillH = 22; ctx.font = '700 11px Poppins, Inter, system-ui, sans-serif'
  const secW = ctx.measureText(item.section).width + 22
  roundRect(ctx, PAD, y, secW, pillH, 6, sc.pill)
  ctx.fillStyle = sc.text; ctx.textAlign = 'left'
  ctx.fillText(item.section, PAD + 11, y + pillH - 7)

  const topicX = PAD + secW + 8
  const topicW = ctx.measureText(item.topic).width + 22
  roundRect(ctx, topicX, y, topicW, pillH, 6, '#f1f5f9')
  ctx.fillStyle = '#64748b'
  ctx.fillText(item.topic, topicX + 11, y + pillH - 7)

  y += PILLS_H

  // Question label + text
  ctx.font = '700 10px Poppins, Inter, system-ui, sans-serif'
  ctx.fillStyle = '#94a3b8'; ctx.fillText('QUESTION', PAD, y); y += 18
  ctx.font = '800 16px Poppins, Inter, system-ui, sans-serif'
  ctx.fillStyle = '#0f172a'
  for (const line of qLines) { ctx.fillText(line, PAD, y + 18); y += LH_Q }
  y += 8

  // Divider
  y += 10
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
  y += 20

  // Answer label
  roundRect(ctx, PAD, y + 2, 3, 15, 2, '#6366f1')
  ctx.font = '700 10px Poppins, Inter, system-ui, sans-serif'
  ctx.fillStyle = '#6366f1'; ctx.textAlign = 'left'
  ctx.fillText('ANSWER', PAD + 10, y + 13); y += A_LAB_H

  // Answer body — word by word with correct colour
  for (const lineSegs of ansLines) {
    let xPos = PAD + 6
    for (const seg of lineSegs) {
      ctx.font = seg.font
      ctx.fillStyle = seg.color
      ctx.textAlign = 'left'
      ctx.fillText(seg.word, xPos, y)
      xPos += ctx.measureText(seg.word).width
    }
    y += LH_A
  }
  y += 12

  // Footer
  ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
  y += 14

  ctx.font = '600 11px Poppins, Inter, system-ui, sans-serif'
  ctx.fillStyle = '#0f172a'; ctx.textAlign = 'left'
  ctx.fillText('prepogy.in', PAD, y + 14)
  ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'right'
  ctx.fillText('Free CMA MCQ Quiz & Revision Hub', W - PAD, y + 14)

  // ── Download via Blob ──
  canvas.toBlob(blob => {
    if (!blob) return
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `prepogy-audit-q${item.id}-${item.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, 'image/png')
}

// ─── Topic Sidebar ───────────────────────────────────────────────
function TopicSidebar({ items, activeId, onSelect, onClose, isMobile }) {
  const sections = ['Company Audit','Basic Concepts','Special Audits']
  const grouped  = sections.reduce((acc, s) => {
    acc[s] = items.filter(i => i.section === s)
    return acc
  }, {})

  const content = (
    <nav className="h-full overflow-y-auto scrollbar-hide" aria-label="Topic navigation">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Topics</span>
        {isMobile && (
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
            <i className="fas fa-times text-xs" />
          </button>
        )}
      </div>
      <div className="p-3 space-y-4">
        {sections.map(sec => {
          const m    = SECTION_META[sec]
          const list = grouped[sec] || []
          if (!list.length) return null
          return (
            <div key={sec}>
              <div className={`flex items-center gap-2 px-2 py-1.5 rounded-xl mb-1 ${m.bg}`}>
                <i className={`fas ${m.icon} ${m.color} text-xs`} />
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${m.color}`}>{sec}</span>
              </div>
              <ul className="space-y-0.5">
                {list.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => { onSelect(item.id); if (isMobile) onClose() }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-medium transition-all truncate ${
                        activeId === item.id
                          ? 'bg-primary text-white font-bold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                      }`}
                      title={item.topic}
                    >
                      {item.topic}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </nav>
  )

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-72 h-full bg-white shadow-2xl animate-slide-in-left flex flex-col">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-4 w-56 shrink-0 bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden self-start max-h-[calc(100vh-2rem)]">
      {content}
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────
export default function AuditHub() {
  const navigate   = useNavigate()
  const [section,  setSection]  = useState('All')
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState(null)
  const [progress, setProgress] = useState(loadProgress)
  const [showDone, setShowDone] = useState(false)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [extraQuestions, setExtraQuestions] = useState([])
  const itemRefs  = useRef({})
  const searchRef = useRef(null)

  // Load admin-added questions from Firestore and merge after built-in data
  useEffect(() => {
    getDocs(query(collection(db, 'auditQuestions'), orderBy('createdAt', 'asc')))
      .then(snap => {
        const extra = snap.docs.map((d, i) => ({
          id: 1000 + i,          // non-colliding numeric id
          firestoreId: d.id,
          ...d.data(),
        }))
        setExtraQuestions(extra)
      })
      .catch(() => {})           // silent – built-in data always shows
  }, [])

  // Merged dataset: built-in first, Firestore additions appended
  const allQuestions = useMemo(() => [...auditData, ...extraQuestions], [extraQuestions])

  const filtered = useMemo(() => {
    let items = allQuestions
    if (section !== 'All') items = items.filter(i => i.section === section)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(i =>
        i.question.toLowerCase().includes(q) ||
        i.topic.toLowerCase().includes(q)    ||
        i.section.toLowerCase().includes(q)
      )
    }
    if (showDone) items = items.filter(i => !progress[i.id])
    return items
  }, [section, search, showDone, progress])

  const doneCount  = Object.values(progress).filter(Boolean).length
  const totalCount = allQuestions.length
  const pct        = Math.round((doneCount / totalCount) * 100)

  const markDone = (id) => {
    setProgress(prev => {
      const next = { ...prev, [id]: !prev[id] }
      saveProgress(next)
      return next
    })
  }

  const resetProgress = () => {
    if (!window.confirm('Reset all progress? This cannot be undone.')) return
    saveProgress({}); setProgress({})
  }

  const handleTopicSelect = useCallback((id) => {
    setActiveTopicId(id)
    setExpanded(id)
    // Make sure it's visible by clearing filters if needed
    const item = allQuestions.find(i => i.id === id)
    if (item) {
      if (section !== 'All' && section !== item.section) setSection('All')
      setSearch('')
      setShowDone(false)
    }
    setTimeout(() => {
      const el = itemRefs.current[id]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }, [section])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') { setExpanded(null); setMobileSidebar(false) } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <>
      <Helmet>
        <title>CMA Inter Audit Revision Hub – 51 Important Questions | Prepogy</title>
        <meta name="description" content="Free CMA Intermediate Audit Revision Hub. Practice 51 important questions on Company Audit, Cost Audit and Special Audits. Track your progress with the interactive study tool." />
        <meta name="keywords" content="CMA inter audit important questions, CMA audit revision, company audit CMA, cost audit important questions, ICMAI audit questions 2022" />
        <link rel="canonical" href="https://prepogy.in/audit" />
        <meta property="og:title" content="CMA Audit Revision Hub – 51 Important Questions | Prepogy" />
        <meta property="og:description" content="Interactive CMA Audit revision tool. Practice, track progress, and master 51 key questions." />
        <meta property="og:url" content="https://prepogy.in/audit" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
      </Helmet>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <TopicSidebar
          items={allQuestions}
          activeId={activeTopicId}
          onSelect={handleTopicSelect}
          onClose={() => setMobileSidebar(false)}
          isMobile={true}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 pb-28">
        {/* Back */}
        <div className="pt-4 mb-6">
          <button onClick={() => navigate('/intermediate/group2')}
            className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
            <i className="fas fa-arrow-left" /> Back to Group 2
          </button>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 rounded-[32px] p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[10rem] opacity-5 font-black leading-none select-none">📋</div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <i className="fas fa-star text-yellow-300" /> CMA Inter · Paper 10
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">Audit Revision Hub</h1>
            <p className="text-blue-100 text-sm font-medium mb-6">51 Important Questions · Company Audit · Special Audits</p>
            <div className="bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-700"
                style={{ width:`${pct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-blue-100">
              <span>{doneCount} of {totalCount} completed</span>
              <span className="font-extrabold text-white">{pct}%</span>
            </div>
          </div>
        </div>

        {/* Main layout: sidebar + content */}
        <div className="flex gap-6 items-start">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <TopicSidebar
              items={allQuestions}
              activeId={activeTopicId}
              onSelect={handleTopicSelect}
              onClose={() => {}}
              isMobile={false}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 mb-6 space-y-3">
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search questions or topics…"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-primary transition-colors" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {SECTIONS.map(s => (
                  <button key={s} onClick={() => setSection(s)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${section===s ? 'bg-primary text-white border-primary shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary hover:text-primary'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer select-none">
                  <div onClick={() => setShowDone(v => !v)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${showDone ? 'bg-primary' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showDone ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  Hide completed
                </label>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{filtered.length} question{filtered.length!==1?'s':''}</span>
                  {doneCount > 0 && (
                    <button onClick={resetProgress} className="text-red-400 hover:text-red-500 font-semibold">
                      <i className="fas fa-rotate-left mr-1" />Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {['Company Audit','Basic Concepts','Special Audits'].map(sec => {
                const m    = SECTION_META[sec]
                const all  = allQuestions.filter(i => i.section===sec)
                const done = all.filter(i => progress[i.id]).length
                return (
                  <button key={sec} onClick={() => setSection(sec===section ? 'All' : sec)}
                    className={`rounded-2xl border p-3 text-center transition-all hover:-translate-y-0.5 ${section===sec ? `${m.bg} ${m.border}` : 'bg-white border-slate-100'}`}>
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center mx-auto mb-1 shadow-sm`}>
                      <i className={`fas ${m.icon} text-white text-xs`} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 leading-tight">{sec}</p>
                    <p className={`text-xs font-extrabold mt-0.5 ${m.color}`}>{done}/{all.length}</p>
                  </button>
                )
              })}
            </div>

            {/* Question list */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-search text-4xl mb-4 block opacity-30" />
                <p className="font-semibold">No questions found</p>
                <button onClick={() => { setSearch(''); setSection('All') }} className="mt-3 text-primary text-sm font-bold hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(item => {
                  const m      = SECTION_META[item.section] || {}
                  const isOpen = expanded === item.id
                  const isDone = !!progress[item.id]
                  const isActive = activeTopicId === item.id

                  return (
                    <div
                      key={item.id}
                      ref={el => { if (el) itemRefs.current[item.id] = el }}
                      className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md
                        ${isDone   ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'}
                        ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                    >
                      {/* Header */}
                      <div className="p-5 cursor-pointer" onClick={() => setExpanded(isOpen ? null : item.id)}>
                        <div className="flex items-start gap-3">
                          <button onClick={e => { e.stopPropagation(); markDone(item.id) }}
                            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'}`}
                            title={isDone ? 'Mark as not done' : 'Mark as done'}>
                            {isDone && <i className="fas fa-check text-white text-[9px]" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${m.bg||'bg-slate-50'} ${m.color||'text-slate-500'} ${m.border||'border-slate-200'}`}>
                                {item.section}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                                {item.topic}
                              </span>
                              {item.meta && (
                                <span className="text-[9px] text-slate-400 font-medium italic">{item.meta}</span>
                              )}
                            </div>
                            <p className={`text-sm font-semibold leading-relaxed ${isDone ? 'text-slate-400 line-through decoration-emerald-300' : 'text-slate-700'}`}>
                              {item.question}
                            </p>
                          </div>
                          <i className={`fas fa-chevron-down text-slate-400 text-xs mt-1 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Answer */}
                      {isOpen && (
                        <div className="border-t border-slate-100 px-5 pb-5 pt-4 animate-fade-in-up">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest flex items-center gap-1.5">
                              <i className="fas fa-lightbulb text-yellow-400" /> Answer
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Download button */}
                              <button
                                onClick={() => downloadQuestionImage(item)}
                                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition-all"
                                title="Download as image with watermark"
                              >
                                <i className="fas fa-download" /> Save Image
                              </button>
                              <button onClick={() => markDone(item.id)}
                                className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}>
                                <i className={`fas ${isDone ? 'fa-check-circle' : 'fa-circle'}`} />
                                {isDone ? 'Completed' : 'Mark as Done'}
                              </button>
                            </div>
                          </div>
                          <div
                            className="prose prose-sm max-w-none text-slate-600 leading-relaxed audit-answer"
                            dangerouslySetInnerHTML={{ __html: item.answer }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Footer tip */}
            <div className="mt-10 bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100 rounded-3xl p-5 text-center">
              <i className="fas fa-instagram text-[#E1306C] text-2xl mb-2 block" />
              <p className="text-sm font-bold text-slate-700 mb-1">Get daily Audit tips on Instagram</p>
              <p className="text-xs text-slate-400 mb-3">Follow <strong>@prepogy.in</strong> for revision flashcards, exam updates and study hacks.</p>
              <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white text-xs font-extrabold px-5 py-2.5 rounded-full shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
                style={{ background:'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#bc1888)' }}>
                <i className="fab fa-instagram text-sm" /> Follow @prepogy.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB — topic navigator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <button
          onClick={() => setMobileSidebar(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-extrabold px-6 py-3.5 rounded-full shadow-2xl hover:shadow-violet-400/40 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <i className="fas fa-list-ul text-sm" />
          Topic Navigator
          <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            {allQuestions.length}
          </span>
        </button>
      </div>
    </>
  )
}
