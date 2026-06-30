import supabase from '../services/supabase.service.js';
import { generateJSON } from '../services/gemini.service.js';
import { QUIZ_PROMPT } from '../utils/prompts.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

export const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, difficulty = 'intermediate', questionCount = 5 } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  // Check last score for this topic
  const { data: lastResult } = await supabase.from('quiz_results').select('score').eq('user_id', req.userId).eq('topic', topic).order('taken_at', { ascending: false }).limit(1).single();

  const prompt = QUIZ_PROMPT(topic, difficulty, questionCount, lastResult?.score ?? null);
  const quiz = await generateJSON(prompt, 'flash');
  res.json({ quiz });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { topic, difficulty, answers, questions } = req.body;
  // answers: { [questionId]: selectedOption }
  let correct = 0;
  const answersLog = questions.map(q => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correct_answer;
    if (isCorrect) correct++;
    return { ...q, selected_answer: selected, is_correct: isCorrect };
  });

  const score = Math.round((correct / questions.length) * 100);
  const { data, error } = await supabase.from('quiz_results').insert({
    user_id: req.userId, topic, difficulty, score,
    total_questions: questions.length, correct_answers: correct,
    answers_log: answersLog,
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });

  res.json({ result: data, score, correct, total: questions.length });
});

export const getQuizHistory = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('quiz_results').select('*').eq('user_id', req.userId).order('taken_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ history: data });
});
