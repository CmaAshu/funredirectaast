import { useState, useEffect, useMemo, useRef } from 'react'
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase.js'
import { paperRegistry } from '../../data/registry.js'

// ─── helpers ────────────────────────────────────────────────────
function getPaperLabel(paperId) {
  const meta = paperRegistry[String(paperId)]
  if (!meta) return `Paper ${paperId}`
  return meta.shortTitle || `Paper ${paperId}`
}

function getPaperSubject(paperId) {
  const meta = paperRegistry[String(paperId)]
  if (!meta) return ''
  // Extract subject from full title (strip "Paper X: " prefix)
  return meta.title.replace(/^Paper\s+\d+[A-C]?\s*:\s*/i, '')
}

const OPTION_GRADIENTS = [
  'from-indigo-500 to-blue-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
]
const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_COLORS = ['text-indigo-700 bg-indigo-50 border-indigo-200',
                       'text-violet-700 bg-violet-50 border-violet-200',
                       'text-emerald-700 bg-emerald-50 border-emerald-200',
                       'text-amber-700  bg-amber-50  border-amber-200']

const STATUS_RING = {
  pending:  'ring-orange-300',
  reviewed: 'ring-blue-300',
  resolved: 'ring-green-300',
}
const STATUS_PILL = {
  pending:  'bg-orange-100 text-orange-600 border-orange-200',
  reviewed: 'bg-blue-100   text-blue-600   border-blue-200',
  resolved: 'bg-green-100  text-green-600  border-green-200',
}

