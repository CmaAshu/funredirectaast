import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = [
  { to: '/admin',               icon: 'fa-gauge',           label: 'Dashboard',    exact: true },
  { to: '/admin/reports',       icon: 'fa-flag',            label: 'Reports'       },
  { to: '/admin/quizzes',       icon: 'fa-circle-question', label: 'Quizzes'       },
  { to: '/admin/blog',          icon: 'fa-newspaper',       label: 'Blog Posts'    },
  { to: '/admin/notifications', icon: 'fa-bell',            label: 'Notifications' },
  { to: '/admin/audit-hub',     icon: 'fa-building-columns',label: 'Audit Hub'     },
  { to: '/admin/home-editor',   icon: 'fa-pencil',          label: 'Home Editor'   },
]

// ── Royal gold palette ──────────────────────────────────────────
const SIDEBAR_STYLE = {
  background: 'linear-gradient(170deg, #1a1200 0%, #2d1f00 40%, #1a1200 100%)',
  borderRight: '1px solid rgba(212,175,55,0.25)',
}
const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F5E27A'
const GOLD_DIM   = 'rgba(212,175,55,0.15)'

export default function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-body)', background: '#0f0a00' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={SIDEBAR_STYLE}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid rgba(212,175,55,0.20)' }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5E27A, #B8860B)', boxShadow: '0 0 18px rgba(212,175,55,0.45)' }}>
            👑
          </div>
          <div>
            <p className="font-extrabold text-sm" style={{ color: GOLD_LIGHT }}>Prepogy Admin</p>
            <p className="text-[10px] truncate max-w-[120px]" style={{ color: 'rgba(212,175,55,0.55)' }}>{user?.email}</p>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive ? 'shadow-md' : 'hover:bg-[rgba(212,175,55,0.08)]'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.10))', color: GOLD_LIGHT, border: '1px solid rgba(212,175,55,0.35)' }
                : { color: 'rgba(212,175,55,0.60)', border: '1px solid transparent' }
              }
            >
              {({ isActive }) => (
                <>
                  <i className={`fas ${icon} w-4 text-center`} style={{ color: isActive ? GOLD : 'rgba(212,175,55,0.50)' }} />
                  {label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
          <button
            onClick={() => { navigate('/'); setSidebarOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:bg-[rgba(212,175,55,0.08)]"
            style={{ color: 'rgba(212,175,55,0.50)' }}
          >
            <i className="fas fa-arrow-left w-4 text-center" style={{ color: 'rgba(212,175,55,0.40)' }} />
            Back to Site
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden" style={{ background: '#f9f5e8' }}>
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center gap-3 shadow-sm"
          style={{ background: 'linear-gradient(90deg,#1a1200,#2d1f00)', borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: GOLD_DIM, color: GOLD }}>
            <i className="fas fa-bars" />
          </button>
          <span className="font-extrabold text-sm" style={{ color: GOLD_LIGHT }}>👑 Prepogy Admin</span>
        </header>

        {/* ── Page content ── */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* Subtle gold header rule */}
          <div className="h-1 w-16 rounded-full mb-8 mx-0" style={{ background: `linear-gradient(90deg,${GOLD},transparent)` }} />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
