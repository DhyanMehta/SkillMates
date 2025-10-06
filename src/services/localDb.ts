// Local database service that provides types and utilities for the app

export interface AppUser {
    id: number;
    name: string;
    email: string;
    location: string;
    avatar: string;
    skillsOffered: string[];
    skillsWanted: string[];
    availability: string;
    rating: number;
    reviews: number;
    isPublic: boolean;
    bio: string;
}

export interface SwapRequest {
    id: number;
    fromUserId: number;
    toUserId: number;
    skillWanted: string;
    skillOffered: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface Announcement {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    createdAt: string;
}

export interface ChatThread {
    id: number;
    requestId: number;
    participants: number[];
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

// Local storage keys
const STORAGE_KEYS = {
    users: 'skillmates_users',
    requests: 'skillmates_requests',
    announcements: 'skillmates_announcements',
    chats: 'skillmates_chats'
};

// Utility functions for localStorage management
export const loadUsers = (): AppUser[] => {
    try {
        const users = localStorage.getItem(STORAGE_KEYS.users);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error loading users from localStorage:', error);
        return [];
    }
};

export const saveUsers = (users: AppUser[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    } catch (error) {
        console.error('Error saving users to localStorage:', error);
    }
};

export const loadRequests = (): SwapRequest[] => {
    try {
        const requests = localStorage.getItem(STORAGE_KEYS.requests);
        return requests ? JSON.parse(requests) : [];
    } catch (error) {
        console.error('Error loading requests from localStorage:', error);
        return [];
    }
};

export const saveRequests = (requests: SwapRequest[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests));
    } catch (error) {
        console.error('Error saving requests to localStorage:', error);
    }
};

export const loadAnnouncements = (): Announcement[] => {
    try {
        const announcements = localStorage.getItem(STORAGE_KEYS.announcements);
        return announcements ? JSON.parse(announcements) : [];
    } catch (error) {
        console.error('Error loading announcements from localStorage:', error);
        return [];
    }
};

export const saveAnnouncements = (announcements: Announcement[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(announcements));
    } catch (error) {
        console.error('Error saving announcements to localStorage:', error);
    }
};

export const loadChats = (): ChatThread[] => {
    try {
        const chats = localStorage.getItem(STORAGE_KEYS.chats);
        return chats ? JSON.parse(chats) : [];
    } catch (error) {
        console.error('Error loading chats from localStorage:', error);
        return [];
    }
};

export const saveChats = (chats: ChatThread[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(chats));
    } catch (error) {
        console.error('Error saving chats to localStorage:', error);
    }
};