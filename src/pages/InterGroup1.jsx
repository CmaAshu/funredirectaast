import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import SjcModal from '../components/SjcModal.jsx'

const papers = [
  { id:'5', icon:'fa-scale-balanced', color:'text-indigo-500', title:'Paper 5: Business Laws and Ethics',      hasPyq: true,  hasSjc: false },
  { id:'6', icon:'fa-calculator',     color:'text-blue-500',   title:'Paper 6: Financial Accounting',            hasPyq: true,  hasSjc: false },
  { id:'7', icon:'fa-receipt',        color:'text-violet-500', title:'Paper 7: Direct and Indirect Taxation',    hasPyq: true,  hasSjc: false },
  { id:'8', icon:'fa-chart-bar',      color:'text-purple-500', title:'Paper 8: Cost Accounting',                 hasPyq: true,  hasSjc: true  },
]

export default function InterGroup1() {
  const navigate = useNavigate()
  const [dash, setDash] = useState(null)
  const [sjcModal, setSjcModal] = useState(false)

  return (
    <>
      <Helmet>
        <title>Prepogy - CMA Inter Group 1 MCQ Quiz &amp; Bank (Papers 5-8 | Syllabus 2022)</title>
        <meta name="description" content="Free CMA Intermediate Group 1 MCQ Quiz and Question Bank for Syllabus 2022. Practice Paper 5 (Law), Paper 6 (Financial Accounting), Paper 7 (Taxation), and Paper 8 (Costing) PYQs online." />
        <meta name="keywords" content="cma inter mcq bank, cma intermediate group 1 mcq, cma inter paper 5 mcq, cma inter business law mcq, cma inter law pyq, cma inter paper 5 mcq bank, cma inter paper 6 mcq, cma inter financial accounting mcq, cma inter accounts mcq bank, cma inter paper 7 mcq, cma inter direct and indirect taxation mcq, cma inter tax pyq, cma inter paper 8 mcq, cma inter cost accounting mcq, cma inter costing mcq bank, cma inter costing pyq" />
        <link rel="canonical" href="https://prepogy.in/intermediate/group1" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Prepogy" />
        <meta property="og:title" content="CMA Inter Group 1 MCQ Quiz & Bank (Papers 5-8) | Prepogy" />
        <meta property="og:description" content="Free CMA Intermediate Group 1 MCQ Quiz for Papers 5-8. Practice Business Laws, Financial Accounting, Taxation, and Cost Accounting PYQs online." />
        <meta property="og:url" content="https://prepogy.in/intermediate/group1" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CMA Inter Group 1 MCQ Quiz | Prepogy" />
        <meta name="twitter:description" content="Practice CMA Intermediate Group 1 Papers 5-8 online. Free MCQ bank and PYQs with instant results." />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://prepogy.in/"},{"@type":"ListItem","position":2,"name":"CMA Intermediate Group 1","item":"https://prepogy.in/intermediate/group1"}]})}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto w-full px-5 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">CMA Intermediate Group 1 MCQ Practice</h1>
          <p className="text-slate-500 text-sm mb-8">Select a paper to start practicing MCQ based on ICMAI Syllabus 2022.</p>
        </div>

        <a href="/" onClick={e => { e.preventDefault(); navigate('/') }} className="inline-flex items-center gap-2 text-indigo-600 bg-white px-6 py-2.5 rounded-full shadow-sm mb-8 font-bold hover:shadow-md transition-all no-underline hover:scale-105 transform duration-200">
          <i className="fas fa-arrow-left" /> Back to Home
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {papers.map(p => (
            <div key={p.id} className="card-base subj-inter group text-left" onClick={() => setDash(p)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <i className={`fas ${p.icon} ${p.color}`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Paper {p.id}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3">{p.title}</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">MCQ Bank</span>
                {p.hasPyq && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">PYQ Available</span>}
                {p.hasSjc && <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">SJC Materials</span>}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Syllabus 2022</span>
                <span className="text-indigo-500 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Start <i className="fas fa-arrow-right text-[9px]" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="sr-only">
          <ul>
            <li><a href="/quiz/5">Paper 5: Business Laws and Ethics Practice</a></li>
            <li><a href="/quiz/6">Paper 6: Financial Accounting Practice</a></li>
            <li><a href="/quiz/7">Paper 7: Direct and Indirect Taxation Practice</a></li>
            <li><a href="/quiz/8">Paper 8: Cost Accounting Practice</a></li>
          </ul>
        </div>
      </div>

      {dash && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto animate-fade-in-up">
          <div className="max-w-4xl mx-auto w-full px-5 py-10 flex-grow">
            <button onClick={() => setDash(null)} className="mb-8 font-bold flex items-center gap-2 text-slate-600 bg-white px-6 py-2.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <i className="fas fa-arrow-left" /> Back
            </button>
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-700">{dash.title}</h2>
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
              <div className="card-base mode-bank flex items-center gap-5 text-left p-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate(`/quiz/${dash.id}?mode=mcq`)}>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-2xl text-primary"><i className="fas fa-university" /></div>
                <div><h3 className="font-bold text-lg text-slate-700">Institute MCQ Bank</h3><p className="text-xs text-slate-400">ICMAI Syllabus 2022</p></div>
              </div>
              {dash.hasPyq && (
                <div className="card-base mode-pyq flex items-center gap-5 text-left p-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate(`/quiz/${dash.id}?mode=pyq`)}>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-2xl text-amber-500"><i className="fas fa-file-invoice" /></div>
                  <div><h3 className="font-bold text-lg text-slate-700">Previous Year Papers</h3><p className="text-xs text-slate-400">Chronological PYQ sets</p></div>
                </div>
              )}
              {dash.hasSjc && (
                <div className="card-base mode-sjc flex items-center gap-5 text-left p-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => setSjcModal(true)}>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-2xl font-bold text-sjc">SJC</div>
                  <div><h3 className="font-bold text-lg text-slate-700">SJC Costing MCQ</h3><p className="text-xs text-slate-400">SJC Institute Materials</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {sjcModal && (
        <SjcModal
          onClose={() => setSjcModal(false)}
          onStart={() => { setSjcModal(false); navigate('/quiz/8?mode=sjc') }}
        />
      )}
    </>
  )
}
