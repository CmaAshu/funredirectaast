import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../firebase.js'
import { getWeekKey } from './Leaderboard.jsx'

const medals = ['🥇', '🥈', '🥉']

function Avatar({ entry, isMe }) {
  const initials = (entry.displayName || '?')[0].toUpperCase()
  return (
    <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${isMe ? 'border-yellow-400' : 'border-white'} shadow-sm`}>
      {entry.photoURL
        ? <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" />
        : <div className={`w-full h-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-yellow-400 text-white' : 'bg-slate-100 text-slate-500'}`}>{initials}</div>}
    </div>
  )
}

// Doc path: leaderboard/subj_{paperId}_{weekKey}/scores/{userId}
export function getSubjectDocId(paperId) {
  return `subj_p${paperId}_${getWeekKey()}`
}

export default function SubjectLeaderboard({ paperId, paperTitle, currentUserId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!paperId) return
    setLoading(true)
    const docId = getSubjectDocId(paperId)
    getDocs(query(
      collection(db, 'leaderboard', docId, 'scores'),
      orderBy('totalScore', 'desc'),
      limit(50)
    ))
      .then(snap => setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [paperId])

  const weekKey = getWeekKey()
  const [year, w] = weekKey.split('-W')
  const weekLabel = `Week ${parseInt(w)}, ${year}`

  return (
    <div className="mt-8 rounded-[28px] overflow-hidden shadow-xl border"
      style={{ borderColor: 'rgba(212,175,55,0.35)' }}>

      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1a1200 0%, #3d2800 100%)', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <h3 className="font-extrabold text-lg leading-tight" style={{ color: '#F5E27A' }}>
              Subject Leaderboard
            </h3>
            <p className="text-xs" style={{ color: 'rgba(212,175,55,0.65)' }}>
              {paperTitle} · {weekLabel} · Resets every Monday
            </p>
          </div>
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: '#F5E27A', border: '1px solid rgba(212,175,55,0.30)' }}>
          Top 50
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-6 py-2 text-xs font-semibold" style={{ background: 'rgba(212,175,55,0.06)', color: 'rgba(120,90,0,0.80)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <i className="fas fa-info-circle mr-1.5" />
        Ranked by total score across ALL sets (MCQ Bank + PYQs) for this paper this week
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-400 bg-white">
          <i className="fas fa-spinner fa-spin text-xl" style={{ color: '#D4AF37' }} />
          <span className="font-medium">Loading…</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-14 px-6 bg-white">
          <span className="text-5xl block mb-3">🌱</span>
          <p className="font-bold text-slate-700">No scores yet this week!</p>
          <p className="text-slate-400 text-sm mt-1">Complete any set of this paper to appear here.</p>
        </div>
      ) : (
        <div className="bg-white divide-y divide-slate-50">
          {entries.map((entry, i) => {
            const isMe = entry.id === currentUserId
            const acc  = entry.totalAttempted > 0
              ? Math.round((entry.totalScore / entry.totalAttempted) * 100)
              : 0
            return (
              <div key={entry.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors"
                style={isMe
                  ? { background: 'linear-gradient(90deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))', borderLeft: '4px solid #D4AF37' }
                  : {}}>
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {i < 3
                    ? <span className="text-xl">{medals[i]}</span>
                    : <span className="text-sm font-black text-slate-400">#{i + 1}</span>}
                </div>

                {/* Avatar */}
                <Avatar entry={entry} isMe={isMe} />

                {/* Name + sets */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate`} style={{ color: isMe ? '#B8860B' : '#1e293b' }}>
                    {entry.displayName || 'Anonymous'}
                    {isMe && (
                      <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: '#D4AF37', color: '#fff' }}>YOU</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                    <span>{entry.totalScore}/{entry.totalAttempted} correct</span>
                    <span>·</span>
                    <span>{entry.setsCount || 0} set{entry.setsCount !== 1 ? 's' : ''} played</span>
                    {entry.city && <><span>·</span><span><i className="fas fa-map-marker-alt mr-0.5 text-[9px]" />{entry.city}</span></>}
                  </div>
                </div>

                {/* Score + acc */}
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-base" style={{ color: isMe ? '#B8860B' : '#1e293b' }}>
                    {entry.totalScore}
                    <span className="text-xs font-semibold text-slate-400 ml-0.5">pts</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">{acc}% acc</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="px-5 py-3 text-center text-[11px] font-medium"
        style={{ background: 'linear-gradient(90deg,rgba(212,175,55,0.06),rgba(212,175,55,0.02))', borderTop: '1px solid rgba(212,175,55,0.15)', color: 'rgba(120,90,0,0.70)' }}>
        👑 Rankings update instantly · Resets every Monday at midnight
      </div>
    </div>
  )
}
