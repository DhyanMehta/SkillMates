import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type SwapRequestRow = Database['public']['Tables']['swap_requests']['Row'];
type SwapRequestInsert = Database['public']['Tables']['swap_requests']['Insert'];
type SwapRequestUpdate = Database['public']['Tables']['swap_requests']['Update'];

export type SwapStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface SwapRequest {
    id: number;
    fromUserId: string;
    toUserId: string;
    offeredSkill: string;
    requestedSkill: string;
    message?: string;
    status: SwapStatus;
    createdAt: string;
    updatedAt: string;
    ratingFromSender?: number;
    ratingFromRecipient?: number;
    feedbackFromSender?: string;
    feedbackFromRecipient?: string;
}

// Convert database row to SwapRequest format
const dbRowToSwapRequest = (row: SwapRequestRow): SwapRequest => ({
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    offeredSkill: row.offered_skill,
    requestedSkill: row.requested_skill,
    message: row.message || undefined,
    status: row.status as SwapStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ratingFromSender: row.rating_from_sender || undefined,
    ratingFromRecipient: row.rating_from_recipient || undefined,
    feedbackFromSender: row.feedback_from_sender || undefined,
    feedbackFromRecipient: row.feedback_from_recipient || undefined,
});

// Convert SwapRequest to database insert format
const swapRequestToDbInsert = (request: Omit<SwapRequest, 'id' | 'createdAt' | 'updatedAt'>): SwapRequestInsert => ({
    from_user_id: request.fromUserId,
    to_user_id: request.toUserId,
    offered_skill: request.offeredSkill,
    requested_skill: request.requestedSkill,
    message: request.message,
    status: request.status,
    rating_from_sender: request.ratingFromSender,
    rating_from_recipient: request.ratingFromRecipient,
    feedback_from_sender: request.feedbackFromSender,
    feedback_from_recipient: request.feedbackFromRecipient,
});

export const requestService = {
    getRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('swap_requests')
                .select(`
          *,
          from_user:users!swap_requests_from_user_id_fkey(name, avatar),
          to_user:users!swap_requests_to_user_id_fkey(name, avatar)
        `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching requests:', error);
                return { success: false, message: error.message };
            }

            const requests = data?.map(row => ({
                ...dbRowToSwapRequest(row),
                fromUser: row.from_user,
                toUser: row.to_user
            })) || [];

            return { success: true, data: requests };
        } catch (error) {
            console.error('Error in getRequests:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    getSentRequests: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('swap_requests')
                .select(`
          *,
          to_user:users!swap_requests_to_user_id_fkey(name, avatar)
        `)
                .eq('from_user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching sent requests:', error);
                return { success: false, message: error.message };
            }

            const requests = data?.map(row => ({
                ...dbRowToSwapRequest(row),
                toUser: row.to_user
            })) || [];

            return { success: true, data: requests };
        } catch (error) {
            console.error('Error in getSentRequests:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    getReceivedRequests: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('swap_requests')
                .select(`
          *,
          from_user:users!swap_requests_from_user_id_fkey(name, avatar)
        `)
                .eq('to_user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching received requests:', error);
                return { success: false, message: error.message };
            }

            const requests = data?.map(row => ({
                ...dbRowToSwapRequest(row),
                fromUser: row.from_user
            })) || [];

            return { success: true, data: requests };
        } catch (error) {
            console.error('Error in getReceivedRequests:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    createRequest: async (requestData: {
        fromUserId: string;
        toUserId: string;
        offeredSkill: string;
        requestedSkill: string;
        message?: string;
    }) => {
        try {
            const insertData: SwapRequestInsert = {
                from_user_id: requestData.fromUserId,
                to_user_id: requestData.toUserId,
                offered_skill: requestData.offeredSkill,
                requested_skill: requestData.requestedSkill,
                message: requestData.message,
                status: 'pending'
            };

            const { data, error } = await supabase
                .from('swap_requests')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('Error creating request:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: dbRowToSwapRequest(data) };
        } catch (error) {
            console.error('Error in createRequest:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    updateRequestStatus: async (requestId: number, status: SwapStatus, userId?: string) => {
        try {
            const updateData: SwapRequestUpdate = { status };

            // Build query with optional user check for security
            let query = supabase
                .from('swap_requests')
                .update(updateData)
                .eq('id', requestId);

            // If userId provided, ensure user is involved in the request
            if (userId) {
                query = query.or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
            }

            const { data, error } = await query
                .select()
                .single();

            if (error) {
                console.error('Error updating request status:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: dbRowToSwapRequest(data) };
        } catch (error) {
            console.error('Error in updateRequestStatus:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    addRating: async (requestId: number, rating: number, feedback: string, fromSender: boolean, userId: string) => {
        try {
            const updateData: SwapRequestUpdate = fromSender ? {
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
                .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
                .select()
                .single();

            if (error) {
                console.error('Error adding rating:', error);
                return { success: false, message: error.message };
            }

            // Update user's overall rating
            await updateUserRating(fromSender ? data.to_user_id : data.from_user_id);

            return { success: true, data: dbRowToSwapRequest(data) };
        } catch (error) {
            console.error('Error in addRating:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    deleteRequest: async (requestId: number, userId: string) => {
        try {
            const { error } = await supabase
                .from('swap_requests')
                .delete()
                .eq('id', requestId)
                .eq('from_user_id', userId); // Only allow deleting own requests

            if (error) {
                console.error('Error deleting request:', error);
                return { success: false, message: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error in deleteRequest:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    },

    getRequestById: async (requestId: number) => {
        try {
            const { data, error } = await supabase
                .from('swap_requests')
                .select(`
          *,
          from_user:users!swap_requests_from_user_id_fkey(name, avatar),
          to_user:users!swap_requests_to_user_id_fkey(name, avatar)
        `)
                .eq('id', requestId)
                .single();

            if (error) {
                console.error('Error fetching request by ID:', error);
                return { success: false, message: error.message };
            }

            const request = {
                ...dbRowToSwapRequest(data),
                fromUser: data.from_user,
                toUser: data.to_user
            };

            return { success: true, data: request };
        } catch (error) {
            console.error('Error in getRequestById:', error);
            return { success: false, message: 'An unexpected error occurred' };
        }
    }
};

// Helper function to update user's overall rating
async function updateUserRating(userId: string) {
    try {
        // Get all ratings for this user
        const { data: sentRatings } = await supabase
            .from('swap_requests')
            .select('rating_from_recipient')
            .eq('from_user_id', userId)
            .not('rating_from_recipient', 'is', null);

        const { data: receivedRatings } = await supabase
            .from('swap_requests')
            .select('rating_from_sender')
            .eq('to_user_id', userId)
            .not('rating_from_sender', 'is', null);

        const allRatings = [
            ...(sentRatings?.map(r => r.rating_from_recipient) || []),
            ...(receivedRatings?.map(r => r.rating_from_sender) || [])
        ].filter(rating => rating !== null) as number[];

        if (allRatings.length > 0) {
            const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;

            // Update user's rating and review count
            await supabase
                .from('users')
                .update({
                    rating: Number(averageRating.toFixed(2)),
                    reviews: allRatings.length
                })
                .eq('id', userId);
        }
    } catch (error) {
        console.error('Error updating user rating:', error);
    }
}

export default requestService;