import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import BackgroundAnimation from './BackgroundAnimation.jsx'
import ProfileSetupModal from './ProfileSetupModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { needsSetup, refreshProfile } = useAuth()

  return (
    <div className="font-sans min-h-screen flex flex-col cursor-auto overflow-x-hidden antialiased">
      <BackgroundAnimation />
      <Header />
      <main className="flex-grow flex flex-col relative w-full">
        <Outlet />
      </main>
      <Footer />

      {/* Profile setup — shown once after first Google sign-in */}
      {needsSetup && (
        <ProfileSetupModal onClose={refreshProfile} />
      )}
    </div>
  )
}
