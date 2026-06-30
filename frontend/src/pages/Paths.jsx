import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Brain, Trash2, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { pathAPI } from '../services/api'

const difficultyColor = { beginner: 'badge-secondary', intermediate: 'badge-warning', advanced: 'badge-accent' }

export default function Paths() {
  const navigate = useNavigate()
  const location = useLocation()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [generating, setGenerating] = useState(false)
  const [showGenForm, setShowGenForm] = useState(location.state?.openGenerator || false)
  const [genForm, setGenForm] = useState({ goal: '', skillLevel: 'beginner', weeklyHours: 5 })

  useEffect(() => {
    loadPaths()
    if (location.state?.openGenerator) {
      window.history.replaceState({}, document.title)
    }
  }, [])

  const loadPaths = async () => {
    try {
      const { data } = await pathAPI.getAll()
      setPaths(data.paths || [])
    } catch { toast.error('Failed to load paths') }
    finally { setLoading(false) }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!genForm.goal.trim()) return toast.error('Please enter a goal')
    setGenerating(true)
    try {
      const { data } = await pathAPI.generate(genForm)
      setPaths(p => [data.path, ...p])
      setShowGenForm(false)
      toast.success('🎉 AI generated your new learning path!')
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to generate path';
      toast.error(errMsg);
    } finally {
      setGenerating(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this path?')) return
    try {
      await pathAPI.delete(id)
      setPaths(p => p.filter(x => x.id !== id))
      toast.success('Path deleted')
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to delete path'
      toast.error(errMsg)
    }
  }

  const getProgress = (path) => {
    const steps = path.learning_steps || []
    return steps.length ? Math.round(steps.filter(s => s.status === 'completed').length / steps.length * 100) : 0
  }

  const filtered = paths.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Learning Paths</h1>
          <p className="page-subtitle">{paths.length} paths · Keep learning every day</p>
        </div>
        <button onClick={() => setShowGenForm(true)} className="btn-primary flex items-center gap-2">
          <Brain size={16} /> Generate with AI
        </button>
      </div>

      {/* AI Generator Form */}
      {showGenForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><Brain size={18} className="text-primary" />Generate AI Learning Path</h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <textarea value={genForm.goal} onChange={e => setGenForm(p => ({ ...p, goal: e.target.value }))}
              placeholder="What do you want to learn? e.g. 'Learn Python for data science in 2 months'"
              className="input-field resize-none h-24" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-muted mb-1 block">Skill Level</label>
                <select value={genForm.skillLevel} onChange={e => setGenForm(p => ({ ...p, skillLevel: e.target.value }))}
                  className="input-field">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1 block">Hours/Week: {genForm.weeklyHours}h</label>
                <input type="range" min="1" max="40" value={genForm.weeklyHours} onChange={e => setGenForm(p => ({ ...p, weeklyHours: parseInt(e.target.value) }))}
                  className="w-full mt-3 accent-primary" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={generating} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Brain size={16} />}
                {generating ? 'Generating...' : 'Generate Path'}
              </button>
              <button type="button" onClick={() => setShowGenForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search paths..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
        {['all','active','completed','archived'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${filter === f ? 'bg-primary text-white' : 'bg-bg-elevated text-text-muted hover:text-text-primary'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Path Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="glass-card h-48 animate-pulse bg-bg-elevated" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BookOpen size={48} className="text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No paths found</h3>
          <p className="text-text-muted mb-6">Generate your first AI-powered learning path</p>
          <button onClick={() => setShowGenForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Create Path
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((path, i) => {
            const progress = getProgress(path)
            return (
              <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div onClick={() => navigate(`/paths/${path.id}`)} className="glass-card-hover p-6 relative group cursor-pointer">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(path.id); }}
                    className="absolute top-4 right-4 p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={15} />
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    {path.ai_generated && <span className="badge-primary text-xs">🤖 AI</span>}
                    {path.difficulty && <span className={`text-xs ${difficultyColor[path.difficulty] || 'badge-primary'}`}>{path.difficulty}</span>}
                  </div>
                  <h3 className="font-bold text-text-primary text-lg mb-1 group-hover:text-primary transition-colors">{path.title}</h3>
                  <p className="text-text-muted text-sm mb-4 line-clamp-2">{path.description}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="progress-bar flex-1">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-sm font-bold gradient-text">{progress}%</span>
                  </div>
                  <p className="text-xs text-text-muted">{path.learning_steps?.length || 0} steps · {path.category}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
