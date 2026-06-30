import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { authAPI } from './services/api'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Paths from './pages/Paths'
import PathDetail from './pages/PathDetail'
import Progress from './pages/Progress'
import Recommendations from './pages/Recommendations'
import AIChat from './pages/AIChat'
import Quiz from './pages/Quiz'
import Settings from './pages/Settings'
import AppLayout from './components/layout/AppLayout'
import AuthCallback from './pages/auth/AuthCallback'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/auth/login" replace />
}

const GuestRoute = ({ children }) => {
  const { token } = useAuthStore()
  return !token ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const checkHash = async () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.substring(1))
        const token = params.get('access_token')
        if (token) {
          try {
            setAuth(token, null)
            const { data } = await authAPI.me()
            setAuth(token, data.user)
            window.history.replaceState(null, null, window.location.pathname)
            window.location.href = '/dashboard'
          } catch (err) {
            console.error('OAuth signin error:', err)
            setAuth(null, null)
            window.history.replaceState(null, null, window.location.pathname)
          }
        }
      }
    }
    checkHash()
  }, [setAuth])
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/auth/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* Protected App */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="paths" element={<Paths />} />
          <Route path="paths/:id" element={<PathDetail />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="progress" element={<Progress />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
