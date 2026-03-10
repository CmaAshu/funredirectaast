import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase.js'

function BlogForm({ initial, onSave, onCancel, saving }) {
  const [title,   setTitle]   = useState(initial?.title   || '')
  const [slug,    setSlug]    = useState(initial?.slug    || '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '')
  const [content, setContent] = useState(initial?.content || '')
  const [tag,     setTag]     = useState(initial?.tag     || '')
  const [cover,   setCover]   = useState(initial?.cover   || '')

  const autoSlug = (v) => v.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label-xs">Title *</label>
          <input value={title} onChange={e => { setTitle(e.target.value); if (!initial) setSlug(autoSlug(e.target.value)) }}
            className="input-base" placeholder="e.g. 30-Day Study Plan for Paper 7" />
        </div>
        <div>
          <label className="label-xs">Slug (URL key) *</label>
          <input value={slug} onChange={e => setSlug(autoSlug(e.target.value))}
            className="input-base font-mono text-xs" placeholder="e.g. 30-day-paper-7" />
        </div>
        <div>
          <label className="label-xs">Tag / Category</label>
          <input value={tag} onChange={e => setTag(e.target.value)} className="input-base" placeholder="e.g. Taxation, Strategy..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label-xs">Cover Image URL (optional)</label>
          <input value={cover} onChange={e => setCover(e.target.value)} className="input-base" placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label-xs">Excerpt (shown on blog list) *</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
            className="input-base resize-none" placeholder="Short summary shown on blog cards..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label-xs">Content (HTML or Markdown) *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={10}
            className="input-base resize-y font-mono text-xs" placeholder="Full article content..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
        <button onClick={() => onSave({ title, slug, excerpt, content, tag, cover })} disabled={!title || !slug || !excerpt || !content || saving}
          className="flex-1 py-3 rounded-2xl font-bold text-sm bg-primary text-white shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {saving ? <><i className="fas fa-spinner fa-spin" /> Saving</> : <><i className="fas fa-check" /> Save Post</>}
        </button>
      </div>
    </div>
  )
}

export default function AdminBlog() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [adding,  setAdding]  = useState(false)
  const [editId,  setEditId]  = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setPosts([]) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleAdd = async (data) => {
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, 'blog'), { ...data, published: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      setPosts(prev => [{ id: ref.id, ...data, published: true }, ...prev])
      setAdding(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const handleEdit = async (data) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'blog', editId), { ...data, updatedAt: serverTimestamp() })
      setPosts(prev => prev.map(p => p.id === editId ? { ...p, ...data } : p))
      setEditId(null)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, 'blog', id))
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (e) { console.error(e) }
    setDeleting(null)
  }

  const togglePublish = async (post) => {
    try {
      await updateDoc(doc(db, 'blog', post.id), { published: !post.published })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p))
    } catch (e) { console.error(e) }
  }

  return (
    <div>
      <style>{`.label-xs { display:block; font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; margin-bottom:0.375rem; } .input-base { display:block; width:100%; border:1px solid #e2e8f0; border-radius:0.75rem; padding:0.625rem 1rem; font-size:0.875rem; outline:none; } .input-base:focus { border-color:#6366f1; }`}</style>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Blog Posts</h1>
          <p className="text-slate-400 text-sm">{posts.length} post{posts.length !== 1 ? 's' : ''} in Firestore</p>
        </div>
        <button onClick={() => { setAdding(true); setEditId(null) }} disabled={adding}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-dark transition-all disabled:opacity-50">
          <i className="fas fa-plus" /> New Post
        </button>
      </div>

      {adding && (
        <div className="mb-6">
          <h2 className="font-extrabold text-slate-700 mb-3">New Post</h2>
          <BlogForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <i className="fas fa-spinner fa-spin text-2xl" /> Loading...
        </div>
      ) : posts.length === 0 && !adding ? (
        <div className="text-center py-20 text-slate-400">
          <i className="fas fa-newspaper text-4xl block opacity-30 mb-3" />
          <p className="font-semibold">No blog posts yet.</p>
          <p className="text-sm mt-1">Create your first post using the button above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {editId === post.id ? (
                <div className="p-5">
                  <BlogForm initial={post} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} />
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {post.tag && (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-100">{post.tag}</span>
                        )}
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${post.published ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {post.published ? '✓ Published' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-800 mb-1">{post.title}</h3>
                      <p className="text-xs text-slate-400 font-mono mb-2">/blog/{post.slug}</p>
                      <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                    </div>
                    {post.cover && (
                      <img src={post.cover} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100" onError={e => e.target.style.display='none'} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <button onClick={() => togglePublish(post)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${post.published ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}>
                      {post.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => { setEditId(post.id); setAdding(false) }}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-500 border-blue-200 hover:bg-blue-100 transition-all">
                      <i className="fas fa-pen mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border bg-red-50 text-red-400 border-red-200 hover:bg-red-100 transition-all ml-auto disabled:opacity-50">
                      {deleting === post.id ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-trash mr-1" /> Delete</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
