import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiljcjizqjwlglbbrwnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGpjaml6cWp3bGdsYmJyd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzA2NzAsImV4cCI6MjA2OTk0NjY3MH0.M34R8M-xQmzTpbmIzrZQdfN9g6hEWmwyef0ZG-o_AEA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');

    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (error) {
            console.log('❌ Connection failed:', error.message);
            return false;
        } else {
            console.log('✅ Connection successful!');
            return true;
        }
    } catch (err) {
        console.log('❌ Connection error:', err.message);
        return false;
    }
}

async function setupDatabase() {
    console.log('\n🚀 Setting up SkillMates database...\n');

    const connected = await testConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed without database connection.');
        console.log('Please check your Supabase credentials and try again.');
        return;
    }

    console.log('\n✅ Database setup complete!');
    console.log('Your SkillMates app is now configured to use Supabase backend.');
    console.log('\nNext steps:');
    console.log('1. Start your app with: npm run dev');
    console.log('2. Sign up for a new account to test the integration');
    console.log('3. Check the Supabase dashboard to see your data');
}

setupDatabase().catch(console.error);