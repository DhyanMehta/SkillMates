import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, requestService, chatService, announcementService } from '../services';
import type { AppUser, SwapRequest, ChatMessage, Announcement } from '../services';

// Query keys
export const queryKeys = {
    users: ['users'] as const,
    user: (id: string) => ['users', id] as const,
    userSkills: (id: string) => ['users', id, 'skills'] as const,
    requests: ['requests'] as const,
    sentRequests: (userId: string) => ['requests', 'sent', userId] as const,
    receivedRequests: (userId: string) => ['requests', 'received', userId] as const,
    chatThreads: (userId: string) => ['chat', 'threads', userId] as const,
    chatMessages: (threadId: string) => ['chat', 'messages', threadId] as const,
    announcements: ['announcements'] as const,
};

// User hooks
export const useUsers = () => {
    return useQuery({
        queryKey: queryKeys.users,
        queryFn: () => userService.getAllUsers(),
    });
};

export const useUser = (userId: string) => {
    return useQuery({
        queryKey: queryKeys.user(userId),
        queryFn: () => userService.getUserProfile(userId),
        enabled: !!userId,
    });
};

export const useUserSkills = (userId: string) => {
    return useQuery({
        queryKey: queryKeys.userSkills(userId),
        queryFn: () => userService.getUserSkills(userId),
        enabled: !!userId,
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: Partial<AppUser> & { id: string }) =>
            userService.updateUserProfile(userData),
        onSuccess: (data, variables) => {
            // Invalidate and refetch user queries
            queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

export const useAddUserSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, list, skill }: {
            userId: string;
            list: 'offered' | 'wanted';
            skill: string
        }) => userService.addUserSkill({ userId, list, skill }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.userSkills(variables.userId) });
        },
    });
};

export const useUpdateUserSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, list, oldSkill, newSkill }: {
            userId: string;
            list: 'offered' | 'wanted';
            oldSkill: string;
            newSkill: string;
        }) => userService.updateUserSkill({ userId, list, oldSkill, newSkill }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.userSkills(variables.userId) });
        },
    });
};

export const useDeleteUserSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, list, skill }: {
            userId: string;
            list: 'offered' | 'wanted';
            skill: string
        }) => userService.deleteUserSkill({ userId, list, skill }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.userSkills(variables.userId) });
        },
    });
};

// Request hooks
export const useSentRequests = (userId: string) => {
    return useQuery({
        queryKey: queryKeys.sentRequests(userId),
        queryFn: () => requestService.getSentRequests(userId),
        enabled: !!userId,
    });
};

export const useReceivedRequests = (userId: string) => {
    return useQuery({
        queryKey: queryKeys.receivedRequests(userId),
        queryFn: () => requestService.getReceivedRequests(userId),
        enabled: !!userId,
    });
};

export const useCreateRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestData: {
            fromUserId: string;
            toUserId: string;
            offeredSkill: string;
            requestedSkill: string;
            message?: string;
        }) => requestService.createRequest(requestData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sentRequests(variables.fromUserId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.receivedRequests(variables.toUserId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.requests });
        },
    });
};

export const useUpdateRequestStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requestId, status, userId }: {
            requestId: number;
            status: string;
            userId?: string
        }) => requestService.updateRequestStatus(requestId, status as any, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requests });
        },
    });
};

export const useDeleteRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requestId, userId }: { requestId: number; userId: string }) =>
            requestService.deleteRequest(requestId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requests });
        },
    });
};

// Chat hooks
export const useChatThreads = (userId: string) => {
    return useQuery({
        queryKey: queryKeys.chatThreads(userId),
        queryFn: () => chatService.getUserChatThreads(userId),
        enabled: !!userId,
    });
};

export const useChatMessages = (threadId: string, userId: string) => {
    return useQuery({
        queryKey: queryKeys.chatMessages(threadId),
        queryFn: () => chatService.getChatMessages(threadId, userId),
        enabled: !!threadId && !!userId,
        refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ threadId, senderUserId, content }: {
            threadId: string;
            senderUserId: string;
            content: string;
        }) => chatService.sendMessage(threadId, senderUserId, content),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chatMessages(variables.threadId) });
        },
    });
};

// Announcement hooks
export const useAnnouncements = () => {
    return useQuery({
        queryKey: queryKeys.announcements,
        queryFn: () => announcementService.getAnnouncements(),
    });
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (message: string) => announcementService.createAnnouncement(message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
        },
    });
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (announcementId: string) => announcementService.deleteAnnouncement(announcementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
        },
    });
};