import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CheckCircle, XCircle, Brain, RotateCcw, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { quizAPI } from '../services/api'

const TOPICS = ['JavaScript', 'Python', 'React', 'Machine Learning', 'Data Science', 'CSS', 'Node.js', 'SQL', 'TypeScript', 'Git']

export default function Quiz() {
  const [phase, setPhase] = useState('setup') // setup | loading | quiz | result
  const [form, setForm] = useState({ topic: '', difficulty: 'intermediate', questionCount: 5 })
  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const generateQuiz = async () => {
    if (!form.topic) return toast.error('Please select a topic')
    setPhase('loading')
    try {
      const { data } = await quizAPI.generate(form)
      setQuiz(data.quiz)
      setCurrent(0)
      setAnswers({})
      setPhase('quiz')
    } catch { toast.error('Failed to generate quiz'); setPhase('setup') }
  }

  const handleAnswer = (option) => {
    if (showAnswer) return
    setSelected(option)
    setShowAnswer(true)
    const letter = option.charAt(0)
    setAnswers(p => ({ ...p, [quiz.questions[current].id]: letter }))
  }

  const next = async () => {
    setSelected(null)
    setShowAnswer(false)
    if (current < quiz.questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      // Submit
      try {
        const { data } = await quizAPI.submit({ topic: quiz.topic, difficulty: quiz.difficulty, answers, questions: quiz.questions })
        setResult(data)
        setPhase('result')
      } catch { toast.error('Failed to submit quiz') }
    }
  }

  const reset = () => { setPhase('setup'); setQuiz(null); setResult(null); setSelected(null); setShowAnswer(false) }

  const q = quiz?.questions[current]
  const isCorrect = showAnswer && selected?.charAt(0) === q?.correct_answer

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">AI Quiz</h1>
          <p className="page-subtitle">Test your knowledge with AI-generated questions</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Setup */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                <Zap size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-center text-text-primary mb-6">Configure Your Quiz</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Topic</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map(t => (
                      <button key={t} onClick={() => setForm(p => ({ ...p, topic: t }))}
                        className={`px-3 py-1.5 rounded-xl text-sm transition-all ${form.topic === t ? 'bg-primary text-white' : 'bg-bg-elevated text-text-secondary hover:bg-primary/20'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <input value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                    placeholder="Or type any topic..." className="input-field mt-3 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">Difficulty</label>
                    <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className="input-field text-sm">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">Questions: {form.questionCount}</label>
                    <input type="range" min="3" max="30" value={form.questionCount} onChange={e => setForm(p => ({ ...p, questionCount: parseInt(e.target.value) }))}
                      className="w-full mt-3 accent-primary" />
                  </div>
                </div>
                <button onClick={generateQuiz} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                  <Brain size={18} /> Generate Quiz with AI
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-16 text-center">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Gemini AI is crafting your quiz...</p>
          </motion.div>
        )}

        {/* Quiz */}
        {phase === 'quiz' && q && (
          <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            {/* Progress */}
            <div className="flex items-center justify-between gap-3 mb-6 w-full">
              <div className="flex gap-1 flex-1">
                {quiz.questions.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < current ? 'bg-secondary' : i === current ? 'bg-primary' : 'bg-bg-elevated'}`} />
                ))}
              </div>
              <span className="text-sm text-text-muted flex-shrink-0 ml-2">{current + 1} / {quiz.questions.length}</span>
            </div>

            <div className="glass-card p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-primary">{quiz.topic}</span>
                <span className="badge-warning capitalize">{quiz.difficulty}</span>
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-6">{q.question}</h2>

              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const letter = opt.charAt(0)
                  const isThisCorrect = letter === q.correct_answer
                  const isSelected = selected === opt
                  let style = 'bg-bg-elevated border border-bg-border text-text-secondary hover:border-primary/40'
                  if (showAnswer) {
                    if (isThisCorrect) style = 'bg-secondary/20 border border-secondary text-secondary'
                    else if (isSelected && !isThisCorrect) style = 'bg-danger/20 border border-danger text-danger'
                  } else if (isSelected) style = 'bg-primary/20 border border-primary text-primary'
                  return (
                    <button key={i} onClick={() => handleAnswer(opt)}
                      className={`w-full px-4 py-3 rounded-xl text-sm text-left transition-all flex items-center justify-between ${style}`}>
                      <span>{opt}</span>
                      {showAnswer && isThisCorrect && <CheckCircle size={16} />}
                      {showAnswer && isSelected && !isThisCorrect && <XCircle size={16} />}
                    </button>
                  )
                })}
              </div>

              {showAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl text-sm ${isCorrect ? 'bg-secondary/10 text-secondary' : 'bg-danger/10 text-danger'}`}>
                  <strong>{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong> — {q.explanation}
                </motion.div>
              )}

              {showAnswer && (
                <button onClick={next} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                  {current < quiz.questions.length - 1 ? 'Next Question →' : 'See Results 🎉'}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6" style={{ boxShadow: '0 0 30px rgba(124,111,255,0.5)' }}>
              <Trophy size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-black font-inter gradient-text mb-2">{result.score}%</h2>
            <p className="text-text-secondary mb-1">{result.correct}/{result.total} correct answers</p>
            <p className="text-text-muted text-sm mb-8">
              {result.score >= 80 ? '🎉 Excellent! You\'re mastering this topic!' : result.score >= 60 ? '👍 Good job! Keep practicing to improve.' : '📚 Keep learning! You\'ll get there.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setPhase('quiz'); setCurrent(0); setAnswers({}); setSelected(null); setShowAnswer(false) }}
                className="btn-secondary flex items-center gap-2"><RotateCcw size={16} /> Retry</button>
              <button onClick={reset} className="btn-primary">New Quiz</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
