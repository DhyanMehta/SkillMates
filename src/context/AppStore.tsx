import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  loadUsers,
  saveUsers,
  loadRequests,
  saveRequests,
  loadAnnouncements,
  saveAnnouncements,
  loadChats,
  saveChats,
  type AppUser,
  type SwapRequest,
  type Announcement,
  type ChatThread,
} from "../services/localDb";

type AppStoreContextValue = {
  users: AppUser[];
  requests: SwapRequest[];
  announcements: Announcement[];
  chats: ChatThread[];
  currentUserId: number | null;
  isAdmin: boolean;
  // auth
  loginAs(userId: number, admin?: boolean): void;
  logout(): void;
  addUser(user: Pick<AppUser, 'name'|'email'|'location'|'avatar'|'bio'|'availability'|'isPublic'>): number;
  // users
  updateUser(user: AppUser): void;
  // requests
  sendRequest(input: Omit<SwapRequest, "id" | "status" | "createdAt"> & { message?: string }): number;
  acceptRequest(id: number): void;
  rejectRequest(id: number): void;
  deleteRequest(id: number): void; // allowed if not accepted
  rateRequest(id: number, rating: number, feedback?: string): void; // updates the other user's rating
  // chats
  ensureChatForRequest(requestId: number): string; // returns threadId
  getChatByRequestId(requestId: number): ChatThread | undefined;
  sendMessage(threadId: string, content: string): void;
  markChatCompleted(threadId: string): void; // current user marks complete
  // admin
  setUserBanned(userId: number, banned: boolean): void;
  setUserApproved(userId: number, approved: boolean): void;
  addAnnouncement(message: string): void;
  removeAnnouncement(id: string): void;
};

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

const CURRENT_USER_KEY = "ssc_current_user_id";
const ADMIN_FLAG_KEY = "ssc_is_admin";

