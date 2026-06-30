import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, User, Target, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { userAPI } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'

export default function Settings() {
  const { user, setUser } = useAuthStore()
  const [form, setForm] = useState({ full_name: user?.full_name || '', bio: user?.bio || '', weekly_goal: user?.weekly_goal || 5, learning_goal: user?.learning_goal || '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await userAPI.updateProfile(form)
      setUser(data.user)
      toast.success('Profile updated successfully!')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Settings</h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <User size={18} className="text-primary" /> Profile Information
        </h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Full Name</label>
            <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Your name" className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." className="input-field resize-none h-20" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <Target size={14} className="text-primary" /> Learning Goal
            </label>
            <textarea value={form.learning_goal} onChange={e => setForm(p => ({ ...p, learning_goal: e.target.value }))} placeholder="What do you want to achieve?" className="input-field resize-none h-20" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <Clock size={14} className="text-primary" /> Weekly Goal: <span className="text-primary font-bold">{form.weekly_goal} hours</span>
            </label>
            <input type="range" min="1" max="40" value={form.weekly_goal} onChange={e => setForm(p => ({ ...p, weekly_goal: parseInt(e.target.value) }))} className="w-full accent-primary" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
