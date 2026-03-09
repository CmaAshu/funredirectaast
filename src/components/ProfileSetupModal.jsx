import { useState, useRef } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

const EXAM_LEVELS = [
  { id: 'foundation', label: 'Foundation',   icon: 'fa-seedling',       selBg: 'bg-emerald-500', selText: 'text-white', iconSel: 'text-white', defIcon: 'text-emerald-500' },
  { id: 'inter',      label: 'Intermediate', icon: 'fa-graduation-cap', selBg: 'bg-indigo-500',  selText: 'text-white', iconSel: 'text-white', defIcon: 'text-indigo-500'  },
  { id: 'final',      label: 'Final',        icon: 'fa-trophy',         selBg: 'bg-amber-500',   selText: 'text-white', iconSel: 'text-white', defIcon: 'text-amber-500'   },
]

export default function ProfileSetupModal({ onClose }) {
  const { user, refreshProfile } = useAuth()

  const [displayName,   setDisplayName]   = useState(user?.displayName || '')
  const [city,          setCity]          = useState('')
  const [age,           setAge]           = useState('')
  const [examLevel,     setExamLevel]     = useState('')
  const [avatarFile,    setAvatarFile]    = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || null)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')
  const fileRef = useRef(null)

  const pickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2 MB.'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Please enter your name.'); return }
    if (!examLevel)          { setError('Please select your exam level.'); return }
    setSaving(true); setError('')

    try {
      let photoURL = user?.photoURL || ''

      // If user uploaded a custom avatar, convert to base64 data URL
      // (Firebase Storage requires Blaze plan; we use Firestore to store small base64 instead)
      if (avatarFile) {
        photoURL = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload  = () => res(r.result)
          r.onerror = rej
          r.readAsDataURL(avatarFile)
        })
        // Update Firebase Auth photo
        await updateProfile(auth.currentUser, { displayName: displayName.trim(), photoURL })
      } else {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() })
      }

      // Write full profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName:     displayName.trim(),
        photoURL,
        city:            city.trim(),
        age:             age ? parseInt(age, 10) : null,
        examLevel,
        profileComplete: true,
        updatedAt:       serverTimestamp(),
      }, { merge: true })

      await refreshProfile()
      onClose()
    } catch (err) {
      console.error('[ProfileSetup]', err)
      setError('Could not save profile. Please try again.')
    }
    setSaving(false)
  }

  const initials = (displayName || user?.email || '?')[0]?.toUpperCase()

  return (
    <div className="fixed inset-0 z-[4000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl my-auto animate-fade-in-up">

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 px-8 pt-8 pb-6 text-center text-white rounded-t-[40px]">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-2xl font-extrabold">Complete Your Profile</h2>
          <p className="text-indigo-100 text-sm mt-1">Appear on the leaderboard with your name &amp; city!</p>
        </div>

        <div className="p-8 space-y-5">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100 shadow-lg">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-3xl font-bold">
                      {initials}
                    </div>}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-camera text-white text-lg" />
              </div>
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="text-xs font-bold text-primary hover:underline">
              {avatarPreview ? 'Change photo' : '+ Upload photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input value={displayName} onChange={e => { setDisplayName(e.target.value); setError('') }}
              placeholder="How should we call you?"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary focus:outline-none text-sm font-medium" />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
              City <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </label>
            <div className="relative">
              <i className="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder="Mumbai, Delhi, Kolkata…"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary focus:outline-none text-sm font-medium" />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
              Age <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </label>
            <input type="number" min="15" max="60" value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="Your age"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary focus:outline-none text-sm font-medium" />
          </div>

          {/* Exam level */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              I am preparing for… <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXAM_LEVELS.map(lv => {
                const sel = examLevel === lv.id
                return (
                  <button key={lv.id} type="button"
                    onClick={() => { setExamLevel(lv.id); setError('') }}
                    className={`rounded-2xl p-4 text-center border-2 transition-all duration-200 ${sel ? `${lv.selBg} border-transparent shadow-lg scale-105` : 'border-slate-200 bg-white hover:border-slate-300 hover:scale-102'}`}>
                    <i className={`fas ${lv.icon} text-xl mb-2 block ${sel ? lv.iconSel : lv.defIcon}`} />
                    <p className={`text-xs font-extrabold leading-tight ${sel ? lv.selText : 'text-slate-600'}`}>{lv.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-extrabold hover:opacity-90 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 mt-2">
            {saving
              ? <><i className="fas fa-spinner fa-spin mr-2" />Saving…</>
              : <><i className="fas fa-rocket mr-2" />Save & Start Practising</>}
          </button>

          <button onClick={onClose}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold py-1 transition-colors">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
