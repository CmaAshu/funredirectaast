import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../firebase.js'

export function getWeekKey() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function getLeaderboardDocId(paperId, setIdx) {
  return `p${paperId}_s${setIdx}_${getWeekKey()}`
}

const medals = ['🥇', '🥈', '🥉']

function Avatar({ entry, isMe, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  const photoURL = entry.photoURL
  const initials = (entry.displayName || '?')[0].toUpperCase()
  return (
    <div className={`${dim} rounded-full overflow-hidden shrink-0 border-2 ${isMe ? 'border-primary' : 'border-white'} shadow-sm`}>
      {photoURL
        ? <img src={photoURL} alt={entry.displayName} className="w-full h-full object-cover" />
        : <div className={`w-full h-full flex items-center justify-center font-bold ${isMe ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{initials}</div>}
    </div>
  )
}

export default function Leaderboard({ paperId, setIdx, currentUserId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (paperId == null || setIdx == null) return
    setLoading(true)
    const docId = getLeaderboardDocId(paperId, setIdx)
    const q = query(
      collection(db, 'leaderboard', docId, 'scores'),
      orderBy('rankScore', 'desc'),
      limit(10)
    )
    getDocs(q)
      .then(snap => setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [paperId, setIdx])

  const weekKey = getWeekKey()
  const [year, w] = weekKey.split('-W')
  const weekLabel = `Week ${parseInt(w)}, ${year}`

  if (loading) return (
    <div className="flex items-center justify-center py-10 gap-3 text-slate-400 mt-6">
      <i className="fas fa-spinner fa-spin text-xl" />
      <span className="font-medium">Loading leaderboard…</span>
    </div>
  )

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-soft overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="text-white font-extrabold text-lg leading-tight">Weekly Leaderboard</h3>
            <p className="text-indigo-200 text-xs">{weekLabel} · Resets every Monday</p>
          </div>
        </div>
        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Top 10</span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 px-6">
          <span className="text-5xl block mb-3">🌱</span>
          <p className="font-bold text-slate-700">No scores yet this week!</p>
          <p className="text-slate-400 text-sm mt-1">Complete the quiz to appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {entries.map((entry, i) => {
            const isMe = entry.id === currentUserId
            return (
              <div key={entry.id}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isMe ? 'bg-indigo-50 border-l-4 border-primary' : 'hover:bg-slate-50/60'}`}>
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {i < 3
                    ? <span className="text-xl">{medals[i]}</span>
                    : <span className="text-sm font-black text-slate-400">#{i+1}</span>}
                </div>

                {/* Avatar */}
                <Avatar entry={entry} isMe={isMe} />

                {/* Name + city */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${isMe ? 'text-primary' : 'text-slate-700'}`}>
                    {entry.displayName || 'Anonymous'}
                    {isMe && <span className="ml-1.5 text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full">YOU</span>}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{entry.score}/{entry.total} correct</span>
                    {entry.city && <><span>·</span><span><i className="fas fa-map-marker-alt mr-0.5 text-[9px]" />{entry.city}</span></>}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`font-extrabold text-base ${isMe ? 'text-primary' : 'text-slate-700'}`}>{entry.accuracy}%</p>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">accuracy</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center font-medium">
          🔒 Only your <strong>first attempt</strong> each week counts · Resets every Monday
        </p>
      </div>
    </div>
  )
}
