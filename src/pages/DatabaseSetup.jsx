import React from 'react'; import { useState } from 'react';

import { Copy, Database, CheckCircle, ArrowLeft } from 'lucide-react';

const DatabaseSetup = () => {
    import { Button } from '@/components/ui/button';

    return (import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

    <div className="min-h-screen bg-gray-50 py-12 px-4">import {useToast} from '@/hooks/use-toast';

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">import {useNavigate} from 'react-router-dom';

            <h2 className="text-2xl font-bold text-center mb-6">Database Setup</h2>

            <p className="text-center text-gray-600">Database configuration and setup tools</p>const DatabaseSetup = () => {

      </div>    const navigate = useNavigate();

    </div>    const { toast } = useToast();

  ); const [copiedStep, setCopiedStep] = useState(null);

};

const copyToClipboard = async (text, stepNumber) => {

    export default DatabaseSetup; try {
        await navigator.clipboard.writeText(text);
        setCopiedStep(stepNumber);
        toast({
            title: "Copied!",
            description: "SQL code copied to clipboard",
        });
        setTimeout(() => setCopiedStep(null), 2000);
    } catch (err) {
        toast({
            title: "Copy failed",
            description: "Please copy the code manually",
            variant: "destructive",
        });
    }
};

const step1SQL = `-- Step-by-Step SkillMates Database Schema
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

-- Functions and triggers
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_skills_offered ON public.users USING GIN(skills_offered);
CREATE INDEX IF NOT EXISTS idx_users_skills_wanted ON public.users USING GIN(skills_wanted);
CREATE INDEX IF NOT EXISTS idx_swap_requests_from_user ON public.swap_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_to_user ON public.swap_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Insert sample data
INSERT INTO public.announcements (title, content, type, is_active)
SELECT 'Welcome to SkillMates!',
       'Start exchanging skills with fellow learners. Create your first skill swap request and connect with the community!',
       'info',
       true
WHERE NOT EXISTS (
  SELECT 1 FROM public.announcements
  WHERE title = 'Welcome to SkillMates!'
);`;

const step2SQL = `-- Row Level Security Policies for SkillMates
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
CREATE POLICY "Everyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);`;

return (
    <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to App
                </Button>

                <div className="flex items-center space-x-3 mb-6">
                    <Database className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Database Setup</h1>
                        <p className="text-muted-foreground">Set up your SkillMates database in 2 easy steps</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                            <span>Create Database Tables</span>
                        </CardTitle>
                        <CardDescription>
                            Run this SQL in your Supabase Dashboard → SQL Editor to create all required tables.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg relative">
                                <pre className="text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                    <code>{step1SQL}</code>
                                </pre>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute top-2 right-2"
                                    onClick={() => copyToClipboard(step1SQL, 1)}
                                >
                                    {copiedStep === 1 ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                            <span>Set Up Security Policies</span>
                        </CardTitle>
                        <CardDescription>
                            Run this SQL after Step 1 completes successfully to enable Row Level Security.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg relative">
                                <pre className="text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                    <code>{step2SQL}</code>
                                </pre>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute top-2 right-2"
                                    onClick={() => copyToClipboard(step2SQL, 2)}
                                >
                                    {copiedStep === 2 ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Quick Setup Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-700">
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Go to your <strong>Supabase Dashboard</strong></li>
                            <li>Navigate to <strong>SQL Editor</strong> in the sidebar</li>
                            <li>Copy and paste the <strong>Step 1 SQL</strong> above</li>
                            <li>Click <strong>"Run"</strong> and wait for success</li>
                            <li>Copy and paste the <strong>Step 2 SQL</strong> above</li>
                            <li>Click <strong>"Run"</strong> again</li>
                            <li>Return to the app and refresh the page</li>
                        </ol>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Button
                        onClick={() => navigate('/')}
                        className="gradient-primary"
                    >
                        Return to SkillMates
                    </Button>
                </div>
            </div>
        </div>
    </div>
);
};

export default DatabaseSetup;