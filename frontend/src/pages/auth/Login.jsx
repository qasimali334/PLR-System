import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, GraduationCap, ArrowRight, Lock, Mail, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'

const perks = ['AI-powered learning paths', 'Personalized recommendations', 'Progress tracking & analytics', 'AI chat assistant']

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    if (!validateEmail(form.email)) return toast.error('Please enter a valid email address')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      setAuth(data.token, data.user)
      toast.success(`Welcome back, ${data.user?.full_name || 'Learner'}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { data } = await authAPI.getGoogleUrl()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Could not get authorization URL')
      }
    } catch {
      toast.error('Failed to initialize Google login')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-primary top-[-150px] right-[-100px]" />
      <div className="orb w-[400px] h-[400px] bg-secondary bottom-[-100px] left-[-100px]" />
      <div className="orb w-[300px] h-[300px] bg-accent top-[40%] left-[5%]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left - Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:block"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black font-inter gradient-text">PLR System</span>
          </Link>
          <h2 className="text-4xl font-black font-inter text-text-primary mb-4 leading-tight">
            Your AI-Powered<br />
            <span className="gradient-text">Learning Companion</span>
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Join thousands of learners growing with personalized AI recommendations tailored just for you.
          </p>
          <div className="space-y-3">
            {perks.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle size={18} className="text-secondary flex-shrink-0" />
                <span className="text-text-secondary">{p}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right - Form */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="text-xl font-black font-inter gradient-text">PLR System</span>
            </Link>
          </div>
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold font-inter text-text-primary mb-1">Welcome Back</h1>
            <p className="text-text-muted text-sm mb-6">Continue your learning journey</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="input-field pl-11 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-bg-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#101026] px-3 text-text-muted">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-bg-secondary hover:bg-bg-elevated border border-bg-border hover:border-primary/40 transition-all font-semibold py-3 px-4 rounded-xl text-text-primary mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.23 2.673 1.255 6.582l3.99 3.183z"
                />
                <path
                  fill="#4285F4"
                  d="M23.727 12.273c0-.818-.073-1.609-.209-2.382H12v4.545h6.582a5.627 5.627 0 0 1-2.436 3.691l3.89 3.018c2.273-2.1 3.582-5.191 3.582-8.873z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.266 14.235L1.275 17.42A11.968 11.968 0 0 0 12 24c3.055 0 5.782-1.009 7.69-2.736l-3.89-3.018A7.124 7.124 0 0 1 12 19.091a7.077 7.077 0 0 1-6.734-4.856z"
                />
                <path
                  fill="#34A853"
                  d="M1.255 6.582A11.95 11.95 0 0 0 0 12c0 1.945.464 3.782 1.275 5.42l3.99-3.185A7.054 7.054 0 0 1 4.91 12c0-1.255.327-2.455.918-3.51l-4.573-3.908z"
                />
              </svg>
              <span>Google</span>
            </button>

            <div className="mt-6 pt-6 border-t border-bg-border text-center">
              <p className="text-text-muted text-sm">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-primary font-semibold hover:text-primary-light transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
