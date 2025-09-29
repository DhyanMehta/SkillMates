import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiljcjizqjwlglbbrwnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGpjaml6cWp3bGdsYmJyd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzA2NzAsImV4cCI6MjA2OTk0NjY3MH0.M34R8M-xQmzTpbmIzrZQdfN9g6hEWmwyef0ZG-o_AEA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...');

    try {
        // Test 1: Basic connection
        console.log('\n1. Testing basic connection...');
        const { data, error } = await supabase.from('users').select('count');

        if (error) {
            console.log('❌ Connection error:', error.message);

            // If it's a table doesn't exist error, let's create the basic tables
            if (error.message.includes('relation "users" does not exist')) {
                console.log('\n📝 Users table does not exist. Creating basic schema...');

                // Create users table
                const { error: createError } = await supabase.rpc('sql', {
                    query: `
            CREATE TABLE IF NOT EXISTS public.users (
              id UUID REFERENCES auth.users(id) PRIMARY KEY,
              name TEXT NOT NULL,
              email TEXT NOT NULL UNIQUE,
              skills TEXT[] DEFAULT '{}',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
            CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
            CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
            
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            BEGIN
              INSERT INTO public.users (id, name, email)
              VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email);
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            CREATE OR REPLACE TRIGGER on_auth_user_created
              AFTER INSERT ON auth.users
              FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
          `
                });

                if (createError) {
                    console.log('❌ Could not create tables:', createError.message);
                } else {
                    console.log('✅ Basic tables created successfully!');
                }
            }
        } else {
            console.log('✅ Basic connection successful!');
        }

        // Test 2: Auth connection
        console.log('\n2. Testing auth connection...');
        const { data: session, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('❌ Auth error:', sessionError.message);
        } else {
            console.log('✅ Auth connection successful!');
            console.log('Current session:', session.session ? 'Logged in' : 'Not logged in');
        }

        console.log('\n🎉 Connection test complete!');
        console.log('You can now use the app with Supabase backend.');

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

testSupabaseConnection();