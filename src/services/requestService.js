// Complete Supabase Request Service
// Replaces all localStorage request management with Supabase database operations

import { supabase } from '../lib/supabase';

// Get all requests with user details
export const getAllRequests = async () => {
    try {
        const { data, error } = await supabase
            .from('swap_requests')
            .select(`
        *,
        from_user:users!swap_requests_from_user_id_fkey(id, name, email, avatar, rating),
        to_user:users!swap_requests_to_user_id_fkey(id, name, email, avatar, rating)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error getting all requests:', error.message);
        return { success: false, message: error.message };
    }
};

// Get sent requests for a user
export const getSentRequests = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('swap_requests')
            .select(`
        *,
        from_user:users!swap_requests_from_user_id_fkey(id, name, email, avatar, rating),
        to_user:users!swap_requests_to_user_id_fkey(id, name, email, avatar, rating)
      `)
            .eq('from_user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(request => ({
            ...request,
            fromUserId: request.from_user_id,
            toUserId: request.to_user_id,
            offeredSkill: request.offered_skill,
            requestedSkill: request.requested_skill,
            createdAt: request.created_at,
            fromUser: request.from_user,
            toUser: request.to_user
        })) || [];

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error getting sent requests:', error.message);
        return { success: false, message: error.message };
    }
};

// Get received requests for a user
export const getReceivedRequests = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('swap_requests')
            .select(`
        *,
        from_user:users!swap_requests_from_user_id_fkey(id, name, email, avatar, rating),
        to_user:users!swap_requests_to_user_id_fkey(id, name, email, avatar, rating)
      `)
            .eq('to_user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(request => ({
            ...request,
            fromUserId: request.from_user_id,
            toUserId: request.to_user_id,
            offeredSkill: request.offered_skill,
            requestedSkill: request.requested_skill,
            createdAt: request.created_at,
            fromUser: request.from_user,
            toUser: request.to_user
        })) || [];

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error getting received requests:', error.message);
        return { success: false, message: error.message };
    }
};

// Create a new swap request
export const createRequest = async (requestData) => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('swap_requests')
            .insert({
                from_user_id: user.id,
                to_user_id: requestData.toUserId,
                offered_skill: requestData.offeredSkill,
                requested_skill: requestData.requestedSkill,
                message: requestData.message || '',
                priority: requestData.priority || 'medium',
                estimated_hours: requestData.estimatedHours || 1,
                deadline: requestData.deadline || null,
                status: 'pending'
            })
            .select(`
        *,
        from_user:users!swap_requests_from_user_id_fkey(id, name, email, avatar, rating),
        to_user:users!swap_requests_to_user_id_fkey(id, name, email, avatar, rating)
      `)
            .single();

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = {
            ...data,
            fromUserId: data.from_user_id,
            toUserId: data.to_user_id,
            offeredSkill: data.offered_skill,
            requestedSkill: data.requested_skill,
            createdAt: data.created_at,
            fromUser: data.from_user,
            toUser: data.to_user
        };

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error creating request:', error.message);
        return { success: false, message: error.message };
    }
};

// Update request status
export const updateRequestStatus = async (requestId, status, additionalData = {}) => {
    try {
        const updateData = {
            status,
            updated_at: new Date().toISOString(),
            ...additionalData
        };

        const { data, error } = await supabase
            .from('swap_requests')
            .update(updateData)
            .eq('id', requestId)
            .select(`
        *,
        from_user:users!swap_requests_from_user_id_fkey(id, name, email, avatar, rating),
        to_user:users!swap_requests_to_user_id_fkey(id, name, email, avatar, rating)
      `)
            .single();

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = {
            ...data,
            fromUserId: data.from_user_id,
            toUserId: data.to_user_id,
            offeredSkill: data.offered_skill,
            requestedSkill: data.requested_skill,
            createdAt: data.created_at,
            fromUser: data.from_user,
            toUser: data.to_user
        };

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error updating request status:', error.message);
        return { success: false, message: error.message };
    }
};

// Delete a request
export const deleteRequest = async (requestId) => {
    try {
        const { error } = await supabase
            .from('swap_requests')
            .delete()
            .eq('id', requestId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting request:', error.message);
        return { success: false, message: error.message };
    }
};

// Add rating and feedback to completed request
export const addRequestFeedback = async (requestId, rating, feedback, isFromSender = true) => {
    try {
        const updateData = isFromSender ? {
            rating_from_sender: rating,
            feedback_from_sender: feedback
        } : {
            rating_from_recipient: rating,
            feedback_from_recipient: feedback
        };

        const { data, error } = await supabase
            .from('swap_requests')
            .update(updateData)
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error adding request feedback:', error.message);
        return { success: false, message: error.message };
    }
};

// Get requests by status
export const getRequestsByStatus = async (userId, status) => {
    try {
        const { data, error } = await supabase
            .from('swap_requests')
            .select(`
        *,
        from_user:users!swap_requests_from_user_id_fkey(id, name, email, avatar, rating),
        to_user:users!swap_requests_to_user_id_fkey(id, name, email, avatar, rating)
      `)
            .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(request => ({
            ...request,
            fromUserId: request.from_user_id,
            toUserId: request.to_user_id,
            offeredSkill: request.offered_skill,
            requestedSkill: request.requested_skill,
            createdAt: request.created_at,
            fromUser: request.from_user,
            toUser: request.to_user
        })) || [];

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error getting requests by status:', error.message);
        return { success: false, message: error.message };
    }
};

// Keep the original requestService object structure for compatibility
export const requestService = {
    getRequests: getAllRequests,
    getSentRequests,
    getReceivedRequests,
    createRequest,
    updateRequestStatus,
    deleteRequest,
    addRequestFeedback,
    getRequestsByStatus
};

export default requestService;