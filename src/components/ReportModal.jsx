import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function ReportModal({ question, options, currentCorrect, paperId, setName, questionIdx, onClose }) {
  const { user } = useAuth()
  const [suggested, setSuggested] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!suggested) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reports'), {
        paperId,
        setName,
        questionIdx,
        questionText: question,
        currentCorrect,
        suggestedCorrect: suggested,
        note: note.trim(),
        reportedBy: user?.uid || 'anonymous',
        reporterName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        createdAt: serverTimestamp(),
        status: 'pending', // pending | reviewed | resolved
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
            <i className="fas fa-times text-sm" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <i className="fas fa-flag text-lg" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Report an Answer</h3>
              <p className="text-xs opacity-80">Help us improve question accuracy</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="font-extrabold text-slate-800 text-lg mb-2">Thank you!</h4>
              <p className="text-slate-500 text-sm mb-6">Your suggestion has been submitted. Our team will review it.</p>
              <button onClick={onClose} className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Question preview */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Question</p>
                <p className="text-sm text-slate-700 font-medium line-clamp-3">{question}</p>
              </div>

              {/* Current answer */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Currently marked correct</p>
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-green-800">
                  {currentCorrect}
                </div>
              </div>

              {/* Suggest correct answer */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Suggest the correct answer *</p>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${suggested === opt ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="suggested" value={opt} checked={suggested === opt} onChange={() => setSuggested(opt)} className="accent-orange-500" />
                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Additional note (optional)</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Reference: Study material page 42..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={!suggested || submitting}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-100 hover:shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {submitting ? <><i className="fas fa-spinner fa-spin" /> Submitting</> : <><i className="fas fa-paper-plane" /> Submit Report</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
