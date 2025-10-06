import { supabase } from '../lib/supabase';// Fallback service that works without database tables

// This will be used if the main Supabase tables don't exist yet

export interface User {

    id: string;export const fallbackUserService = {

        name: string; getUserProfile: async (userId) => {

            email: string; return {

                location?: string; success: false,

                avatar?: string; message: 'Database tables not set up yet. Please run the database schema first.'

    skillsOffered: string[];
            };

            skillsWanted: string[];
        },

        availability: string;

        rating: number; getAllUsers: async () => {

            reviews: number; return {

                isPublic: boolean; success: true,

                bio?: string; data: [] // Return empty array if no database

    isBanned?: boolean;
            };

            isProfileApproved ?: boolean;
        },

        createdAt: string;

        updatedAt: string; updateUserProfile: async (userId, userData) => {

        }        return {

            success: false,

            // Fallback service when Supabase is unavailable            message: 'Database tables not set up yet. Please run the database schema first.'

            const fallbackUserService = {};

            getUserProfile: async (userId: string) => { },

            try {

                // Try localStorage fallback    searchUsersBySkills: async (skills) => {

                const users = JSON.parse(localStorage.getItem('skillmates_users') || '[]'); return {

                    const user = users.find((u: User) => u.id === userId); success: true,

                    return { success: !!user, data: user || null }; data: []

                } catch(error) { };

                console.error('Fallback service error:', error);
            }

            return { success: false, message: 'Service unavailable' };
        };

    }

    }, export default fallbackUserService;

getAllUsers: async () => {
    try {
        const users = JSON.parse(localStorage.getItem('skillmates_users') || '[]');
        return { success: true, data: users.filter((u: User) => u.isPublic && !u.isBanned) };
    } catch (error) {
        console.error('Fallback service error:', error);
        return { success: false, message: 'Service unavailable' };
    }
},

    updateUserProfile: async (userData: Partial<User> & { id: string }) => {
        try {
            const users = JSON.parse(localStorage.getItem('skillmates_users') || '[]');
            const userIndex = users.findIndex((u: User) => u.id === userData.id);

            if (userIndex >= 0) {
                users[userIndex] = { ...users[userIndex], ...userData, updatedAt: new Date().toISOString() };
                localStorage.setItem('skillmates_users', JSON.stringify(users));
                return { success: true, data: users[userIndex] };
            }

            return { success: false, message: 'User not found' };
        } catch (error) {
            console.error('Fallback service error:', error);
            return { success: false, message: 'Service unavailable' };
        }
    }
};

export default fallbackUserService;