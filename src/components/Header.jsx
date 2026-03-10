import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell.jsx'
import UserMenu from './UserMenu.jsx'
import AuthModal from './AuthModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <header className="text-center py-10 md:py-16 px-5 relative shrink-0">
        {/* Top-right: bell + (if signed in, user menu is top-left) */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-40 flex items-center gap-2">
          <NotificationBell />
        </div>

        {/* Top-left: user menu */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-40">
          <UserMenu onLoginClick={() => setShowAuth(true)} />
        </div>

        {/* Logo */}
        <div className="w-24 h-24 md:w-36 md:h-36 mx-auto mb-5 cursor-pointer hover:scale-110 flex items-center justify-center transition-transform duration-300 animate-floating"
          role="button" onClick={() => navigate('/')}>
          <img src="/prep.png" alt="Prepogy - CMA Exam Hub Logo" width="144" height="144" className="w-full h-auto object-contain drop-shadow-lg" />
        </div>

        <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-extrabold uppercase tracking-[2px] text-gradient-original mb-1">
          <span className="sr-only">CMA MCQ Quiz Bank - </span>Prepogy
        </h1>
        <h2 className="text-[0.9em] text-slate-500 font-medium tracking-wide mt-1">
          Free CMA MCQ Quiz &amp; Question Bank | Foundation, Inter &amp; Final PYQ
        </h2>
      </header>
    </>
  )
}
