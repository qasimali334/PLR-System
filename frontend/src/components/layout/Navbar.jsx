import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Navbar({ onMenuClick }) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authAPI.logout().catch(() => {})
    clearAuth()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-bg-card border-b border-bg-border min-h-[73px]">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all">
          <Menu size={20} />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-bg-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text-primary leading-none">{user?.full_name || 'Learner'}</p>
            <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="ml-2 p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/10 transition-all" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
