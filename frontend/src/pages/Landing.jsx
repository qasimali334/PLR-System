import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Brain, Zap, Target, BarChart3, MessageSquare, BookOpen,
  ChevronRight, ArrowRight, Sparkles, Trophy, Users,
  CheckCircle, Play, GraduationCap, TrendingUp, Clock, Shield
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
}
const stagger = { visible: { transition: { staggerChildren: 0.12 } } }

const features = [
  { icon: Brain, title: 'AI-Powered Recommendations', desc: 'Gemini AI analyzes your learning patterns, interests, and progress to suggest exactly what you should learn next.', color: 'primary', gradient: 'from-primary to-purple-500' },
  { icon: Target, title: 'Personalized Learning Paths', desc: 'Get custom roadmaps tailored to your goals, skill level, and available time — generated in seconds by AI.', color: 'secondary', gradient: 'from-secondary to-blue-400' },
  { icon: BarChart3, title: 'Progress Analytics', desc: 'Track your learning journey with beautiful charts, streaks, skill radar, and heatmap calendars.', color: 'accent', gradient: 'from-accent to-orange-400' },
  { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Ask questions, get explanations, and receive guidance from your personal AI learning companion anytime.', color: 'warning', gradient: 'from-warning to-yellow-300' },
  { icon: Zap, title: 'Adaptive Quizzes', desc: 'AI generates smart quizzes adapted to your current knowledge level to reinforce learning and identify gaps.', color: 'success', gradient: 'from-success to-teal-300' },
  { icon: BookOpen, title: 'Curated Resources', desc: 'Access a library of hand-picked videos, articles, courses, and books matched to your learning path.', color: 'primary', gradient: 'from-purple-500 to-pink-400' },
]

const steps = [
  { step: '01', title: 'Tell Us Your Interests', desc: 'Select the topics and skills you want to explore — from programming and design to business and science.', icon: Target },
  { step: '02', title: 'AI Builds Your Path', desc: 'Our Gemini AI instantly creates a personalized learning roadmap with steps, resources, and time estimates.', icon: Brain },
  { step: '03', title: 'Learn & Level Up', desc: 'Follow your path, track progress, take AI quizzes, and get smarter recommendations as you grow.', icon: TrendingUp },
]

const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '10K+', label: 'Learning Paths' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '4.9★', label: 'Average Rating' },
]


const FloatingCard = ({ children, className, delay = 0 }) => (
  <motion.div
    className={`glass-card p-4 ${className}`}
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    {children}
  </motion.div>
)

const NavLink = ({ href, children }) => (
  <a href={href} className="text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium">
    {children}
  </a>
)

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-primary top-[-200px] left-[-200px]" />
        <div className="orb w-[500px] h-[500px] bg-secondary top-[30%] right-[-150px]" />
        <div className="orb w-[400px] h-[400px] bg-accent bottom-[10%] left-[20%]" />
      </div>

      {/* NAVBAR */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={`mx-auto max-w-7xl px-6 flex items-center justify-between rounded-2xl transition-all duration-300 ${scrolled ? 'bg-bg-card/90 backdrop-blur-xl border border-bg-border py-3 px-6 mx-4' : ''}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold font-inter gradient-text">PLR System</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="btn-ghost hidden sm:block text-sm px-4 py-2">Log In</Link>
            <Link to="/auth/register" className="btn-primary text-sm px-5 py-2.5">
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex items-center justify-center px-6 pt-24"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.4)' }}
          >
            <Sparkles size={14} className="text-primary" />
            <span className="gradient-text">Powered by Google Gemini AI</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black font-inter leading-tight text-balance mb-6"
          >
            Learn Smarter,{' '}
            <br />
            <span className="gradient-text">Not Harder</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI builds your personalized learning path, tracks your progress, and recommends what to learn next — so you always grow in the right direction.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/auth/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4 rounded-2xl">
              Start Learning Free
              <ArrowRight size={18} />
            </Link>
            <button className="btn-secondary flex items-center gap-2 text-base px-8 py-4 rounded-2xl">
              <Play size={18} className="text-primary" />
              See How It Works
            </button>
          </motion.div>

          {/* Hero floating cards */}
          <div className="relative max-w-4xl mx-auto h-64 hidden md:block">
            <FloatingCard className="absolute left-0 top-0 w-56" delay={0}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp size={16} className="text-secondary" />
                </div>
                <span className="text-sm font-semibold text-text-primary">Progress Today</span>
              </div>
              <div className="text-2xl font-bold gradient-text-teal">+2.5 hrs</div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: '72%' }} />
              </div>
              <div className="text-xs text-text-muted mt-1">72% of daily goal</div>
            </FloatingCard>

            <FloatingCard className="absolute right-0 top-4 w-60" delay={1}>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-primary" />
                <span className="text-sm font-semibold">AI Recommendation</span>
              </div>
              <p className="text-xs text-text-secondary mb-2">Based on your progress, learn:</p>
              <div className="flex items-center gap-2">
                <span className="badge-primary text-xs">React Hooks</span>
                <span className="badge-secondary text-xs">95% match</span>
              </div>
            </FloatingCard>

            <FloatingCard className="absolute left-1/2 -translate-x-1/2 bottom-0 w-52" delay={0.5}>
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-warning" />
                <span className="text-sm font-semibold">Quiz Score</span>
              </div>
              <div className="text-2xl font-bold text-warning">87%</div>
              <p className="text-xs text-text-muted">JavaScript Fundamentals</p>
            </FloatingCard>
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black font-inter gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="badge-primary inline-block mb-4">Everything You Need</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black font-inter mb-4">
              AI That Actually <span className="gradient-text">Understands</span> You
            </motion.h2>
            <motion.p variants={fadeUp} className="text-text-secondary text-lg max-w-2xl mx-auto">
              Every feature is designed around your unique learning style, pace, and goals.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-gradient-to-br ${f.gradient}`} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold font-inter text-text-primary mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={stagger} viewport={{ once: true }}>
            <motion.div variants={fadeUp} className="badge-secondary inline-block mb-4">Simple Process</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black font-inter mb-4">
              From Zero to <span className="gradient-text-teal">Expert</span> in 3 Steps
            </motion.h2>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`glass-card p-8 flex items-start gap-6 ${i % 2 !== 0 ? 'flex-row-reverse text-right' : ''}`}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center" style={{ boxShadow: '0 4px 20px rgba(124,111,255,0.4)' }}>
                  <step.icon size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Step {step.step}</span>
                  <h3 className="text-2xl font-bold font-inter text-text-primary mt-1 mb-2">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,111,255,0.2) 0%, rgba(0,229,176,0.1) 100%)', border: '1px solid rgba(124,111,255,0.3)' }}
          >
            <div className="orb w-64 h-64 bg-primary -top-16 -right-16" />
            <div className="orb w-48 h-48 bg-secondary -bottom-12 -left-12" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6" style={{ boxShadow: '0 0 30px rgba(124,111,255,0.5)' }}>
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-inter mb-4">
                Start Your <span className="gradient-text">AI Journey</span> Today
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
                Join 50,000+ learners who are growing faster with personalized AI recommendations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth/register" className="btn-primary flex items-center gap-2 text-base px-10 py-4 rounded-2xl">
                  Create Free Account
                  <ArrowRight size={18} />
                </Link>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <CheckCircle size={16} className="text-secondary" />
                  No credit card required
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
