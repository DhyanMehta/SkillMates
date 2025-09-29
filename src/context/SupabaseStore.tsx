import { createContext, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from "./AuthContext";
import {
    useUsers,
    useReceivedRequests,
    useSentRequests,
    useAnnouncements,
    useChatThreads
} from "../hooks/useSupabaseQueries";
import type { AppUser, SwapRequest, Announcement, ChatThread } from "../services";

type SupabaseStoreContextValue = {
    // Data from hooks
    users: AppUser[];
    sentRequests: SwapRequest[];
    receivedRequests: SwapRequest[];
    announcements: Announcement[];
    chatThreads: ChatThread[];

    // Loading states
    isLoadingUsers: boolean;
    isLoadingRequests: boolean;
    isLoadingAnnouncements: boolean;
    isLoadingChats: boolean;

    // Current user info
    currentUser: AppUser | null;
    isAdmin: boolean;

    // Helper functions
    refreshData: () => void;
};

const SupabaseStoreContext = createContext<SupabaseStoreContextValue | undefined>(undefined);

// Create a query client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
        },
    },
});

const SupabaseStoreProviderInner = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Fetch data using our custom hooks
    const {
        data: usersResponse,
        isLoading: isLoadingUsers,
        refetch: refetchUsers
    } = useUsers();

    const {
        data: sentRequestsResponse,
        isLoading: isLoadingSentRequests,
        refetch: refetchSentRequests
    } = useSentRequests(user?.id || '');

    const {
        data: receivedRequestsResponse,
        isLoading: isLoadingReceivedRequests,
        refetch: refetchReceivedRequests
    } = useReceivedRequests(user?.id || '');

    const {
        data: announcementsResponse,
        isLoading: isLoadingAnnouncements,
        refetch: refetchAnnouncements
    } = useAnnouncements();

    const {
        data: chatThreadsResponse,
        isLoading: isLoadingChats,
        refetch: refetchChats
    } = useChatThreads(user?.id || '');

    // Extract data from responses (handle the service response format)
    const users = usersResponse?.success ? usersResponse.data : [];
    const sentRequests = sentRequestsResponse?.success ? sentRequestsResponse.data : [];
    const receivedRequests = receivedRequestsResponse?.success ? receivedRequestsResponse.data : [];
    const announcements = announcementsResponse?.success ? announcementsResponse.data : [];
    const chatThreads = chatThreadsResponse?.success ? chatThreadsResponse.data : [];

    // Set current user and admin status
    useEffect(() => {
        if (user && users.length > 0) {
            const foundUser = users.find(u => u.id === user.id);
            setCurrentUser(foundUser || null);

            // Check if user is admin (you can customize this logic)
            // For now, let's say admin is determined by email or a specific field
            setIsAdmin(user.email === 'admin@skillmates.com' || foundUser?.email === 'admin@skillmates.com');
        } else {
            setCurrentUser(null);
            setIsAdmin(false);
        }
    }, [user, users]);

    const refreshData = () => {
        refetchUsers();
        refetchSentRequests();
        refetchReceivedRequests();
        refetchAnnouncements();
        refetchChats();
    };

    const value: SupabaseStoreContextValue = {
        users,
        sentRequests,
        receivedRequests,
        announcements,
        chatThreads,

        isLoadingUsers,
        isLoadingRequests: isLoadingSentRequests || isLoadingReceivedRequests,
        isLoadingAnnouncements,
        isLoadingChats,

        currentUser,
        isAdmin,

        refreshData,
    };

    return (
        <SupabaseStoreContext.Provider value={value}>
            {children}
        </SupabaseStoreContext.Provider>
    );
};

export const SupabaseStoreProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <SupabaseStoreProviderInner>
                {children}
            </SupabaseStoreProviderInner>
        </QueryClientProvider>
    );
};

export const useSupabaseStore = () => {
    const context = useContext(SupabaseStoreContext);
    if (!context) {
        throw new Error('useSupabaseStore must be used within a SupabaseStoreProvider');
    }
    return context;
};

// For backward compatibility, also export the query client
export { queryClient };