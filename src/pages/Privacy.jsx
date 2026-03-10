import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const Section = ({ number, title, children }) => (
  <div>
    <h2 className="font-bold text-lg text-slate-800 mb-3 border-l-4 border-primary pl-3">
      {number}. {title}
    </h2>
    <div className="text-slate-600 space-y-2 leading-relaxed pl-1">{children}</div>
  </div>
)

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Prepogy</title>
        <meta name="description" content="Privacy Policy for Prepogy.in — the free CMA MCQ Quiz and Question Bank. Learn how we collect, use, and protect your data." />
        <link rel="canonical" href="https://prepogy.in/privacy" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Privacy Policy - Prepogy" />
        <meta property="og:url" content="https://prepogy.in/privacy" />
        <meta property="og:image" content="https://prepogy.in/prep.png" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-5 pb-20">
        <button
          onClick={() => navigate('/')}
          className="mb-8 font-bold flex items-center gap-2 text-emerald-600 bg-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-100 transition-transform hover:scale-105"
        >
          <i className="fas fa-arrow-left" /> Back
        </button>

        <article className="bg-white p-8 md:p-12 rounded-[32px] shadow-lg max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 flex items-center gap-2 mb-2">
              🛡️ Privacy Policy
            </h1>
            <p className="text-xs text-slate-400">Last updated: March 2026 &nbsp;|&nbsp; Effective immediately</p>
            <p className="text-slate-600 mt-3 text-sm md:text-base">
              At <strong>Prepogy.in</strong>, your privacy matters. This policy explains what information we collect when
              you use our free <strong>CMA MCQ Quiz</strong> and Question Bank platform, why we collect it, and how we
              keep it safe. By using Prepogy, you agree to the practices described here.
            </p>
          </header>

          <div className="space-y-8 text-sm md:text-base article-body">

            <Section number="1" title="Information We Collect">
              <p><strong>Account Data:</strong> When you register or log in using Firebase Authentication, we collect your
              name and email address. This is used solely to create and identify your account and personalise your
              experience on Prepogy.</p>
              <p><strong>Quiz & Performance Data:</strong> Your quiz scores, attempt history, and leaderboard rankings
              are stored securely on our Firebase servers. This data powers the leaderboard feature and lets you track
              your <strong>CMA MCQ practice</strong> progress over time.</p>
              <p><strong>Usage Data:</strong> We collect anonymised, aggregated data about how pages are visited (e.g.,
              which <strong>CMA Inter PYQ</strong> or Foundation quiz pages are most used) to improve the platform.
              This data does not identify you personally.</p>
              <p><strong>Device & Technical Data:</strong> Your browser type, device type, IP address (anonymised), and
              referring URL may be logged automatically via Google Analytics to help us diagnose issues and understand
              general traffic patterns.</p>
            </Section>

            <Section number="2" title="How We Use Your Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>To create and manage your user account securely.</li>
                <li>To display your scores on the public leaderboard (using your chosen display name).</li>
                <li>To send important service-related notices (e.g., major updates, policy changes) via email, if needed.</li>
                <li>To improve the <strong>CMA MCQ Quiz</strong> content, fix bugs, and optimise platform performance.</li>
                <li>To comply with legal obligations where required.</li>
              </ul>
              <p className="mt-2">We do <strong>not</strong> use your data for unsolicited marketing emails or automated profiling.</p>
            </Section>

            <Section number="3" title="Cookies & Third-Party Services">
              <p><strong>Google Analytics (GA4):</strong> We use Google Analytics to understand how visitors interact with
              Prepogy. GA4 collects anonymised data such as page views and session duration. You can opt out by installing
              the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics Opt-out Browser Add-on</a>.</p>
              <p><strong>Google AdSense:</strong> We display ads through Google AdSense, which may use cookies to serve
              personalised advertisements based on your browsing activity. You can manage your ad personalisation
              preferences via <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Ad Settings</a>.</p>
              <p><strong>Firebase (Google):</strong> Authentication and database services are provided by Firebase
              (Google LLC). Your account data is stored on Firebase's secure, encrypted servers. Firebase's privacy
              practices are governed by Google's Privacy Policy.</p>
            </Section>

            <Section number="4" title="Data Sharing & Disclosure">
              <p>We do <strong>not sell, rent, or trade</strong> your personal information to any third party.</p>
              <p>We may disclose your information only in the following limited circumstances:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>When required by applicable law, court order, or government authority.</li>
                <li>To protect the rights, property, or safety of Prepogy, its users, or the public.</li>
                <li>To trusted service providers (such as Google/Firebase) who process data on our behalf under strict
                data processing agreements.</li>
              </ul>
            </Section>

            <Section number="5" title="Data Retention & Deletion">
              <p>Your account data is retained for as long as your account remains active. If you wish to delete your
              account and all associated data, please contact us at the email address below. We will process deletion
              requests within 30 days.</p>
              <p>Anonymised, aggregated analytics data (not linked to any individual) may be retained indefinitely for
              platform improvement purposes.</p>
            </Section>

            <Section number="6" title="Children's Privacy">
              <p>Prepogy is intended for students preparing for ICMAI CMA exams, who are generally 18 years of age or
              older. We do not knowingly collect personal data from children under 13. If you believe a child has
              provided us with personal information, please contact us and we will delete it promptly.</p>
            </Section>

            <Section number="7" title="Security">
              <p>We take reasonable technical and organisational measures to protect your data against unauthorised access,
              loss, or misuse. Firebase Authentication uses industry-standard encryption for credentials. However, no
              internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
            </Section>

            <Section number="8" title="Your Rights">
              <p>You have the right to access, correct, or request deletion of your personal data held by Prepogy. To
              exercise these rights, contact us using the details below. We aim to respond to all requests within 30 days.</p>
            </Section>

            <Section number="9" title="Changes to This Policy">
              <p>We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date
              at the top of this page. Continued use of Prepogy after changes are posted constitutes acceptance of the
              revised policy.</p>
            </Section>

            <Section number="10" title="Contact Us">
              <p>If you have any questions, concerns, or data requests regarding this Privacy Policy, please reach out
              via our Instagram page{' '}
              <a href="https://www.instagram.com/prepogy.in/" target="_blank" rel="noopener noreferrer" className="text-primary underline">@prepogy.in</a>.
              </p>
            </Section>

          </div>
        </article>
      </div>
    </>
  )
}
