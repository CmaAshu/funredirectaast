import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const papers = [
  { id:'13', icon:'fa-landmark',    color:'text-amber-500',  title:'Paper 13: Corporate and Economic Laws' },
  { id:'14', icon:'fa-chart-line',  color:'text-orange-500', title:'Paper 14: Strategic Financial Management' },
  { id:'15', icon:'fa-file-invoice-dollar', color:'text-yellow-500', title:'Paper 15: Direct Tax Laws and International Taxation' },
  { id:'16', icon:'fa-bullseye',    color:'text-rose-500',   title:'Paper 16: Strategic Cost Management' },
]

export default function FinalGroup3() {
  const navigate = useNavigate()
  const [dash, setDash] = useState(null)

  return (
    <>
      <Helmet>
        <title>Prepogy - CMA Final Group 3 MCQ Quiz &amp; Bank (Papers 13-16 | Syllabus 2022)</title>
        <meta name="description" content="Free CMA Final Group 3 MCQ Quiz and Question Bank for Syllabus 2022. Practice Paper 13 (Law), Paper 14 (SFM), Paper 15 (Direct Tax), and Paper 16 (SCM) PYQs online." />
        <meta name="keywords" content="cma final group 3 mcq, cma final paper 13 mcq, cma final corporate laws mcq, cma final economic laws mcq, cma final paper 14 mcq, cma final sfm mcq, cma final strategic financial management mcq, cma final paper 15 mcq, cma final direct tax mcq, cma final international taxation mcq, cma final paper 16 mcq, cma final strategic cost management mcq, cma final scm mcq, cma final group 3 pyq" />
        <link rel="canonical" href="https://prepogy.in/final/group3" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Prepogy" />
        <meta property="og:title" content="CMA Final Group 3 MCQ Quiz & Bank (Papers 13-16) | Prepogy" />
        <meta property="og:description" content="Free CMA Final Group 3 MCQ Quiz for Papers 13-16. Practice Corporate Laws, SFM, Direct Tax, and Strategic Cost Management online." />
        <meta property="og:url" content="https://prepogy.in/final/group3" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CMA Final Group 3 MCQ Quiz | Prepogy" />
        <meta name="twitter:description" content="Practice CMA Final Group 3 Papers 13-16 online. Free MCQ bank with instant results on ICMAI Syllabus 2022." />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://prepogy.in/"},{"@type":"ListItem","position":2,"name":"CMA Final Group 3","item":"https://prepogy.in/final/group3"}]})}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto w-full px-5 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">CMA Final Group 3 MCQ Practice</h1>
          <p className="text-slate-500 text-sm mb-8">Select a paper to start practicing MCQ based on ICMAI Syllabus 2022.</p>
        </div>
        <a href="/" onClick={e => { e.preventDefault(); navigate('/') }} className="inline-flex items-center gap-2 text-amber-600 bg-white px-6 py-2.5 rounded-full shadow-sm mb-8 font-bold hover:shadow-md transition-all no-underline hover:scale-105 transform duration-200">
          <i className="fas fa-arrow-left" /> Back to Home
        </a>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {papers.map(p => (
            <div key={p.id} className="card-base subj-final group text-left" onClick={() => setDash(p)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <i className={`fas ${p.icon} ${p.color}`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  Paper {p.id}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3">{p.title}</h3>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">MCQ Bank · Syllabus 2022</span>
                <span className="text-amber-500 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Practice <i className="fas fa-arrow-right text-[9px]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {dash && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto animate-fade-in-up">
          <div className="max-w-4xl mx-auto w-full px-5 py-10 flex-grow">
            <button onClick={() => setDash(null)} className="mb-8 font-bold flex items-center gap-2 text-slate-600 bg-white px-6 py-2.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors"><i className="fas fa-arrow-left" /> Back</button>
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-700">{dash.title}</h2>
            <div className="flex justify-center">
              <div className="card-base mode-bank flex items-center gap-5 text-left p-6 w-full max-w-md cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate(`/quiz/${dash.id}?mode=mcq`)}>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-2xl text-primary"><i className="fas fa-university" /></div>
                <div><h3 className="font-bold text-lg text-slate-700">Institute MCQ Bank</h3><p className="text-xs text-slate-400">ICMAI Syllabus 2022</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