export const AppStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<AppUser[]>(() => loadUsers());
  const [requests, setRequests] = useState<SwapRequest[]>(() => loadRequests());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadAnnouncements());
  const [chats, setChats] = useState<ChatThread[]>(() => loadChats());
  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? Number(raw) : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem(ADMIN_FLAG_KEY) === "true");

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveRequests(requests);
  }, [requests]);

  useEffect(() => {
    saveAnnouncements(announcements);
  }, [announcements]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const loginAs = useCallback((userId: number, admin?: boolean) => {
    setCurrentUserId(userId);
    localStorage.setItem(CURRENT_USER_KEY, String(userId));
    if (admin !== undefined) {
      setIsAdmin(!!admin);
      localStorage.setItem(ADMIN_FLAG_KEY, admin ? "true" : "false");
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUserId(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setIsAdmin(false);
    localStorage.setItem(ADMIN_FLAG_KEY, "false");
  }, []);

  const updateUser = useCallback((user: AppUser) => {
    setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, ...user } : u)));
  }, []);

  const addUser = useCallback<AppStoreContextValue['addUser']>((input) => {
    const nextId = (users.reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
    const newUser: AppUser = {
      id: nextId,
      name: input.name,
      email: input.email,
      location: input.location,
      avatar: input.avatar || 'https://i.pravatar.cc/150?img=1',
      bio: input.bio,
      availability: input.availability || 'Flexible',
      isPublic: input.isPublic ?? true,
      isBanned: false,
      isProfileApproved: true,
      rating: 0,
      reviews: 0,
      skillsOffered: [],
      skillsWanted: [],
    };
    setUsers(prev => [...prev, newUser]);
    return nextId;
  }, [users]);

  const sendRequest: AppStoreContextValue["sendRequest"] = useCallback((input) => {
    const nextId = (requests.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
    const newReq: SwapRequest = {
      id: nextId,
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
      offeredSkill: input.offeredSkill,
      requestedSkill: input.requestedSkill,
      message: input.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setRequests(prev => [newReq, ...prev]);
    return nextId;
  }, [requests]);

  const acceptRequest = useCallback((id: number) => {
    setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: "accepted" } : r)));
    // Ensure chat thread exists for this request
    setChats(prev => {
      const exists = prev.find(t => t.requestId === id);
      if (exists) return prev;
      const req = requests.find(r => r.id === id);
      if (!req) return prev;
      const thread: ChatThread = {
        id: crypto.randomUUID(),
        requestId: id,
        participantUserIds: [req.fromUserId, req.toUserId],
        messages: [],
        isCompleted: false,
      };
      return [thread, ...prev];
    });
  }, [requests]);

  const rejectRequest = useCallback((id: number) => {
    setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: "rejected" } : r)));
  }, []);

  const deleteRequest = useCallback((id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  }, []);

  const rateRequest = useCallback((id: number, rating: number, feedback?: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const isSender = currentUserId != null && r.fromUserId === currentUserId;
      const updated: SwapRequest = {
        ...r,
        ...(isSender ? { ratingFromSender: rating, feedbackFromSender: feedback } : { ratingFromRecipient: rating, feedbackFromRecipient: feedback }),
      };
      return updated;
    }));

    // Update target user's rating aggregation
    setUsers(prev => {
      const req = requests.find(r => r.id === id);
      if (!req || currentUserId == null) return prev;
      const targetUserId = req.fromUserId === currentUserId ? req.toUserId : req.fromUserId;
      return prev.map(u => {
        if (u.id !== targetUserId) return u;
        const newReviews = (u.reviews ?? 0) + 1;
        const newRating = ((u.rating ?? 0) * (u.reviews ?? 0) + rating) / newReviews;
        return { ...u, rating: Number(newRating.toFixed(2)), reviews: newReviews };
      });
    });
  }, [currentUserId, requests]);

  const ensureChatForRequest = useCallback((requestId: number) => {
    let threadId: string | undefined;
    setChats(prev => {
      const existing = prev.find(t => t.requestId === requestId);
      if (existing) {
        threadId = existing.id;
        return prev;
      }
      const req = requests.find(r => r.id === requestId);
      if (!req) return prev;
      const thread: ChatThread = {
        id: crypto.randomUUID(),
        requestId,
        participantUserIds: [req.fromUserId, req.toUserId],
        messages: [],
        isCompleted: false,
      };
      threadId = thread.id;
      return [thread, ...prev];
    });
    // Fallback if setState batching didn't set id
    if (!threadId) {
      const latest = chats.find(t => t.requestId === requestId);
      if (latest) threadId = latest.id;
    }
    return threadId || "";
  }, [requests, chats]);

  const getChatByRequestId = useCallback((requestId: number) => chats.find(t => t.requestId === requestId), [chats]);

  const sendMessage = useCallback((threadId: string, content: string) => {
    if (!currentUserId) return;
    const msg = {
      id: crypto.randomUUID(),
      threadId,
      senderUserId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
    };
    setChats(prev => prev.map(t => t.id === threadId ? { ...t, messages: [...t.messages, msg] } : t));
  }, [currentUserId]);

  const markChatCompleted = useCallback((threadId: string) => {
    setChats(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      const completedUserIds = Array.from(new Set([...(t.completedUserIds || []), ...(currentUserId ? [currentUserId] : [])]));
      const isCompleted = completedUserIds.length >= 2;
      return { ...t, completedUserIds, isCompleted };
    }));
  }, [currentUserId]);

  const setUserBanned = useCallback((userId: number, banned: boolean) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isBanned: banned } : u)));
  }, []);

  const setUserApproved = useCallback((userId: number, approved: boolean) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isProfileApproved: approved } : u)));
  }, []);

  const addAnnouncement = useCallback((message: string) => {
    const ann: Announcement = { id: crypto.randomUUID(), message, createdAt: new Date().toISOString() };
    setAnnouncements(prev => [ann, ...prev]);
  }, []);

  const removeAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  const value = useMemo<AppStoreContextValue>(() => ({
    users,
    requests,
    announcements,
    chats,
    currentUserId,
    isAdmin,
    loginAs,
    logout,
    addUser,
    updateUser,
    sendRequest,
    acceptRequest,
    rejectRequest,
    deleteRequest,
    rateRequest,
    ensureChatForRequest,
    getChatByRequestId,
    sendMessage,
    markChatCompleted,
    setUserBanned,
    setUserApproved,
    addAnnouncement,
    removeAnnouncement,
  }), [users, requests, announcements, chats, currentUserId, isAdmin, loginAs, logout, addUser, updateUser, sendRequest, acceptRequest, rejectRequest, deleteRequest, rateRequest, ensureChatForRequest, getChatByRequestId, sendMessage, markChatCompleted, setUserBanned, setUserApproved, addAnnouncement, removeAnnouncement]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
};

export const useAppStore = () => {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
};


