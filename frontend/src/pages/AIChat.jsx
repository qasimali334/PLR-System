import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { parseSSEStream } from '../services/api'

const STARTERS = [
  'What should I learn next?',
  'Explain React hooks to me',
  'How do I stay motivated while learning?',
  'Give me a quick quiz on JavaScript',
]

export default function AIChat() {
  const { token } = useAuthStore()
  const location = useLocation()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI learning assistant powered by Gemini. I know your current learning path and can help you understand topics, suggest resources, or just answer questions. What would you like to explore?' }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || streaming) return
    setInput('')
    const userMsg = { role: 'user', content: msg }
    const history = messages.filter(m => m.role !== 'system')
    setMessages(p => [...p, userMsg, { role: 'assistant', content: '', streaming: true }])
    setStreaming(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, history })
      })

      await parseSSEStream(
        res,
        (fullText) => {
          setMessages(p => p.map((m, i) => i === p.length - 1 ? { ...m, content: fullText } : m))
        },
        () => {
          setMessages(p => p.map((m, i) => i === p.length - 1 ? { ...m, streaming: false } : m))
        }
      )
    } catch {
      setMessages(p => p.map((m, i) => i === p.length - 1 ? { ...m, content: 'Sorry, something went wrong. Please try again.', streaming: false } : m))
    } finally {
      setStreaming(false)
    }
  }

  useEffect(() => {
    if (location.state?.prefillMessage) {
      sendMessage(location.state.prefillMessage)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">AI Learning Assistant</h1>
          <p className="page-subtitle flex items-center gap-1.5">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            Powered by Gemini 2.0 Flash
          </p>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: 'Chat cleared! What would you like to explore?' }])}
          className="btn-ghost flex items-center gap-2 text-sm">
          <Trash2 size={15} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 glass-card p-4 overflow-y-auto space-y-4 scrollbar-hide mb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-primary' : 'bg-secondary/20'}`}>
                {msg.role === 'assistant' ? <Bot size={15} className="text-white" /> : <User size={15} className="text-secondary" />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary/20 text-text-primary rounded-tr-sm' : 'bg-bg-elevated text-text-secondary rounded-tl-sm'}`}>
                {msg.content ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  msg.streaming && (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                    </span>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Starter suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {STARTERS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask anything about your learning journey..."
          className="input-field flex-1" disabled={streaming} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || streaming}
          className="btn-primary px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
