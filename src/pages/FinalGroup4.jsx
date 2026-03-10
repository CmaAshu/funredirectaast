import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const papers = [
  { id:'17', icon:'fa-audit',          color:'text-amber-500',  title:'Paper 17: Cost and Management Audit', hasPyq: true },
  { id:'18', icon:'fa-file-alt',        color:'text-orange-500', title:'Paper 18: Corporate Financial Reporting' },
  { id:'19', icon:'fa-receipt',         color:'text-yellow-500', title:'Paper 19: Indirect Tax Laws and Practice' },
  { id:'20A', icon:'fa-chess-king',     color:'text-rose-500',  title:'Paper 20A: Strategic Performance Management and Business Valuation' },
  { id:'20B', icon:'fa-shield-alt',     color:'text-pink-500',   title:'Paper 20B: Risk Management in Banking and Insurance' },
  { id:'20C', icon:'fa-globe-americas', color:'text-fuchsia-500',title:'Paper 20C: International Taxation' },
]

export default function FinalGroup4() {
  const navigate = useNavigate()
  const [dash, setDash] = useState(null)

  return (
    <>
      <Helmet>
        <title>Prepogy - CMA Final Group 4 MCQ Quiz &amp; Bank (Papers 17-20 | Syllabus 2022)</title>
        <meta name="description" content="Free CMA Final Group 4 MCQ Quiz and Question Bank for Syllabus 2022. Practice Paper 17 (Cost Audit), Paper 18 (CFR), Paper 19 (Indirect Tax), and Electives (SPMBV/Risk/Intl Tax) PYQs online." />
        <meta name="keywords" content="cma final group 4 mcq, cma final paper 17 mcq, cma final cost audit mcq, cma final management audit mcq, cma final paper 18 mcq, cma final cfr mcq, cma final corporate financial reporting mcq, cma final paper 19 mcq, cma final idt mcq, cma final indirect tax laws mcq, cma final gst mcq, cma final paper 20 mcq, cma final spmbv mcq, cma final risk management mcq, cma final international taxation mcq, cma final group 4 pyq" />
        <link rel="canonical" href="https://prepogy.in/final/group4" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Prepogy" />
        <meta property="og:title" content="CMA Final Group 4 MCQ Quiz & Bank (Papers 17-20) | Prepogy" />
        <meta property="og:description" content="Free CMA Final Group 4 MCQ Quiz for Papers 17-20. Practice Cost Audit, CFR, Indirect Tax, and Elective papers online." />
        <meta property="og:url" content="https://prepogy.in/final/group4" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CMA Final Group 4 MCQ Quiz | Prepogy" />
        <meta name="twitter:description" content="Practice CMA Final Group 4 Papers 17-20 online. Free MCQ bank with instant results on ICMAI Syllabus 2022." />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://prepogy.in/"},{"@type":"ListItem","position":2,"name":"CMA Final Group 4","item":"https://prepogy.in/final/group4"}]})}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto w-full px-5 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">CMA Final Group 4 MCQ Practice</h1>
          <p className="text-slate-500 text-sm mb-8">Select a paper to start practicing MCQ based on ICMAI Syllabus 2022.</p>
        </div>
        <a href="/" onClick={e => { e.preventDefault(); navigate('/') }} className="inline-flex items-center gap-2 text-amber-600 bg-white px-6 py-2.5 rounded-full shadow-sm mb-8 font-bold hover:shadow-md transition-all no-underline hover:scale-105 transform duration-200">
          <i className="fas fa-arrow-left" /> Back to Home
        </a>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map(p => (
            <div key={p.id} className="card-base subj-final flex items-center gap-5 text-left" onClick={() => setDash(p)}>
              <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shrink-0 text-2xl shadow-sm"><i className={`fas ${p.icon} ${p.color}`} /></div>
              <div><h3 className="font-bold text-gray-800">{p.title}</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MCQ Bank · Practice Online</p></div>
            </div>
          ))}
        </div>
      </div>

      {dash && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto animate-fade-in-up">
          <div className="max-w-4xl mx-auto w-full px-5 py-10 flex-grow">
            <button onClick={() => setDash(null)} className="mb-8 font-bold flex items-center gap-2 text-slate-600 bg-white px-6 py-2.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors"><i className="fas fa-arrow-left" /> Back</button>
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-700">{dash.title}</h2>
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <div className="card-base mode-bank flex items-center gap-5 text-left p-6 w-full cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate(`/quiz/${dash.id}?mode=mcq`)}>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-2xl text-primary"><i className="fas fa-university" /></div>
                <div><h3 className="font-bold text-lg text-slate-700">Institute MCQ Bank</h3><p className="text-xs text-slate-400">ICMAI Syllabus 2022</p></div>
              </div>
              {dash.hasPyq && (
                <div className="card-base mode-pyq flex items-center gap-5 text-left p-6 w-full cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate(`/quiz/${dash.id}?mode=pyq`)}>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-2xl text-amber-500"><i className="fas fa-file-invoice" /></div>
                  <div><h3 className="font-bold text-lg text-slate-700">Previous Year Papers</h3><p className="text-xs text-slate-400">Chronological PYQ sets</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
