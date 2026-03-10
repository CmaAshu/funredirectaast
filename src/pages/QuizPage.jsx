import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import AuthModal from '../components/AuthModal.jsx'
import Leaderboard, { getLeaderboardDocId } from '../components/Leaderboard.jsx'
import SubjectLeaderboard, { getSubjectDocId } from '../components/SubjectLeaderboard.jsx'
import ReportModal from '../components/ReportModal.jsx'
import { paperRegistry, loadQuizData } from '../data/registry.js'

const performanceQuotes = [
  '⚠️ Help us stay online! Share this link with just one friend today.',
  '🚀 Small acts lead to big impacts. Sharing fuels months of practice for CMAs.',
  "🙏 A Personal Request: We're a tiny team. Your share is our only marketing.",
  '📢 Spread the Word! Recommend us to a peer today.',
  '🆘 We Need You! Please share this platform to keep it free.',
  '🏰 Strong communities share resources. Post this link and strengthen our network.',
]

function parseTableFromText(text) {
  if (!text.includes('|')) return text
  let formatted = text.replace(/<br\s*\/?>/gi, '\n')
  const lines = formatted.split('\n')
  let html = '', inTable = false, buffer = []
  const renderTable = (rows) => {
    if (!rows.length) return ''
    let t = '<div class="custom-table-wrapper"><table class="generated-table">', first = true
    rows.forEach(row => {
      let clean = row, isHeader = false
      if (clean.toLowerCase().startsWith('<b>') && clean.toLowerCase().endsWith('</b>')) {
        clean = clean.substring(3, clean.length - 4); isHeader = true
      } else if (first) isHeader = true
      const cells = clean.split('|')
      if (isHeader && first) {
        t += '<thead><tr>' + cells.map(c => `<th>${c.replace(/<\/?b>/gi,'').trim()}</th>`).join('') + '</tr></thead><tbody>'
      } else {
        t += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
      }
      first = false
    })
    return t + '</tbody></table></div>'
  }
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.includes('|')) { if (!inTable) inTable = true; buffer.push(trimmed) }
    else {
      if (inTable) { html += renderTable(buffer); buffer = []; inTable = false }
      if (trimmed.length > 0) html += `<div class="mb-2">${trimmed}</div>`
    }
  })
  if (inTable) html += renderTable(buffer)
  return html
}

function createConfetti(count = 60) {
  const colors = ['#6366f1','#10b981','#f59e0b','#db2777','#0ea5e9']
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    p.className = 'confetti-particle'
    p.style.left = Math.random() * 100 + 'vw'
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    p.style.animationDelay = Math.random() * 0.5 + 's'
    const size = Math.random() * 8 + 4 + 'px'
    p.style.width = size; p.style.height = size
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
    document.body.appendChild(p)
    setTimeout(() => p.remove(), 3000)
  }
}

