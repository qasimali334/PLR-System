import { createClient } from '@supabase/supabase-js';

// Admin client with service role key (full access, server-side only)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Helper: get user-scoped client with user's JWT
export const getUserClient = (token) =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

export default supabaseAdmin;
