import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type ChatThreadRow = Database['public']['Tables']['chat_threads']['Row'];
type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type ChatThreadInsert = Database['public']['Tables']['chat_threads']['Insert'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

export interface ChatMessage {
    id: string;
    threadId: string;
    senderUserId: string;
    content: string;
    createdAt: string;
}

export interface ChatThread {
    id: string;
    requestId: number;
    participantUserIds: string[];
    messages: ChatMessage[];
    isCompleted: boolean;
    completedUserIds?: string[];
    createdAt: string;
}

// Convert database rows to app format
const dbRowToChatMessage = (row: ChatMessageRow): ChatMessage => ({
    id: row.id,
    threadId: row.thread_id,
    senderUserId: row.sender_user_id,
    content: row.content,
    createdAt: row.created_at,
});

const dbRowToChatThread = (row: ChatThreadRow & { chat_messages?: ChatMessageRow[] }): ChatThread => ({
    id: row.id,
    requestId: row.request_id,
    participantUserIds: row.participant_user_ids,
    messages: row.chat_messages?.map(dbRowToChatMessage) || [],
    isCompleted: row.is_completed,
    completedUserIds: row.completed_user_ids || [],
    createdAt: row.created_at,
});

export const chatService = {
    // Get all chat threads for a user
    getUserChatThreads: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('chat_threads')
                .select(`
          *,
          chat_messages(*)
        `)
                .contains('participant_user_ids', [userId])
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching chat threads:', error);
                return { success: false, message: error.message };
            }

            const threads = data?.map(row => dbRowToChatThread(row)) || [];
            return { success: true, data: threads };
        } catch (error) {
            console.error('Error in getUserChatThreads:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Get a specific chat thread
    getChatThread: async (threadId: string, userId: string) => {
        try {
            const { data, error } = await supabase
                .from('chat_threads')
                .select(`
          *,
          chat_messages(
            *,
            sender:users!chat_messages_sender_user_id_fkey(name, avatar)
          )
        `)
                .eq('id', threadId)
                .contains('participant_user_ids', [userId])
                .single();

            if (error) {
                console.error('Error fetching chat thread:', error);
                return { success: false, message: error.message };
            }

            const thread = dbRowToChatThread(data);
            return { success: true, data: thread };
        } catch (error) {
            console.error('Error in getChatThread:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Create a new chat thread for a swap request
    createChatThread: async (requestId: number, participantUserIds: string[]) => {
        try {
            const insertData: ChatThreadInsert = {
                request_id: requestId,
                participant_user_ids: participantUserIds,
                is_completed: false,
                completed_user_ids: []
            };

            const { data, error } = await supabase
                .from('chat_threads')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('Error creating chat thread:', error);
                return { success: false, message: error.message };
            }

            const thread = dbRowToChatThread(data);
            return { success: true, data: thread };
        } catch (error) {
            console.error('Error in createChatThread:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Get or create chat thread for a request
    getOrCreateChatThread: async (requestId: number, participantUserIds: string[]) => {
        try {
            // First try to find existing thread
            const { data: existingThread, error: searchError } = await supabase
                .from('chat_threads')
                .select('*')
                .eq('request_id', requestId)
                .single();

            if (!searchError && existingThread) {
                return { success: true, data: dbRowToChatThread(existingThread) };
            }

            // Create new thread if none exists
            return await chatService.createChatThread(requestId, participantUserIds);
        } catch (error) {
            console.error('Error in getOrCreateChatThread:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Send a message in a chat thread
    sendMessage: async (threadId: string, senderUserId: string, content: string) => {
        try {
            // Verify user is participant in the thread
            const { data: thread, error: threadError } = await supabase
                .from('chat_threads')
                .select('participant_user_ids')
                .eq('id', threadId)
                .single();

            if (threadError || !thread) {
                return { success: false, message: 'Chat thread not found' };
            }

            if (!thread.participant_user_ids.includes(senderUserId)) {
                return { success: false, message: 'Not authorized to send messages in this thread' };
            }

            const insertData: ChatMessageInsert = {
                thread_id: threadId,
                sender_user_id: senderUserId,
                content: content.trim()
            };

            const { data, error } = await supabase
                .from('chat_messages')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('Error sending message:', error);
                return { success: false, message: error.message };
            }

            const message = dbRowToChatMessage(data);
            return { success: true, data: message };
        } catch (error) {
            console.error('Error in sendMessage:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Get messages for a chat thread with pagination
    getChatMessages: async (threadId: string, userId: string, limit = 50, offset = 0) => {
        try {
            // Verify user is participant in the thread
            const { data: thread, error: threadError } = await supabase
                .from('chat_threads')
                .select('participant_user_ids')
                .eq('id', threadId)
                .single();

            if (threadError || !thread) {
                return { success: false, message: 'Chat thread not found' };
            }

            if (!thread.participant_user_ids.includes(userId)) {
                return { success: false, message: 'Not authorized to view messages in this thread' };
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
          *,
          sender:users!chat_messages_sender_user_id_fkey(name, avatar)
        `)
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Error fetching chat messages:', error);
                return { success: false, message: error.message };
            }

            const messages = data?.map(row => ({
                ...dbRowToChatMessage(row),
                sender: row.sender
            })) || [];

            return { success: true, data: messages };
        } catch (error) {
            console.error('Error in getChatMessages:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Mark chat as completed by a user
    markChatCompleted: async (threadId: string, userId: string) => {
        try {
            const { data: thread, error: fetchError } = await supabase
                .from('chat_threads')
                .select('participant_user_ids, completed_user_ids')
                .eq('id', threadId)
                .single();

            if (fetchError || !thread) {
                return { success: false, message: 'Chat thread not found' };
            }

            if (!thread.participant_user_ids.includes(userId)) {
                return { success: false, message: 'Not authorized' };
            }

            const completedUserIds = thread.completed_user_ids || [];
            if (!completedUserIds.includes(userId)) {
                completedUserIds.push(userId);
            }

            const isCompleted = completedUserIds.length >= thread.participant_user_ids.length;

            const { data, error } = await supabase
                .from('chat_threads')
                .update({
                    completed_user_ids: completedUserIds,
                    is_completed: isCompleted
                })
                .eq('id', threadId)
                .select()
                .single();

            if (error) {
                console.error('Error marking chat completed:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: dbRowToChatThread(data) };
        } catch (error) {
            console.error('Error in markChatCompleted:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Subscribe to new messages in a chat thread
    subscribeToMessages: (threadId: string, callback: (message: ChatMessage) => void) => {
        const subscription = supabase
            .channel(`chat_messages:${threadId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `thread_id=eq.${threadId}`
                },
                (payload) => {
                    const message = dbRowToChatMessage(payload.new as ChatMessageRow);
                    callback(message);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }
};

export default chatService;