export default function QuizPage() {
  const { paperId }       = useParams()
  const [searchParams]    = useSearchParams()
  const navigate          = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const meta              = paperRegistry[paperId]

  // mode: 'mcq' | 'pyq' | 'sjc'
  const mode = searchParams.get('mode') || 'mcq'

  const [quizSets, setQuizSets]     = useState(null)
  const [loadErr, setLoadErr]       = useState(false)
  const [showAuth, setShowAuth]     = useState(false)
  const [currentSetIdx, setSetIdx]  = useState(0)
  const [currentQIdx, setQIdx]      = useState(0)
  const [score, setScore]           = useState({ c: 0, w: 0 })
  const [userAnswers, setAnswers]   = useState([])
  const [attempted, setAttempted]   = useState([])
  const [showResults, setShowRes]   = useState(false)
  const [theme, setThemeState]      = useState('light')
  const [copyFB, setCopyFB]         = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)
  const [lbKey, setLbKey]           = useState(0)
  const [quote]                     = useState(() => performanceQuotes[Math.floor(Math.random() * performanceQuotes.length)])
  const [slideDir, setSlideDir]     = useState('right') // 'right' | 'left'
  const [slideKey, setSlideKey]     = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [showLoginNudge, setShowLoginNudge] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  // Touch / swipe
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const isScrollable = useRef(false)

  // ── Load theme ──
  useEffect(() => {
    const t = localStorage.getItem('quiz-theme') || 'light'
    applyTheme(t)
  }, [])

  // ── Load quiz data based on mode ──
  useEffect(() => {
    if (!meta) return
    setQuizSets(null)
    setLoadErr(false)
    loadQuizData(paperId, mode).then(sets => {
      if (sets) setQuizSets(sets)
      else setLoadErr(true)
    }).catch(() => setLoadErr(true))
  }, [paperId, meta, mode])

  const applyTheme = (t) => {
    setThemeState(t)
    document.documentElement.setAttribute('data-theme', t)
    if (t === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('quiz-theme', t)
  }

  const loadSet = useCallback((idx) => {
    if (!quizSets) return
    setSetIdx(idx)
    setQIdx(0)
    setScore({ c: 0, w: 0 })
    setAnswers(new Array(quizSets[idx].questions.length).fill(null))
    setAttempted(new Array(quizSets[idx].questions.length).fill(false))
    setShowRes(false)
    setScoreSaved(false)
    // No auto-scroll on set change — user controls their position
  }, [quizSets])

  useEffect(() => { if (quizSets) loadSet(0) }, [quizSets, loadSet])

  const saveScore = useCallback(async (finalScore) => {
    if (!user || !quizSets) return
    const total    = quizSets[currentSetIdx].questions.length
    const accuracy = total > 0 ? Math.round((finalScore.c / total) * 100) : 0
    const rankScore = (finalScore.c / total) * 60 + (accuracy / 100) * 40

    // Pull rich profile data
    let photoURL = user.photoURL || ''
    let city = ''
    try {
      const { getDoc: gd, doc: d } = await import('firebase/firestore')
      const profileSnap = await gd(d(db, 'users', user.uid))
      if (profileSnap.exists()) {
        const pd = profileSnap.data()
        photoURL = pd.photoURL || photoURL
        city     = pd.city     || ''
      }
    } catch {}

    const displayName = user.displayName || user.email?.split('@')[0] || 'Anonymous'

    // ── Per-set leaderboard (create-only, no replay) ──
    const setDocId = getLeaderboardDocId(paperId, currentSetIdx)
    const setRef   = doc(db, 'leaderboard', setDocId, 'scores', user.uid)
    const existing = await getDoc(setRef).catch(() => null)
    if (!existing?.exists()) {
      await setDoc(setRef, {
        displayName, photoURL, city,
        score: finalScore.c, total, accuracy, rankScore,
        timestamp: serverTimestamp(),
      }).catch(console.error)
    }

    // ── Subject leaderboard (accumulate across sets) ──
    try {
      const { doc: fd, getDoc: fget, setDoc: fset } = await import('firebase/firestore')
      const subjDocId = getSubjectDocId(paperId)
      const subjRef   = fd(db, 'leaderboard', subjDocId, 'scores', user.uid)
      const subjSnap  = await fget(subjRef).catch(() => null)

      if (subjSnap?.exists()) {
        const prev = subjSnap.data()
        // Prevent double-counting same set in same week
        const doneSets = prev.doneSets || []
        const setKey   = `${paperId}_${currentSetIdx}`
        if (!doneSets.includes(setKey)) {
          await fset(subjRef, {
            displayName, photoURL, city,
            totalScore:     (prev.totalScore     || 0) + finalScore.c,
            totalAttempted: (prev.totalAttempted || 0) + total,
            setsCount:      (prev.setsCount      || 0) + 1,
            doneSets:       [...doneSets, setKey],
            updatedAt:      serverTimestamp(),
          }, { merge: true })
        }
      } else {
        await fset(subjRef, {
          displayName, photoURL, city,
          totalScore:     finalScore.c,
          totalAttempted: total,
          setsCount:      1,
          doneSets:       [`${paperId}_${currentSetIdx}`],
          updatedAt:      serverTimestamp(),
        })
      }
    } catch (e) { console.error('Subject LB error:', e) }

    setScoreSaved(true)
    setLbKey(k => k + 1)
  }, [user, quizSets, paperId, currentSetIdx])

  // Keyboard shortcuts
  useEffect(() => {
    if (!quizSets || showResults) return
    const handler = (e) => {
      const key = e.key.toLowerCase()
      const map  = { a:0, b:1, c:2, d:3, '1':0, '2':1, '3':2, '4':3 }
      if (key in map) {
        const opts = quizSets[currentSetIdx].questions[currentQIdx].o
        if (opts[map[key]] !== undefined) handleAnswer(opts[map[key]])
      } else if (key === 'enter' || key === 'arrowright') changeQuestion(1)
      else if (key === 'arrowleft') changeQuestion(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  // ── Auth loading ──
  if (authLoading) return (
    <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
      <i className="fas fa-spinner fa-spin text-2xl" /> Loading...
    </div>
  )

  if (!meta) return (
    <div className="max-w-4xl mx-auto px-5 py-20 text-center">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">Quiz Coming Soon</h2>
      <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left mr-2" /> Go Back
      </button>
    </div>
  )

  if (!quizSets && !loadErr) return (
    <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
      <i className="fas fa-spinner fa-spin text-2xl" /> Loading questions...
    </div>
  )

  if (loadErr) return (
    <div className="max-w-4xl mx-auto px-5 py-20 text-center">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">Error Loading Questions</h2>
      <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  )

  const sets      = quizSets
  const questions = sets[currentSetIdx].questions
  const q         = questions[currentQIdx]
  const total     = score.c + score.w
  const acc       = total > 0 ? Math.round((score.c / total) * 100) + '%' : '0%'

  const handleAnswer = (selected) => {
    if (attempted[currentQIdx]) return
    const newAtt = [...attempted]; newAtt[currentQIdx] = true
    const newAns = [...userAnswers]; newAns[currentQIdx] = selected
    setAttempted(newAtt); setAnswers(newAns)
    if (selected === q.c) { setScore(s => ({ ...s, c: s.c + 1 })); createConfetti(15) }
    else setScore(s => ({ ...s, w: s.w + 1 }))
  }

  // ── changeQuestion: NO auto-scroll — view stays stable ──
  const changeQuestion = (dir) => {
    const next = currentQIdx + dir
    if (next >= 0 && next < questions.length) {
      setSlideDir(dir > 0 ? 'right' : 'left')
      setSlideKey(k => k + 1)
      setQIdx(next)
    } else if (next >= questions.length) {
      doShowResults()
    }
  }

  const doShowResults = () => {
    setShowRes(true)
    createConfetti(100)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setScore(prev => { saveScore(prev); return prev })
    // Show login nudge for guests every time they see results
    if (!user) setShowLoginNudge(true)
  }

  const shareText = (platform) => {
    const text = `I scored ${score.c}/${questions.length} on Prepogy CMA Quiz! 🚀 Try: ${window.location.href}`
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    else if (platform === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank')
    else { navigator.clipboard.writeText(text).catch(() => {}); setCopyFB(true); setTimeout(() => setCopyFB(false), 3000) }
  }

  // ── Swipe: horizontal-only, skip if over scrollable table ──
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1 || (window.visualViewport && window.visualViewport.scale > 1)) {
      touchStartX.current = null; return
    }
    touchStartX.current = e.changedTouches[0].clientX
    touchStartY.current = e.changedTouches[0].clientY
    const scrollable = e.target.closest('.custom-table-wrapper, .overflow-x-auto')
    isScrollable.current = !!(scrollable && scrollable.scrollWidth > scrollable.clientWidth)
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || isScrollable.current) { touchStartX.current = null; return }
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs((touchStartY.current || 0) - e.changedTouches[0].clientY)
    // Only trigger if horizontal swipe dominates
    if (Math.abs(dx) > 55 && Math.abs(dx) > dy * 1.5) {
      dx > 0 ? changeQuestion(1) : changeQuestion(-1)
    }
    touchStartX.current = null
  }

  const openGuruji = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`Explain why "${q.c}" is correct for: ${q.q}`)}`, '_blank')
  }

  const modeLabel = mode === 'pyq' ? '📋 Previous Year Questions' : mode === 'sjc' ? '🏫 SJC Chapter Quiz' : '📚 MCQ Bank'

  // Animation class based on slide direction
  const slideClass = slideDir === 'right' ? 'animate-slide-in' : 'animate-slide-in-left'

  return (
    <>
      <Helmet>
        {/* ── Title, description, keywords — mode-aware ── */}
        <title>{mode === 'pyq' ? (meta.pyqSeoTitle || meta.seoTitle) : mode === 'sjc' ? (meta.sjcSeoTitle || meta.seoTitle) : meta.seoTitle}</title>
        <meta name="description" content={mode === 'pyq' ? (meta.pyqSeoDesc || meta.seoDesc) : mode === 'sjc' ? (meta.sjcSeoDesc || meta.seoDesc) : meta.seoDesc} />
        <meta name="keywords" content={mode === 'pyq' ? (meta.pyqSeoKeywords || meta.seoKeywords) : mode === 'sjc' ? (meta.sjcSeoKeywords || meta.seoKeywords) : meta.seoKeywords} />
        <link rel="canonical" href={`${meta.canonical}${mode !== 'mcq' ? `?mode=${mode}` : ''}`} />
        {/* ── Open Graph ── */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Prepogy" />
        <meta property="og:title" content={mode === 'pyq' ? (meta.pyqOgTitle || meta.ogTitle) : mode === 'sjc' ? (meta.sjcOgTitle || meta.ogTitle) : meta.ogTitle} />
        <meta property="og:description" content={mode === 'pyq' ? (meta.pyqOgDesc || meta.ogDesc) : mode === 'sjc' ? (meta.sjcOgDesc || meta.ogDesc) : meta.ogDesc} />
        <meta property="og:url" content={`${meta.canonical}${mode !== 'mcq' ? `?mode=${mode}` : ''}`} />
        <meta property="og:image" content={meta.ogImage || 'https://prepogy.in/prep.png'} />
        {/* ── Twitter Cards ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={mode === 'pyq' ? (meta.pyqTwitterTitle || meta.twitterTitle) : mode === 'sjc' ? (meta.sjcTwitterTitle || meta.twitterTitle) : meta.twitterTitle} />
        <meta name="twitter:description" content={mode === 'pyq' ? (meta.pyqTwitterDesc || meta.twitterDesc) : mode === 'sjc' ? (meta.sjcTwitterDesc || meta.twitterDesc) : meta.twitterDesc} />
        {/* ── Structured data ── */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Quiz",
          "name": mode === 'pyq' ? (meta.pyqSeoTitle || meta.seoTitle) : mode === 'sjc' ? (meta.sjcSeoTitle || meta.seoTitle) : meta.seoTitle,
          "description": mode === 'pyq' ? (meta.pyqLdJsonDesc || meta.ldJsonDesc) : mode === 'sjc' ? (meta.sjcLdJsonDesc || meta.ldJsonDesc) : meta.ldJsonDesc,
          "educationalAlignment": {
            "@type": "AlignmentObject",
            "alignmentType": "educationalLevel",
            "educationalFramework": "ICMAI",
            "targetName": meta.eduLevel
          },
          "isAccessibleForFree": "True",
          "url": `${meta.canonical}${mode !== 'mcq' ? `?mode=${mode}` : ''}`,
          "provider": { "@type": "Organization", "name": "Prepogy", "url": "https://prepogy.in" }
        })}</script>
      </Helmet>

      {showReport && (
        <ReportModal
          question={q.q}
          options={q.o}
          currentCorrect={q.c}
          paperId={paperId}
          setName={sets[currentSetIdx].setName}
          questionIdx={currentQIdx}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* ── Login nudge popup (guests only, every result) ── */}
      {showLoginNudge && !user && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-[28px] shadow-2xl max-w-sm w-full p-7 text-center relative overflow-hidden">
            {/* Gold top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg,#D4AF37,#F5E27A,#D4AF37)' }} />
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">You're on the leaderboard!</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Sign in to save your score and show your name on the <strong>weekly leaderboard</strong>.
              Great scores expire on Monday — don't let yours disappear!
            </p>
            <button
              onClick={() => { setShowLoginNudge(false); setShowAuth(true) }}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mb-3 shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#D4AF37,#B8860B)', boxShadow: '0 6px 20px rgba(212,175,55,0.35)' }}>
              <i className="fas fa-sign-in-alt mr-2" /> Sign In to Save Score
            </button>
            <button
              onClick={() => setShowLoginNudge(false)}
              className="w-full py-2.5 rounded-2xl font-semibold text-slate-400 text-sm hover:text-slate-600 transition-colors">
              Maybe later — continue without account
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-20 w-full">
        {/* Header */}
        {!focusMode && (
          <div className="pt-4 pb-2 flex flex-col items-center">
            <nav className="breadcrumb self-start">
              <a href="/" onClick={e=>{e.preventDefault();navigate('/')}} className="hover:text-primary transition-colors">Home</a>
              <i className="fas fa-chevron-right text-[8px]" />
              <a href={meta.breadcrumb[1]} onClick={e=>{e.preventDefault();navigate(meta.breadcrumb[1])}} className="hover:text-primary transition-colors">{meta.breadcrumb[0]}</a>
              <i className="fas fa-chevron-right text-[8px]" />
              <span className="text-primary font-bold">{meta.shortTitle}</span>
            </nav>

            {/* Mode badge */}
            <div className="mt-2 mb-3 text-xs font-bold px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {modeLabel}
            </div>

            {/* Theme switcher */}
            <div className="flex items-center gap-2 bg-black/5 p-1.5 rounded-2xl backdrop-blur-sm mb-4">
              {['light','dark','black'].map(t => (
                <button key={t} onClick={() => applyTheme(t)} className={`theme-btn ${theme === t ? 'active' : ''}`}
                  title={t === 'light' ? 'Light Mode' : t === 'dark' ? 'Dark Mode' : 'Jet Black'}>
                  <i className={`fas ${t === 'light' ? 'fa-sun' : t === 'dark' ? 'fa-moon' : 'fa-circle'}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top nav */}
        {!showResults && !focusMode && (
          <div className="flex justify-between items-center mb-6 gap-3">
            <button onClick={() => navigate(-1)} className="btn-home animate-pulse-glow border-primary text-primary">
              <i className="fas fa-arrow-left" /> <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => loadSet(currentSetIdx)} className="text-[10px] text-red-500 font-bold uppercase tracking-wide px-2 py-1">Reset</button>
              <select value={currentSetIdx} onChange={e => { loadSet(parseInt(e.target.value)); e.target.blur() }}
                className="max-w-[130px] sm:max-w-[220px] rounded-xl px-3 py-2 text-xs font-bold border outline-none focus:border-primary cursor-pointer truncate"
                style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)', color:'var(--color-text-main)' }}>
                {sets.map((s, i) => <option key={i} value={i}>{s.setName}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Stats bar */}
        {!showResults && (
          <div className={`bg-surface rounded-3xl p-5 flex shadow-soft mb-4 border border-slate-100/50 divide-x animate-fade-in-up ${focusMode ? 'mt-6' : ''}`}
            style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            {[
              { label:'Correct',  val: score.c, color:'text-success' },
              { label:'Wrong',    val: score.w, color:'text-error' },
              { label:'Accuracy', val: acc,     color:'text-primary' },
            ].map(s => (
              <div key={s.label} className="flex-1 text-center">
                <span className={`block text-2xl font-extrabold mb-1 ${s.color}`}>{s.val}</span>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Question Navigator Grid */}
        {!showResults && !focusMode && questions.length > 1 && (
          <div className="mb-6 p-4 rounded-3xl border animate-fade-in-up"
            style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <p className="text-[9px] font-extrabold uppercase tracking-widest opacity-50 mb-3 text-center">Jump to Question</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {questions.map((_, i) => {
                const isAtt = attempted[i]
                const isCorrect = isAtt && userAnswers[i] === questions[i].c
                const isCurr = i === currentQIdx
                let cls = 'q-nav-btn '
                if (isCurr)        cls += 'current '
                if (!isAtt)        cls += 'unanswered'
                else if (isCorrect)cls += 'correct'
                else               cls += 'incorrect'
                return (
                  <button key={i} className={cls} onClick={() => { setSlideDir(i > currentQIdx ? 'right' : 'left'); setSlideKey(k=>k+1); setQIdx(i) }}>
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-[9px] font-bold opacity-50 uppercase tracking-wide">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Correct</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Wrong</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300 inline-block" /> Unanswered</span>
            </div>
          </div>
        )}

        {/* Question card — stable position, no scroll on change */}
        {!showResults && (
          <article
            key={slideKey}
            className={`bg-surface backdrop-blur-md shadow-soft rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden transition-all duration-300 ${slideClass}`}
            style={{ backgroundColor:'var(--color-surface)' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <i className="fas fa-puzzle-piece absolute -bottom-8 -right-8 text-[12rem] text-primary opacity-[0.03] -rotate-12 pointer-events-none" />

            {/* Progress + toolbar */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">
                Progress • {currentQIdx + 1} of {questions.length}
              </p>
              <div className="flex items-center gap-2">
                {/* Focus mode toggle */}
                <button onClick={() => setFocusMode(f => !f)} title={focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${focusMode ? 'bg-primary text-white border border-primary' : 'text-slate-500 border border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  <i className={`fas ${focusMode ? 'fa-compress' : 'fa-expand'} text-[9px]`} />
                  {focusMode ? 'Exit Focus' : 'Focus'}
                </button>
                {/* Report button */}
                <button onClick={() => setShowReport(true)} title="Report an issue"
                  className="text-[10px] font-bold text-orange-500 border border-orange-200 bg-orange-50 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-orange-100 transition-all">
                  <i className="fas fa-flag text-[9px]" /> Report
                </button>
                {/* ASK GURU */}
                <button onClick={openGuruji} title="ASK GURU"
                  className="relative p-[1.5px] rounded-full overflow-hidden inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105 group border-none bg-transparent">
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#4285f4,#34a853,#fbbc05,#ea4335,#4285f4)] animate-rotate-border" />
                  <div className="relative bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
                    <i className="fas fa-magnifying-glass-chart text-primary text-xs" />
                    <span className="font-bold text-[10px] text-slate-600">ASK GURU <span className="google-g-text">G</span></span>
                  </div>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                style={{ width:`${((currentQIdx + 1) / questions.length) * 100}%` }} />
            </div>

            {/* Question text */}
            <div className="text-xl md:text-2xl font-bold mb-8 leading-tight overflow-x-auto"
              style={{ color:'var(--color-text-main)' }}
              dangerouslySetInnerHTML={{ __html: parseTableFromText(q.q) }} />

            {/* Options */}
            <div role="radiogroup">
              {q.o.map((opt, i) => {
                const isSelected = userAnswers[currentQIdx] === opt
                const isAtt = attempted[currentQIdx]
                let cls = 'option'
                if (isAtt) {
                  cls += ' disabled'
                  if (opt === q.c) cls += ' correct'
                  else if (isSelected && opt !== q.c) cls += ' incorrect'
                }
                return (
                  <div key={i} className={cls} role="radio" aria-checked={isSelected}
                    onClick={() => !isAtt && handleAnswer(opt)}>
                    <span className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center font-bold mr-5 shrink-0 text-sm">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-[15px] font-semibold opacity-90">{opt}</span>
                  </div>
                )
              })}
            </div>

            {/* Swipe hint (mobile only) */}
            <div className="mt-6 flex justify-center md:hidden">
              <div className="bg-primary/5 px-5 py-2 rounded-full border border-primary/20">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                  <i className="fas fa-chevron-left text-[8px]" /> Swipe to Navigate <i className="fas fa-chevron-right text-[8px]" />
                </span>
              </div>
            </div>

            {/* Nav buttons */}
            <div className="flex justify-between mt-10 pt-8 border-t border-black/5">
              <button onClick={() => changeQuestion(-1)} style={{ visibility: currentQIdx === 0 ? 'hidden' : 'visible' }}
                className="px-7 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 bg-black/5 hover:bg-black/10 active:scale-95">
                <i className="fas fa-chevron-left" /> Prev
              </button>
              <button onClick={() => changeQuestion(1)}
                className="px-7 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 bg-primary text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95">
                {currentQIdx === questions.length - 1 ? 'Show Results' : <>Next <i className="fas fa-chevron-right ml-1" /></>}
              </button>
            </div>
          </article>
        )}

        {/* Results */}
        {showResults && (
          <>
            <div className="bg-surface rounded-[32px] p-8 md:p-12 text-center shadow-2xl animate-fade-in-up border border-slate-100/10 relative overflow-hidden"
              style={{ backgroundColor:'var(--color-surface)' }}>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-primary text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl animate-floating">
                  <i className="fas fa-trophy" />
                </div>
                <h2 className="text-3xl font-black mb-2" style={{ color:'var(--color-text-main)' }}>Quiz Completed!</h2>
                <div className="inline-block bg-indigo-50 text-primary px-6 py-2 rounded-full font-extrabold text-sm mb-8 tracking-wide">
                  Correct: {score.c} out of {questions.length}
                </div>

                {scoreSaved && (
                  <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full animate-fade-in-up mb-4">
                    <i className="fas fa-check-circle" /> Score saved to leaderboard!
                  </div>
                )}

                <div className="mb-8 p-6 bg-black/5 rounded-[28px] border border-black/5">
                  <div className="bg-surface p-6 rounded-2xl shadow-sm border-l-4 border-primary text-left relative"
                    style={{ backgroundColor:'var(--color-surface)' }}>
                    <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">{quote}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button onClick={() => shareText('whatsapp')} className="share-btn bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-100">
                    <i className="fab fa-whatsapp text-lg" /> WhatsApp
                  </button>
                  <button onClick={() => shareText('telegram')} className="share-btn bg-gradient-to-r from-sky-500 to-blue-600 shadow-blue-100">
                    <i className="fab fa-telegram-plane text-lg" /> Telegram
                  </button>
                  <button onClick={() => shareText('copy')} className="col-span-2 share-btn bg-slate-800 shadow-slate-200">
                    <i className="fas fa-link" /> Copy Link
                  </button>
                </div>
                {copyFB && <p className="text-success text-sm font-bold animate-fade-in-up mb-4">✅ Copied!</p>}

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-black/5">
                  <button onClick={() => loadSet(currentSetIdx)} className="py-4 rounded-2xl font-bold text-sm bg-primary text-white shadow-lg shadow-indigo-100 hover:bg-primary-dark transition-all">Try Again</button>
                  <button onClick={() => navigate('/')} className="py-4 rounded-2xl font-bold text-sm bg-black/5 hover:bg-black/10 transition-all" style={{ color:'var(--color-text-muted)' }}>Home</button>
                </div>
              </div>
            </div>

            <Leaderboard key={lbKey} paperId={paperId} setIdx={currentSetIdx} currentUserId={user?.uid} />

            <SubjectLeaderboard
              key={`subj-${lbKey}`}
              paperId={paperId}
              paperTitle={meta.shortTitle}
              currentUserId={user?.uid}
            />

            {/* Instagram follow card */}
            <div className="mt-6 rounded-[28px] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-[#f09433] via-[#e6683c] via-40% via-[#dc2743] via-70% to-[#bc1888] p-6 text-center text-white">
                <i className="fab fa-instagram text-4xl mb-3 block" />
                <h3 className="font-extrabold text-lg mb-1">Follow us on Instagram</h3>
                <p className="text-white/80 text-xs mb-4 leading-relaxed">
                  Get daily MCQ flashcards, exam tips, and study strategies. Join 1000s of CMA aspirants @prepogy.in
                </p>
                <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#dc2743] font-extrabold text-sm px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform">
                  <i className="fab fa-instagram" /> @prepogy.in
                </a>
              </div>
            </div>
          </>
        )}

        {!showResults && (
          <footer className="py-8 text-center opacity-60 mt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color:'var(--color-text-muted)' }}>Prepogy © 2025</p>
          </footer>
        )}
      </div>
    </>
  )
}
