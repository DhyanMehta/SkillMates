import { loadRequests, saveRequests } from './localDb';

export const requestService = {
    getRequests: async () => {
        const requests = loadRequests();
        return { success: true, data: requests };
    },
    getSentRequests: async (userId) => {
        const requests = loadRequests();
        const filtered = requests.filter(r => Number(r.fromUserId) === Number(userId));
        return { success: true, data: filtered };
    },
    getReceivedRequests: async (userId) => {
        const requests = loadRequests();
        const filtered = requests.filter(r => Number(r.toUserId) === Number(userId));
        return { success: true, data: filtered };
    },
    createRequest: async (requestData) => {
        const requests = loadRequests();
        const nextId = (requests.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
        const newReq = {
            id: nextId,
            fromUserId: requestData.fromUserId,
            toUserId: requestData.toUserId,
            offeredSkill: requestData.offeredSkill,
            requestedSkill: requestData.requestedSkill,
            message: requestData.message,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        const next = [newReq, ...requests];
        saveRequests(next);
        return { success: true, data: newReq };
    },
    updateRequestStatus: async (requestId, status) => {
        const requests = loadRequests();
        const idx = requests.findIndex(r => Number(r.id) === Number(requestId));
        if (idx === -1) return { success: false, message: 'Request not found' };
        const updated = { ...requests[idx], status };
        const next = [...requests];
        next[idx] = updated;
        saveRequests(next);
        return { success: true, data: updated };
    },
    deleteRequest: async (requestId) => {
        const requests = loadRequests();
        const next = requests.filter(r => Number(r.id) !== Number(requestId));
        saveRequests(next);
        return { success: true };
    }
};

export default requestService;