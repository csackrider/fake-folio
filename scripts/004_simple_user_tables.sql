-- Simple user-based tables (no households)
-- Each user has their own entries, budgets, and settings

-- Entries table
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  frequency TEXT CHECK (frequency IN ('monthly', 'yearly') OR frequency IS NULL),
  assigned_to TEXT DEFAULT 'Shared',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget categories table
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  budget_limit NUMERIC NOT NULL,
  icon TEXT DEFAULT 'receipt',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'light',
  members JSONB DEFAULT '[{"id": "shared", "name": "Shared"}]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies: users can only access their own data
CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own entries" ON public.entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entries" ON public.entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own entries" ON public.entries
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own budgets" ON public.budget_categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budgets" ON public.budget_categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets" ON public.budget_categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets" ON public.budget_categories
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(date);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON public.budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
