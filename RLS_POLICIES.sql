-- Row Level Security Policies for SkillMates
-- Run this AFTER the main schema has been created successfully

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
-- Users policies
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Swap requests policies
DROP POLICY IF EXISTS "Users can view requests involving them" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can create swap requests" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can update requests involving them" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON public.swap_requests;

-- Chat threads policies
DROP POLICY IF EXISTS "Users can view their chat threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can create chat threads for their requests" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can update their chat threads" ON public.chat_threads;

-- Chat messages policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

-- Announcements policies
DROP POLICY IF EXISTS "Everyone can view active announcements" ON public.announcements;

-- Create Users policies
CREATE POLICY "Users can view all public profiles" ON public.users FOR SELECT USING (is_public = true OR auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create Swap requests policies
CREATE POLICY "Users can view requests involving them" ON public.swap_requests FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create swap requests" ON public.swap_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update requests involving them" ON public.swap_requests FOR UPDATE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can delete their own requests" ON public.swap_requests FOR DELETE USING (auth.uid() = from_user_id);

-- Create Chat threads policies
CREATE POLICY "Users can view their chat threads" ON public.chat_threads FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create chat threads for their requests" ON public.chat_threads FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.swap_requests 
    WHERE id = request_id AND (from_user_id = auth.uid() OR to_user_id = auth.uid())
  )
);
CREATE POLICY "Users can update their chat threads" ON public.chat_threads FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create Chat messages policies
CREATE POLICY "Users can view messages in their threads" ON public.chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads 
    WHERE id = thread_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their threads" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_threads 
    WHERE id = thread_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);
CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE USING (auth.uid() = sender_id);

-- Create Announcements policies
CREATE POLICY "Everyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);