import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import ProfileSetupModal from './ProfileSetupModal.jsx'

const LEVEL_BADGE = {
  foundation: { label: 'Foundation', bg: 'bg-emerald-100 text-emerald-700' },
  inter:      { label: 'Inter',       bg: 'bg-indigo-100 text-indigo-700'   },
  final:      { label: 'Final',       bg: 'bg-amber-100 text-amber-700'     },
}

export default function UserMenu({ onLoginClick }) {
  const { user, isAdmin, profile } = useAuth()
  const navigate  = useNavigate()
  const [open,    setOpen]    = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    setTimeout(() => document.addEventListener('click', h), 0)
    return () => document.removeEventListener('click', h)
  }, [open])

  if (!user) {
    return (
      <button onClick={onLoginClick}
        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
        <i className="fas fa-sign-in-alt" /> Sign In
      </button>
    )
  }

  // Avatar: use Firestore photoURL > Auth photoURL > initials
  const photoURL  = profile?.photoURL || user.photoURL
  const name      = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'User'
  const initials  = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const lvBadge   = profile?.examLevel ? LEVEL_BADGE[profile.examLevel] : null

  return (
    <>
      {editProfile && <ProfileSetupModal onClose={() => setEditProfile(false)} />}

      <div ref={ref} className="relative">
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 bg-white border-2 border-slate-200 px-3 py-1.5 rounded-full font-semibold text-sm text-slate-700 hover:border-primary transition-all shadow-sm">
          {photoURL
            ? <img src={photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            : <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">{initials}</span>}
          <span className="max-w-[100px] truncate hidden sm:block">{name}</span>
          {isAdmin && (
            <span className="hidden sm:block text-[8px] font-extrabold bg-primary text-white px-1.5 py-0.5 rounded-full uppercase">Admin</span>
          )}
          <i className={`fas fa-chevron-down text-xs text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden animate-fade-in-up">

            {/* Profile header */}
            <div className="px-5 py-4 bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow shrink-0">
                  {photoURL
                    ? <img src={photoURL} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold">{initials}</div>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {isAdmin && (
                      <span className="text-[9px] font-extrabold bg-gradient-to-r from-primary to-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                    {lvBadge && (
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${lvBadge.bg}`}>
                        {lvBadge.label}
                      </span>
                    )}
                    {profile?.city && (
                      <span className="text-[9px] text-slate-400 font-semibold">
                        <i className="fas fa-map-marker-alt mr-0.5" />{profile.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <button onClick={() => { setEditProfile(true); setOpen(false) }}
                className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3">
                <i className="fas fa-user-pen w-4 text-center text-slate-400" /> Edit Profile
              </button>

              {isAdmin && (
                <button onClick={() => { navigate('/admin'); setOpen(false) }}
                  className="w-full text-left px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center gap-3 border-t border-slate-50">
                  <i className="fas fa-shield-halved w-4 text-center" /> Admin Dashboard
                </button>
              )}

              <button onClick={() => { signOut(auth); setOpen(false) }}
                className="w-full text-left px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-slate-50">
                <i className="fas fa-sign-out-alt w-4 text-center" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
