// Test Database Schema - Verify all tables and functions exist
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiljcjizqjwlglbbrwnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGpjaml6cWp3bGdsYmJyd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2MTg4ODksImV4cCI6MjA0MzE5NDg4OX0.YH2Fvs0JTK2sLFdZUpyOe1jh8wNYuXQKAXCn7QeVwzc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchema() {
    console.log('🧪 Testing SkillMates Database Schema...\n');

    try {
        // Test 1: Check if all tables exist
        console.log('📋 Checking database tables...');

        const tables = ['users', 'swap_requests', 'chat_threads', 'chat_messages', 'announcements'];

        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);

                if (error) {
                    console.log(`❌ Table '${table}': ${error.message}`);
                } else {
                    console.log(`✅ Table '${table}': Accessible`);
                }
            } catch (err) {
                console.log(`❌ Table '${table}': ${err.message}`);
            }
        }

        // Test 2: Test user profile creation flow
        console.log('\n👤 Testing user profile access...');

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.log('ℹ️  No authenticated user - some tests will be skipped');
        } else {
            console.log(`✅ Authenticated user: ${user.email}`);

            // Try to get user profile
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.log(`❌ User profile: ${profileError.message}`);
            } else {
                console.log(`✅ User profile: Found for ${profile.name}`);
            }
        }

        // Test 3: Check RLS policies
        console.log('\n🔒 Testing Row Level Security...');

        const { data: publicUsers, error: publicError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('is_public', true)
            .limit(3);

        if (publicError) {
            console.log(`❌ RLS Public Users: ${publicError.message}`);
        } else {
            console.log(`✅ RLS Public Users: Can access ${publicUsers.length} public profiles`);
        }

        // Test 4: Check announcements
        console.log('\n📢 Testing announcements...');

        const { data: announcements, error: announcementError } = await supabase
            .from('announcements')
            .select('*')
            .eq('is_active', true);

        if (announcementError) {
            console.log(`❌ Announcements: ${announcementError.message}`);
        } else {
            console.log(`✅ Announcements: Found ${announcements.length} active announcements`);
        }

        // Test 5: Check functions exist
        console.log('\n⚙️  Testing database functions...');

        const { data: functions, error: functionError } = await supabase
            .rpc('handle_new_user')
            .then(() => ({ data: 'exists', error: null }))
            .catch(err => ({ data: null, error: err }));

        if (functionError) {
            // This is expected to error since we're not providing proper parameters
            // But if the function exists, it will error with parameter issues, not "function doesn't exist"
            if (functionError.message.includes('function') && functionError.message.includes('does not exist')) {
                console.log('❌ Function handle_new_user: Does not exist');
            } else {
                console.log('✅ Function handle_new_user: Exists');
            }
        } else {
            console.log('✅ Function handle_new_user: Exists');
        }

        console.log('\n🎉 Database schema test completed!');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

// Run the test
testDatabaseSchema();