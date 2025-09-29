import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiljcjizqjwlglbbrwnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGpjaml6cWp3bGdsYmJyd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzA2NzAsImV4cCI6MjA2OTk0NjY3MH0.M34R8M-xQmzTpbmIzrZQdfN9g6hEWmwyef0ZG-o_AEA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Checking database tables...');

    try {
        // Check what tables exist
        const { data: tables, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (error) {
            console.log('❌ Error checking tables:', error.message);
        } else {
            console.log('📋 Existing tables:', tables?.map(t => t.table_name) || []);
        }

        // Try to check users table specifically
        console.log('\n🔍 Testing users table...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (usersError) {
            console.log('❌ Users table error:', usersError.message);
            return false;
        } else {
            console.log('✅ Users table exists and accessible');
        }

        // Try to check swap_requests table
        console.log('\n🔍 Testing swap_requests table...');
        const { data: requests, error: requestsError } = await supabase
            .from('swap_requests')
            .select('count')
            .limit(1);

        if (requestsError) {
            console.log('❌ Swap_requests table error:', requestsError.message);
            return false;
        } else {
            console.log('✅ Swap_requests table exists and accessible');
        }

        console.log('\n🎉 Database tables are ready for skill swap functions!');
        return true;

    } catch (error) {
        console.log('❌ Database check failed:', error.message);
        return false;
    }
}

checkDatabase();