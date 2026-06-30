import supabase from '../services/supabase.service.js';
import { generateJSON } from '../services/gemini.service.js';
import { RECOMMENDATION_PROMPT } from '../utils/prompts.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const getRecommendations = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('ai_recommendations').select('*').eq('user_id', req.userId).eq('is_dismissed', false).order('created_at', { ascending: false }).limit(10);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ recommendations: data });
});

export const generateRecommendations = asyncHandler(async (req, res) => {
  // Build user profile for AI
  const [{ data: interests }, { data: paths }, { data: quizzes }, { data: userProfile }] = await Promise.all([
    supabase.from('interests').select('*').eq('user_id', req.userId),
    supabase.from('learning_paths').select('*, learning_steps(status, title)').eq('user_id', req.userId),
    supabase.from('quiz_results').select('topic, score').eq('user_id', req.userId),
    supabase.from('users').select('learning_goal, weekly_goal').eq('id', req.userId).single(),
  ]);

  const completedTopics = paths?.flatMap(p => p.learning_steps?.filter(s => s.status === 'completed').map(s => s.title)) || [];
  const quizScores = quizzes?.reduce((acc, q) => { acc[q.topic] = q.score; return acc; }, {}) || {};

  const profile = {
    interests: interests?.map(i => `${i.topic} (${i.skill_level})`) || [],
    skillLevels: interests?.reduce((acc, i) => { acc[i.topic] = i.skill_level; return acc; }, {}) || {},
    completedTopics,
    quizScores,
    avgHoursPerWeek: userProfile?.data?.weekly_goal || 5,
    learningGoal: userProfile?.data?.learning_goal || 'General learning',
  };

  const prompt = RECOMMENDATION_PROMPT(profile);
  const aiData = await generateJSON(prompt, 'pro');

  // Safely get recommendations array
  const recList = Array.isArray(aiData?.recommendations) ? aiData.recommendations : [];
  if (recList.length === 0) {
    console.warn('[RECOMMEND] AI returned no recommendations or invalid structure.');
    return res.json({ recommendations: [], insight: aiData?.summary_insight || '' });
  }

  // Save recommendations
  const rows = recList.map(r => ({
    user_id: req.userId, type: 'next_topic',
    title: r.topic, content: r, gemini_model: 'gemini-2.5-flash',
  }));
  await supabase.from('ai_recommendations').insert(rows);

  res.json({ recommendations: recList, insight: aiData.summary_insight });
});

export const acceptRecommendation = asyncHandler(async (req, res) => {
  // Fetch recommendation details
  const { data: rec } = await supabase.from('ai_recommendations').select('*').eq('id', req.params.id).eq('user_id', req.userId).single();

  const { data, error } = await supabase.from('ai_recommendations').update({ is_accepted: true }).eq('id', req.params.id).eq('user_id', req.userId).select().single();
  if (error) return res.status(400).json({ error: error.message });

  // Auto-generate learning path in the background if details are available
  if (rec) {
    const topic = rec.title || rec.content?.topic;
    const difficulty = rec.content?.difficulty || 'intermediate';
    if (topic) {
      (async () => {
        try {
          console.log(`[AUTO-GENERATE PATH] Generating path for accepted topic: "${topic}"...`);
          const { LEARNING_PATH_PROMPT } = await import('../utils/prompts.js');
          const { generateJSON } = await import('../services/gemini.service.js');
          
          const prompt = LEARNING_PATH_PROMPT(topic, difficulty, 5, []);
          const aiData = await generateJSON(prompt, 'pro');
          
          const { data: path, error: pathErr } = await supabase.from('learning_paths').insert({
            user_id: req.userId,
            title: aiData.title,
            description: aiData.description,
            category: aiData.category,
            difficulty: aiData.difficulty,
            ai_generated: true,
            total_steps: aiData.steps?.length || 0,
          }).select().single();
          
          if (!pathErr && path && aiData.steps?.length > 0) {
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
            await supabase.from('learning_steps').insert(stepRows);
            console.log(`[AUTO-GENERATE PATH] Successfully generated path "${aiData.title}" for topic "${topic}".`);
          } else if (pathErr) {
            console.error(`[AUTO-GENERATE PATH ERROR] ${pathErr.message}`);
          }
        } catch (err) {
          console.error(`[AUTO-GENERATE PATH ERROR] Failed to auto-generate path:`, err);
        }
      })();
    }
  }

  res.json({ recommendation: data, message: 'Recommendation accepted and roadmap generation started in background' });
});

export const dismissRecommendation = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('ai_recommendations').update({ is_dismissed: true }).eq('id', req.params.id).eq('user_id', req.userId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ recommendation: data, message: 'Recommendation dismissed' });
});

export const getPathRecommendations = asyncHandler(async (req, res) => {
  const { pathId } = req.params;
  const { data, error } = await supabase.from('ai_recommendations').select('*').eq('user_id', req.userId).eq('type', `path_rec:${pathId}`).eq('is_dismissed', false).order('created_at', { ascending: false }).limit(5);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ recommendations: data });
});

export const generatePathRecommendations = asyncHandler(async (req, res) => {
  const { pathId } = req.params;
  
  // 1. Fetch path and steps
  const { data: path, error: pathErr } = await supabase.from('learning_paths').select('*, learning_steps(*)').eq('id', pathId).eq('user_id', req.userId).single();
  if (pathErr || !path) return res.status(404).json({ error: 'Learning path not found' });

  const steps = path.learning_steps || [];
  const completedSteps = steps.filter(s => s.status === 'completed').map(s => s.title);
  const pendingSteps = steps.filter(s => s.status !== 'completed').map(s => s.title);

  // 2. Call Gemini model
  const { PATH_RECOMMENDATION_PROMPT } = await import('../utils/prompts.js');
  const prompt = PATH_RECOMMENDATION_PROMPT(path.title, path.description, completedSteps, pendingSteps);
  const aiData = await generateJSON(prompt, 'pro');

  // Safely extract recommendations array
  const pathRecList = Array.isArray(aiData?.recommendations) ? aiData.recommendations : [];
  if (pathRecList.length === 0) {
    console.warn('[PATH_RECOMMEND] AI returned no recommendations or invalid structure. Raw:', JSON.stringify(aiData).slice(0, 200));
    return res.json({ recommendations: [], insight: aiData?.summary_insight || '' });
  }

  // 3. Save recommendations in DB
  const rows = pathRecList.map(r => ({
    user_id: req.userId,
    type: `path_rec:${pathId}`,
    title: r.topic,
    content: r,
    gemini_model: 'gemini-2.5-flash',
  }));
  
  // Clean old path recommendations first to avoid duplicates
  await supabase.from('ai_recommendations').delete().eq('user_id', req.userId).eq('type', `path_rec:${pathId}`);
  
  const { data: savedRecs, error: insertErr } = await supabase.from('ai_recommendations').insert(rows).select();
  if (insertErr) return res.status(400).json({ error: insertErr.message });

  res.json({ recommendations: savedRecs || [], insight: aiData?.summary_insight || '' });
});
