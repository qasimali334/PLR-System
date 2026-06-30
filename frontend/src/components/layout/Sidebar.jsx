import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, LayoutDashboard, BookOpen, TrendingUp, Sparkles,
  MessageSquare, Zap, Settings, ChevronLeft, ChevronRight, Compass
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/paths',           icon: BookOpen,         label: 'My Paths' },
  { to: '/recommendations', icon: Sparkles,         label: 'Recommendations' },
  { to: '/quiz',            icon: Zap,              label: 'Quiz' },
  { to: '/progress',        icon: TrendingUp,       label: 'Progress' },
  { to: '/ai-chat',         icon: MessageSquare,    label: 'AI Chat' },
  { to: '/settings',        icon: Settings,         label: 'Settings' },
]

export default function Sidebar({ open, onToggle }) {
  const { pathname } = useLocation()
  return (
    <motion.aside
      animate={{ width: open ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col bg-bg-card border-r border-bg-border h-full overflow-hidden relative flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-bg-border min-h-[73px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 0 20px rgba(124,111,255,0.4)' }}>
          <GraduationCap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-lg font-black font-inter gradient-text whitespace-nowrap overflow-hidden">
              PLR System
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || pathname.startsWith(to + '/')
          return (
            <Link key={to} to={to}
              className={`sidebar-item ${active ? 'active' : ''} ${!open ? 'justify-center' : ''}`}
              title={!open ? label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="whitespace-nowrap text-sm font-medium">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Toggle button */}
      <div className="px-2 pb-4">
        <button onClick={onToggle}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all ${!open ? 'justify-center' : ''}`}>
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          <AnimatePresence>
            {open && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm whitespace-nowrap">
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
