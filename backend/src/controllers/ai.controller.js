import supabase from '../services/supabase.service.js';
import { generateJSON, streamWithFlash, startChat } from '../services/gemini.service.js';
import { INSIGHTS_PROMPT, CHAT_SYSTEM_PROMPT } from '../utils/prompts.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const getInsights = asyncHandler(async (req, res) => {
  const [{ data: logs }, { data: paths }, { data: quizzes }, { data: user }] = await Promise.all([
    supabase.from('progress_logs').select('*').eq('user_id', req.userId),
    supabase.from('learning_paths').select('*, learning_steps(status, title)').eq('user_id', req.userId),
    supabase.from('quiz_results').select('*').eq('user_id', req.userId),
    supabase.from('users').select('learning_goal, weekly_goal').eq('id', req.userId).single(),
  ]);

  const totalHours = (logs || []).reduce((s, l) => s + (l.time_spent_min || 0), 0) / 60;
  const completedTopics = paths?.flatMap(p => p.learning_steps?.filter(s => s.status === 'completed').map(s => s.title)) || [];
  const inProgressTopics = paths?.flatMap(p => p.learning_steps?.filter(s => s.status === 'in_progress').map(s => s.title)) || [];
  const avgQuizScore = quizzes?.length ? (quizzes.reduce((s, q) => s + q.score, 0) / quizzes.length) : 0;

  // Calculate streak
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = (logs || []).filter(l => new Date(l.logged_at) >= weekAgo).length;

  const data = { totalHours: totalHours.toFixed(1), completedTopics, inProgressTopics, avgQuizScore: avgQuizScore.toFixed(1), weekSessions, learningGoal: user?.data?.learning_goal || 'Not set', streak: 0 };
  const prompt = INSIGHTS_PROMPT(data);
  const insights = await generateJSON(prompt, 'pro');

  res.json({ insights, rawData: data });
});

export const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Fetch user context
  const [{ data: paths }, { data: interests }] = await Promise.all([
    supabase.from('learning_paths').select('title, status, learning_steps(title, status)').eq('user_id', req.userId).eq('status', 'active').limit(1),
    supabase.from('interests').select('topic, skill_level').eq('user_id', req.userId).limit(5),
  ]);

  const activePath = paths?.[0];
  const currentStep = activePath?.learning_steps?.find(s => s.status === 'in_progress');
  const context = {
    currentPath: activePath?.title || 'None',
    currentStep: currentStep?.title || 'None',
    skillLevel: interests?.[0]?.skill_level || 'beginner',
    interests: interests?.map(i => i.topic) || [],
    completedTopics: activePath?.learning_steps?.filter(s => s.status === 'completed').map(s => s.title) || [],
  };

  const systemPrompt = CHAT_SYSTEM_PROMPT(context);

  // Set SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const fullPrompt = `${systemPrompt}\n\nConversation history:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${message}\n\nAssistant:`;

  let fullResponse = '';
  await streamWithFlash(fullPrompt, (chunk) => {
    fullResponse += chunk;
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  });

  res.write(`data: ${JSON.stringify({ done: true, fullText: fullResponse })}\n\n`);
  res.end();
});

export const generateWeeklyReport = asyncHandler(async (req, res) => {
  const insights = await getInsights({ ...req, params: {} }, { json: (d) => d });
  res.json({ report: insights });
});
