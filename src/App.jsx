import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Foundation from './pages/Foundation.jsx'
import InterGroup1 from './pages/InterGroup1.jsx'
import InterGroup2 from './pages/InterGroup2.jsx'
import FinalGroup3 from './pages/FinalGroup3.jsx'
import FinalGroup4 from './pages/FinalGroup4.jsx'
import QuizPage from './pages/QuizPage.jsx'
import Blog from './pages/Blog.jsx'
import About from './pages/About.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import AuditHub from './pages/AuditHub.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminReports from './pages/admin/AdminReports.jsx'
import AdminQuizzes from './pages/admin/AdminQuizzes.jsx'
import AdminBlog from './pages/admin/AdminBlog.jsx'
import AdminNotifications from './pages/admin/AdminNotifications.jsx'
import AdminAuditHub from './pages/admin/AdminAuditHub.jsx'
import AdminHomePage from './pages/admin/AdminHomePage.jsx'
import useClickBurst from './hooks/useClickBurst.js'

function AppRoutes() {
  useClickBurst()
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="foundation" element={<Foundation />} />
        <Route path="intermediate/group1" element={<InterGroup1 />} />
        <Route path="intermediate/group2" element={<InterGroup2 />} />
        <Route path="final/group3" element={<FinalGroup3 />} />
        <Route path="final/group4" element={<FinalGroup4 />} />
        <Route path="quiz/:paperId" element={<QuizPage />} />
        <Route path="blog" element={<Blog />} />
        <Route path="about" element={<About />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="audit" element={<AuditHub />} />
      </Route>

      {/* Admin (role-protected) */}
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="audit-hub"     element={<AdminAuditHub />} />
        <Route path="home-editor"   element={<AdminHomePage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AdminProvider>
          <AppRoutes />
        </AdminProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
