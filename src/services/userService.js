import { loadUsers, saveUsers } from './localDb';

const getUserIndex = (users, userId) => users.findIndex(u => Number(u.id) === Number(userId));

export const userService = {
    getUserProfile: async (userId) => {
        const users = loadUsers();
        const user = users.find(u => Number(u.id) === Number(userId));
        return user ? { success: true, data: user } : { success: false, message: 'User not found' };
    },
    updateUserProfile: async (userData) => {
        const users = loadUsers();
        const idx = getUserIndex(users, userData.id);
        if (idx === -1) return { success: false, message: 'User not found' };
        const updated = { ...users[idx], ...userData };
        const next = [...users];
        next[idx] = updated;
        saveUsers(next);
        return { success: true, data: updated };
    },
    getUserSkills: async (userId) => {
        const users = loadUsers();
        const user = users.find(u => Number(u.id) === Number(userId));
        if (!user) return { success: false, message: 'User not found' };
        return {
            success: true,
            data: {
                skillsOffered: user.skillsOffered || [],
                skillsWanted: user.skillsWanted || []
            }
        };
    },
    addUserSkill: async ({ userId, list, skill }) => {
        // list: 'offered' | 'wanted'
        const users = loadUsers();
        const idx = getUserIndex(users, userId);
        if (idx === -1) return { success: false, message: 'User not found' };
        const isOffered = String(list) === 'offered';
        const current = users[idx];
        const offered = [...(current.skillsOffered || [])];
        const wanted = [...(current.skillsWanted || [])];
        const target = isOffered ? offered : wanted;
        if (!target.includes(skill)) target.push(skill);
        const updated = { ...current, skillsOffered: offered, skillsWanted: wanted };
        const next = [...users];
        next[idx] = updated;
        saveUsers(next);
        return { success: true, data: updated };
    },
    updateUserSkill: async ({ userId, list, oldSkill, newSkill }) => {
        const users = loadUsers();
        const idx = getUserIndex(users, userId);
        if (idx === -1) return { success: false, message: 'User not found' };
        const isOffered = String(list) === 'offered';
        const current = users[idx];
        const arr = isOffered ? [...(current.skillsOffered || [])] : [...(current.skillsWanted || [])];
        const sIdx = arr.findIndex(s => s === oldSkill);
        if (sIdx === -1) return { success: false, message: 'Skill not found' };
        arr[sIdx] = newSkill;
        const updated = isOffered ? { ...current, skillsOffered: arr } : { ...current, skillsWanted: arr };
        const next = [...users];
        next[idx] = updated;
        saveUsers(next);
        return { success: true, data: updated };
    },
    deleteUserSkill: async ({ userId, list, skill }) => {
        const users = loadUsers();
        const idx = getUserIndex(users, userId);
        if (idx === -1) return { success: false, message: 'User not found' };
        const isOffered = String(list) === 'offered';
        const current = users[idx];
        const arr = (isOffered ? current.skillsOffered : current.skillsWanted) || [];
        const filtered = arr.filter(s => s !== skill);
        const updated = isOffered ? { ...current, skillsOffered: filtered } : { ...current, skillsWanted: filtered };
        const next = [...users];
        next[idx] = updated;
        saveUsers(next);
        return { success: true, data: updated };
    }
};

export default userService;