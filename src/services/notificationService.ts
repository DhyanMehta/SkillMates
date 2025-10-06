import { supabase } from '../lib/supabase';

// Temporary interface until database types are updated
interface NotificationRow {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message?: string;
    data?: any;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'new_request' | 'request_accepted' | 'new_message' | 'request_completed' | 'request_completion_pending';
    title: string;
    message?: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UnreadCounts {
    unreadMessages: number;
    unreadNotifications: number;
}

// Convert database row to Notification format
const dbRowToNotification = (row: NotificationRow): Notification => ({
    id: row.id,
    userId: row.user_id,
    type: row.type as Notification['type'],
    title: row.title,
    message: row.message || undefined,
    data: row.data,
    isRead: row.is_read,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const notificationService = {
    // Get all notifications for a user
    getNotifications: async (userId: string, limit = 50) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching notifications:', error);
                return { success: false, message: error.message };
            }

            const notifications = data?.map(dbRowToNotification) || [];
            return { success: true, data: notifications };
        } catch (error) {
            console.error('Error in getNotifications:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true, updated_at: new Date().toISOString() })
                .eq('id', notificationId);

            if (error) {
                console.error('Error marking notification as read:', error);
                return { success: false, message: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error in markAsRead:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Mark all notifications as read for a user
    markAllAsRead: async (userId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true, updated_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                console.error('Error marking all notifications as read:', error);
                return { success: false, message: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error in markAllAsRead:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Get unread counts for a user
    getUnreadCounts: async (userId: string): Promise<{ success: boolean; data?: UnreadCounts; message?: string }> => {
        try {
            const { data, error } = await supabase
                .rpc('get_user_unread_counts', { user_id_param: userId });

            if (error) {
                console.error('Error fetching unread counts:', error);
                return { success: false, message: error.message };
            }

            const result = data?.[0] || { unread_messages: 0, unread_notifications: 0 };
            return {
                success: true,
                data: {
                    unreadMessages: parseInt(result.unread_messages) || 0,
                    unreadNotifications: parseInt(result.unread_notifications) || 0
                }
            };
        } catch (error) {
            console.error('Error in getUnreadCounts:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Create a notification (usually called by the backend)
    createNotification: async (
        userId: string,
        type: Notification['type'],
        title: string,
        message?: string,
        data?: any
    ) => {
        try {
            const { data: result, error } = await supabase
                .rpc('create_notification', {
                    user_id_param: userId,
                    type_param: type,
                    title_param: title,
                    message_param: message,
                    data_param: data
                });

            if (error) {
                console.error('Error creating notification:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: result };
        } catch (error) {
            console.error('Error in createNotification:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Subscribe to real-time notifications
    subscribeToNotifications: (userId: string, callback: (notification: Notification) => void) => {
        const subscription = supabase
            .channel(`notifications_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const notification = dbRowToNotification(payload.new as NotificationRow);
                    callback(notification);
                }
            )
            .subscribe();

        return subscription;
    },

    // Mark chat messages as read
    markChatMessagesAsRead: async (threadId: string, userId: string) => {
        try {
            const { error } = await supabase
                .rpc('mark_messages_read', {
                    thread_id_param: threadId,
                    user_id_param: userId
                });

            if (error) {
                console.error('Error marking messages as read:', error);
                return { success: false, message: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error in markChatMessagesAsRead:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    }
};