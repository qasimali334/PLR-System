import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Sparkles, CheckCircle, XCircle, Brain, ChevronRight, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { recommendAPI } from '../services/api'

const diffColor = { beginner: 'badge-secondary', intermediate: 'badge-warning', advanced: 'badge-accent' }

export default function Recommendations() {
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [insight, setInsight] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data } = await recommendAPI.getAll()
      setRecs(data.recommendations || [])
    } catch { toast.error('Failed to load recommendations') }
    finally { setLoading(false) }
  }

  const generate = async () => {
    setGenerating(true)
    try {
      const { data } = await recommendAPI.generate()
      setRecs(data.recommendations || [])
      setInsight(data.insight || '')
      toast.success('✨ Fresh AI recommendations generated!')
    } catch { toast.error('Failed to generate recommendations') }
    finally { setGenerating(false) }
  }

  const accept = async (id) => {
    await recommendAPI.accept(id)
    setRecs(p => p.filter(r => r.id !== id))
    toast.success('Added to your learning list!')
  }

  const dismiss = async (id) => {
    await recommendAPI.dismiss(id)
    setRecs(p => p.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">AI Recommendations</h1>
          <p className="page-subtitle">Personalized learning suggestions powered by Gemini AI</p>
        </div>
        <button onClick={generate} disabled={generating} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RefreshCw size={16} />}
          {generating ? 'Generating...' : 'Refresh AI Picks'}
        </button>
      </div>

      {insight && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-6 border-primary/30">
          <div className="flex items-start gap-3">
            <Brain size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-text-primary mb-1">AI Insight</p>
              <p className="text-text-secondary text-sm">{insight}</p>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="glass-card h-40 animate-pulse bg-bg-elevated" />)}
        </div>
      ) : recs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Sparkles size={48} className="text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No recommendations yet</h3>
          <p className="text-text-muted mb-6">Let AI analyze your profile and suggest what to learn next</p>
          <button onClick={generate} disabled={generating} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
            {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
            Generate Recommendations
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec, i) => {
            const content = rec.content || {}
            return (
              <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Target size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-text-primary">{content.topic || rec.title}</h3>
                        <span className={`text-xs ${diffColor[content.difficulty] || 'badge-primary'}`}>{content.difficulty}</span>
                        <span className="badge-primary text-xs">Rank #{content.rank || i+1}</span>
                      </div>
                      <p className="text-text-secondary text-sm mb-3">{content.reason}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xs text-text-muted">⏱ ~{content.estimated_hours}h to complete</span>
                        <span className="text-xs text-secondary">✓ {Math.round((content.confidence_score || 0.8) * 100)}% match</span>
                        {content.category && <span className="text-xs text-text-muted">📂 {content.category}</span>}
                      </div>
                      {content.suggested_resources?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {content.suggested_resources.slice(0,2).map((r, j) => (
                            <a key={j} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary flex items-center gap-1 hover:text-primary-light transition-colors">
                              {r.title} <ChevronRight size={11} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => accept(rec.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/20 text-secondary text-sm font-medium hover:bg-secondary/30 transition-all">
                      <CheckCircle size={15} /> Accept
                    </button>
                    <button onClick={() => dismiss(rec.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-all">
                      <XCircle size={15} /> Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
