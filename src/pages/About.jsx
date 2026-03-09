import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function About() {
  const navigate = useNavigate()
  return (
    <>
      <Helmet>
        <title>About Prepogy - CMA MCQ Practice Hub</title>
        <meta name="description" content="Learn the story behind Prepogy, the free CMA MCQ Quiz and Question Bank for Foundation, Intermediate & Final. Built to help CMA students learn from mistakes instantly." />
        <link rel="canonical" href="https://prepogy.in/about" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Prepogy - CMA MCQ Practice Hub" />
        <meta property="og:url" content="https://prepogy.in/about" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-5 pb-20">
        <button
          onClick={() => navigate('/')}
          className="mb-8 font-bold flex items-center gap-2 text-primary bg-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-100 transition-transform hover:scale-105"
        >
          <i className="fas fa-arrow-left" /> Back
        </button>

        <article className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl leading-relaxed max-w-4xl mx-auto">

          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary flex items-center gap-3 mb-3">
              📚 About Prepogy MCQ Bank
            </h1>
            <p className="text-slate-500 text-base md:text-lg">
              The <strong>free CMA MCQ Quiz</strong> platform built on a simple, powerful idea — learn from your mistakes, instantly.
            </p>
          </header>

          <div className="space-y-8 text-slate-700 article-body">

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> How It All Started
              </h2>
              <p className="text-base md:text-lg leading-relaxed">
                The idea for this website sparked back in <strong>2019</strong> when I went for my driving licence test —
                specifically for my learning licence. I installed an app that had over <strong>200 MCQ questions</strong> related
                to the test. I practised those questions, got some right and some wrong, but crucially, I learned from those
                mistakes <em>instantly</em>.
              </p>
            </section>

            <blockquote className="bg-indigo-50 p-6 rounded-2xl border-l-4 border-primary">
              <p className="italic text-slate-600 text-base md:text-lg">
                "As a result, when I sat for the actual test, I scored <strong>10 out of 10</strong> without any issues.
                That instant learning feedback loop from the MCQs really impressed me — it showed me immediately where I
                was making errors."
              </p>
            </blockquote>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> The Vision Behind Prepogy
              </h2>
              <p className="text-base md:text-lg leading-relaxed">
                That experience led to a clear vision: to create a similar <strong>MCQ-based practice and learning platform
                for CMA students</strong>. If a simple driving licence app could make me score perfectly through practice
                and instant feedback, the same principle could help CMA aspirants master their subjects — whether it's
                the <strong>CMA Foundation MCQ Quiz</strong>, <strong>CMA Inter MCQ Bank</strong>, or the
                <strong> CMA Final Question Bank</strong>.
              </p>
              <p className="text-base md:text-lg leading-relaxed mt-4">
                This realisation directly inspired the creation of <strong>Prepogy</strong>. The goal is simple: give every
                CMA student a free, effective way to practise <strong>CMA Inter Previous Year Questions (PYQ)</strong>,
                chapter-wise MCQs, and <strong>important questions for Audit, Law, and Costing</strong> — and learn from
                every mistake along the way.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="text-2xl">🏆</span> What Prepogy Offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-check-circle" /> Official Content
                  </h3>
                  <p className="text-sm text-slate-600">
                    Questions sourced from official <strong>CMA Inter PYQ</strong> papers and ICMAI study modules for authentic, exam-relevant practice.
                  </p>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-rocket" /> Comprehensive Bank
                  </h3>
                  <p className="text-sm text-slate-600">
                    Covers <strong>CMA Foundation, Intermediate & Final MCQ Quiz</strong> — including important questions for Audit, Law, Taxation, and Costing.
                  </p>
                </div>
                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                  <h3 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-bolt" /> Instant Feedback
                  </h3>
                  <p className="text-sm text-slate-600">
                    Know immediately where you went wrong so you can improve faster before your ICMAI exam.
                  </p>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <h3 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-lock-open" /> Completely Free
                  </h3>
                  <p className="text-sm text-slate-600">
                    No paywalls, no subscriptions. Every <strong>CMA MCQ quiz</strong> on Prepogy is free — because quality exam prep should be accessible to all.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </article>
      </div>
    </>
  )
}
