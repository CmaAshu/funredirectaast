import { useState, useEffect } from 'react'
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase.js'
import { paperRegistry } from '../../data/registry.js'

const PAPER_LIST = Object.entries(paperRegistry).map(([id, m]) => ({ id, title: m.shortTitle + ' — ' + m.title }))

function QuestionForm({ initial, onSave, onCancel, saving }) {
  const [q, setQ]   = useState(initial?.q || '')
  const [o, setO]   = useState(initial?.o || ['', '', '', ''])
  const [c, setC]   = useState(initial?.c || '')
  const [e, setE]   = useState(initial?.e || '')

  const updateOpt = (i, val) => { const n = [...o]; n[i] = val; setO(n) }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Question Text *</label>
        <textarea value={q} onChange={e => setQ(e.target.value)} rows={3}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
          placeholder="Enter question..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {o.map((opt, i) => (
          <div key={i}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Option {String.fromCharCode(65+i)} *</label>
            <input value={opt} onChange={e => updateOpt(i, e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              placeholder={`Option ${String.fromCharCode(65+i)}`} />
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Correct Answer *</label>
        <select value={c} onChange={e => setC(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary bg-white">
          <option value="">— Select correct option —</option>
          {o.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Explanation (optional)</label>
        <input value={e} onChange={ev => setE(ev.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="Explanation or reference..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
        <button onClick={() => onSave({ q, o, c, e })} disabled={!q || !c || saving}
          className="flex-1 py-3 rounded-2xl font-bold text-sm bg-primary text-white shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {saving ? <><i className="fas fa-spinner fa-spin" /> Saving</> : <><i className="fas fa-check" /> Save Question</>}
        </button>
      </div>
    </div>
  )
}

export default function AdminQuizzes() {
  const [selectedPaper, setSelectedPaper] = useState('')
  const [selectedSet, setSelectedSet]     = useState('')
  const [questions, setQuestions]         = useState([])
  const [loading, setLoading]             = useState(false)
  const [adding, setAdding]               = useState(false)
  const [editId, setEditId]               = useState(null)
  const [saving, setSaving]               = useState(false)
  const [deleting, setDeleting]           = useState(null)
  const [sets, setSets]                   = useState([])

  const colPath = () => `quizOverrides/${selectedPaper}/sets/${selectedSet}/questions`

  const loadSets = async (paperId) => {
    try {
      const snap = await getDocs(collection(db, `quizOverrides/${paperId}/sets`))
      setSets(snap.docs.map(d => d.id))
    } catch { setSets([]) }
  }

  const loadQuestions = async () => {
    if (!selectedPaper || !selectedSet) return
    setLoading(true)
    try {
      const q = query(collection(db, colPath()), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setQuestions([]) }
    setLoading(false)
  }

  useEffect(() => { if (selectedPaper) loadSets(selectedPaper) }, [selectedPaper])
  useEffect(() => { if (selectedSet) loadQuestions() }, [selectedSet])

  const createSet = async () => {
    const name = window.prompt('Enter set name (e.g. "Custom Set 1"):')
    if (!name) return
    await setDoc(doc(db, `quizOverrides/${selectedPaper}/sets/${name}`), { createdAt: serverTimestamp() })
    setSets(prev => [...prev, name])
    setSelectedSet(name)
  }

  const handleAdd = async ({ q, o, c, e }) => {
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, colPath()), { q, o, c, e, createdAt: serverTimestamp() })
      setQuestions(prev => [...prev, { id: ref.id, q, o, c, e }])
      setAdding(false)
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const handleEdit = async ({ q, o, c, e }) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, colPath(), editId), { q, o, c, e })
      setQuestions(prev => prev.map(qu => qu.id === editId ? { ...qu, q, o, c, e } : qu))
      setEditId(null)
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, colPath(), id))
      setQuestions(prev => prev.filter(q => q.id !== id))
    } catch (err) { console.error(err) }
    setDeleting(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Manage Quizzes</h1>
        <p className="text-slate-400 text-sm">Add, edit, or delete questions stored in Firestore. These override static data files.</p>
      </div>

      {/* Paper + Set selector */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Select Paper</label>
            <select value={selectedPaper} onChange={e => { setSelectedPaper(e.target.value); setSelectedSet(''); setQuestions([]) }}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary bg-white">
              <option value="">— Choose a paper —</option>
              {PAPER_LIST.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Select Question Set</label>
            <div className="flex gap-2">
              <select value={selectedSet} onChange={e => setSelectedSet(e.target.value)} disabled={!selectedPaper}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary bg-white disabled:opacity-50">
                <option value="">— Choose a set —</option>
                {sets.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {selectedPaper && (
                <button onClick={createSet} title="Create new set"
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-all">
                  + New
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 font-semibold">
          <i className="fas fa-info-circle mr-1.5" />
          Questions here are stored in Firestore under <code>quizOverrides/</code>. These are separate from the static data files. You can build dynamic quiz sets here.
        </div>
      </div>

      {/* Question list */}
      {selectedSet && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-slate-700">{questions.length} Question{questions.length !== 1 ? 's' : ''} in "{selectedSet}"</h2>
            <button onClick={() => setAdding(true)} disabled={adding}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-dark transition-all">
              <i className="fas fa-plus" /> Add Question
            </button>
          </div>

          {adding && (
            <div className="mb-4">
              <QuestionForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
              <i className="fas fa-spinner fa-spin" /> Loading...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fas fa-circle-question text-4xl block opacity-30 mb-3" />
              <p className="font-semibold">No questions yet.</p>
              <p className="text-sm mt-1">Add questions using the button above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((qu, idx) => (
                <div key={qu.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {editId === qu.id ? (
                    <div className="p-4">
                      <QuestionForm initial={qu} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} />
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Q{idx + 1}</p>
                          <p className="text-sm font-semibold text-slate-700 mb-3">{qu.q}</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(qu.o || []).map((opt, i) => (
                              <div key={i} className={`text-xs px-3 py-1.5 rounded-xl font-semibold border ${opt === qu.c ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                {String.fromCharCode(65+i)}. {opt}
                              </div>
                            ))}
                          </div>
                          {qu.e && <p className="text-xs text-slate-400 mt-2 italic">💡 {qu.e}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setEditId(qu.id)} className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all flex items-center justify-center">
                            <i className="fas fa-pen text-xs" />
                          </button>
                          <button onClick={() => handleDelete(qu.id)} disabled={deleting === qu.id}
                            className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-all flex items-center justify-center">
                            {deleting === qu.id ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-trash text-xs" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
