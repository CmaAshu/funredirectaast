import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedAdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, adminLoading } = useAdmin()

  if (authLoading || adminLoading) return (
    <div className="flex items-center justify-center min-h-screen gap-3 text-slate-400">
      <i className="fas fa-spinner fa-spin text-2xl" /> Checking permissions...
    </div>
  )

  if (!user) return <Navigate to="/" replace />
  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
      <div className="text-6xl mb-2">🚫</div>
      <h1 className="text-2xl font-extrabold text-slate-800">Access Denied</h1>
      <p className="text-slate-500 text-sm">You don't have admin privileges to view this page.</p>
      <a href="/" className="mt-4 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all">
        Back to Home
      </a>
    </div>
  )

  return children
}
