import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];

export interface Announcement {
    id: string;
    message: string;
    createdAt: string;
}

// Convert database row to app format
const dbRowToAnnouncement = (row: AnnouncementRow): Announcement => ({
    id: row.id,
    message: row.message,
    createdAt: row.created_at,
});

export const announcementService = {
    // Get all announcements
    getAnnouncements: async () => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching announcements:', error);
                return { success: false, message: error.message };
            }

            const announcements = data?.map(dbRowToAnnouncement) || [];
            return { success: true, data: announcements };
        } catch (error) {
            console.error('Error in getAnnouncements:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Create a new announcement (admin only)
    createAnnouncement: async (message: string) => {
        try {
            const insertData: AnnouncementInsert = {
                message: message.trim()
            };

            const { data, error } = await supabase
                .from('announcements')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('Error creating announcement:', error);
                return { success: false, message: error.message };
            }

            const announcement = dbRowToAnnouncement(data);
            return { success: true, data: announcement };
        } catch (error) {
            console.error('Error in createAnnouncement:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Delete an announcement (admin only)
    deleteAnnouncement: async (announcementId: string) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', announcementId);

            if (error) {
                console.error('Error deleting announcement:', error);
                return { success: false, message: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error in deleteAnnouncement:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    // Subscribe to new announcements
    subscribeToAnnouncements: (callback: (announcement: Announcement) => void) => {
        const subscription = supabase
            .channel('announcements')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'announcements'
                },
                (payload) => {
                    const announcement = dbRowToAnnouncement(payload.new as AnnouncementRow);
                    callback(announcement);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }
};

export default announcementService;