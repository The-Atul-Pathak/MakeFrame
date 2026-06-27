import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** Redirects already-authenticated users away from auth pages (login/signup). */
export default function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  return <Outlet />
}
