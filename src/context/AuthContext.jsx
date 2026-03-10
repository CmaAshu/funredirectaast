import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,           setUser]          = useState(undefined) // undefined = loading
  const [role,           setRole]          = useState(null)
  const [profile,        setProfile]       = useState(null)      // full Firestore user doc
  const [needsSetup,     setNeedsSetup]    = useState(false)     // show ProfileSetupModal?
  const [loading,        setLoading]       = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null); setRole(null); setProfile(null)
        setNeedsSetup(false); setLoading(false)
        return
      }
      setUser(u)
      try {
        const ref  = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const data = snap.data()
          setRole(data?.role || 'user')
          setProfile(data)
          // Show profile setup if user signed in via Google and hasn't completed profile
          setNeedsSetup(!data?.profileComplete && u.providerData?.[0]?.providerId === 'google.com')
        } else {
          // Brand-new user — create their doc, mark profile incomplete
          const newProfile = {
            displayName:    u.displayName || '',
            email:          u.email       || '',
            photoURL:       u.photoURL    || '',
            role:           'user',
            profileComplete: false,
            createdAt:      serverTimestamp(),
          }
          await setDoc(ref, newProfile)
          setRole('user')
          setProfile(newProfile)
          // Only prompt profile setup for Google users
          setNeedsSetup(u.providerData?.[0]?.providerId === 'google.com')
        }
      } catch (err) {
        console.warn('[AuthContext] Firestore read failed:', err.code, err.message)
        // Keep whatever role was set; don't silently demote admin to user
        setRole(prev => prev ?? 'user')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Called by ProfileSetupModal after saving
  const refreshProfile = async () => {
    if (!auth.currentUser) return
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (snap.exists()) { setProfile(snap.data()); setNeedsSetup(false) }
    } catch {}
  }

  const isAdmin = role === 'admin'

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, profile, needsSetup, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
