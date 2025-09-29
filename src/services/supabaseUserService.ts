import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface AppUser {
    id: string;
    name: string;
    email: string;
    location?: string;
    avatar?: string;
    skillsOffered: string[];
    skillsWanted: string[];
    availability: string;
    rating: number;
    reviews: number;
    isPublic: boolean;
    bio?: string;
    isBanned?: boolean;
    isProfileApproved?: boolean;
    createdAt: string;
    updatedAt: string;
}

// Convert database row to AppUser format
const dbRowToAppUser = (row: UserRow): AppUser => ({
    id: row.id,
    name: row.name,
    email: row.email,
    location: row.location || undefined,
    avatar: row.avatar || undefined,
    skillsOffered: row.skills_offered || [],
    skillsWanted: row.skills_wanted || [],
    availability: row.availability,
    rating: Number(row.rating),
    reviews: row.reviews,
    isPublic: row.is_public,
    bio: row.bio || undefined,
    isBanned: row.is_banned,
    isProfileApproved: row.is_profile_approved,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

// Convert AppUser to database update format
const appUserToDbUpdate = (user: Partial<AppUser>): UserUpdate => ({
    ...(user.name && { name: user.name }),
    ...(user.email && { email: user.email }),
    ...(user.location !== undefined && { location: user.location }),
    ...(user.avatar !== undefined && { avatar: user.avatar }),
    ...(user.skillsOffered && { skills_offered: user.skillsOffered }),
    ...(user.skillsWanted && { skills_wanted: user.skillsWanted }),
    ...(user.availability && { availability: user.availability }),
    ...(user.rating !== undefined && { rating: user.rating }),
    ...(user.reviews !== undefined && { reviews: user.reviews }),
    ...(user.isPublic !== undefined && { is_public: user.isPublic }),
    ...(user.bio !== undefined && { bio: user.bio }),
    ...(user.isBanned !== undefined && { is_banned: user.isBanned }),
    ...(user.isProfileApproved !== undefined && { is_profile_approved: user.isProfileApproved }),
});

export const userService = {
    getUserProfile: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                return { success: false, message: error.message };
            }

            if (!data) {
                return { success: false, message: 'User not found' };
            }

            return { success: true, data: dbRowToAppUser(data) };
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    getAllUsers: async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('is_public', true)
                .eq('is_banned', false)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching users:', error);
                return { success: false, message: error.message };
            }

            const users = data?.map(dbRowToAppUser) || [];
            return { success: true, data: users };
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    updateUserProfile: async (userData: Partial<AppUser> & { id: string }) => {
        try {
            const updateData = appUserToDbUpdate(userData);

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userData.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating user profile:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: dbRowToAppUser(data) };
        } catch (error) {
            console.error('Error in updateUserProfile:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    getUserSkills: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('skills_offered, skills_wanted')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user skills:', error);
                return { success: false, message: error.message };
            }

            if (!data) {
                return { success: false, message: 'User not found' };
            }

            return {
                success: true,
                data: {
                    skillsOffered: data.skills_offered || [],
                    skillsWanted: data.skills_wanted || []
                }
            };
        } catch (error) {
            console.error('Error in getUserSkills:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    addUserSkill: async ({ userId, list, skill }: { userId: string; list: 'offered' | 'wanted'; skill: string }) => {
        try {
            // First get current skills
            const { data: currentUser, error: fetchError } = await supabase
                .from('users')
                .select('skills_offered, skills_wanted')
                .eq('id', userId)
                .single();

            if (fetchError) {
                console.error('Error fetching current skills:', fetchError);
                return { success: false, message: fetchError.message };
            }

            if (!currentUser) {
                return { success: false, message: 'User not found' };
            }

            const isOffered = list === 'offered';
            const currentOffered = currentUser.skills_offered || [];
            const currentWanted = currentUser.skills_wanted || [];

            const newOffered = isOffered ? [...currentOffered, skill] : currentOffered;
            const newWanted = !isOffered ? [...currentWanted, skill] : currentWanted;

            // Remove duplicates
            const uniqueOffered = [...new Set(newOffered)];
            const uniqueWanted = [...new Set(newWanted)];

            const { data, error } = await supabase
                .from('users')
                .update({
                    skills_offered: uniqueOffered,
                    skills_wanted: uniqueWanted
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error adding user skill:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: dbRowToAppUser(data) };
        } catch (error) {
            console.error('Error in addUserSkill:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    updateUserSkill: async ({ userId, list, oldSkill, newSkill }: {
        userId: string;
        list: 'offered' | 'wanted';
        oldSkill: string;
        newSkill: string
    }) => {
        try {
            const { data: currentUser, error: fetchError } = await supabase
                .from('users')
                .select('skills_offered, skills_wanted')
                .eq('id', userId)
                .single();

            if (fetchError) {
                return { success: false, message: fetchError.message };
            }

            if (!currentUser) {
                return { success: false, message: 'User not found' };
            }

            const isOffered = list === 'offered';
            const currentSkills = isOffered ? (currentUser.skills_offered || []) : (currentUser.skills_wanted || []);
            const updatedSkills = currentSkills.map(skill => skill === oldSkill ? newSkill : skill);

            const updateData = isOffered
                ? { skills_offered: updatedSkills }
                : { skills_wanted: updatedSkills };

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, data: dbRowToAppUser(data) };
        } catch (error) {
            console.error('Error in updateUserSkill:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    deleteUserSkill: async ({ userId, list, skill }: { userId: string; list: 'offered' | 'wanted'; skill: string }) => {
        try {
            const { data: currentUser, error: fetchError } = await supabase
                .from('users')
                .select('skills_offered, skills_wanted')
                .eq('id', userId)
                .single();

            if (fetchError) {
                return { success: false, message: fetchError.message };
            }

            if (!currentUser) {
                return { success: false, message: 'User not found' };
            }

            const isOffered = list === 'offered';
            const currentSkills = isOffered ? (currentUser.skills_offered || []) : (currentUser.skills_wanted || []);
            const filteredSkills = currentSkills.filter(s => s !== skill);

            const updateData = isOffered
                ? { skills_offered: filteredSkills }
                : { skills_wanted: filteredSkills };

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, data: dbRowToAppUser(data) };
        } catch (error) {
            console.error('Error in deleteUserSkill:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    searchUsersBySkills: async (skills: string[]) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(skills.map(skill => `skills_offered.cs.{${skill}}`).join(','))
                .eq('is_public', true)
                .eq('is_banned', false);

            if (error) {
                console.error('Error searching users by skills:', error);
                return { success: false, message: error.message };
            }

            const users = data?.map(dbRowToAppUser) || [];
            return { success: true, data: users };
        } catch (error) {
            console.error('Error in searchUsersBySkills:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    }
};

export default userService;