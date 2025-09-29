-- Step-by-Step SkillMates Database Schema
-- Run this in your Supabase SQL Editor - creates tables first, then policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create all tables first
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  location TEXT DEFAULT '',
  avatar TEXT DEFAULT 'https://i.pravatar.cc/150?img=1',
  bio TEXT DEFAULT '',
  availability TEXT DEFAULT 'Flexible' CHECK (availability IN ('Morning', 'Afternoon', 'Evening', 'Flexible')),
  skills_offered TEXT[] DEFAULT '{}',
  skills_wanted TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  is_profile_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swap requests table
CREATE TABLE IF NOT EXISTS public.swap_requests (
  id SERIAL PRIMARY KEY,
  from_user_id UUID REFERENCES public.users(id) NOT NULL,
  to_user_id UUID REFERENCES public.users(id) NOT NULL,
  offered_skill TEXT NOT NULL,
  requested_skill TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_hours INTEGER DEFAULT 1,
  deadline DATE,
  rating_from_sender INTEGER CHECK (rating_from_sender >= 1 AND rating_from_sender <= 5),
  rating_from_recipient INTEGER CHECK (rating_from_recipient >= 1 AND rating_from_recipient <= 5),
  feedback_from_sender TEXT,
  feedback_from_recipient TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat threads table
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES public.swap_requests(id) NOT NULL,
  user1_id UUID REFERENCES public.users(id) NOT NULL,
  user2_id UUID REFERENCES public.users(id) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES public.chat_threads(id) NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_swap_requests_updated_at ON public.swap_requests;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_swap_requests_updated_at BEFORE UPDATE ON public.swap_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_skills_offered ON public.users USING GIN(skills_offered);
CREATE INDEX IF NOT EXISTS idx_users_skills_wanted ON public.users USING GIN(skills_wanted);
CREATE INDEX IF NOT EXISTS idx_swap_requests_from_user ON public.swap_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_to_user ON public.swap_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Step 4: Insert sample data
INSERT INTO public.announcements (title, content, type, is_active) 
SELECT 'Welcome to SkillMates!', 
       'Start exchanging skills with fellow learners. Create your first skill swap request and connect with the community!', 
       'info', 
       true
WHERE NOT EXISTS (
  SELECT 1 FROM public.announcements 
  WHERE title = 'Welcome to SkillMates!'
);