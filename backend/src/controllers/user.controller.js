import supabase from '../services/supabase.service.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const getProfile = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', req.userId).single();
  if (error) return res.status(404).json({ error: 'Profile not found' });
  res.json({ user: data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, bio, weekly_goal, learning_goal, avatar_url } = req.body;
  const updates = { updated_at: new Date().toISOString() };
  if (full_name !== undefined) updates.full_name = full_name;
  if (bio !== undefined) updates.bio = bio;
  if (weekly_goal !== undefined) updates.weekly_goal = weekly_goal;
  if (learning_goal !== undefined) updates.learning_goal = learning_goal;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const { data, error } = await supabase.from('users').update(updates).eq('id', req.userId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data, message: 'Profile updated' });
});
