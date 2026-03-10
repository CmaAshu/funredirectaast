// AdminContext re-exports isAdmin from AuthContext for backward-compat
// (AdminProvider is now a no-op wrapper since AuthContext handles role)
import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext.jsx'

const AdminContext = createContext({ isAdmin: false, adminLoading: false })

export function AdminProvider({ children }) {
  return <>{children}</>
}

export function useAdmin() {
  const { isAdmin, loading } = useAuth()
  return { isAdmin, adminLoading: loading }
}
