-- SkillMates Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to create the necessary tables

-- Enable Row Level Security (RLS)
-- We'll set up policies after creating tables

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    avatar TEXT,
    skills_offered TEXT[] DEFAULT '{}',
    skills_wanted TEXT[] DEFAULT '{}',
    availability TEXT DEFAULT 'Available',
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviews INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    bio TEXT,
    is_banned BOOLEAN DEFAULT false,
    is_profile_approved BOOLEAN DEFAULT true
);

-- Swap requests table
CREATE TABLE IF NOT EXISTS public.swap_requests (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    offered_skill TEXT NOT NULL,
    requested_skill TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    rating_from_sender INTEGER CHECK (rating_from_sender >= 1 AND rating_from_sender <= 5),
    rating_from_recipient INTEGER CHECK (rating_from_recipient >= 1 AND rating_from_recipient <= 5),
    feedback_from_sender TEXT,
    feedback_from_recipient TEXT
);

-- Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    message TEXT NOT NULL
);

-- Chat threads table
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    request_id BIGINT REFERENCES public.swap_requests(id) ON DELETE CASCADE NOT NULL,
    participant_user_ids UUID[] NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_user_ids UUID[] DEFAULT '{}'
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    thread_id UUID REFERENCES public.chat_threads(id) ON DELETE CASCADE NOT NULL,
    sender_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_swap_requests
    BEFORE UPDATE ON public.swap_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Public users are viewable by everyone" 
ON public.users FOR SELECT 
USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- Swap requests policies
CREATE POLICY "Users can view requests they're involved in" 
ON public.swap_requests FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create requests" 
ON public.swap_requests FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update requests they're involved in" 
ON public.swap_requests FOR UPDATE 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can delete their own requests" 
ON public.swap_requests FOR DELETE 
USING (auth.uid() = from_user_id);

-- Announcements policies (read-only for regular users)
CREATE POLICY "Announcements are viewable by everyone" 
ON public.announcements FOR SELECT 
USING (true);

-- Chat threads policies
CREATE POLICY "Users can view threads they participate in" 
ON public.chat_threads FOR SELECT 
USING (auth.uid() = ANY(participant_user_ids));

CREATE POLICY "Users can create threads" 
ON public.chat_threads FOR INSERT 
WITH CHECK (auth.uid() = ANY(participant_user_ids));

CREATE POLICY "Users can update threads they participate in" 
ON public.chat_threads FOR UPDATE 
USING (auth.uid() = ANY(participant_user_ids));

-- Chat messages policies
CREATE POLICY "Users can view messages in their threads" 
ON public.chat_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.chat_threads 
        WHERE id = thread_id AND auth.uid() = ANY(participant_user_ids)
    )
);

CREATE POLICY "Users can insert messages in their threads" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
    auth.uid() = sender_user_id AND
    EXISTS (
        SELECT 1 FROM public.chat_threads 
        WHERE id = thread_id AND auth.uid() = ANY(participant_user_ids)
    )
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_skills_offered ON public.users USING GIN(skills_offered);
CREATE INDEX IF NOT EXISTS idx_users_skills_wanted ON public.users USING GIN(skills_wanted);
CREATE INDEX IF NOT EXISTS idx_swap_requests_from_user ON public.swap_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_to_user ON public.swap_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_request ON public.chat_threads(request_id);