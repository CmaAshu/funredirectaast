import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()
  const [sitemapOpen, setSitemapOpen] = useState(false)
  const [igDismissed, setIgDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('ig_banner_dismissed') === '1'
  )

  const toggleSitemap = () => {
    setSitemapOpen(v => {
      if (!v) setTimeout(() => document.getElementById('sitemapContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      return !v
    })
  }

  const dismissIg = () => {
    localStorage.setItem('ig_banner_dismissed', '1')
    setIgDismissed(true)
  }

  return (
    <footer className="py-10 text-center shrink-0 border-t border-slate-100 mt-10">

      {/* ── Floating FAB cluster ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {/* Instagram FAB */}
        <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
          className="group relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:-translate-y-1 hover:scale-110"
          style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
          <i className="fab fa-instagram text-xl text-white" />
          {/* Tooltip */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Follow @prepogy.in
          </span>
        </a>
        {/* Blog FAB */}
        <button onClick={() => navigate('/blog')} aria-label="Study Strategy Blog"
          className="relative group w-12 h-12 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white hover:border-transparent transition-all shadow-sm">
          <i className="fas fa-newspaper" />
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-white" />
          </span>
          <span className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Study Blog
          </span>
        </button>
      </div>

      {/* ── Instagram banner (dismissible, shown once) ── */}
      {!igDismissed && (
        <div className="mx-4 mb-8 rounded-3xl overflow-hidden shadow-lg max-w-xl mx-auto">
          <div className="relative p-5 text-white text-center"
            style={{ background: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
            <button onClick={dismissIg}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-all">
              <i className="fas fa-times" />
            </button>
            <i className="fab fa-instagram text-3xl mb-2 block" />
            <p className="font-extrabold text-base mb-1">Daily MCQs on Instagram</p>
            <p className="text-white/80 text-xs mb-3">
              Flashcards, exam tips & study hacks — free, every day.<br />
              <strong>@prepogy.in</strong>
            </p>
            <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white font-extrabold text-sm px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
              style={{ color: '#dc2743' }}>
              <i className="fab fa-instagram" /> Follow Now — It's Free
            </a>
          </div>
        </div>
      )}

      {/* ── Social icons ── */}
      <div className="flex justify-center gap-5 mb-8">
        <a href="https://whatsapp.com/channel/0029Vb77tFDKQuJFr4fbCE3c" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-100 hover:bg-[#25D366] text-slate-500 hover:text-white px-4 py-2 rounded-full font-bold text-xs transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          aria-label="Join WhatsApp Channel">
          <i className="fab fa-whatsapp text-base" /> WhatsApp Channel
        </a>
        <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-100 hover:text-white text-slate-500 px-4 py-2 rounded-full font-bold text-xs transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          style={{}} onMouseEnter={e => e.currentTarget.style.background='linear-gradient(135deg,#f09433,#dc2743,#bc1888)'}
          onMouseLeave={e => e.currentTarget.style.background='rgb(241 245 249)'}
          aria-label="Follow on Instagram">
          <i className="fab fa-instagram text-base" /> @prepogy.in
        </a>
      </div>

      {/* ── Nav ── */}
      <div className="flex flex-wrap justify-center gap-6 mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 px-4 items-center">
        <button onClick={() => navigate('/')}               className="hover:text-primary transition-colors bg-transparent border-0 cursor-pointer p-0 font-bold uppercase tracking-widest text-slate-400">Home</button>
        <button onClick={() => navigate('/audit')}          className="hover:text-violet-600 transition-colors bg-transparent border-0 cursor-pointer p-0 font-bold uppercase tracking-widest text-slate-400">Audit Hub</button>
        <button onClick={() => navigate('/blog')}           className="hover:text-indigo-600 transition-colors bg-transparent border-0 cursor-pointer p-0 font-bold uppercase tracking-widest text-slate-400">Blog</button>
        <button onClick={() => navigate('/about')}          className="hover:text-primary transition-colors bg-transparent border-0 cursor-pointer p-0 font-bold uppercase tracking-widest text-slate-400">About</button>
        <button onClick={() => navigate('/privacy')}        className="hover:text-emerald-500 transition-colors bg-transparent border-0 cursor-pointer p-0 font-bold uppercase tracking-widest text-slate-400">Privacy</button>
        <button onClick={() => navigate('/terms')}          className="hover:text-amber-600 transition-colors bg-transparent border-0 cursor-pointer p-0 font-bold uppercase tracking-widest text-slate-400">Terms</button>
        <button onClick={toggleSitemap}                     className="hover:text-primary transition-colors uppercase tracking-widest bg-transparent border-0 cursor-pointer p-0 font-bold text-slate-400">Sitemap</button>
      </div>

      {/* ── Sitemap ── */}
      <div id="sitemapContainer" className={`seo-sitemap ${sitemapOpen ? 'active' : ''}`}>
        <h2>CMA Foundation MCQ Quiz (Papers 1-4)</h2>
        <ul>
          <li><button onClick={() => navigate('/quiz/1')} className="seo-link">CMA Foundation Paper 1: Business Laws MCQ Quiz</button></li>
          <li><button onClick={() => navigate('/quiz/2')} className="seo-link">CMA Foundation Paper 2: Financial & Cost Accounting MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/3')} className="seo-link">CMA Foundation Paper 3: Business Math & Stats MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/4')} className="seo-link">CMA Foundation Paper 4: Business Economics MCQ</button></li>
        </ul>
        <h2>CMA Inter MCQ Bank &amp; Important Questions</h2>
        <ul>
          <li><button onClick={() => navigate('/quiz/5')}  className="seo-link">CMA Inter Paper 5: Business Laws MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/6')}  className="seo-link">CMA Inter Paper 6: Financial Accounting MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/7')}  className="seo-link">CMA Inter Paper 7: Direct & Indirect Taxation MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/8')}  className="seo-link">CMA Inter Paper 8: Cost Accounting MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/9')}  className="seo-link">CMA Inter Paper 9: OM & SM MCQ Bank</button></li>
          <li><button onClick={() => navigate('/quiz/10')} className="seo-link">CMA Inter Paper 10: Corporate Accounting MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/11')} className="seo-link">CMA Inter Paper 11: FM & Business Data Analytics MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/12')} className="seo-link">CMA Inter Paper 12: Management Accounting MCQ</button></li>
          <li><button onClick={() => navigate('/audit')}   className="seo-link">CMA Inter Audit Revision Hub: 51 Important Questions</button></li>
        </ul>
        <h2>CMA Final MCQ Quiz &amp; PYQ</h2>
        <ul>
          <li><button onClick={() => navigate('/quiz/13')} className="seo-link">CMA Final Paper 13: Corporate & Economic Laws MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/14')} className="seo-link">CMA Final Paper 14: SFM MCQ Quiz</button></li>
          <li><button onClick={() => navigate('/quiz/15')} className="seo-link">CMA Final Paper 15: Direct Tax & International Tax MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/16')} className="seo-link">CMA Final Paper 16: Strategic Cost Management MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/17')} className="seo-link">CMA Final Paper 17: Cost & Management Audit MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/18')} className="seo-link">CMA Final Paper 18: CFR MCQ Bank</button></li>
          <li><button onClick={() => navigate('/quiz/19')} className="seo-link">CMA Final Paper 19: Indirect Tax Laws MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/20A')} className="seo-link">CMA Final Paper 20A: SPMBV MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/20B')} className="seo-link">CMA Final Paper 20B: Risk Management MCQ</button></li>
          <li><button onClick={() => navigate('/quiz/20C')} className="seo-link">CMA Final Paper 20C: International Taxation MCQ</button></li>
        </ul>
      </div>

      {/* SR-only SEO */}
      <div className="sr-only">
        <nav aria-label="Quick Links">
          <ul>
            <li><a href="/foundation">CMA Foundation MCQ Quiz</a></li>
            <li><a href="/intermediate/group1">CMA Inter Group 1 MCQ Bank</a></li>
            <li><a href="/intermediate/group2">CMA Inter Group 2 MCQ Bank</a></li>
            <li><a href="/audit">CMA Audit Revision Hub</a></li>
            <li><a href="/final/group3">CMA Final Group 3 MCQ Quiz</a></li>
            <li><a href="/final/group4">CMA Final Group 4 MCQ Bank Quiz</a></li>
          </ul>
        </nav>
      </div>

      <p className="text-slate-400 text-xs font-bold mb-2 mt-8">Prepogy © 2025</p>
      <p className="text-sm font-bold text-emerald-500 mt-4 flex items-center justify-center gap-2">
        जय हिन्द <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="Flag of India" width="20" height="13" className="w-5 rounded-[2px] shadow-sm" />
      </p>
    </footer>
  )
}
