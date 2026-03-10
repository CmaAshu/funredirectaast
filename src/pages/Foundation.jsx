import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const papers = [
  { id:'1', icon:'fa-gavel',      color:'text-emerald-500', title:'Paper 1: Fundamentals of Business Laws and Business Communication Hub' },
  { id:'2', icon:'fa-calculator', color:'text-blue-500',    title:'Paper 2: Fundamentals of Financial and Cost Accounting Hub' },
  { id:'3', icon:'fa-chart-line', color:'text-indigo-500',  title:'Paper 3: Fundamentals of Mathematics and Statistics Hub' },
  { id:'4', icon:'fa-globe',      color:'text-cyan-500',    title:'Paper 4: Fundamentals of Business Economics and Management Hub' },
]

export default function Foundation() {
  const navigate = useNavigate()
  const [dash, setDash] = useState(null) // { id, title }

  return (
    <>
      <Helmet>
        <title>Prepogy - CMA Foundation MCQ Quiz &amp; Bank (Papers 1-4 | Syllabus 2022)</title>
        <meta name="description" content="Free CMA Foundation MCQ Quiz and Question Bank for Syllabus 2022. Practice Paper 1 (Law), Paper 2 (Accounts), Paper 3 (Maths), and Paper 4 (Economics) online with instant results." />
        <meta name="keywords" content="cma foundation mcq quiz, cma foundation paper 1 mcq, cma foundation accounts mcq, cma foundation maths mcq, cma foundation economics mcq, cma foundation mcq bank" />
        <link rel="canonical" href="https://prepogy.in/foundation" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Prepogy" />
        <meta property="og:title" content="CMA Foundation MCQ Quiz & Bank (Papers 1-4) | Prepogy" />
        <meta property="og:description" content="Free CMA Foundation MCQ Quiz and Question Bank for Syllabus 2022. Practice Papers 1-4 online with instant results." />
        <meta property="og:url" content="https://prepogy.in/foundation" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CMA Foundation MCQ Quiz & Bank | Prepogy" />
        <meta name="twitter:description" content="Practice CMA Foundation Papers 1-4 online. Free MCQ quiz with instant results on ICMAI Syllabus 2022." />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://prepogy.in/"},{"@type":"ListItem","position":2,"name":"CMA Foundation","item":"https://prepogy.in/foundation"}]})}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto w-full px-5 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">CMA Foundation MCQ Practice</h1>
          <p className="text-slate-500 text-sm mb-8">Select a paper below to start practicing MCQ questions online based on the Syllabus 2022.</p>
          <div className="max-w-3xl mx-auto mb-12 hidden md:block animate-fade-in-up">
            <div className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 rounded-[32px] p-8 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -right-10 -bottom-10 text-[150px] text-emerald-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700"><i className="fas fa-seedling" /></div>
              <h3 className="text-xl font-black text-emerald-700 mb-4 flex items-center gap-3 justify-center md:justify-start">
                <span className="bg-emerald-100 p-2 rounded-xl text-2xl shadow-sm">🚀</span>
                <span>Kickstart Your CMA Journey!</span>
              </h3>
              <p className="text-slate-600 leading-relaxed relative z-10 font-medium text-sm md:text-base text-left">
                Welcome to the <span className="text-emerald-600 font-bold">ultimate CMA Foundation hub!</span> 🌟 Designed specifically for <span className="bg-emerald-100/80 px-2 py-0.5 rounded text-emerald-800 font-bold">Syllabus 2022</span> aspirants, this platform is your secret weapon to cracking Papers 1 to 4. Master <span className="text-emerald-600 font-semibold">Business Laws (Paper 1)</span> ⚖️, <span className="text-blue-500 font-semibold">Financial & Cost Accounting (Paper 2)</span> 🔢, <span className="text-indigo-500 font-semibold">Mathematics & Statistics (Paper 3)</span> 📊, and <span className="text-cyan-500 font-semibold">Business Economics (Paper 4)</span> 🌍. Questions are based on materials released by the CMA Institute. 🎯 Track your progress and turn practice into perfection! 💪✨
              </p>
            </div>
          </div>
        </div>

        <a href="/" onClick={e => { e.preventDefault(); navigate('/') }} className="inline-flex items-center gap-2 text-emerald-600 bg-white px-6 py-2.5 rounded-full shadow-sm mb-8 font-bold hover:shadow-md transition-all no-underline hover:scale-105 transform duration-200">
          <i className="fas fa-arrow-left" /> Back to Home
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map(p => (
            <div key={p.id} className="card-base subj-foundation flex items-center gap-5 text-left" onClick={() => setDash(p)}>
              <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shrink-0 text-2xl shadow-sm">
                <i className={`fas ${p.icon} ${p.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{p.title}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Practice Online</p>
              </div>
            </div>
          ))}
        </div>

        <div className="sr-only">
          <h2>CMA Foundation Practice Hub</h2>
          <nav aria-label="Quick Links">
            <ul>
              <li><a href="/quiz/1">Paper 1: Fundamentals of Business Laws Practice</a></li>
              <li><a href="/quiz/2">Paper 2: Financial and Cost Accounting Practice</a></li>
              <li><a href="/quiz/3">Paper 3: Mathematics and Statistics Practice</a></li>
              <li><a href="/quiz/4">Paper 4: Business Economics Practice</a></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Dashboard overlay */}
      {dash && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto animate-fade-in-up">
          <div className="max-w-4xl mx-auto w-full px-5 py-10 flex-grow">
            <button onClick={() => setDash(null)} className="mb-8 font-bold flex items-center gap-2 text-slate-600 bg-white px-6 py-2.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <i className="fas fa-arrow-left" /> Back
            </button>
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-700">{dash.title}</h2>
            <div className="flex justify-center">
              <div className="card-base mode-bank flex items-center gap-5 text-left p-6 w-full max-w-md hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate(`/quiz/${dash.id}`)}>
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
