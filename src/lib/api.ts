// Supabase-backed API services
import supabaseUserService from "../services/supabaseUserService";
import supabaseRequestService from "../services/supabaseRequestService";

const userService = supabaseUserService;
const requestService = supabaseRequestService;

export const authApi = {
    register: async (userData: any) => {
        try {
            const email = String(userData?.email || "").toLowerCase();
            const newUser = {
                id: crypto.randomUUID(),
                name: userData?.name || (email ? email.split("@")[0] : "user"),
                email,
            };
            localStorage.setItem('local_user', JSON.stringify(newUser));
            return { success: true, data: newUser };
        } catch (e) {
            return { success: false, message: 'Registration failed' };
        }
    },
    login: async (credentials: any) => {
        const email = String(credentials?.email || "").toLowerCase();
        const raw = localStorage.getItem('local_user');
        const existing = raw ? JSON.parse(raw) : null;
        if (existing && String(existing.email || '').toLowerCase() === email) {
            return { success: true, data: existing };
        }
        return { success: false, message: 'User not found' };
    },
    getCurrentUser: async () => {
        const raw = localStorage.getItem('local_user');
        return raw ? { success: true, data: JSON.parse(raw) } : { success: false, message: 'No user' };
    }
};

export const skillsApi = {
    getAllSkills: async () => {
        // Aggregate distinct skills from all users
        const usersRes = await (async () => {
            // load directly via userService's internal storage
            const list = (window as any)?.localStorage ? require("../services/localDb") : null;
            try {
                const { loadUsers } = await import("../services/localDb");
                const users = loadUsers();
                const set = new Set<string>();
                users.forEach(u => {
                    (u.skillsOffered || []).forEach(s => set.add(s));
                    (u.skillsWanted || []).forEach(s => set.add(s));
                });
                return { success: true, data: Array.from(set) } as any;
            } catch {
                return { success: true, data: [] } as any;
            }
        })();
        return usersRes;
    },
    getUserSkills: async (userId: any) => userService.getUserSkills(userId),
    addSkill: async (payload: any) => userService.addUserSkill(payload),
    updateSkill: async (payload: any) => userService.updateUserSkill(payload),
    deleteSkill: async (payload: any) => userService.deleteUserSkill(payload)
};

export const requestsApi = {
    getAllRequests: async () => requestService.getRequests(),
    createRequest: async (requestData: any) => requestService.createRequest(requestData),
    updateRequestStatus: async (requestId: any, status: any) => requestService.updateRequestStatus(requestId, status),
    deleteRequest: async (requestId: any) => requestService.deleteRequest(requestId)
};