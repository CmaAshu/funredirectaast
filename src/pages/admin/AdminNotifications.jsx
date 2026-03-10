import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase.js'
import { useAuth } from '../../context/AuthContext.jsx'

const TYPE_STYLES = {
  info:    { color: 'bg-blue-50 text-blue-600 border-blue-200',    icon: 'fa-circle-info' },
  success: { color: 'bg-green-50 text-green-600 border-green-200', icon: 'fa-circle-check' },
  warning: { color: 'bg-orange-50 text-orange-600 border-orange-200', icon: 'fa-triangle-exclamation' },
  update:  { color: 'bg-purple-50 text-purple-600 border-purple-200', icon: 'fa-rocket' },
}

export default function AdminNotifications() {
  const { user } = useAuth()
  const [notifs,   setNotifs]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [deleting, setDeleting] = useState(null)

  // Form state
  const [title,   setTitle]   = useState('')
  const [message, setMessage] = useState('')
  const [type,    setType]    = useState('info')
  const [link,    setLink]    = useState('')
  const [preview, setPreview] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setNotifs([]) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSend = async () => {
    if (!title || !message) return
    setSending(true)
    try {
      const ref = await addDoc(collection(db, 'notifications'), {
        title, message, type, link: link.trim() || null,
        sentBy: user?.email || 'admin',
        createdAt: serverTimestamp(),
        readBy: [],
      })
      setNotifs(prev => [{ id: ref.id, title, message, type, link: link.trim() || null, sentBy: user?.email }, ...prev])
      setTitle(''); setMessage(''); setLink(''); setType('info'); setPreview(false)
    } catch (e) { console.error(e) }
    setSending(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, 'notifications', id))
      setNotifs(prev => prev.filter(n => n.id !== id))
    } catch (e) { console.error(e) }
    setDeleting(null)
  }

  const style = TYPE_STYLES[type] || TYPE_STYLES.info

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Notifications</h1>
        <p className="text-slate-400 text-sm">Send announcements and alerts to all Prepogy users</p>
      </div>

      {/* Compose form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
        <h2 className="font-extrabold text-slate-800 mb-5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
            <i className="fas fa-paper-plane text-primary text-xs" />
          </div>
          Compose Notification
        </h2>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Type</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TYPE_STYLES).map(([t, { color, icon }]) => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border capitalize transition-all ${type === t ? `${color} shadow-sm` : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                  <i className={`fas ${icon}`} /> {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="e.g. New questions added for Paper 8!" />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Message *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              placeholder="Write the notification body here..." />
          </div>

          {/* Optional link */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Action Link (optional)</label>
            <input value={link} onChange={e => setLink(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="e.g. /quiz/8 or https://..." />
          </div>

          {/* Preview toggle */}
          {(title || message) && (
            <div>
              <button onClick={() => setPreview(p => !p)}
                className="text-xs font-bold text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-all">
                <i className={`fas fa-eye${preview ? '-slash' : ''} mr-1.5`} />{preview ? 'Hide' : 'Show'} Preview
              </button>
              {preview && (
                <div className={`mt-3 p-4 rounded-2xl border flex items-start gap-3 ${style.color}`}>
                  <i className={`fas ${style.icon} mt-0.5`} />
                  <div>
                    <p className="font-bold text-sm">{title || '(no title)'}</p>
                    <p className="text-xs mt-0.5 opacity-80">{message || '(no message)'}</p>
                    {link && <a href={link} className="text-xs font-bold mt-1 block underline">→ {link}</a>}
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={handleSend} disabled={!title || !message || sending}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-white shadow-lg shadow-indigo-100 hover:bg-primary-dark disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {sending ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : <><i className="fas fa-paper-plane" /> Send to All Users</>}
          </button>
        </div>
      </div>

      {/* Sent notifications */}
      <div>
        <h2 className="font-extrabold text-slate-800 mb-4">Sent Notifications ({notifs.length})</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
            <i className="fas fa-spinner fa-spin" /> Loading...
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <i className="fas fa-bell text-4xl block opacity-30 mb-3" />
            <p className="font-semibold">No notifications sent yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map(n => {
              const s = TYPE_STYLES[n.type] || TYPE_STYLES.info
              return (
                <div key={n.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${s.color}`}>
                    <i className={`fas ${s.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-extrabold text-slate-800 text-sm">{n.title}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize ${s.color}`}>{n.type}</span>
                    </div>
                    <p className="text-xs text-slate-500">{n.message}</p>
                    {n.link && <a href={n.link} className="text-xs font-bold text-primary mt-1 block hover:underline">→ {n.link}</a>}
                    <p className="text-[10px] text-slate-400 mt-1.5">Sent by {n.sentBy}</p>
                  </div>
                  <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center shrink-0 transition-all disabled:opacity-50">
                    {deleting === n.id ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-trash text-xs" />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
