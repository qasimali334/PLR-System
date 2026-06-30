import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Trophy, BookOpen, Brain, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { progressAPI, aiAPI, quizAPI } from '../services/api'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-sm">
      <p className="text-text-muted">{label}</p>
      <p className="text-primary font-bold">{payload[0]?.value} hrs</p>
    </div>
  )
}

export default function Progress() {
  const [stats, setStats] = useState(null)
  const [insights, setInsights] = useState(null)
  const [quizHistory, setQuizHistory] = useState([])
  const [loadingInsights, setLoadingInsights] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, quizRes] = await Promise.all([progressAPI.getStats(), quizAPI.getHistory()])
        setStats(statsRes.data)
        setQuizHistory(quizRes.data.history || [])
      } catch { toast.error('Failed to load progress') }
    }
    load()
  }, [])

  const loadInsights = async () => {
    setLoadingInsights(true)
    try {
      const { data } = await aiAPI.getInsights()
      setInsights(data.insights)
      toast.success('AI insights generated!')
    } catch { toast.error('Failed to generate insights') }
    finally { setLoadingInsights(false) }
  }

  const quizChartData = quizHistory.slice(0, 10).reverse().map((q, i) => ({
    name: q.topic?.slice(0, 8) || `Q${i+1}`,
    score: q.score,
  }))

  const radarData = quizHistory.reduce((acc, q) => {
    const existing = acc.find(a => a.topic === q.topic)
    if (existing) existing.score = Math.max(existing.score, q.score)
    else acc.push({ topic: q.topic?.slice(0, 10), score: q.score })
    return acc
  }, []).slice(0, 6)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Learning Analytics</h1>
          <p className="page-subtitle">Track your growth and learning performance</p>
        </div>
        <button onClick={loadInsights} disabled={loadingInsights} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {loadingInsights ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Brain size={16} />}
          AI Insights
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Clock, label: 'Total Hours', value: `${stats?.totalHours || 0}h`, color: 'text-primary' },
          { icon: TrendingUp, label: 'This Week', value: `${stats?.weeklyHours || 0}h`, color: 'text-secondary' },
          { icon: BookOpen, label: 'Paths Completed', value: stats?.completedPaths || 0, color: 'text-accent' },
          { icon: Trophy, label: 'Quiz Average', value: `${stats?.avgQuizScore || 0}%`, color: 'text-warning' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-5">
            <s.icon size={20} className={`${s.color} mb-2`} />
            <div className={`text-2xl font-bold font-inter ${s.color}`}>{s.value}</div>
            <div className="text-text-muted text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      {insights && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><Brain size={18} className="text-primary" />AI Analysis</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
              <p className="text-xs text-secondary font-semibold mb-1">💪 Strengths</p>
              <p className="text-sm text-text-secondary">{insights.strengths}</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <p className="text-xs text-accent font-semibold mb-1">🎯 Focus Areas</p>
              <p className="text-sm text-text-secondary">{insights.weaknesses}</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <p className="text-xs text-primary font-semibold mb-1">📈 Pace</p>
              <p className="text-sm text-text-secondary">{insights.pace_assessment}</p>
            </div>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4">
            <p className="text-sm font-medium text-secondary mb-2">💡 Actionable Tips</p>
            <ul className="space-y-1">
              {insights.actionable_tips?.map((tip, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>{tip}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 p-3 bg-gradient-card rounded-xl border border-primary/20">
            <p className="text-sm text-text-secondary italic">"{insights.motivational_message}"</p>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quiz Scores */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-text-primary mb-4">Quiz Performance</h3>
          {quizChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={quizChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,111,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#6b6990', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b6990', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#7c6fff" strokeWidth={2} dot={{ fill: '#7c6fff', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-text-muted text-sm text-center py-12">Take quizzes to see your performance</p>}
        </div>

        {/* Skill Radar */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-text-primary mb-4">Topic Mastery</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(124,111,255,0.15)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#6b6990', fontSize: 10 }} />
                <Radar dataKey="score" stroke="#00e5b0" fill="#00e5b0" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <p className="text-text-muted text-sm text-center py-12">Complete quizzes to map your skills</p>}
        </div>
      </div>

      {/* Quiz History */}
      {quizHistory.length > 0 && (
        <div className="glass-card p-6 mt-6">
          <h3 className="font-bold text-text-primary mb-4">Recent Quizzes</h3>
          <div className="space-y-2">
            {quizHistory.slice(0, 8).map((q, i) => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-bg-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{q.topic}</p>
                  <p className="text-xs text-text-muted">{new Date(q.taken_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">{q.correct_answers}/{q.total_questions}</span>
                  <span className={`font-bold text-sm ${q.score >= 80 ? 'text-secondary' : q.score >= 60 ? 'text-warning' : 'text-danger'}`}>{q.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