// ─── Option bars component ───────────────────────────────────────
function OptionBars({ suggestions, total, options }) {
  // Try to map suggestion text → A/B/C/D label via the stored options array
  // options may be undefined if not stored in the report
  const allAnswers = Object.keys(suggestions)

  return (
    <div className="mt-4 space-y-2">
      {allAnswers.map((ans, idx) => {
        const count = suggestions[ans]
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0
        const grad  = OPTION_GRADIENTS[idx % OPTION_GRADIENTS.length]
        const lbl   = OPTION_LABELS[idx % OPTION_LABELS.length]
        const pill  = OPTION_COLORS[idx % OPTION_COLORS.length]

        return (
          <div key={ans} className="flex items-center gap-3 group">
            {/* Label */}
            <span className={`shrink-0 w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center border ${pill}`}>
              {lbl}
            </span>

            {/* Bar track */}
            <div className="flex-1 relative h-5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${grad} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${pct}%` }}
              />
              {/* Answer text overlay */}
              <span className="absolute inset-0 flex items-center pl-3 text-[10px] font-semibold text-slate-600 truncate">
                {ans.length > 40 ? ans.slice(0, 40) + '…' : ans}
              </span>
            </div>

            {/* Count + % */}
            <div className="shrink-0 text-right min-w-[52px]">
              <span className="text-xs font-extrabold text-slate-700">{count}</span>
              <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────
export default function AdminReports() {
  const [reports,   setReports]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all')
  const [expandedQ, setExpandedQ] = useState(null)
  const [updating,  setUpdating]  = useState(null)
  const [search,    setSearch]    = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const q    = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Grouped by paperId + questionText
  const grouped = useMemo(() => {
    let filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(r =>
        (r.questionText || '').toLowerCase().includes(q) ||
        (r.paperId      || '').toString().includes(q)    ||
        (r.setName      || '').toLowerCase().includes(q)
      )
    }

    const map = {}
    filtered.forEach(r => {
      const key = `${r.paperId}___${r.questionText}`
      if (!map[key]) {
        map[key] = {
          key,
          paperId:        r.paperId,
          setName:        r.setName   || '—',
          questionText:   r.questionText,
          questionNumber: r.questionNumber || null,
          currentCorrect: r.currentCorrect,
          options:        r.options   || [],
          suggestions:    {},
          reports:        [],
        }
      }
      map[key].reports.push(r)
      const s = r.suggestedCorrect || 'Unknown'
      map[key].suggestions[s] = (map[key].suggestions[s] || 0) + 1
    })
    return Object.values(map).sort((a, b) => b.reports.length - a.reports.length)
  }, [reports, filter, search])

  const updateStatus = async (reportId, status) => {
    setUpdating(reportId)
    try {
      await updateDoc(doc(db, 'reports', reportId), { status })
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r))
    } catch (e) { console.error(e) }
    setUpdating(null)
  }

  const bulkUpdateGroup = async (groupReports, status) => {
    for (const r of groupReports) {
      if (r.status !== status) await updateStatus(r.id, status)
    }
  }

  const topSuggestion = (suggestions) =>
    Object.entries(suggestions).sort((a, b) => b[1] - a[1])[0]

  const counts = { pending: reports.filter(r=>r.status==='pending').length,
                   reviewed:reports.filter(r=>r.status==='reviewed').length,
                   resolved:reports.filter(r=>r.status==='resolved').length }

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-0.5">Answer Reports</h1>
          <p className="text-slate-400 text-sm">{reports.length} total · {grouped.length} unique questions</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:border-primary hover:text-primary">
          <i className="fas fa-rotate-right" /> Refresh
        </button>
      </div>

      {/* ── Summary tiles ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:'Pending',  key:'pending',  icon:'fa-clock',        grad:'from-orange-400 to-amber-400' },
          { label:'Reviewed', key:'reviewed', icon:'fa-eye',          grad:'from-blue-400 to-cyan-400'   },
          { label:'Resolved', key:'resolved', icon:'fa-check-circle', grad:'from-emerald-400 to-teal-400'},
        ].map(({ label, key, icon, grad }) => (
          <button key={key} onClick={() => setFilter(f => f === key ? 'all' : key)}
            className={`rounded-2xl p-3 text-center border transition-all hover:-translate-y-0.5 ${filter===key ? 'bg-white shadow-md border-primary/30' : 'bg-white border-slate-100'}`}>
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mx-auto mb-1.5 shadow-sm`}>
              <i className={`fas ${icon} text-white text-xs`} />
            </div>
            <p className="text-lg font-black text-slate-800">{counts[key]}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Filter + Search row ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'reviewed', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${filter===f ? 'bg-primary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search question or paper…"
            className="w-full pl-8 pr-4 py-2 rounded-full border border-slate-200 text-xs outline-none focus:border-primary transition-all" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <i className="fas fa-times text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <i className="fas fa-spinner fa-spin text-2xl" /> Loading reports…
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <i className="fas fa-flag text-4xl mb-3 block opacity-30" />
          <p className="font-semibold">No reports found</p>
          {(filter !== 'all' || search) && (
            <button onClick={() => { setFilter('all'); setSearch('') }} className="mt-2 text-primary text-sm font-bold hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => {
            const [topAns, topCount] = topSuggestion(group.suggestions)
            const isExpanded   = expandedQ === group.key
            const pendingCount = group.reports.filter(r => r.status === 'pending').length
            const total        = group.reports.length
            const subject      = getPaperSubject(group.paperId)

            return (
              <div key={group.key} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

                {/* ── Group header ── */}
                <div className="p-5 cursor-pointer" onClick={() => setExpandedQ(isExpanded ? null : group.key)}>

                  {/* Metadata row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs font-black bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-3 py-1 rounded-full shadow-sm">
                      {getPaperLabel(group.paperId)}
                    </span>
                    {group.questionNumber && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                        Q.{group.questionNumber}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-1 rounded-full">
                      {group.setName}
                    </span>
                    {subject && (
                      <span className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]" title={subject}>
                        {subject.length > 35 ? subject.slice(0,35)+'…' : subject}
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      {pendingCount > 0 && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                          {pendingCount} pending
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                        {total} report{total > 1 ? 's' : ''}
                      </span>
                      <i className={`fas fa-chevron-down text-slate-400 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Question text */}
                  <p className="font-semibold text-slate-700 text-sm leading-relaxed mb-4">
                    {group.questionText}
                  </p>

                  {/* Currently correct */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currently correct:</span>
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-lg border border-green-200">
                      {group.currentCorrect}
                    </span>
                  </div>

                  {/* Summary sentence */}
                  <div className="text-xs text-slate-500 mb-1 font-medium">
                    <span className="font-black text-slate-700">{topCount} student{topCount>1?'s':''}</span> reported the correct answer is{' '}
                    <span className="font-bold text-orange-700">"{topAns}"</span>
                  </div>

                  {/* Option bars */}
                  <OptionBars suggestions={group.suggestions} total={total} options={group.options} />
                </div>

                {/* ── Bulk actions ── */}
                <div className="px-5 pb-4 flex gap-2 flex-wrap">
                  <button onClick={e => { e.stopPropagation(); bulkUpdateGroup(group.reports, 'resolved') }}
                    className="text-[10px] font-bold text-green-600 border border-green-200 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-all flex items-center gap-1.5">
                    <i className="fas fa-check" /> Mark All Resolved
                  </button>
                  <button onClick={e => { e.stopPropagation(); bulkUpdateGroup(group.reports, 'reviewed') }}
                    className="text-[10px] font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all flex items-center gap-1.5">
                    <i className="fas fa-eye" /> Mark All Reviewed
                  </button>
                </div>

                {/* ── Expanded individual reports ── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {group.reports.map(r => (
                      <div key={r.id} className="px-5 py-4 flex items-start gap-3">
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 mt-0.5 ${STATUS_PILL[r.status] || 'bg-slate-100 text-slate-500'}`}>
                          {r.status}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">
                            <span className="font-semibold">{r.reporterName || 'Anonymous'}</span> · {r.setName}
                          </p>
                          <p className="text-xs font-semibold text-orange-700">Suggested: {r.suggestedCorrect}</p>
                          {r.note && <p className="text-xs text-slate-400 mt-1 italic">"{r.note}"</p>}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {['pending', 'reviewed', 'resolved'].map(s => (
                            <button key={s} disabled={r.status===s || updating===r.id}
                              onClick={() => updateStatus(r.id, s)}
                              className={`text-[9px] font-bold px-2 py-1 rounded-lg capitalize transition-all disabled:opacity-40 ${r.status===s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                              {updating === r.id ? <i className="fas fa-spinner fa-spin" /> : s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
