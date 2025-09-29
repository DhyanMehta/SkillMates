import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiljcjizqjwlglbbrwnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGpjaml6cWp3bGdsYmJyd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzA2NzAsImV4cCI6MjA2OTk0NjY3MH0.M34R8M-xQmzTpbmIzrZQdfN9g6hEWmwyef0ZG-o_AEA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    console.log('🔐 Testing authentication...');

    try {
        // Test signup
        console.log('\n1. Testing signup...');
        const testEmail = `testuser${Date.now()}@gmail.com`;
        const testPassword = 'testpassword123';

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: 'Test User'
                }
            }
        });

        if (signUpError) {
            console.log('❌ Signup error:', signUpError.message);

            // If user already exists, try to sign in
            if (signUpError.message.includes('already registered')) {
                console.log('👤 User exists, trying to sign in...');

                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword
                });

                if (signInError) {
                    console.log('❌ SignIn error:', signInError.message);
                } else {
                    console.log('✅ SignIn successful!');
                    console.log('User:', signInData.user?.email);
                }
            }
        } else {
            console.log('✅ Signup successful!');
            console.log('User:', signUpData.user?.email);
            console.log('Session:', signUpData.session ? 'Active' : 'No session');
        }

        // Test current session
        console.log('\n2. Testing current session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('❌ Session error:', sessionError.message);
        } else {
            console.log('✅ Session check successful!');
            console.log('Current user:', session?.user?.email || 'Not logged in');
        }

        console.log('\n🎉 Auth test complete!');

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

testAuth();