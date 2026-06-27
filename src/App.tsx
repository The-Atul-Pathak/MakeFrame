import { Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import ProjectWorkspace from '@/pages/ProjectWorkspace'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import PublicOnlyRoute from '@/components/shared/PublicOnlyRoute'

export default function App() {
  return (
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
  )
}
