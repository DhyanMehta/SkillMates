import { supabase } from '../lib/supabase';

// Debug utility for testing chat functionality
export const ChatDebugUtils = {
    // Test basic connection
    async testConnection() {
        console.log('🔍 Testing Supabase connection...');
        try {
            const { data, error } = await supabase.from('chat_messages').select('id').limit(1);
            console.log('✅ Connection successful', { data, error });
            return { success: true, data, error };
        } catch (err) {
            console.error('❌ Connection failed', err);
            return { success: false, error: err };
        }
    },

    // Test realtime subscription
    async testRealtimeSubscription() {
        console.log('🔍 Testing realtime subscription...');

        const channel = supabase
            .channel('test-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages'
            }, (payload) => {
                console.log('🎉 Realtime event received:', payload);
            })
            .subscribe((status) => {
                console.log('📡 Subscription status:', status);
            });

        // Keep subscription for 10 seconds
        setTimeout(() => {
            console.log('🔌 Unsubscribing from test channel');
            supabase.removeChannel(channel);
        }, 10000);

        return channel;
    },

    // Insert test message
    async insertTestMessage(threadId, message) {
        console.log('🔍 Inserting test message...', { threadId, message });

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    thread_id: threadId,
                    sender_id: userData.user.id,
                    message: message,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            console.log('✅ Test message inserted:', { data, error });
            return { success: true, data, error };
        } catch (err) {
            console.error('❌ Test message failed:', err);
            return { success: false, error: err };
        }
    },

    // Check chat threads
    async checkChatThreads() {
        console.log('🔍 Checking chat threads...');

        try {
            const { data, error } = await supabase
                .from('chat_threads')
                .select(`
          id,
          participant_1_id,
          participant_2_id,
          created_at,
          last_message_at
        `)
                .order('created_at', { ascending: false });

            console.log('📋 Chat threads:', { data, error });
            return { success: true, data, error };
        } catch (err) {
            console.error('❌ Failed to check threads:', err);
            return { success: false, error: err };
        }
    },

    // Check recent messages
    async checkRecentMessages(threadId) {
        console.log('🔍 Checking recent messages for thread:', threadId);

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
          id,
          thread_id,
          sender_id,
          message,
          created_at
        `)
                .eq('thread_id', threadId)
                .order('created_at', { ascending: false })
                .limit(10);

            console.log('💬 Recent messages:', { data, error });
            return { success: true, data, error };
        } catch (err) {
            console.error('❌ Failed to check messages:', err);
            return { success: false, error: err };
        }
    },

    // Full diagnostic
    async runFullDiagnostic(threadId = null) {
        console.log('🚀 Starting full chat diagnostic...');

        const results = {
            connection: await this.testConnection(),
            threads: await this.checkChatThreads(),
            realtime: null,
            messages: null
        };

        // Test realtime
        results.realtime = await this.testRealtimeSubscription();

        // Check messages if thread provided
        if (threadId) {
            results.messages = await this.checkRecentMessages(threadId);
        }

        console.log('📊 Diagnostic results:', results);
        return results;
    }
};

// Global access for debugging
if (typeof window !== 'undefined') {
    window.ChatDebugUtils = ChatDebugUtils;
}