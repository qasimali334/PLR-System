-- PLR System Database Schema
-- Run this in Supabase SQL Editor → New Query → Run

-- ========================
-- USERS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text UNIQUE NOT NULL,
  full_name     text,
  avatar_url    text,
  bio           text,
  weekly_goal   int DEFAULT 5,
  learning_goal text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ========================
-- INTERESTS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.interests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category     text NOT NULL,
  topic        text NOT NULL,
  skill_level  text NOT NULL DEFAULT 'beginner',
  priority     int DEFAULT 3,
  created_at   timestamptz DEFAULT now()
);

-- ========================
-- LEARNING PATHS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  category      text,
  difficulty    text DEFAULT 'beginner',
  ai_generated  boolean DEFAULT true,
  status        text DEFAULT 'active',
  total_steps   int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ========================
-- LEARNING STEPS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.learning_steps (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id          uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  step_order       int NOT NULL,
  title            text NOT NULL,
  description      text,
  resource_url     text,
  resource_type    text DEFAULT 'article',
  estimated_hours  float DEFAULT 1,
  status           text DEFAULT 'pending',
  completed_at     timestamptz
);

-- ========================
-- PROGRESS LOGS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  step_id         uuid REFERENCES public.learning_steps(id),
  path_id         uuid REFERENCES public.learning_paths(id),
  action          text,
  time_spent_min  int DEFAULT 0,
  notes           text,
  logged_at       timestamptz DEFAULT now()
);

-- ========================
-- QUIZ RESULTS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic           text NOT NULL,
  score           float DEFAULT 0,
  total_questions int DEFAULT 0,
  correct_answers int DEFAULT 0,
  difficulty      text,
  answers_log     jsonb,
  taken_at        timestamptz DEFAULT now()
);

-- ========================
-- AI RECOMMENDATIONS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type         text DEFAULT 'next_topic',
  title        text,
  content      jsonb,
  gemini_model text DEFAULT 'gemini-1.5-pro',
  is_accepted  boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- ========================
-- RESOURCES TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.resources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  url         text NOT NULL,
  type        text DEFAULT 'article',
  topic       text,
  category    text,
  difficulty  text DEFAULT 'beginner',
  is_free     boolean DEFAULT true,
  rating      float DEFAULT 0,
  tags        text[],
  created_at  timestamptz DEFAULT now()
);

-- ========================
-- ROW LEVEL SECURITY
-- ========================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Interests policies
CREATE POLICY "Users manage own interests" ON public.interests FOR ALL USING (auth.uid() = user_id);

-- Paths policies
CREATE POLICY "Users manage own paths" ON public.learning_paths FOR ALL USING (auth.uid() = user_id);

-- Steps policies (accessible through paths)
CREATE POLICY "Users manage own steps" ON public.learning_steps FOR ALL
USING (path_id IN (SELECT id FROM public.learning_paths WHERE user_id = auth.uid()));

-- Progress logs policies
CREATE POLICY "Users manage own logs" ON public.progress_logs FOR ALL USING (auth.uid() = user_id);

-- Quiz results policies
CREATE POLICY "Users manage own quiz results" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);

-- AI recommendations policies
CREATE POLICY "Users manage own recommendations" ON public.ai_recommendations FOR ALL USING (auth.uid() = user_id);

-- Resources - readable by all authenticated users
CREATE POLICY "Authenticated users can view resources" ON public.resources FOR SELECT USING (auth.role() = 'authenticated');

-- ========================
-- AUTO-CREATE USER PROFILE TRIGGER
-- ========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
