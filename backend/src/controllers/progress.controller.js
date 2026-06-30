import supabase from '../services/supabase.service.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const getProgress = asyncHandler(async (req, res) => {
  const { data: logs } = await supabase.from('progress_logs').select('*, learning_steps(title, path_id)').eq('user_id', req.userId).order('logged_at', { ascending: false }).limit(50);
  res.json({ logs: logs || [] });
});

export const logProgress = asyncHandler(async (req, res) => {
  const { step_id, path_id, action, time_spent_min, notes } = req.body;
  const { data, error } = await supabase.from('progress_logs').insert({
    user_id: req.userId, step_id, path_id, action, time_spent_min: time_spent_min || 0, notes: notes || '',
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ log: data });
});

export const getStreak = asyncHandler(async (req, res) => {
  const { data: logs } = await supabase.from('progress_logs').select('logged_at').eq('user_id', req.userId).order('logged_at', { ascending: false });
  
  let streak = 0;
  if (!logs || logs.length === 0) return res.json({ streak: 0 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = [...new Set(logs.map(l => new Date(l.logged_at).toDateString()))];

  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
    if (diff === i) streak++;
    else break;
  }
  res.json({ streak });
});

export const getStats = asyncHandler(async (req, res) => {
  const { data: logs } = await supabase.from('progress_logs').select('*').eq('user_id', req.userId);
  const { data: paths } = await supabase.from('learning_paths').select('id, status').eq('user_id', req.userId);
  const { data: quizzes } = await supabase.from('quiz_results').select('score').eq('user_id', req.userId);

  const totalHours = (logs || []).reduce((sum, l) => sum + (l.time_spent_min || 0), 0) / 60;
  const completedPaths = (paths || []).filter(p => p.status === 'completed').length;
  const avgQuizScore = quizzes?.length ? (quizzes.reduce((s, q) => s + q.score, 0) / quizzes.length).toFixed(1) : 0;

  // Weekly hours (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyLogs = (logs || []).filter(l => new Date(l.logged_at) >= weekAgo);
  const weeklyHours = weeklyLogs.reduce((sum, l) => sum + (l.time_spent_min || 0), 0) / 60;

  res.json({
    totalHours: parseFloat(totalHours.toFixed(1)),
    weeklyHours: parseFloat(weeklyHours.toFixed(1)),
    completedPaths,
    totalPaths: (paths || []).length,
    avgQuizScore: parseFloat(avgQuizScore),
    totalQuizzes: (quizzes || []).length,
  });
});
