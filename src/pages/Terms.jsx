import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const Section = ({ number, title, children }) => (
  <div>
    <h2 className="font-bold text-lg text-slate-800 mb-3 border-l-4 border-amber-500 pl-3">
      {number}. {title}
    </h2>
    <div className="text-slate-600 space-y-2 leading-relaxed pl-1">{children}</div>
  </div>
)

export default function Terms() {
  const navigate = useNavigate()
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - Prepogy</title>
        <meta name="description" content="Terms and Conditions for using Prepogy.in — the free CMA MCQ Quiz and Question Bank platform for ICMAI students." />
        <link rel="canonical" href="https://prepogy.in/terms" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Terms and Conditions - Prepogy" />
        <meta property="og:url" content="https://prepogy.in/terms" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-5 pb-20">
        <button
          onClick={() => navigate('/')}
          className="mb-8 font-bold flex items-center gap-2 text-amber-600 bg-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-100 transition-transform hover:scale-105"
        >
          <i className="fas fa-arrow-left" /> Back
        </button>

        <article className="bg-white p-8 md:p-12 rounded-[32px] shadow-lg max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-600 flex items-center gap-2 mb-2">
              📜 Terms and Conditions
            </h1>
            <p className="text-xs text-slate-400">Last updated: March 2026 &nbsp;|&nbsp; Effective immediately</p>
            <p className="text-slate-600 mt-3 text-sm md:text-base">
              Welcome to <strong>Prepogy.in</strong>. These Terms and Conditions ("Terms") govern your access to and use
              of the Prepogy website, including all quizzes, leaderboards, account features, and content
              ("the Platform"). By accessing or using Prepogy, you confirm that you have read, understood, and agree to
              be bound by these Terms. If you do not agree, please discontinue use of the Platform immediately.
            </p>
          </header>

          <div className="space-y-8 text-sm md:text-base article-body">

            <Section number="1" title="Use of the Platform">
              <p>Prepogy is an educational platform providing free <strong>CMA MCQ Quiz</strong> practice for students
              preparing for ICMAI Foundation, Intermediate, and Final examinations. The Platform is intended for personal,
              non-commercial, educational use only.</p>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Platform for any unlawful or fraudulent purpose.</li>
                <li>Attempt to reverse-engineer, copy, scrape, or reproduce the Platform's content or code without permission.</li>
                <li>Interfere with or disrupt the Platform's infrastructure, servers, or networks.</li>
                <li>Impersonate another user, person, or entity.</li>
              </ul>
            </Section>

            <Section number="2" title="User Accounts & Registration">
              <p>Certain features of the Platform (such as leaderboards and progress tracking) require you to create an
              account. When registering, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate, complete, and current information.</li>
                <li>Maintain the confidentiality of your login credentials and not share them with others.</li>
                <li>Accept full responsibility for all activity that occurs under your account.</li>
                <li>Notify us immediately if you suspect any unauthorised access to your account.</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice.</p>
            </Section>

            <Section number="3" title="Intellectual Property & Content">
              <p>All original content on Prepogy — including website design, layout, code, and any original written
              material — is the intellectual property of Prepogy and is protected under applicable copyright law.</p>
              <p><strong>MCQ Content:</strong> Multiple Choice Questions, including <strong>CMA Inter PYQ</strong>,
              <strong> CMA Foundation MCQ Quiz</strong>, and <strong>CMA Final Question Bank</strong> content, are
              sourced from official ICMAI public study materials and past papers for fair educational use under
              applicable educational fair use principles. Prepogy does not claim ownership of ICMAI's official
              content. ICMAI retains all rights to their original materials.</p>
              <p>You may not reproduce, republish, distribute, or commercially exploit any content from the Platform
              without explicit written permission.</p>
            </Section>

            <Section number="4" title="Leaderboard & Fair Use">
              <p>The leaderboard is a motivational feature that displays scores from completed quizzes. You agree to
              participate honestly and not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use scripts, bots, or automated tools to manipulate quiz scores or leaderboard rankings.</li>
                <li>Exploit bugs or technical vulnerabilities to gain an unfair advantage.</li>
                <li>Create multiple accounts to inflate rankings.</li>
              </ul>
              <p>Any accounts found engaging in score manipulation or cheating will be permanently suspended. Prepogy
              reserves the right to remove or adjust scores at its sole discretion to maintain fair rankings.</p>
            </Section>

            <Section number="5" title="No Guarantee of Exam Success">
              <p>Prepogy is a supplementary practice tool. While we strive to provide accurate and up-to-date
              <strong> CMA MCQ practice</strong> content aligned with the ICMAI Syllabus 2022, we do not guarantee any
              specific results in your ICMAI examinations. The Platform is provided on an "as is" and "as available"
              basis. We make no warranties, express or implied, regarding the completeness, accuracy, or fitness for a
              particular purpose of any content.</p>
            </Section>

            <Section number="6" title="Third-Party Services & Advertising">
              <p>Prepogy uses third-party services including Google Analytics and Google AdSense. These services may
              collect data in accordance with their own privacy policies. Prepogy is not responsible for the content,
              privacy practices, or actions of any third-party services or advertisers.</p>
              <p>Advertisements displayed on Prepogy are served by Google AdSense. Prepogy does not endorse any
              advertised products or services. Clicking on advertisements is at your own risk.</p>
            </Section>

            <Section number="7" title="Limitation of Liability">
              <p>To the maximum extent permitted by applicable law, Prepogy and its creator shall not be liable for
              any direct, indirect, incidental, special, or consequential damages arising from:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your use of, or inability to use, the Platform.</li>
                <li>Any errors, inaccuracies, or omissions in the content.</li>
                <li>Unauthorised access to or alteration of your data.</li>
                <li>Any third-party conduct or content on the Platform.</li>
              </ul>
            </Section>

            <Section number="8" title="Availability & Modifications">
              <p>We reserve the right to modify, suspend, or discontinue any part of the Platform at any time, with or
              without notice. We may also update these Terms at any time. The revised Terms will be posted on this page
              with an updated effective date. Continued use of the Platform after changes are posted constitutes
              your acceptance of the updated Terms.</p>
            </Section>

            <Section number="9" title="Governing Law">
              <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising
              in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in
              India.</p>
            </Section>

            <Section number="10" title="Contact">
              <p>For any questions or concerns regarding these Terms, please contact us via our Instagram page{' '}
              <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">@prepogy.in</a>.
              </p>
            </Section>

          </div>
        </article>
      </div>
    </>
  )
}
