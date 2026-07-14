import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import PublicOnlyRoute from '@/components/shared/PublicOnlyRoute'
import RouteLoadingFallback from '@/components/shared/RouteLoadingFallback'
import { useAuth } from '@/hooks/useAuth'

const Landing = lazy(() => import('@/pages/Landing'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const Terms = lazy(() => import('@/pages/Terms'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ProjectWorkspace = lazy(() => import('@/pages/ProjectWorkspace'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))

/** "/" is the marketing landing page for visitors and the Dashboard for signed-in users. */
function HomeRoute() {
  const { user, loading } = useAuth()

  if (loading) return <RouteLoadingFallback fullScreen />
  return user ? <Dashboard /> : <Landing />
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Not public-only: a logged-in user may legitimately re-auth a recovery link mid-session. */}
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/project/:projectId" element={<ProjectWorkspace />} />
        </Route>

        {/* Catch-all: unknown URLs get a real 404 instead of a blank screen. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
