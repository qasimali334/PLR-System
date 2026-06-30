import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CheckCircle, Circle, Clock, ExternalLink, Play, ChevronRight, Send, Bot, User, Trash2, X, Sparkles, RefreshCw, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { pathAPI, recommendAPI, parseSSEStream } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'
import MarkdownRenderer from '../components/MarkdownRenderer'

const STAGE_COLORS = [
  {
    bg: 'bg-indigo-950/40 border-indigo-500/20 hover:bg-indigo-950/60',
    text: 'text-indigo-200',
    accent: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300'
  },
  {
    bg: 'bg-teal-950/40 border-teal-500/20 hover:bg-teal-950/60',
    text: 'text-teal-200',
    accent: 'text-teal-400',
    border: 'border-teal-500/30',
    badge: 'bg-teal-500/20 text-teal-300'
  },
  {
    bg: 'bg-blue-950/40 border-blue-500/20 hover:bg-blue-950/60',
    text: 'text-blue-200',
    accent: 'text-blue-400',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300'
  },
  {
    bg: 'bg-amber-950/40 border-amber-500/20 hover:bg-amber-950/60',
    text: 'text-amber-200',
    accent: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300'
  },
  {
    bg: 'bg-orange-950/40 border-orange-500/20 hover:bg-orange-950/60',
    text: 'text-orange-200',
    accent: 'text-orange-400',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300'
  },
  {
    bg: 'bg-emerald-950/40 border-emerald-500/20 hover:bg-emerald-950/60',
    text: 'text-emerald-200',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300'
  },
  {
    bg: 'bg-rose-950/40 border-rose-500/20 hover:bg-rose-950/60',
    text: 'text-rose-200',
    accent: 'text-rose-400',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300'
  },
  {
    bg: 'bg-zinc-800/40 border-zinc-500/20 hover:bg-zinc-800/60',
    text: 'text-zinc-200',
    accent: 'text-zinc-400',
    border: 'border-zinc-500/30',
    badge: 'bg-zinc-700/40 text-zinc-300'
  }
]

