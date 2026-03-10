import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase.js'

const SECTIONS = ['Company Audit', 'Basic Concepts', 'Special Audits']

const EMPTY_FORM = {
  section: 'Company Audit',
  topic: '',
  meta: '',
  question: '',
  answer: '',
}

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-[11px] text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

const INPUT_CLS  = "w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-primary transition-colors"
const TA_CLS     = `${INPUT_CLS} resize-y min-h-[90px]`

export default function AdminAuditHub() {
  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(null)
  const [editId,    setEditId]    = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [showForm,  setShowForm]  = useState(false)
  const [preview,   setPreview]   = useState(false)
  const [toast,     setToast]     = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const q    = query(collection(db, 'auditQuestions'), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      setQuestions(snap.docs.map(d => ({ firestoreId: d.id, ...d.data() })))
    } catch (e) {
      showToast('Failed to load questions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadQuestions() }, [])

  const openAdd = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setPreview(false)
    setShowForm(true)
  }

  const openEdit = (q) => {
    setEditId(q.firestoreId)
    setForm({ section: q.section, topic: q.topic, meta: q.meta || '', question: q.question, answer: q.answer })
    setPreview(false)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!form.topic.trim() || !form.question.trim() || !form.answer.trim()) {
      showToast('Topic, Question and Answer are required', 'error'); return
    }
    setSaving(true)
    try {
      const data = { ...form, updatedAt: serverTimestamp() }
      if (editId) {
        await updateDoc(doc(db, 'auditQuestions', editId), data)
        showToast('Question updated!')
      } else {
        await addDoc(collection(db, 'auditQuestions'), { ...data, createdAt: serverTimestamp() })
        showToast('Question added!')
      }
      setShowForm(false)
      setEditId(null)
      setForm(EMPTY_FORM)
      await loadQuestions()
    } catch (e) {
      showToast('Save failed: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (firestoreId) => {
    if (!window.confirm('Delete this question? This cannot be undone.')) return
    setDeleting(firestoreId)
    try {
      await deleteDoc(doc(db, 'auditQuestions', firestoreId))
      showToast('Question deleted')
      await loadQuestions()
    } catch (e) {
      showToast('Delete failed', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const SEC_COLOR = {
    'Company Audit':  'bg-blue-50 text-blue-700 border-blue-200',
    'Basic Concepts': 'bg-violet-50 text-violet-700 border-violet-200',
    'Special Audits': 'bg-amber-50 text-amber-700 border-amber-200',
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
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Audit Hub Questions</h1>
          <p className="text-slate-400 text-sm">Add or edit custom questions for the Audit Revision Hub. These are stored in Firestore and merged with the built-in questions.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md hover:bg-primary-dark transition-all hover:-translate-y-0.5">
          <i className="fas fa-plus" /> Add Question
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-slate-800 text-lg">
              {editId ? '✏️ Edit Question' : '➕ New Question'}
            </h2>
            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all">
              <i className="fas fa-times text-xs" />
            </button>
          </div>

          {/* Section */}
          <FormField label="Section">
            <div className="flex gap-2 flex-wrap">
              {SECTIONS.map(s => (
                <button key={s} onClick={() => set('section', s)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${form.section === s ? 'bg-primary text-white border-primary shadow' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary hover:text-primary'}`}>
                  {s}
                </button>
              ))}
            </div>
          </FormField>

          {/* Topic & Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Topic *" hint="e.g. 🚫 Prohibited Services">
              <input value={form.topic} onChange={e => set('topic', e.target.value)} className={INPUT_CLS} placeholder="Topic name (emojis welcome)" />
            </FormField>
            <FormField label="Meta" hint="Optional tag e.g. (PYQ J'23)">
              <input value={form.meta} onChange={e => set('meta', e.target.value)} className={INPUT_CLS} placeholder="(PYQ D'23-old) optional" />
            </FormField>
          </div>

          {/* Question */}
          <FormField label="Question *">
            <textarea value={form.question} onChange={e => set('question', e.target.value)} className={TA_CLS} placeholder="Write the full question text here..." />
          </FormField>

          {/* Answer */}
          <FormField label="Answer HTML *" hint="Supports HTML tags: <p>, <h3 class='text-rose-600 font-extrabold'>, <ul><li>, <strong>, etc.">
            <textarea value={form.answer} onChange={e => set('answer', e.target.value)} className={`${TA_CLS} min-h-[180px] font-mono text-xs`}
              placeholder={'<h3 class="text-blue-600 font-extrabold mb-2">Section Title</h3>\n<p class="mb-3">Answer body here...</p>\n<ul class="space-y-1">\n  <li>👉 <strong>Point one</strong></li>\n</ul>'} />
          </FormField>

          {/* Preview toggle */}
          {form.answer && (
            <div>
              <button onClick={() => setPreview(v => !v)} className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2">
                <i className={`fas ${preview ? 'fa-code' : 'fa-eye'}`} />
                {preview ? 'Hide Preview' : 'Preview Answer'}
              </button>
              {preview && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                  <div className="text-sm text-slate-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: form.answer }} />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow hover:bg-primary-dark transition-all disabled:opacity-60">
              {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-save" />}
              {saving ? 'Saving…' : editId ? 'Update Question' : 'Save Question'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-6 py-2.5 rounded-2xl text-sm font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-slate-800">
            Custom Questions
            <span className="ml-2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{questions.length}</span>
          </h2>
          <p className="text-xs text-slate-400">Built-in questions are in <code className="bg-slate-100 px-1 rounded">audit_data.js</code></p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400">
            <i className="fas fa-spinner fa-spin text-2xl mb-3 block" /> Loading…
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <i className="fas fa-plus-circle text-4xl mb-3 block opacity-30" />
            <p className="font-semibold">No custom questions yet</p>
            <p className="text-xs mt-1">Click "Add Question" to create the first one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map(q => (
              <div key={q.firestoreId} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${SEC_COLOR[q.section] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {q.section}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 px-2.5 py-0.5 rounded-full">{q.topic}</span>
                    {q.meta && <span className="text-[10px] text-slate-400 italic">{q.meta}</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 line-clamp-2">{q.question}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(q)}
                    className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all text-xs">
                    <i className="fas fa-pen" />
                  </button>
                  <button onClick={() => handleDelete(q.firestoreId)} disabled={deleting === q.firestoreId}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all text-xs disabled:opacity-50">
                    {deleting === q.firestoreId ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-trash" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note about Firestore rules */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700 leading-relaxed">
        <i className="fas fa-triangle-exclamation mr-1.5" />
        <strong>Firestore rule required:</strong> Make sure your Firestore security rules allow admin writes to the <code className="bg-amber-100 px-1 rounded">auditQuestions</code> collection. See <code>FIRESTORE_RULES.txt</code> for the recommended rules.
      </div>
    </div>
  )
}
