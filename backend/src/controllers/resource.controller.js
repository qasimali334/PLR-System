import supabase from '../services/supabase.service.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const getResources = asyncHandler(async (req, res) => {
  const { topic, type, difficulty, search, page = 1, limit = 12 } = req.query;
  let query = supabase.from('resources').select('*', { count: 'exact' });
  if (topic) query = query.ilike('topic', `%${topic}%`);
  if (type) query = query.eq('type', type);
  if (difficulty) query = query.eq('difficulty', difficulty);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  query = query.range((page - 1) * limit, page * limit - 1).order('rating', { ascending: false });
  const { data, count, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ resources: data, total: count, page: parseInt(page), limit: parseInt(limit) });
});

export const getResourceById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('resources').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Resource not found' });
  res.json({ resource: data });
});
