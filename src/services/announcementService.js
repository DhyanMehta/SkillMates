// Supabase Announcements Service
// Handles all announcement-related operations

import { supabase } from '../lib/supabase';

// Get all active announcements
export const getActiveAnnouncements = async () => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select(`
        *,
        created_by_user:users(id, name, email)
      `)
            .eq('is_active', true)
            .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting active announcements:', error.message);
        return [];
    }
};

// Get all announcements (admin only)
export const getAllAnnouncements = async () => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select(`
        *,
        created_by_user:users(id, name, email)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting all announcements:', error.message);
        return [];
    }
};

// Create new announcement (admin only)
export const createAnnouncement = async (announcementData) => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('announcements')
            .insert({
                title: announcementData.title,
                content: announcementData.content,
                type: announcementData.type || 'info',
                is_active: announcementData.isActive !== false,
                created_by: user.id,
                expires_at: announcementData.expiresAt || null
            })
            .select(`
        *,
        created_by_user:users(id, name, email)
      `)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating announcement:', error.message);
        throw error;
    }
};

// Update announcement (admin only)
export const updateAnnouncement = async (announcementId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', announcementId)
            .select(`
        *,
        created_by_user:users(id, name, email)
      `)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating announcement:', error.message);
        throw error;
    }
};

// Deactivate announcement (admin only)
export const deactivateAnnouncement = async (announcementId) => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', announcementId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deactivating announcement:', error.message);
        throw error;
    }
};

// Delete announcement (admin only)
export const deleteAnnouncement = async (announcementId) => {
    try {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', announcementId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting announcement:', error.message);
        throw error;
    }
};

export default {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deactivateAnnouncement,
    deleteAnnouncement
};