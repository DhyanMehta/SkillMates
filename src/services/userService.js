// Complete Supabase User Service
import { supabase } from '../lib/supabase';

// Get current user profile
export const getCurrentUserProfile = async () => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) return null;

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting current user profile:', error.message);
        return null;
    }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('users')
            .update({
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        return { success: false, message: error.message };
    }
};

// Get all users (for admin and user search)
export const getAllUsers = async (filters = {}) => {
    try {
        let query = supabase
            .from('users')
            .select('*')
            .eq('is_public', true)
            .eq('is_banned', false);

        // Apply filters if provided
        if (filters.skills) {
            query = query.contains('skills_offered', [filters.skills]);
        }
        if (filters.availability) {
            query = query.eq('availability', filters.availability);
        }
        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error getting all users:', error.message);
        return { success: false, message: error.message, data: [] };
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error getting user by ID:', error.message);
        return { success: false, message: error.message };
    }
};

// Create user profile after signup
export const createUserProfile = async (userData) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{
                ...userData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating user profile:', error.message);
        return { success: false, message: error.message };
    }
};

// Check if user profile exists
export const checkUserProfileExists = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return { success: true, exists: !!data };
    } catch (error) {
        console.error('Error checking user profile:', error.message);
        return { success: false, message: error.message, exists: false };
    }
};

// Update user skills
export const updateUserSkills = async (skillsOffered, skillsWanted) => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('users')
            .update({
                skills_offered: skillsOffered,
                skills_wanted: skillsWanted,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating user skills:', error.message);
        return { success: false, message: error.message };
    }
};

// Search users by skills
export const searchUsersBySkills = async (skillQuery) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('is_public', true)
            .eq('is_banned', false)
            .or(`skills_offered.cs.{${skillQuery}},skills_wanted.cs.{${skillQuery}}`)
            .order('rating', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error searching users by skills:', error.message);
        return { success: false, message: error.message, data: [] };
    }
};

// Get user statistics
export const getUserStats = async (userId) => {
    try {
        // Get basic user info
        const { data: userInfo, error: userError } = await supabase
            .from('users')
            .select('rating, reviews, created_at')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // Get request statistics
        const { data: sentRequests, error: sentError } = await supabase
            .from('swap_requests')
            .select('status')
            .eq('from_user_id', userId);

        const { data: receivedRequests, error: receivedError } = await supabase
            .from('swap_requests')
            .select('status')
            .eq('to_user_id', userId);

        if (sentError || receivedError) throw sentError || receivedError;

        const stats = {
            ...userInfo,
            totalSentRequests: sentRequests?.length || 0,
            totalReceivedRequests: receivedRequests?.length || 0,
            completedRequests: [
                ...(sentRequests || []),
                ...(receivedRequests || [])
            ].filter(req => req.status === 'completed').length
        };

        return { success: true, data: stats };
    } catch (error) {
        console.error('Error getting user statistics:', error.message);
        return { success: false, message: error.message };
    }
};

// Default export for backward compatibility
export default {
    getCurrentUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    createUserProfile,
    checkUserProfileExists,
    updateUserSkills,
    searchUsersBySkills,
    getUserStats
};