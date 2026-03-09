import { useState, useRef, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.js'

const TYPE_ICON = {
  info:    { icon: 'fa-circle-info',        color: 'bg-blue-100 text-blue-600' },
  success: { icon: 'fa-circle-check',       color: 'bg-emerald-100 text-emerald-600' },
  warning: { icon: 'fa-triangle-exclamation', color: 'bg-orange-100 text-orange-600' },
  update:  { icon: 'fa-rocket',             color: 'bg-indigo-100 text-indigo-600' },
}

const FALLBACK = [
  { icon: 'fa-check-circle', color: 'bg-emerald-100 text-emerald-600', title: 'CMA Inter PYQ Update', body: "Previous year questions added to Inter MCQ Bank!" },
  { icon: 'fa-rocket',       color: 'bg-indigo-100 text-indigo-600',   title: 'New: Audit Questions',  body: 'Audit Super 51 high-yield concepts now live.' },
]

export default function NotificationBell() {
  const [open,    setOpen]    = useState(false)
  const [hasNew,  setHasNew]  = useState(false)
  const [notifs,  setNotifs]  = useState([])
  const ref = useRef(null)

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(10))
        const snap = await getDocs(q)
        if (snap.empty) { setNotifs(FALLBACK); return }
        const items = snap.docs.map(d => {
          const data = d.data()
          const t = TYPE_ICON[data.type] || TYPE_ICON.info
          return { id: d.id, icon: t.icon, color: t.color, title: data.title, body: data.message, link: data.link }
        })
        setNotifs(items)
        // Show badge if there's a newer notification than last seen
        const lastSeen = parseInt(localStorage.getItem('prepogy_notif_seen') || '0', 10)
        const latest = snap.docs[0]?.data()?.createdAt?.toMillis?.() || 0
        if (latest > lastSeen) setHasNew(true)
      } catch {
        setNotifs(FALLBACK)
        setHasNew(true)
      }
    }
    loadNotifs()
  }, [])

  const toggle = () => {
    setOpen(v => {
      if (!v) {
        setHasNew(false)
        localStorage.setItem('prepogy_notif_seen', Date.now().toString())
      }
      return !v
    })
  }

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} aria-label="Notifications"
        className="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:bg-slate-100">
        <i className="fas fa-bell text-slate-500 text-base" />
        {hasNew && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-100/80 z-[100] overflow-hidden animate-fade-in-up">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-sm">Notifications</h4>
            {notifs.length > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{notifs.length}</span>
            )}
          </div>

          <div className="pb-3 max-h-80 overflow-y-auto">
            {notifs.map((n, i) => (
              <div key={n.id || i} className="mx-3 mb-1 rounded-2xl hover:bg-slate-50 transition-colors">
                <a href={n.link || '#'} onClick={e => { if (!n.link) e.preventDefault() }}
                  className="flex items-start gap-3 p-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                    <i className={`fas ${n.icon} text-xs`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 mb-0.5 leading-tight">{n.title}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{n.body}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
