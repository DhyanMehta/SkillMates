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

        .single();            .select('*')

            .eq('id', user.id)

if (error) throw error;            .single();

return data;

    } catch (error) {
    if (error) throw error;

    console.error('Error getting current user profile:', error.message); return data;

    return null;
} catch (error) {

} console.error('Error getting current user profile:', error.message);

}; return null;

    }

// Update user profile};

export const updateUserProfile = async (profileData) => {

    try {// Update user profile

        const { data: { user }, error: authError } = await supabase.auth.getUser(); export const updateUserProfile = async (profileData) => {

            if (authError) throw authError; try {

                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (!user) throw new Error('No authenticated user'); if (authError) throw authError;



                const { data, error } = await supabase        if (!user) throw new Error('No authenticated user');

            .from('users')

    .update({
        const { data, error } = await supabase

                ...profileData,            .from('users')

                updated_at: new Date().toISOString().update({

        })                ...profileData,

            .eq('id', user.id)                updated_at: new Date().toISOString()

            .select()
    })

    .single();            .eq('id', user.id)

        .select()

if (error) throw error;            .single();

return { success: true, data };

    } catch (error) {
    if (error) throw error;

    console.error('Error updating user profile:', error.message); return { success: true, data };

    return { success: false, message: error.message };
} catch (error) {

} console.error('Error updating user profile:', error.message);

}; return { success: false, message: error.message };

    }

// Get all users (for admin and user search)};

export const getAllUsers = async (filters = {}) => {

    try {// Get all users (for admin and user search)

        let query = supabaseexport const getAllUsers = async (filters = {}) => {

            .from('users')    try {

            .select('*')        let query = supabase

        .eq('is_public', true).from('users')

        .eq('is_banned', false);            .select('*')

            .eq('is_public', true)

    // Apply filters            .eq('is_banned', false);

    if (filters.search) {

        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);        // Apply filters

    } if (filters.search) {

        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);

        if (filters.skillsOffered && filters.skillsOffered.length > 0) { }

        query = query.overlaps('skills_offered', filters.skillsOffered);

    } if (filters.skillsOffered && filters.skillsOffered.length > 0) {

        query = query.overlaps('skills_offered', filters.skillsOffered);

        if (filters.skillsWanted && filters.skillsWanted.length > 0) { }

        query = query.overlaps('skills_wanted', filters.skillsWanted);

    } if (filters.skillsWanted && filters.skillsWanted.length > 0) {

        query = query.overlaps('skills_wanted', filters.skillsWanted);

        if (filters.location) { }

        query = query.ilike('location', `%${filters.location}%`);

    } if (filters.location) {

        query = query.ilike('location', `%${filters.location}%`);

        // Sorting        }

        const sortBy = filters.sortBy || 'created_at';

        const sortOrder = filters.sortOrder || 'desc';        // Sorting

        query = query.order(sortBy, { ascending: sortOrder === 'asc' }); const sortBy = filters.sortBy || 'created_at';

        const sortOrder = filters.sortOrder || 'desc';

        const { data, error } = await query; query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        if (error) throw error;

        const { data, error } = await query;

        return data || []; if (error) throw error;

    } catch (error) {

        console.error('Error getting all users:', error.message); return data || [];

        return [];
    } catch (error) {

    } console.error('Error getting all users:', error.message);

}; return [];

    }

// Get user by ID};

export const getUserById = async (userId) => {

    try {// Get user by ID

        const { data, error } = await supabaseexport const getUserById = async (userId) => {

            .from('users')    try {

            .select('*')        const { data, error } = await supabase

        .eq('id', userId).from('users')

        .eq('is_public', true).select('*')

        .single();            .eq('id', userId)

            .eq('is_public', true)

    if (error) throw error;            .single();

    return { success: true, data };

} catch (error) {
    if (error) throw error;

    console.error('Error getting user by ID:', error.message); return { success: true, data };

    return { success: false, message: error.message };
} catch (error) {

} console.error('Error getting user by ID:', error.message);

}; return { success: false, message: error.message };

    }

// Update user rating (called after completed swaps)};

export const updateUserRating = async (userId, newRating) => {

    try {// Search users by skills

        // Get current user statsexport const searchUsersBySkills = async (skillsOffered = [], skillsWanted = [], location = '') => {

        const { data: user, error: getUserError } = await supabase    try {

            .from('users')        let query = supabase

    .select('rating, total_reviews').from('users')

    .eq('id', userId).select('*')

    .single();            .eq('is_public', true)

        .eq('is_banned', false);

if (getUserError) throw getUserError;

if (skillsOffered.length > 0) {

    // Calculate new average rating            query = query.overlaps('skills_offered', skillsOffered);

    const currentRating = user.rating || 0;
}

const currentReviews = user.total_reviews || 0;

const totalRating = (currentRating * currentReviews) + newRating; if (skillsWanted.length > 0) {

    const newTotalReviews = currentReviews + 1; query = query.overlaps('skills_wanted', skillsWanted);

    const newAverageRating = totalRating / newTotalReviews;
}



// Update user        if (location.trim()) {

const { data, error } = await supabase            query = query.ilike('location', `%${location.trim()}%`);

            .from('users')        }

            .update({

    rating: Math.round(newAverageRating * 100) / 100, // Round to 2 decimal places        const { data, error } = await query.order('rating', { ascending: false });

    total_reviews: newTotalReviews, if(error) throw error;

    updated_at: new Date().toISOString()

})        return data || [];

            .eq('id', userId)    } catch (error) {

            .select()        console.error('Error searching users by skills:', error.message);

            .single(); return [];

}

if (error) throw error;};

return data;

    } catch (error) {// Update user rating (called after completed swaps)

    console.error('Error updating user rating:', error.message); export const updateUserRating = async (userId, newRating) => {

        throw error; try {

        }        // Get current user stats

}; const { data: user, error: getUserError } = await supabase

        .from('users')

    export default {            .select('rating, total_reviews')

    getCurrentUserProfile,            .eq('id', userId)

    updateUserProfile,            .single();

        getAllUsers,

        getUserById, if(getUserError) throw getUserError;

        updateUserRating

    };        // Calculate new average rating
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