export default function PathDetail() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const [path, setPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedStepId, setExpandedStepId] = useState(null)

  // Sidebar Chat State
  const [activeChat, setActiveChat] = useState(null) // { title, description }
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatStreaming, setChatStreaming] = useState(false)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)

  // Path Recommendations State
  const [recs, setRecs] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [generatingRecs, setGeneratingRecs] = useState(false)
  const [recsInsight, setRecsInsight] = useState('')

  useEffect(() => {
    loadPath()
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const loadPath = async () => {
    try {
      const { data } = await pathAPI.getById(id)
      setPath(data.path)
      
      // Load path recommendations
      setLoadingRecs(true)
      const recRes = await recommendAPI.getPathRecs(id)
      const existingRecs = recRes.data.recommendations || []
      setRecs(existingRecs)
      setLoadingRecs(false)
      
      // Auto-generate recommendations in the background if they don't exist yet
      if (existingRecs.length === 0) {
        console.log('No recommendations found for this path, generating initial recommendations...')
        generatePathRecs(id)
      }
    } catch { 
      toast.error('Failed to load path') 
      setLoadingRecs(false)
    } finally { 
      setLoading(false) 
    }
  }

  const generatePathRecs = async (overrideId) => {
    const targetId = (overrideId && typeof overrideId === 'string') ? overrideId : id;
    setGeneratingRecs(true)
    try {
      const { data } = await recommendAPI.generatePathRecs(targetId)
      setRecs(data.recommendations || [])
      if (data.insight) setRecsInsight(data.insight)
      toast.success('✨ Fresh path recommendations generated!')
    } catch {
      toast.error('Failed to generate recommendations for this path')
    } finally {
      setGeneratingRecs(false)
    }
  }

  const acceptRec = async (recId) => {
    try {
      await recommendAPI.accept(recId)
      setRecs(p => p.filter(r => r.id !== recId))
      toast.success('Added to your learning list! Generation started in background.')
    } catch {
      toast.error('Failed to accept recommendation')
    }
  }

  const dismissRec = async (recId) => {
    try {
      await recommendAPI.dismiss(recId)
      setRecs(p => p.filter(r => r.id !== recId))
      toast.success('Recommendation dismissed')
    } catch {
      toast.error('Failed to dismiss recommendation')
    }
  }

  const updateStep = async (stepId, status) => {
    try {
      await pathAPI.updateStep(id, stepId, { status })
      setPath(p => ({
        ...p,
        learning_steps: p.learning_steps.map(s => s.id === stepId ? { ...s, status } : s)
      }))
      if (status === 'completed') {
        toast.success('Step completed! 🎉')
        // Automatically refresh recommendations based on the newly completed step
        toast.promise(
          recommendAPI.generatePathRecs(id).then(res => {
            setRecs(res.data.recommendations || [])
            if (res.data.insight) setRecsInsight(res.data.insight)
          }),
          {
            loading: 'Refreshed recommendations based on your progress...',
            success: '✨ Recommendations updated based on your progress!',
            error: 'Failed to update recommendations'
          }
        )
      }
    } catch { toast.error('Failed to update step') }
  }

  // Open Chat Sidebar & Load History
  const handleOpenChat = (subtopic) => {
    const chatKey = `chat_${id}_${subtopic.title}`
    setActiveChat(subtopic)

    const saved = localStorage.getItem(chatKey)
    if (saved) {
      setChatMessages(JSON.parse(saved))
    } else {
      const initialMsgs = [
        { role: 'assistant', content: `Hi! Let's explore "${subtopic.title}" together. Here is a quick definition:\n\n*"${subtopic.description}"*\n\nWhat questions do you have about this topic?` }
      ]
      setChatMessages(initialMsgs)
      localStorage.setItem(chatKey, JSON.stringify(initialMsgs))

      // Auto-trigger explanation
      const prefillMessage = `Explain the concept of "${subtopic.title}" in the context of "${path.title}". Here is the brief definition: "${subtopic.description}". Can you give me more details, code examples (if applicable), and explain why it is important?`
      triggerAutoExplain(prefillMessage, initialMsgs, chatKey)
    }
  }

  // Auto-explanation API Caller
  const triggerAutoExplain = async (msg, initialHistory, chatKey) => {
    setChatStreaming(true)
    const userMsg = { role: 'user', content: 'Explain this topic in detail.' }
    const newMessages = [...initialHistory, userMsg, { role: 'assistant', content: '', streaming: true }]
    setChatMessages(newMessages)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, history: initialHistory })
      })

      await parseSSEStream(
        res,
        (fullText) => {
          setChatMessages(p => {
            const updated = p.map((m, idx) => idx === p.length - 1 ? { ...m, content: fullText } : m)
            localStorage.setItem(chatKey, JSON.stringify(updated.map(m => ({ role: m.role, content: m.content }))))
            return updated
          })
        },
        () => {
          setChatMessages(p => {
            const updated = p.map((m, idx) => idx === p.length - 1 ? { ...m, streaming: false } : m)
            localStorage.setItem(chatKey, JSON.stringify(updated.map(m => ({ role: m.role, content: m.content }))))
            return updated
          })
        }
      )
    } catch {
      setChatMessages(p => p.map((m, idx) => idx === p.length - 1 ? { ...m, content: 'Sorry, something went wrong. Please try again.', streaming: false } : m))
    } finally {
      setChatStreaming(false)
    }
  }

  // Send Chat Message API Caller
  const sendChatMessage = async (text) => {
    const msg = text || chatInput.trim()
    if (!msg || chatStreaming) return
    setChatInput('')

    const userMsg = { role: 'user', content: msg }
    const history = chatMessages.filter(m => m.role !== 'system')
    const newMessages = [...chatMessages, userMsg, { role: 'assistant', content: '', streaming: true }]
    setChatMessages(newMessages)
    setChatStreaming(true)

    const chatKey = `chat_${id}_${activeChat.title}`

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, history })
      })

      await parseSSEStream(
        res,
        (fullText) => {
          setChatMessages(p => {
            const updated = p.map((m, idx) => idx === p.length - 1 ? { ...m, content: fullText } : m)
            localStorage.setItem(chatKey, JSON.stringify(updated.map(m => ({ role: m.role, content: m.content }))))
            return updated
          })
        },
        () => {
          setChatMessages(p => {
            const updated = p.map((m, idx) => idx === p.length - 1 ? { ...m, streaming: false } : m)
            localStorage.setItem(chatKey, JSON.stringify(updated.map(m => ({ role: m.role, content: m.content }))))
            return updated
          })
        }
      )
    } catch {
      setChatMessages(p => p.map((m, idx) => idx === p.length - 1 ? { ...m, content: 'Sorry, something went wrong. Please try again.', streaming: false } : m))
    } finally {
      setChatStreaming(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!path) return <div className="text-center text-text-muted">Path not found</div>

  const steps = path.learning_steps || []
  const completed = steps.filter(s => s.status === 'completed').length
  const progress = steps.length ? Math.round(completed / steps.length * 100) : 0

  return (
    <div className={`grid gap-6 transition-all duration-300 ${activeChat ? 'lg:grid-cols-3 max-w-7xl mx-auto' : 'max-w-4xl mx-auto grid-cols-1'}`}>
      
      {/* Left Column: Path Details */}
      <div className={activeChat ? 'lg:col-span-2' : ''}>
        <Link to="/paths" className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors w-fit">
          <ChevronLeft size={18} /> Back to Paths
        </Link>

        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            {path.ai_generated && <span className="badge-primary">🤖 AI Generated Roadmap</span>}
            {path.difficulty && <span className="badge-secondary capitalize">{path.difficulty}</span>}
          </div>
          <h1 className="text-2xl font-bold font-inter text-text-primary mb-2">{path.title}</h1>
          <p className="text-text-muted text-sm mb-4">{path.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">{completed}/{steps.length} completed</span>
                <span className="font-bold gradient-text">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-text-muted">Click any section to expand. Click a topic to open the AI Chat sidebar.</p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {steps.map((step, i) => {
            const colors = STAGE_COLORS[i % STAGE_COLORS.length]
            const isOpen = expandedStepId === step.id

            // Parse JSON description safely
            let descObj
            try {
              descObj = JSON.parse(step.description)
              if (!descObj || typeof descObj !== 'object') {
                throw new Error()
              }
            } catch {
              descObj = {
                summary: step.description || '',
                subtopics: [
                  { title: 'Foundations & Concepts', description: step.description || 'Learn the foundational concepts and structures related to this topic.' }
                ]
              }
            }

            return (
              <div key={step.id} className="rounded-xl overflow-hidden transition-all duration-300">
                {/* Header Banner */}
                <div
                  onClick={() => setExpandedStepId(isOpen ? null : step.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-xl border ${colors.bg} cursor-pointer transition-all duration-200 select-none ${colors.border} ${isOpen ? 'rounded-b-none' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {step.status === 'completed' ? (
                      <CheckCircle size={18} className="text-secondary flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-text-muted/60 flex-shrink-0" />
                    )}
                    <div className="text-left">
                      <h3 className={`font-bold font-inter text-md ${step.status === 'completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                        {step.step_order}. {step.title}
                      </h3>
                      {descObj.summary && (
                        <p className="text-xs text-text-secondary mt-0.5">{descObj.summary}</p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${colors.accent}`}>
                    <Play size={12} className={`fill-current transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Accordion Expandable Details */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`overflow-hidden border-x border-b rounded-b-xl p-5 ${colors.bg.replace('hover:', ' ')} ${colors.border}`}
                    >
                      {/* Metadata & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-bg-border">
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="badge-primary capitalize text-[10px]">{step.resource_type}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {step.estimated_hours}h</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {step.resource_url && (
                            <a href={step.resource_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors">
                              Open Resource <ExternalLink size={12} />
                            </a>
                          )}

                          <button
                            onClick={() => updateStep(step.id, step.status === 'completed' ? 'pending' : 'completed')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${step.status === 'completed' ? 'bg-secondary/20 border-secondary/40 text-secondary' : 'bg-bg-elevated border-bg-border text-text-muted hover:text-text-primary'}`}
                          >
                            {step.status === 'completed' ? <CheckCircle size={13} /> : <Circle size={13} />}
                            {step.status === 'completed' ? 'Completed' : 'Mark Complete'}
                          </button>
                        </div>
                      </div>

                      {/* Subtopics Grid */}
                      {descObj.subtopics?.length > 0 ? (
                        <div>
                          <p className="text-xs text-text-muted font-bold tracking-wide uppercase mb-3">Roadmap Subtopics — Click to ask AI assistant</p>
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {descObj.subtopics.map((sub, j) => {
                              const isChattingThis = activeChat?.title === sub.title
                              return (
                                <div
                                  key={j}
                                  onClick={() => handleOpenChat(sub)}
                                  className={`p-4 rounded-xl border bg-bg-primary/50 cursor-pointer hover:bg-primary/5 transition-all duration-200 group flex flex-col justify-between ${isChattingThis ? 'border-primary bg-primary/5' : 'border-bg-border hover:border-primary/50'}`}
                                >
                                  <div>
                                    <h4 className={`font-bold text-sm mb-1 group-hover:text-primary transition-colors ${isChattingThis ? 'text-primary' : 'text-text-primary'}`}>{sub.title}</h4>
                                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{sub.description}</p>
                                  </div>
                                  <div className="text-[10px] text-primary/70 mt-3 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                    Ask AI <ChevronRight size={10} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-text-muted p-4">No subtopics available for this step.</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Path Recommendations Section */}
        <div className="mt-8 border-t border-bg-border/60 pt-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-primary animate-pulse" />
                <h2 className="text-xl font-bold font-inter text-text-primary">What to Learn Next</h2>
              </div>
              <p className="text-xs text-text-muted">Personalized AI recommendations based on your progress in this path</p>
            </div>
            <button 
              onClick={generatePathRecs} 
              disabled={generatingRecs} 
              className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3 disabled:opacity-60"
            >
              {generatingRecs ? (
                <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              {generatingRecs ? 'Analyzing Progress...' : recs.length > 0 ? 'Refresh AI Picks' : 'Generate Recommendations'}
            </button>
          </div>

          {loadingRecs ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="glass-card h-40 animate-pulse bg-bg-elevated/40" />
              ))}
            </div>
          ) : recs.length === 0 ? (
            <div className="glass-card p-8 text-center border-dashed border-2 border-bg-border">
              <Target size={32} className="text-text-muted mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold text-text-primary mb-1">No next steps generated yet</p>
              <p className="text-xs text-text-muted mb-4">Let Gemini AI analyze your progress and recommend the absolute best next topics and projects.</p>
              <button 
                onClick={generatePathRecs} 
                disabled={generatingRecs} 
                className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4"
              >
                <Sparkles size={13} /> Generate Next Steps
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recsInsight && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 border-primary/20 bg-primary/5 flex items-start gap-2.5">
                  <Bot size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-primary block mb-0.5">AI Progress Insight</span>
                    <p className="text-text-secondary text-xs leading-relaxed">{recsInsight}</p>
                  </div>
                </motion.div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {recs.map((rec, idx) => {
                  const content = rec.content || {}
                  const difficultyColor = {
                    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }[content.difficulty || 'intermediate']

                  return (
                    <motion.div 
                      key={rec.id} 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card p-5 flex flex-col justify-between border-bg-border hover:border-primary/30 transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${difficultyColor}`}>
                            {content.difficulty || 'intermediate'}
                          </span>
                          <span className="text-[10px] text-text-muted font-medium">⏱ ~{content.estimated_hours || 8}h</span>
                        </div>
                        <h4 className="font-bold text-sm text-text-primary mb-2 line-clamp-1">{content.topic || rec.title}</h4>
                        <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-3">{content.reason}</p>
                        
                        {content.suggested_resources?.length > 0 && (
                          <div className="mb-4 pt-3 border-t border-bg-border/60">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Curated Resources</span>
                            <div className="space-y-1.5">
                              {content.suggested_resources.map((r, j) => (
                                <a 
                                  key={j} 
                                  href={r.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:text-primary-light flex items-center gap-1 transition-colors w-fit max-w-full"
                                >
                                  <ExternalLink size={11} className="flex-shrink-0" />
                                  <span className="truncate">{r.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-bg-border/40">
                        <button 
                          onClick={() => acceptRec(rec.id)} 
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-semibold transition-all border border-secondary/20"
                        >
                          <CheckCircle size={12} /> Accept Path
                        </button>
                        <button 
                          onClick={() => dismissRec(rec.id)} 
                          className="flex items-center justify-center p-1.5 rounded-lg bg-danger/5 hover:bg-danger/10 text-danger text-xs font-semibold transition-all border border-danger/10"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: AI Chat Sidebar */}
      {activeChat && (
        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="lg:col-span-1 glass-card p-5 h-[calc(100vh-140px)] sticky top-6 flex flex-col border-primary/30"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-bg-border flex-shrink-0">
            <div className="flex items-center gap-2 max-w-[80%]">
              <Bot size={18} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-text-primary truncate">{activeChat.title}</h3>
                <p className="text-[10px] text-text-muted truncate">AI Learning Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  const chatKey = `chat_${id}_${activeChat.title}`
                  localStorage.removeItem(chatKey)
                  setChatMessages([{ role: 'assistant', content: `Chat cleared! Ask anything about "${activeChat.title}".` }])
                  toast.success('Chat history cleared')
                }}
                className="text-text-muted hover:text-danger p-1 rounded hover:bg-danger/10 transition-colors"
                title="Clear chat history"
              >
                <Trash2 size={14} />
              </button>
              <button 
                onClick={() => setActiveChat(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-bg-elevated transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-hide">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${msg.role === 'assistant' ? 'bg-gradient-primary text-white font-bold' : 'bg-secondary/20 text-secondary'}`}>
                  {msg.role === 'assistant' ? <Bot size={12} className="text-white" /> : <User size={12} />}
                </div>
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-primary/20 text-text-primary rounded-tr-sm' : 'bg-bg-elevated text-text-secondary rounded-tl-sm'}`}>
                  {msg.content ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    msg.streaming && (
                      <span className="inline-flex gap-1 py-1">
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex gap-2 mt-auto flex-shrink-0 pt-3 border-t border-bg-border">
            <input 
              ref={chatInputRef} 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
              placeholder="Ask follow-up..." 
              className="input-field flex-1 text-xs py-2 px-3 h-9" 
              disabled={chatStreaming} 
            />
            <button 
              onClick={() => sendChatMessage()} 
              disabled={!chatInput.trim() || chatStreaming}
              className="btn-primary p-2 h-9 w-9 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  )
}
