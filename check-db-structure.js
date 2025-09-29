// Check existing database structure
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiljcjizqjwlglbbrwnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGpjaml6cWp3bGdsYmJyd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2MTg4ODksImV4cCI6MjA0MzE5NDg4OX0.YH2Fvs0JTK2sLFdZUpyOe1jh8wNYuXQKAXCn7QeVwzc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
    console.log('🔍 Checking existing database structure...\n');

    try {
        // Check what tables exist by trying to access them
        const tables = ['users', 'swap_requests', 'chat_threads', 'chat_messages', 'announcements'];

        for (const table of tables) {
            try {
                // Try to get table structure info
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(0); // Get structure only

                if (error) {
                    if (error.message.includes('does not exist')) {
                        console.log(`❌ Table '${table}': Does not exist`);
                    } else {
                        console.log(`✅ Table '${table}': Exists (${error.message})`);
                    }
                } else {
                    console.log(`✅ Table '${table}': Exists and accessible`);
                }
            } catch (err) {
                console.log(`❌ Table '${table}': Error - ${err.message}`);
            }
        }

        // Try to check if specific columns exist by attempting a query
        console.log('\n🔍 Checking specific table structures...');

        // Check chat_threads structure
        try {
            const { error } = await supabase
                .from('chat_threads')
                .select('user1_id, user2_id')
                .limit(0);

            if (error) {
                console.log(`❌ chat_threads columns: ${error.message}`);
            } else {
                console.log(`✅ chat_threads: user1_id and user2_id columns exist`);
            }
        } catch (err) {
            console.log(`❌ chat_threads structure check failed: ${err.message}`);
        }

    } catch (error) {
        console.error('❌ Database structure check failed:', error.message);
    }
}

checkDatabaseStructure();