import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import PublicOnlyRoute from '@/components/shared/PublicOnlyRoute'
import RouteLoadingFallback from '@/components/shared/RouteLoadingFallback'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ProjectWorkspace = lazy(() => import('@/pages/ProjectWorkspace'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Not public-only: a logged-in user may legitimately re-auth a recovery link mid-session. */}
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectWorkspace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
