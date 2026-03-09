import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase.js'
import { Link } from 'react-router-dom'

function StatCard({ icon, label, value, color, to }) {
  const inner = (
    <div className={`rounded-3xl p-6 flex items-center gap-4 hover:shadow-xl transition-all border ${to ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
      style={{ background: 'linear-gradient(135deg,#ffffff,#fffdf0)', borderColor: 'rgba(212,175,55,0.25)', boxShadow: '0 4px 20px rgba(212,175,55,0.08)' }}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}>
        <i className={`fas ${icon}`} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800">{value ?? <i className="fas fa-spinner fa-spin text-slate-300 text-base" />}</p>
        <p className="text-xs font-semibold text-slate-400">{label}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ reports: null, pending: null, blogs: null, notifs: null })
  const [recentReports, setRecentReports] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [rSnap, pSnap, bSnap, nSnap] = await Promise.all([
          getDocs(collection(db, 'reports')),
          getDocs(query(collection(db, 'reports'), where('status', '==', 'pending'))),
          getDocs(collection(db, 'blog')),
          getDocs(collection(db, 'notifications')),
        ])
        setStats({ reports: rSnap.size, pending: pSnap.size, blogs: bSnap.size, notifs: nSnap.size })
      } catch { /* silent */ }

      try {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(5))
        const snap = await getDocs(q)
        setRecentReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch { /* silent */ }
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Overview of Prepogy admin activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="fa-flag"      label="Total Reports"    value={stats.reports}  color="bg-orange-50 text-orange-500"  to="/admin/reports" />
        <StatCard icon="fa-clock"     label="Pending Review"   value={stats.pending}  color="bg-red-50 text-red-500"        to="/admin/reports" />
        <StatCard icon="fa-newspaper" label="Blog Posts"       value={stats.blogs}    color="bg-blue-50 text-blue-500"      to="/admin/blog" />
        <StatCard icon="fa-bell"      label="Notifications"    value={stats.notifs}   color="bg-purple-50 text-purple-500"  to="/admin/notifications" />
      </div>

      {/* Recent reports */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-slate-800">Recent Reports</h2>
          <Link to="/admin/reports" className="text-xs font-bold text-primary hover:underline">View All →</Link>
        </div>
        {recentReports.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No reports yet.</p>
        ) : (
          <div className="space-y-3">
            {recentReports.map(r => (
              <div key={r.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${r.status === 'pending' ? 'bg-orange-100 text-orange-600' : r.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                  {r.status}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 mb-0.5">Paper {r.paperId} • {r.setName}</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{r.questionText}</p>
                  <p className="text-xs text-slate-400 mt-1">Suggested: <span className="text-orange-600 font-semibold">{r.suggestedCorrect}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
