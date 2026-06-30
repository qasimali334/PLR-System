import { createClient } from '@supabase/supabase-js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name },
  });
  if (error) return res.status(400).json({ error: error.message });

  // Insert user profile
  await supabase.from('users').upsert({
    id: data.user.id,
    email,
    full_name,
  });

  // Sign in to get token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return res.status(400).json({ error: signInError.message });

  res.status(201).json({
    message: 'Registration successful',
    user: { id: data.user.id, email, full_name },
    token: signInData.session.access_token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid credentials' });

  // Fetch profile
  const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();

  res.json({
    message: 'Login successful',
    user: profile || { id: data.user.id, email: data.user.email },
    token: data.session.access_token,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  res.json({ user: profile || user });
});

export const getGoogleUrl = asyncHandler(async (req, res) => {
  const redirectBase = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${redirectBase.replace(/\/$/, '')}/auth/callback`,
    },
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ url: data.url });
});
