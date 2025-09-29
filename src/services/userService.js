// Complete Supabase User Service
// Replaces all localStorage user management with Supabase database operations

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

        // Apply filters
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        if (filters.skillsOffered && filters.skillsOffered.length > 0) {
            query = query.overlaps('skills_offered', filters.skillsOffered);
        }

        if (filters.skillsWanted && filters.skillsWanted.length > 0) {
            query = query.overlaps('skills_wanted', filters.skillsWanted);
        }

        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }

        // Sorting
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error getting all users:', error.message);
        return [];
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .eq('is_public', true)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error getting user by ID:', error.message);
        return { success: false, message: error.message };
    }
};

// Search users by skills
export const searchUsersBySkills = async (skillsOffered = [], skillsWanted = [], location = '') => {
    try {
        let query = supabase
            .from('users')
            .select('*')
            .eq('is_public', true)
            .eq('is_banned', false);

        if (skillsOffered.length > 0) {
            query = query.overlaps('skills_offered', skillsOffered);
        }

        if (skillsWanted.length > 0) {
            query = query.overlaps('skills_wanted', skillsWanted);
        }

        if (location.trim()) {
            query = query.ilike('location', `%${location.trim()}%`);
        }

        const { data, error } = await query.order('rating', { ascending: false });
        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error searching users by skills:', error.message);
        return [];
    }
};

// Update user rating (called after completed swaps)
export const updateUserRating = async (userId, newRating) => {
    try {
        // Get current user stats
        const { data: user, error: getUserError } = await supabase
            .from('users')
            .select('rating, total_reviews')
            .eq('id', userId)
            .single();

        if (getUserError) throw getUserError;

        // Calculate new average rating
        const currentRating = user.rating || 0;
        const currentReviews = user.total_reviews || 0;
        const totalRating = (currentRating * currentReviews) + newRating;
        const newTotalReviews = currentReviews + 1;
        const newAverageRating = totalRating / newTotalReviews;

        // Update user
        const { data, error } = await supabase
            .from('users')
            .update({
                rating: Math.round(newAverageRating * 100) / 100, // Round to 2 decimal places
                total_reviews: newTotalReviews,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating user rating:', error.message);
        throw error;
    }
};

// Admin functions
export const banUser = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                is_banned: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error banning user:', error.message);
        throw error;
    }
};

export const unbanUser = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                is_banned: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error unbanning user:', error.message);
        throw error;
    }
};

// Check if current user is admin (you can add admin role logic here)
export const isCurrentUserAdmin = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        // Add your admin logic here (check email, role, etc.)
        // For now, checking if email contains 'admin' or specific admin emails
        const adminEmails = ['admin@skillmates.com', 'test@admin.com'];
        return user && (adminEmails.includes(user.email) || user.email.includes('admin'));
    } catch (error) {
        console.error('Error checking admin status:', error.message);
        return false;
    }
};

// Keep the original userService object structure for compatibility
export const userService = {
    getUserProfile: async (userId) => {
        if (userId) {
            return await getUserById(userId);
        } else {
            // Get current user profile
            const profile = await getCurrentUserProfile();
            return profile ? { success: true, data: profile } : { success: false, message: 'User not found' };
        }
    },

    updateUserProfile: async (userData) => {
        return await updateUserProfile(userData);
    },

    getUserSkills: async (userId) => {
        try {
            const result = await getUserById(userId);
            if (!result.success) return result;

            return {
                success: true,
                data: {
                    skillsOffered: result.data.skills_offered || [],
                    skillsWanted: result.data.skills_wanted || []
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    addUserSkill: async ({ userId, list, skill }) => {
        try {
            const result = await getUserById(userId);
            if (!result.success) return result;

            const user = result.data;
            const isOffered = String(list) === 'offered';
            const skillsOffered = [...(user.skills_offered || [])];
            const skillsWanted = [...(user.skills_wanted || [])];

            const targetArray = isOffered ? skillsOffered : skillsWanted;
            if (!targetArray.includes(skill)) {
                targetArray.push(skill);
            }

            const updateData = {
                skills_offered: skillsOffered,
                skills_wanted: skillsWanted
            };

            return await updateUserProfile(updateData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateUserSkill: async ({ userId, list, oldSkill, newSkill }) => {
        try {
            const result = await getUserById(userId);
            if (!result.success) return result;

            const user = result.data;
            const isOffered = String(list) === 'offered';
            const skillsArray = isOffered ? [...(user.skills_offered || [])] : [...(user.skills_wanted || [])];

            const skillIndex = skillsArray.findIndex(s => s === oldSkill);
            if (skillIndex === -1) return { success: false, message: 'Skill not found' };

            skillsArray[skillIndex] = newSkill;

            const updateData = isOffered
                ? { skills_offered: skillsArray }
                : { skills_wanted: skillsArray };

            return await updateUserProfile(updateData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteUserSkill: async ({ userId, list, skill }) => {
        try {
            const result = await getUserById(userId);
            if (!result.success) return result;

            const user = result.data;
            const isOffered = String(list) === 'offered';
            const skillsArray = (isOffered ? user.skills_offered : user.skills_wanted) || [];
            const filteredSkills = skillsArray.filter(s => s !== skill);

            const updateData = isOffered
                ? { skills_offered: filteredSkills }
                : { skills_wanted: filteredSkills };

            return await updateUserProfile(updateData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

export default userService;