import supabase from '../services/supabase.service.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const getInterests = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('interests').select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ interests: data });
});

export const addInterests = asyncHandler(async (req, res) => {
  const { interests } = req.body; // array of { category, topic, skill_level, priority }
  if (!Array.isArray(interests) || interests.length === 0) {
    return res.status(400).json({ error: 'Interests array is required' });
  }
  const rows = interests.map(i => ({ ...i, user_id: req.userId }));
  const { data, error } = await supabase.from('interests').insert(rows).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ interests: data, message: 'Interests added' });
});

export const updateInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { skill_level, priority } = req.body;
  const { data, error } = await supabase.from('interests').update({ skill_level, priority }).eq('id', id).eq('user_id', req.userId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ interest: data });
});

export const deleteInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('interests').delete().eq('id', id).eq('user_id', req.userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Interest removed' });
});
