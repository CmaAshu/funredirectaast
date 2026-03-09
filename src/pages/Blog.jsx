import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const posts = [
  { href:'/blog/blog-accounts.html', icon:'fa-calculator',    gradient:'from-blue-500 to-cyan-400',    glow:'rgba(59,130,246,0.18)',   badge:'Paper 6',  badgeColor:'bg-blue-100 text-blue-700',    title:'Financial Accounting 30-Day Blueprint',    desc:'A structured plan to master journal entries, final accounts, and consolidation for CMA Inter Paper 6.',        tag:'Study Strategy' },
  { href:'/blog/blog-taxation.html', icon:'fa-receipt',       gradient:'from-violet-500 to-purple-400', glow:'rgba(139,92,246,0.18)',   badge:'Paper 7',  badgeColor:'bg-violet-100 text-violet-700', title:'Taxation 30-Day Strategy Guide',           desc:'Conquer Direct & Indirect Taxation with chapter-wise priority plan and key concepts for quick revision.',       tag:'Study Strategy' },
  { href:'/blog/blog-law.html',       icon:'fa-scale-balanced',gradient:'from-emerald-500 to-teal-400', glow:'rgba(16,185,129,0.18)',   badge:'Paper 5',  badgeColor:'bg-emerald-100 text-emerald-700',title:'Business Laws Smart Study Plan',           desc:'Focus on high-yield sections of CMA Inter Business Laws and Ethics for maximum marks.',                         tag:'Quick Wins'     },
  { href:'/blog/blog-costing.html',   icon:'fa-chart-bar',    gradient:'from-indigo-500 to-blue-400',   glow:'rgba(99,102,241,0.18)',   badge:'Paper 8',  badgeColor:'bg-indigo-100 text-indigo-700', title:'Cost Accounting Mastery Plan',             desc:'A 30-day blueprint to crack CMA Inter Cost Accounting with practice techniques and formula sheets.',            tag:'Study Strategy' },
  { href:'/blog/blog-fmda.html',      icon:'fa-chart-pie',    gradient:'from-pink-500 to-rose-400',     glow:'rgba(236,72,153,0.18)',   badge:'Paper 11', badgeColor:'bg-pink-100 text-pink-700',     title:'FM & Business Data Analytics Guide',       desc:'Strategies for Financial Management and Data Analytics MCQs for CMA Intermediate Paper 11.',                   tag:'Study Strategy' },
  { href:'/blog/blog-ma.html',        icon:'fa-clipboard-list',gradient:'from-amber-500 to-orange-400', glow:'rgba(245,158,11,0.18)',   badge:'Paper 12', badgeColor:'bg-amber-100 text-amber-700',   title:'Management Accounting Blueprint',          desc:'30-day strategy for Management Accounting to target the most important MCQ areas.',                            tag:'Study Strategy' },
  { href:'/blog/blog-omsm.html',      icon:'fa-cogs',         gradient:'from-cyan-500 to-sky-400',      glow:'rgba(6,182,212,0.18)',    badge:'Paper 9',  badgeColor:'bg-cyan-100 text-cyan-700',     title:'OM & SM Quick Revision Strategy',          desc:'Operations Management and Strategic Management condensed into a focused 30-day plan.',                         tag:'Quick Wins'     },
  { href:'/blog/blog-paper10.html',   icon:'fa-building',     gradient:'from-rose-500 to-pink-400',     glow:'rgba(239,68,68,0.18)',    badge:'Paper 10', badgeColor:'bg-rose-100 text-rose-700',     title:'Corporate Accounting & Auditing Guide',    desc:'Master CMA Inter Paper 10 with targeted study of corporate accounting entries and audit concepts.',             tag:'Study Strategy' },
]

export default function Blog() {
  const navigate = useNavigate()
  return (
    <>
      <Helmet>
        <title>CMA Intermediate Study Strategy &amp; 30-Day Blueprints | Prepogy</title>
        <meta name="description" content="Master ICMAI Syllabus 2022 with Prepogy's expert 30-day blueprints for CMA Inter Financial Accounting, Taxation, Law, and Costing. Proven strategies to score 70+." />
        <meta name="keywords" content="CMA Inter Study Plan, ICMAI Syllabus 2022, CMA Intermediate Strategy, Financial Accounting Paper 6, Taxation Paper 7, Law Paper 7, Costing Paper 8, CMA Exam Tips, Prepogy Blog" />
        <meta name="author" content="Prepogy" />
        <link rel="canonical" href="https://prepogy.in/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Prepogy" />
        <meta property="og:url" content="https://prepogy.in/blog" />
        <meta property="og:title" content="CMA Intermediate 30-Day Blueprints for Success | Prepogy" />
        <meta property="og:description" content="Get structured study plans for CMA Inter Papers 6, 7, and 8. Transform your preparation with smart prioritization and master the ICMAI exams." />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CMA Intermediate 30-Day Blueprints | Prepogy" />
        <meta name="twitter:description" content="Expert study strategies and 30-day blueprints for CMA Inter Papers 5-12. Master ICMAI Syllabus 2022." />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"Blog","name":"Prepogy CMA Blog","url":"https://prepogy.in/blog","description":"Expert study blueprints and strategies for CMA Intermediate students, covering Financial Accounting, Taxation, Law, and Costing.","publisher":{"@type":"Organization","name":"Prepogy","logo":{"@type":"ImageObject","url":"https://prepogy.in/prep.png"}}})}</script>
      </Helmet>

      <div className="max-w-5xl mx-auto px-5 pb-24">

        {/* Back */}
        <div className="pt-2 mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-500 font-semibold text-sm hover:text-primary transition-colors group">
            <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-primary group-hover:text-primary transition-all">
              <i className="fas fa-arrow-left text-xs" />
            </span>
            Back to Home
          </button>
        </div>

        {/* Hero */}
        <div className="relative rounded-[36px] overflow-hidden mb-12 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-sm text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                <i className="fas fa-newspaper text-yellow-300" /> CMA Strategy Blog
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
                30-Day Blueprints for CMA Intermediate
              </h1>
              <p className="text-indigo-200 text-sm leading-relaxed max-w-lg">
                Expert study strategies, chapter-wise priority guides, and proven tactics to score 70+ in ICMAI Syllabus 2022 papers.
              </p>
            </div>
            <div className="shrink-0 hidden md:flex flex-col items-center gap-2 bg-white/10 border border-white/20 rounded-2xl p-5 text-center min-w-[80px]">
              <span className="text-4xl font-black">8</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Blueprints</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((p, i) => (
            <article
              key={i}
              className="group relative bg-white rounded-[28px] border border-slate-100 shadow-soft hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
              onClick={() => window.location.href = p.href}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${p.gradient}`} />
              <div className="p-6 flex gap-4 flex-1">
                <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`fas ${p.icon} text-white text-lg`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{p.tag}</span>
                  </div>
                  <h2 className="text-[15px] font-extrabold text-slate-800 mb-1.5 group-hover:text-primary transition-colors leading-snug">{p.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                    Read Blueprint <i className="fas fa-arrow-right text-[9px]" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-3xl p-6 md:p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-lightbulb text-white text-xl" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mb-2">Want daily revision tips?</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">Follow <strong>@prepogy.in</strong> on Instagram for MCQ flashcards, quick tips, and last-minute revision hacks.</p>
          <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white text-sm font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
            <i className="fab fa-instagram text-base" /> Follow @prepogy.in
          </a>
        </div>
      </div>
    </>
  )
}
