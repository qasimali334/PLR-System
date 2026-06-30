import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, TrendingUp, Trophy, Clock, Flame, Sparkles, ChevronRight, Plus, Brain } from 'lucide-react'
import { progressAPI, pathAPI, recommendAPI } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const StatCard = ({ icon: Icon, label, value, color = 'primary', subtitle }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color === 'primary' ? 'bg-primary/20' : color === 'secondary' ? 'bg-secondary/20' : color === 'accent' ? 'bg-accent/20' : 'bg-warning/20'}`}>
      <Icon size={20} className={color === 'primary' ? 'text-primary' : color === 'secondary' ? 'text-secondary' : color === 'accent' ? 'text-accent' : 'text-warning'} />
    </div>
    <div className="text-2xl font-bold font-inter gradient-text">{value}</div>
    <div className="text-text-muted text-sm mt-0.5">{label}</div>
    {subtitle && <div className="text-xs text-text-muted/70 mt-0.5">{subtitle}</div>}
  </motion.div>
)

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const [paths, setPaths] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, streakRes, pathsRes, recRes] = await Promise.all([
          progressAPI.getStats(),
          progressAPI.getStreak(),
          pathAPI.getAll(),
          recommendAPI.getAll(),
        ])
        setStats(statsRes.data)
        setStreak(streakRes.data.streak)
        setPaths(pathsRes.data.paths?.slice(0, 3) || [])
        setRecommendations(recRes.data.recommendations?.slice(0, 3) || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getPathProgress = (path) => {
    const steps = path.learning_steps || []
    if (!steps.length) return 0
    return Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-inter text-text-primary">
              {greeting}, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'Learner'}</span> 👋
            </h1>
            <p className="text-text-muted mt-1">Ready to continue your learning journey?</p>
          </div>
          <Link to="/paths" state={{ openGenerator: true }} className="btn-primary flex items-center gap-2 hidden md:flex">
            <Plus size={16} /> New Path
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Clock} label="Hours This Week" value={`${stats?.weeklyHours || 0}h`} color="primary" subtitle="Keep going!" />
        <StatCard icon={Flame} label="Day Streak" value={`${streak}🔥`} color="accent" subtitle="Don't break it!" />
        <StatCard icon={BookOpen} label="Active Paths" value={stats?.totalPaths || 0} color="secondary" />
        <StatCard icon={Trophy} label="Quiz Avg Score" value={`${stats?.avgQuizScore || 0}%`} color="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Learning Paths */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-inter text-text-primary">Active Learning Paths</h2>
            <Link to="/paths" className="text-sm text-primary hover:text-primary-light flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="glass-card p-5 h-24 animate-pulse bg-bg-elevated" />)}
            </div>
          ) : paths.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Brain size={40} className="text-primary mx-auto mb-3" />
              <p className="text-text-secondary mb-4">No learning paths yet.</p>
              <Link to="/paths" state={{ openGenerator: true }} className="btn-primary inline-flex items-center gap-2"><Plus size={16} />Create Your First Path</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {paths.map((path, i) => {
                const progress = getPathProgress(path)
                return (
                  <motion.div key={path.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/paths/${path.id}`} className="glass-card-hover p-5 block">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-text-primary">{path.title}</h3>
                          <p className="text-xs text-text-muted mt-0.5">{path.learning_steps?.length || 0} steps • {path.category || 'General'}</p>
                        </div>
                        <span className={`badge ${path.ai_generated ? 'badge-primary' : 'badge-secondary'}`}>
                          {path.ai_generated ? '🤖 AI' : 'Manual'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="progress-bar flex-1">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-sm font-bold gradient-text">{progress}%</span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-inter text-text-primary">AI Picks For You</h2>
            <Link to="/recommendations" className="text-sm text-primary hover:text-primary-light flex items-center gap-1">
              More <ChevronRight size={14} />
            </Link>
          </div>
          {recommendations.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <Sparkles size={32} className="text-primary mx-auto mb-3" />
              <p className="text-text-secondary text-sm mb-3">Generate AI recommendations</p>
              <Link to="/recommendations" className="btn-primary text-sm px-4 py-2">Get Recommendations</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <motion.div key={rec.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass-card p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-semibold text-text-primary">{rec.title || rec.content?.topic}</p>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2">{rec.content?.reason}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-primary text-xs">{rec.content?.difficulty || 'intermediate'}</span>
                    <span className="text-xs text-text-muted">{rec.content?.estimated_hours}h estimated</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
