import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { authAPI } from '../../services/api'
import { GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase returns token in the hash fragment e.g., #access_token=...
      const hash = window.location.hash
      if (!hash || !hash.includes('access_token=')) {
        toast.error('Authentication details not found.')
        navigate('/auth/login')
        return
      }

      const params = new URLSearchParams(hash.substring(1))
      const token = params.get('access_token')

      if (!token) {
        toast.error('Authentication token not found.')
        navigate('/auth/login')
        return
      }

      try {
        // Set the token first so the request interceptor attaches it
        setAuth(token, null)
        const { data } = await authAPI.me()
        setAuth(token, data.user)
        toast.success(`Welcome back! 🎉`)
        navigate('/dashboard')
      } catch (err) {
        console.error('OAuth callback verification failed:', err)
        toast.error('Failed to verify session. Please sign in again.')
        setAuth(null, null)
        navigate('/auth/login')
      }
    };

    handleCallback()
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-primary top-[-150px] right-[-100px]" />
      <div className="orb w-[400px] h-[400px] bg-secondary bottom-[-100px] left-[-100px]" />

      <div className="relative z-10 text-center flex flex-col items-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-8 animate-pulse shadow-lg shadow-primary/30">
          <GraduationCap size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold font-inter text-text-primary mb-3">Securing your session</h2>
        <p className="text-text-secondary text-base mb-8 leading-relaxed">
          Verifying your account details. You will be redirected shortly...
        </p>
        
        {/* Animated premium glassmorphic loader */}
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    </div>
  )
}
