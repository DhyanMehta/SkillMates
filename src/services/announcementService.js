// Legacy announcement service// Supabase Announcements Service

import { supabase } from '../lib/supabase';// Handles all announcement-related operations



export const getAnnouncements = async () => {
    import { supabase } from '../lib/supabase';

    try {

        const { data, error } = await supabase// Get all active announcements

            .from('announcements')export const getActiveAnnouncements = async () => {

            .select('*')    try {

            .eq('is_active', true)        const { data, error } = await supabase

        .order('created_at', { ascending: false });            .from('announcements')

            .select(`

        if (error) throw error;        *,

        return { success: true, data: data || [] };        created_by_user:users(id, name, email)

    } catch (error) {      `)

    console.error('Error getting announcements:', error.message);            .eq('is_active', true)

    return { success: false, message: error.message };            .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

}            .order('created_at', { ascending: false });

};

if (error) throw error;

export const createAnnouncement = async (announcementData) => {
    return data || [];

    try { } catch (error) {

        const { data, error } = await supabase        console.error('Error getting active announcements:', error.message);

            .from('announcements')        return [];

            .insert([announcementData])    }

            .select()};

            .single();

// Get all announcements (admin only)

if (error) throw error; export const getAllAnnouncements = async () => {

    return { success: true, data }; try {

    } catch (error) {
        const { data, error } = await supabase

        console.error('Error creating announcement:', error.message);            .from('announcements')

        return { success: false, message: error.message };            .select(`

    }        *,

};        created_by_user:users(id, name, email)

      `)

        export default {            .order('created_at', { ascending: false });

            getAnnouncements,

            createAnnouncement        if(error) throw error;

        }; return data || [];
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