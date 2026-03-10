import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

const HOME_DEFAULTS = {
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

export default function Home() {
  const navigate = useNavigate()
  const [view,   setView]   = useState('home')
  const [cfg,    setCfg]    = useState(HOME_DEFAULTS)

  // Load editable home-page config from Firestore (falls back to defaults if missing)
  useEffect(() => {
    getDoc(doc(db, 'siteConfig', 'homePage'))
      .then(snap => { if (snap.exists()) setCfg(c => ({ ...c, ...snap.data() })) })
      .catch(() => {}) // silent – defaults always work
  }, [])

  const showView = (v) => { setView(v); window.scrollTo(0, 0) }

  return (
    <>
      <Helmet>
        <title>Prepogy - Free CMA MCQ Quiz &amp; Question Bank (Foundation, Inter &amp; Final PYQ)</title>
        <meta name="description" content="Free CMA MCQ Quiz and Question Bank for Foundation, Intermediate & Final. Practice Chapter-wise PYQs, Important Questions (Audit, Law, Costing), and Mock Tests for ICMAI Syllabus 2022." />
        <meta name="keywords" content="cma mcq quiz, cma foundation mcq quiz, cma inter mcq bank, cma intermediate mcq practice, cma inter previous year questions, cma inter pyq mcq, cma final mcq bank quiz" />
        <link rel="canonical" href="https://prepogy.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Prepogy" />
        <meta property="og:title" content="Prepogy - Free CMA MCQ Quiz & Question Bank (Foundation, Inter & Final PYQ)" />
        <meta property="og:description" content="Free CMA MCQ Quiz and Question Bank for Foundation, Intermediate & Final. Practice Chapter-wise PYQs, Important Questions (Audit, Law, Costing), and Mock Tests for ICMAI Syllabus 2022." />
        <meta property="og:url" content="https://prepogy.in/" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Prepogy - Free CMA MCQ Quiz & Question Bank" />
        <meta name="twitter:description" content="Free CMA MCQ Quiz and Question Bank for Foundation, Intermediate & Final. Practice PYQs online with instant results." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-5 pb-20 w-full pt-6 md:pt-10">

        {/* HOME */}
        {view === 'home' && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <a href="/foundation" onClick={e => { e.preventDefault(); navigate('/foundation') }}
                className="card-base card-foundation group block text-gray-800 no-underline" aria-label="CMA Foundation MCQ Quiz">
                <i className="fas fa-seedling text-4xl text-emerald-500 mb-4 block group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold">CMA Foundation</h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">MCQ Quiz (Papers 1-4)</p>
              </a>
              <div className="card-base card-inter group" onClick={() => showView('inter')} aria-label="CMA Intermediate MCQ Bank">
                <i className="fas fa-graduation-cap text-4xl text-indigo-500 mb-4 block group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold">CMA Intermediate</h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">MCQ Bank (Papers 5-12)</p>
              </div>
              <div className="card-base card-final group" onClick={() => showView('final')} aria-label="CMA Final MCQ Quiz">
                <i className="fas fa-trophy text-4xl text-amber-500 mb-4 block group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold">CMA Final</h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">Quiz & PYQ (Papers 13-20)</p>
              </div>
            </div>

            {/* Why Prepogy */}
            <div className="max-w-5xl mx-auto mt-16 md:mt-24 mb-8 text-center relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 blur-3xl -z-10 rounded-full" />
              <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-8 uppercase tracking-wider flex items-center justify-center gap-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{cfg.whyTitle}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-slate-600">
                  {cfg.features.map((f, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 group">
                      <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <i className={`fas ${f.icon} text-2xl`} />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-800 text-lg mb-2">{f.title}</span>
                        <span className="text-slate-500 leading-relaxed">{f.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick-access cards: Audit Hub + Instagram */}
            <div className="max-w-5xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Audit Hub promo */}
              <button onClick={() => navigate('/audit')}
                className="group rounded-[28px] overflow-hidden text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-building-columns" />
                </div>
                <h3 className="font-extrabold text-lg mb-1">{cfg.audit.title}</h3>
                <p className="text-white/70 text-xs leading-relaxed">{cfg.audit.body}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full group-hover:bg-white/30 transition-all">
                  {cfg.audit.btn} <i className="fas fa-arrow-right text-[9px]" />
                </div>
              </button>

              {/* Instagram CTA */}
              <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer"
                className="group rounded-[28px] overflow-hidden text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-white p-6"
                style={{ background: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  <i className="fab fa-instagram" />
                </div>
                <h3 className="font-extrabold text-lg mb-1">{cfg.instagram.title}</h3>
                <p className="text-white/80 text-xs leading-relaxed">{cfg.instagram.body}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full group-hover:bg-white/30 transition-all">
                  {cfg.instagram.btn} <i className="fab fa-instagram text-[9px]" />
                </div>
              </a>
            </div>
          </div>
        )}

        {/* INTERMEDIATE */}
        {view === 'inter' && (
          <div className="animate-fade-in-up">
            <button onClick={() => showView('home')} className="mb-8 font-bold flex items-center gap-2 text-primary bg-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-100 transition-transform hover:scale-105">
              <i className="fas fa-arrow-left" /> Back
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <a href="/intermediate/group1" onClick={e => { e.preventDefault(); navigate('/intermediate/group1') }} className="card-base card-inter group block text-gray-800 no-underline">
                <h2 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">Group I (Inter)</h2>
                <p className="text-xs text-gray-400 mt-2">Papers 5 - 8 MCQ Bank</p>
              </a>
              <a href="/intermediate/group2" onClick={e => { e.preventDefault(); navigate('/intermediate/group2') }} className="card-base card-inter group block text-gray-800 no-underline">
                <h2 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">Group II (Inter)</h2>
                <p className="text-xs text-gray-400 mt-2">Papers 9 - 12 MCQ Bank</p>
              </a>
            </div>
          </div>
        )}

        {/* FINAL */}
        {view === 'final' && (
          <div className="animate-fade-in-up">
            <button onClick={() => showView('home')} className="mb-8 font-bold flex items-center gap-2 text-amber-600 bg-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-100 transition-transform hover:scale-105">
              <i className="fas fa-arrow-left" /> Back
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <a href="/final/group3" onClick={e => { e.preventDefault(); navigate('/final/group3') }} className="card-base card-final group block text-gray-800 no-underline">
                <h2 className="text-xl font-bold group-hover:text-amber-600 transition-colors">Group III (Final)</h2>
                <p className="text-xs text-gray-400 mt-2">Papers 13 - 16 Practice</p>
              </a>
              <a href="/final/group4" onClick={e => { e.preventDefault(); navigate('/final/group4') }} className="card-base card-final group block text-gray-800 no-underline">
                <h2 className="text-xl font-bold group-hover:text-amber-600 transition-colors">Group IV (Final)</h2>
                <p className="text-xs text-gray-400 mt-2">Papers 17 - 20 Practice</p>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
