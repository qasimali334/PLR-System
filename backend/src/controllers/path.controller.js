import supabase from '../services/supabase.service.js';
import { generateJSON } from '../services/gemini.service.js';
import { LEARNING_PATH_PROMPT } from '../utils/prompts.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const getPaths = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('learning_paths').select('*, learning_steps(*)').eq('user_id', req.userId).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ paths: data });
});

export const getPathById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('learning_paths').select('*, learning_steps(*)').eq('id', req.params.id).eq('user_id', req.userId).single();
  if (error) return res.status(404).json({ error: 'Path not found' });
  // Sort steps by order
  if (data.learning_steps) {
    data.learning_steps.sort((a, b) => a.step_order - b.step_order);
  }
  res.json({ path: data });
});

export const createPath = asyncHandler(async (req, res) => {
  const { title, description, category, difficulty, steps = [] } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const { data: path, error } = await supabase.from('learning_paths').insert({
    user_id: req.userId, title, description, category, difficulty,
    ai_generated: false, total_steps: steps.length,
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });

  if (steps.length > 0) {
    const stepRows = steps.map((s, i) => ({ ...s, path_id: path.id, step_order: i + 1 }));
    await supabase.from('learning_steps').insert(stepRows);
  }
  res.status(201).json({ path, message: 'Path created' });
});

export const generatePath = asyncHandler(async (req, res) => {
  const { goal, skillLevel = 'beginner', weeklyHours = 5 } = req.body;
  if (!goal) return res.status(400).json({ error: 'Learning goal is required' });

  // Fetch user interests for context
  const { data: interests } = await supabase.from('interests').select('topic').eq('user_id', req.userId);
  const interestTopics = interests?.map(i => i.topic) || [];

  const prompt = LEARNING_PATH_PROMPT(goal, skillLevel, weeklyHours, interestTopics);
  const aiData = await generateJSON(prompt, 'pro');

  // Save generated path
  const { data: path, error } = await supabase.from('learning_paths').insert({
    user_id: req.userId,
    title: aiData.title,
    description: aiData.description,
    category: aiData.category,
    difficulty: aiData.difficulty,
    ai_generated: true,
    total_steps: aiData.steps?.length || 0,
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });

  let formattedSteps = [];
  if (aiData.steps?.length > 0) {
    const stepRows = aiData.steps.map(s => {
      const descObj = s.subtopics
        ? { summary: s.summary || s.description || '', subtopics: s.subtopics }
        : { summary: s.description || '', subtopics: [] };

      return {
        path_id: path.id,
        step_order: s.step_order,
        title: s.title,
        description: JSON.stringify(descObj),
        resource_type: s.resource_type || 'article',
        resource_url: s.resource_url || '',
        estimated_hours: s.estimated_hours || 1,
      };
    });
    const { data: savedSteps } = await supabase.from('learning_steps').insert(stepRows).select();
    formattedSteps = savedSteps || stepRows;
  }

  res.status(201).json({ path: { ...path, learning_steps: formattedSteps }, message: 'AI path generated', estimated_hours: aiData.estimated_total_hours });
});

export const updatePath = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;
  const { data, error } = await supabase.from('learning_paths').update({ title, description, status, updated_at: new Date().toISOString() }).eq('id', req.params.id).eq('user_id', req.userId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ path: data });
});

export const deletePath = asyncHandler(async (req, res) => {
  const pathId = req.params.id;
  const { data: path, error: fetchError } = await supabase
    .from('learning_paths')
    .select('id')
    .eq('id', pathId)
    .eq('user_id', req.userId)
    .single();

  if (fetchError || !path) {
    return res.status(404).json({ error: 'Path not found' });
  }

  // 1. Delete progress logs
  const { error: err1 } = await supabase.from('progress_logs').delete().eq('path_id', pathId).eq('user_id', req.userId);
  if (err1) return res.status(400).json({ error: err1.message });

  // 2. Delete recommendations associated with the path
  await supabase.from('ai_recommendations').delete().eq('user_id', req.userId).eq('type', `path_rec:${pathId}`);

  // 3. Delete learning steps
  const { error: err2 } = await supabase.from('learning_steps').delete().eq('path_id', pathId);
  if (err2) return res.status(400).json({ error: err2.message });

  // 4. Delete the path itself
  const { error } = await supabase.from('learning_paths').delete().eq('id', pathId).eq('user_id', req.userId);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Path deleted' });
});

export const updateStep = asyncHandler(async (req, res) => {
  const { stepId } = req.params;
  const { status, time_spent_min, notes } = req.body;
  const updates = { status };
  if (status === 'completed') updates.completed_at = new Date().toISOString();

  const { data: step, error } = await supabase.from('learning_steps').update(updates).eq('id', stepId).select().single();
  if (error) return res.status(400).json({ error: error.message });

  // Log progress
  if (status) {
    await supabase.from('progress_logs').insert({
      user_id: req.userId, step_id: stepId, path_id: req.params.pathId,
      action: status, time_spent_min: time_spent_min || 0, notes: notes || '',
    });
  }
  res.json({ step, message: 'Step updated' });
});
