import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase.js'

const friendlyError = (code) => ({
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
}[code] || 'Something went wrong. Please try again.')

// After login, fetch role from Firestore and redirect accordingly
async function getRoleAndRedirect(uid, navigate, onClose) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    const role = snap.exists() ? (snap.data()?.role || 'user') : 'user'
    onClose()
    if (role === 'admin') navigate('/admin')
    // else stay on current page — no redirect for regular users
  } catch {
    onClose()
  }
}

export default function AuthModal({ onClose }) {
  const navigate = useNavigate()
  const [mode,     setMode]   = useState('login')
  const [name,     setName]   = useState('')
  const [email,    setEmail]  = useState('')
  const [password, setPass]   = useState('')
  const [error,    setError]  = useState('')
  const [loading,  setLoading]= useState(false)

  const handleEmail = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      let uid
      if (mode === 'register') {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return }
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: name.trim() })
        await setDoc(doc(db, 'users', cred.user.uid), {
          displayName: name.trim(), email, role: 'user', createdAt: serverTimestamp(),
        }, { merge: true })
        uid = cred.user.uid
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        uid = cred.user.uid
      }
      await getRoleAndRedirect(uid, navigate, onClose)
    } catch (err) { setError(friendlyError(err.code)) }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true); setError('')
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      // Create user doc if first time
      const ref = doc(db, 'users', cred.user.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          displayName: cred.user.displayName || '', email: cred.user.email || '',
          role: 'user', createdAt: serverTimestamp(),
        })
      }
      await getRoleAndRedirect(cred.user.uid, navigate, onClose)
    } catch (err) { setError(friendlyError(err.code)) }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md p-8 md:p-10 shadow-2xl relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-5 right-6 text-2xl font-bold text-gray-300 hover:text-gray-500" aria-label="Close">&times;</button>

        <div className="text-center mb-6">
          <img src="/prep.png" alt="Prepogy" className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h2 className="text-2xl font-extrabold text-slate-800">{mode === 'login' ? 'Welcome Back!' : 'Join Prepogy'}</h2>
          <p className="text-slate-500 text-sm mt-1">{mode === 'login' ? 'Sign in to compete on the weekly leaderboard.' : 'Create a free account to start practicing.'}</p>
        </div>

        <button onClick={handleGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-2xl py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-all mb-4 disabled:opacity-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          {mode === 'register' && (
            <input type="text" placeholder="Your Name" value={name} onChange={e => { setName(e.target.value); setError('') }} required
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary focus:outline-none text-sm font-medium" />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={e => { setEmail(e.target.value); setError('') }} required
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary focus:outline-none text-sm font-medium" />
          <input type="password" placeholder="Password (min. 6 chars)" value={password} onChange={e => { setPass(e.target.value); setError('') }} required minLength={6}
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary focus:outline-none text-sm font-medium" />

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-indigo-200 disabled:opacity-60">
            {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Please wait...</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer p-0">
            {mode === 'login' ? 'Sign Up Free' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
