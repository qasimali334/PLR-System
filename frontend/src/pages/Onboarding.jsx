import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, Check, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { interestAPI, pathAPI } from '../services/api'

const CATEGORIES = [
  { id: 'technology', label: '💻 Technology', color: 'primary' },
  { id: 'design', label: '🎨 Design', color: 'accent' },
  { id: 'business', label: '📈 Business', color: 'warning' },
  { id: 'science', label: '🔬 Science', color: 'secondary' },
  { id: 'mathematics', label: '📐 Mathematics', color: 'primary' },
  { id: 'languages', label: '🌍 Languages', color: 'accent' },
  { id: 'arts', label: '🎭 Arts & Creativity', color: 'accent' },
  { id: 'health', label: '🏃 Health & Fitness', color: 'success' },
]

const TOPICS_BY_CATEGORY = {
  technology: ['JavaScript', 'Python', 'React', 'Machine Learning', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'Mobile Dev', 'AI/ML'],
  design: ['UI/UX Design', 'Figma', 'Graphic Design', 'Web Design', 'Product Design', 'Motion Design', 'Typography', '3D Design'],
  business: ['Digital Marketing', 'Entrepreneurship', 'Finance', 'Project Management', 'Sales', 'SEO', 'Analytics', 'Leadership'],
  science: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Environmental Science', 'Neuroscience', 'Genetics'],
  mathematics: ['Statistics', 'Calculus', 'Linear Algebra', 'Discrete Math', 'Probability', 'Number Theory'],
  languages: ['Spanish', 'French', 'Japanese', 'Chinese', 'German', 'Arabic', 'Korean', 'Portuguese'],
  arts: ['Photography', 'Video Editing', 'Music Production', 'Creative Writing', 'Filmmaking', 'Animation'],
  health: ['Nutrition', 'Yoga', 'Mental Health', 'Exercise Science', 'Mindfulness', 'Sports Medicine'],
}

const SKILL_LEVELS = [
  { value: 'beginner', label: '🌱 Beginner', desc: 'Just starting out' },
  { value: 'intermediate', label: '🚀 Intermediate', desc: 'Some knowledge' },
  { value: 'advanced', label: '⚡ Advanced', desc: 'Deep expertise' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [skillLevels, setSkillLevels] = useState({})
  const [goal, setGoal] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(5)
  const [generating, setGenerating] = useState(false)

  const availableTopics = selectedCategories.flatMap(c => TOPICS_BY_CATEGORY[c] || [])

  const toggleCategory = (id) => {
    setSelectedCategories(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
    setSelectedTopics([])
  }

  const toggleTopic = (t) => {
    setSelectedTopics(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  }

  const handleFinish = async () => {
    if (!goal.trim()) return toast.error('Please enter your learning goal')
    setGenerating(true)
    try {
      // Save interests
      const interests = selectedTopics.map(t => ({
        category: selectedCategories.find(c => TOPICS_BY_CATEGORY[c]?.includes(t)) || 'general',
        topic: t,
        skill_level: skillLevels[t] || 'beginner',
        priority: 3,
      }))
      if (interests.length > 0) await interestAPI.add(interests)

      // Generate first AI path
      await pathAPI.generate({ goal, skillLevel: skillLevels[selectedTopics[0]] || 'beginner', weeklyHours })

      toast.success('🎉 Your personalized learning path is ready!')
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const errMsg = err.response?.data?.error || err.message || 'Setup failed. Please try again.';
      toast.error(errMsg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-primary top-[-200px] left-[-100px]" />
      <div className="orb w-[400px] h-[400px] bg-secondary bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-xl font-black font-inter gradient-text">PLR System</span>
          </div>
          <h1 className="text-3xl font-bold font-inter text-text-primary">Set Up Your Learning Profile</h1>
          <p className="text-text-muted mt-2">Step {step} of 4 — {['Choose Categories', 'Pick Topics', 'Set Skill Levels', 'Your Goal'][step - 1]}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-gradient-primary' : 'bg-bg-elevated'}`} />
          ))}
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Categories */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-text-primary mb-2">What are you interested in?</h2>
                <p className="text-text-muted text-sm mb-6">Select all that apply</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                      className={`p-4 rounded-xl text-sm font-medium text-center transition-all duration-200 ${selectedCategories.includes(cat.id) ? 'bg-primary/20 border-2 border-primary text-primary' : 'bg-bg-elevated border-2 border-transparent text-text-secondary hover:border-primary/30'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Topics */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-text-primary mb-2">Which specific topics interest you?</h2>
                <p className="text-text-muted text-sm mb-6">Select 2-8 topics</p>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map(t => (
                    <button key={t} onClick={() => toggleTopic(t)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${selectedTopics.includes(t) ? 'bg-primary text-white' : 'bg-bg-elevated text-text-secondary hover:bg-bg-border'}`}>
                      {selectedTopics.includes(t) && <Check size={13} />}
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Skill levels */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-text-primary mb-2">What's your level for each topic?</h2>
                <p className="text-text-muted text-sm mb-6">This helps AI generate the right difficulty</p>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                  {selectedTopics.map(topic => (
                    <div key={topic} className="bg-bg-elevated rounded-xl p-4">
                      <p className="text-text-primary font-medium mb-3">{topic}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {SKILL_LEVELS.map(level => (
                          <button key={level.value} onClick={() => setSkillLevels(p => ({ ...p, [topic]: level.value }))}
                            className={`p-2.5 rounded-lg text-xs text-center transition-all ${skillLevels[topic] === level.value ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-primary/20'}`}>
                            <div>{level.label}</div>
                            <div className="opacity-70 mt-0.5">{level.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Goal */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-text-primary mb-2">What's your learning goal?</h2>
                <p className="text-text-muted text-sm mb-6">Our AI will create a personalized path based on this</p>
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. Become a full-stack developer in 6 months, Learn machine learning to switch careers..."
                  className="input-field resize-none h-32 mb-6"
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">
                    How many hours per week can you dedicate? <span className="text-primary font-bold">{weeklyHours} hrs</span>
                  </label>
                  <input type="range" min="1" max="40" value={weeklyHours} onChange={e => setWeeklyHours(parseInt(e.target.value))}
                    className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>1 hr</span><span>40 hrs</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className="btn-ghost flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={18} /> Back
            </button>
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={(step === 1 && selectedCategories.length === 0) || (step === 2 && selectedTopics.length === 0)}
                className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={generating || !goal.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-60">
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI is generating your path...</span>
                  </>
                ) : (
                  <><Sparkles size={18} /> Generate My Path</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
