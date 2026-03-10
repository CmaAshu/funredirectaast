import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase.js'

const DOC_REF = () => doc(db, 'siteConfig', 'homePage')

// Default values that mirror the current hardcoded text
const DEFAULTS = {
  instagram: {
    title: 'Stay Updated @prepogy.in',
    body: 'Follow us on Instagram for website updates, new feature announcements, and community news. Your backup channel to stay connected.',
    btn: 'Follow for Updates',
  },
  audit: {
    title: 'Audit Revision Hub',
    body: '51 important questions with full answers. Track your progress, filter by section, and prepare smarter for Paper 10.',
    btn: 'Start Revision',
  },
  whyTitle: 'Why Prepogy?',
  features: [
    { icon: 'fa-list-check', color: 'bg-indigo-50 text-indigo-600', title: 'Institute MCQs', text: 'All MCQs released by the institute are converted into quiz form, making your practice easier and effective.' },
    { icon: 'fa-history',    color: 'bg-emerald-50 text-emerald-600', title: 'Institute PYQs', text: 'Practice confidently with a comprehensive collection of Previous Year Questions directly from the institute.' },
    { icon: 'fa-robot',      color: 'bg-amber-50 text-amber-600',    title: 'Ask Guruji',   text: 'Get instant AI-powered explanations for your doubts using our integrated Google search tool.' },
  ],
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
        <i className={`fas ${icon} text-primary`} /> {title}
      </h2>
      {children}
    </div>
  )
}

const INPUT_CLS  = "w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-primary transition-colors"
const TA_CLS     = `${INPUT_CLS} resize-y`

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-[11px] text-slate-400 mb-1">{hint}</p>}
      {children}
    </div>
  )
}

export default function AdminHomePage() {
  const [config,   setConfig]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(DOC_REF())
        setConfig(snap.exists() ? deepMerge(DEFAULTS, snap.data()) : structuredClone(DEFAULTS))
      } catch {
        setConfig(structuredClone(DEFAULTS))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await setDoc(DOC_REF(), { ...config, updatedAt: serverTimestamp() }, { merge: true })
      showToast('Home page config saved! Changes live immediately.')
    } catch (e) {
      showToast('Save failed: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    if (!window.confirm('Reset all values to defaults?')) return
    setConfig(structuredClone(DEFAULTS))
    showToast('Reset to defaults — click Save to apply')
  }

  // Nested setter helpers
  const setInsta  = (k, v) => setConfig(c => ({ ...c, instagram: { ...c.instagram, [k]: v } }))
  const setAudit  = (k, v) => setConfig(c => ({ ...c, audit: { ...c.audit, [k]: v } }))
  const setFeature = (i, k, v) => setConfig(c => {
    const features = c.features.map((f, idx) => idx === i ? { ...f, [k]: v } : f)
    return { ...c, features }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <i className="fas fa-spinner fa-spin text-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-2xl shadow-xl text-sm font-bold text-white animate-fade-in-up ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Home Page Editor</h1>
          <p className="text-slate-400 text-sm">Edit card text, button labels, and feature descriptions. Changes save to Firestore and go live instantly.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="px-4 py-2.5 rounded-2xl text-sm font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
            <i className="fas fa-rotate-left mr-1.5" />Reset
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md hover:bg-primary-dark transition-all hover:-translate-y-0.5 disabled:opacity-60">
            {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-cloud-arrow-up" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Instagram Card */}
      <SectionCard title="Instagram Card" icon="fa-instagram">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Card Title">
            <input value={config.instagram.title} onChange={e => setInsta('title', e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="Button Label">
            <input value={config.instagram.btn} onChange={e => setInsta('btn', e.target.value)} className={INPUT_CLS} />
          </Field>
        </div>
        <Field label="Body Text">
          <textarea value={config.instagram.body} onChange={e => setInsta('body', e.target.value)} className={TA_CLS} rows={3} />
        </Field>
        {/* Live preview */}
        <div className="rounded-2xl overflow-hidden text-white p-5 text-sm"
          style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg mb-3"><i className="fab fa-instagram" /></div>
          <p className="font-extrabold mb-1">{config.instagram.title || '—'}</p>
          <p className="text-white/80 text-xs leading-relaxed mb-3">{config.instagram.body || '—'}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full">
            {config.instagram.btn || '—'} <i className="fab fa-instagram text-[9px]" />
          </span>
        </div>
      </SectionCard>

      {/* Audit Hub Card */}
      <SectionCard title="Audit Revision Hub Card" icon="fa-building-columns">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Card Title">
            <input value={config.audit.title} onChange={e => setAudit('title', e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="Button Label">
            <input value={config.audit.btn} onChange={e => setAudit('btn', e.target.value)} className={INPUT_CLS} />
          </Field>
        </div>
        <Field label="Body Text">
          <textarea value={config.audit.body} onChange={e => setAudit('body', e.target.value)} className={TA_CLS} rows={3} />
        </Field>
        {/* Live preview */}
        <div className="rounded-2xl text-white p-5 text-sm bg-gradient-to-br from-violet-600 to-indigo-600">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg mb-3"><i className="fas fa-building-columns" /></div>
          <p className="font-extrabold mb-1">{config.audit.title || '—'}</p>
          <p className="text-white/70 text-xs leading-relaxed mb-3">{config.audit.body || '—'}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full">
            {config.audit.btn || '—'} <i className="fas fa-arrow-right text-[9px]" />
          </span>
        </div>
      </SectionCard>

      {/* Why Prepogy */}
      <SectionCard title="Why Prepogy Section" icon="fa-star">
        <Field label="Section Heading">
          <input value={config.whyTitle} onChange={e => setConfig(c => ({ ...c, whyTitle: e.target.value }))} className={INPUT_CLS} />
        </Field>
        <div className="space-y-4 mt-2">
          {config.features.map((f, i) => (
            <div key={i} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Feature {i + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Title">
                  <input value={f.title} onChange={e => setFeature(i, 'title', e.target.value)} className={INPUT_CLS} />
                </Field>
                <Field label="Icon class" hint="FontAwesome class e.g. fa-list-check">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      <i className={`fas ${f.icon}`} />
                    </span>
                    <input value={f.icon} onChange={e => setFeature(i, 'icon', e.target.value)} className={`${INPUT_CLS} pl-8`} />
                  </div>
                </Field>
              </div>
              <Field label="Description">
                <textarea value={f.text} onChange={e => setFeature(i, 'text', e.target.value)} className={TA_CLS} rows={2} />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl shadow-indigo-200 hover:bg-primary-dark transition-all hover:-translate-y-0.5 disabled:opacity-60">
          {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-cloud-arrow-up" />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}

// Deep merge helper (right wins)
function deepMerge(base, override) {
  if (!override) return structuredClone(base)
  const result = { ...base }
  for (const key of Object.keys(override)) {
    if (Array.isArray(override[key])) {
      result[key] = override[key]
    } else if (typeof override[key] === 'object' && override[key] !== null && typeof base[key] === 'object') {
      result[key] = deepMerge(base[key], override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}
