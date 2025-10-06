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
            console.log('=== CREATE CHAT THREAD DEBUG ===');
            console.log('createChatThread called with:', { requestId, participantUserIds });

            // Check authentication first
            const { data: authUser, error: authError } = await supabase.auth.getUser();
            console.log('Current authenticated user:', { authUser: authUser?.user?.id, authError });

            if (authError || !authUser?.user) {
                console.error('Authentication issue:', authError);
                return { success: false, message: 'Authentication required for chat functionality' };
            }

            // Check if request exists first
            console.log('Checking if request exists...');
            const { data: requestCheck, error: requestError } = await supabase
                .from('swap_requests')
                .select('id, status, from_user_id, to_user_id')
                .eq('id', requestId)
                .single();

            console.log('Request existence check:', { requestCheck, requestError });

            if (requestError || !requestCheck) {
                console.error('Request not found:', { requestId, requestError });
                return {
                    success: false,
                    message: `Request with ID ${requestId} not found in database`,
                    details: requestError?.message
                };
            }

            if (requestCheck.status !== 'accepted') {
                console.error('Request not accepted:', { requestId, status: requestCheck.status });
                return {
                    success: false,
                    message: `Request ${requestId} has status '${requestCheck.status}', but 'accepted' is required for chat`
                };
            }

            // Test basic supabase connection
            console.log('Testing supabase connection...');
            const { count: testCount, error: testError } = await supabase
                .from('chat_threads')
                .select('*', { count: 'exact', head: true });
            console.log('Connection test result:', { testCount, testError });

            if (testError) {
                console.error('Database connection issue:', testError);
                return { success: false, message: `Database connection error: ${testError.message}` };
            }

            const insertData: ChatThreadInsert = {
                request_id: requestId,
                participant_user_ids: participantUserIds,
                is_completed: false,
                completed_user_ids: []
            };

            console.log('Insert data for chat thread:', insertData);
            console.log('Insert data types:', {
                request_id_type: typeof requestId,
                participant_user_ids_type: typeof participantUserIds,
                participant_user_ids_array: Array.isArray(participantUserIds),
                participant_user_ids_length: participantUserIds?.length
            });

            console.log('Attempting supabase insert...');
            const { data, error } = await supabase
                .from('chat_threads')
                .insert(insertData)
                .select()
                .single();

            console.log('Supabase insert result:', { data, error });

            if (error) {
                console.error('=== CHAT THREAD CREATE ERROR ===');
                console.error('Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return { success: false, message: `Database error: ${error.message}` };
            }

            const thread = dbRowToChatThread(data);
            console.log('Created thread successfully:', thread);
            console.log('=== CREATE CHAT THREAD SUCCESS ===');
            return { success: true, data: thread };
        } catch (error) {
            console.error('=== UNEXPECTED ERROR IN CREATE CHAT THREAD ===');
            console.error('Caught exception:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            return { success: false, message: `Unexpected error: ${error.message}` };
        }
    },

    // Get or create chat thread for a request
    getOrCreateChatThread: async (requestId: number, participantUserIds?: string[]) => {
        try {
            console.log('getOrCreateChatThread called with:', { requestId, participantUserIds });

            // If participant IDs are not provided, fetch them from the request
            let actualParticipantIds = participantUserIds;
            if (!actualParticipantIds || actualParticipantIds.length === 0) {
                console.log('Fetching participant IDs from request...');
                const { data: request, error: requestError } = await supabase
                    .from('swap_requests')
                    .select('from_user_id, to_user_id')
                    .eq('id', requestId)
                    .single();

                if (requestError || !request) {
                    console.error('Failed to fetch request for participant IDs:', requestError);
                    return { success: false, message: 'Could not find request to determine participants' };
                }

                actualParticipantIds = [request.from_user_id, request.to_user_id];
                console.log('Fetched participant IDs from request:', actualParticipantIds);
            }

            // Use upsert to ensure only one thread per request
            // First, try to find existing thread with more comprehensive search
            const { data: existingThreads, error: searchError } = await supabase
                .from('chat_threads')
                .select('*')
                .eq('request_id', requestId)
                .order('created_at', { ascending: true }); // Get oldest first

            console.log('Search for existing threads result:', { existingThreads, searchError });

            if (!searchError && existingThreads && existingThreads.length > 0) {
                // If multiple threads exist (shouldn't happen but let's handle it), return the first one
                if (existingThreads.length > 1) {
                    console.warn(`Multiple threads found for request ${requestId}, returning the first one`);
                }
                console.log('Found existing thread, returning it');
                return { success: true, data: dbRowToChatThread(existingThreads[0]) };
            }

            // Try to create a new thread with conflict resolution
            console.log('No existing thread found, creating new one');
            const { data: newThread, error: insertError } = await supabase
                .from('chat_threads')
                .insert({
                    request_id: requestId,
                    participant_user_ids: actualParticipantIds,
                    is_completed: false,
                    completed_user_ids: []
                })
                .select()
                .single();

            if (insertError) {
                // If insert failed due to conflict, try to get existing thread again
                if (insertError.code === '23505') { // Unique violation
                    console.log('Thread creation conflict, fetching existing thread');
                    const { data: existingThread, error: retryError } = await supabase
                        .from('chat_threads')
                        .select('*')
                        .eq('request_id', requestId)
                        .single();

                    if (!retryError && existingThread) {
                        return { success: true, data: dbRowToChatThread(existingThread) };
                    }
                }
                console.error('Error creating thread:', insertError);
                return { success: false, message: insertError.message };
            }

            console.log('Successfully created new thread:', newThread);
            return { success: true, data: dbRowToChatThread(newThread) };
        } catch (error) {
            console.error('Error in getOrCreateChatThread:', error);
            return { success: false, message: `Chat error: ${error.message}` };
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
                .select('*')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Error fetching chat messages:', error);
                return { success: false, message: error.message };
            }

            const messages = data?.map(row => dbRowToChatMessage(row)) || [];

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

    // Get user details for chat display (names, avatars)
    getChatParticipantDetails: async (userIds: string[]) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, avatar')
                .in('id', userIds);

            if (error) {
                console.error('Error fetching user details:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Error in getChatParticipantDetails:', error);
            return { success: false, message: 'Failed to load user details' };
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