// Local storage backed persistence for users, swap requests, and announcements
// Starts empty and grows based on user actions

export type SwapStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface SwapRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  offeredSkill: string;
  requestedSkill: string;
  message?: string;
  status: SwapStatus;
  createdAt: string;
  ratingFromSender?: number; // rating given by the sender to the recipient
  ratingFromRecipient?: number; // rating given by the recipient to the sender
  feedbackFromSender?: string;
  feedbackFromRecipient?: string;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  location?: string;
  avatar: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  rating: number;
  reviews: number;
  isPublic: boolean;
  bio?: string;
  isBanned?: boolean;
  isProfileApproved?: boolean; // for admin moderation
}

const USERS_KEY = "ssc_users";
const REQUESTS_KEY = "ssc_swap_requests";
const ANNOUNCEMENTS_KEY = "ssc_announcements";
const CHATS_KEY = "ssc_chats";

export type Announcement = {
  id: string;
  message: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderUserId: number;
  content: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  requestId: number;
  participantUserIds: [number, number];
  messages: ChatMessage[];
  isCompleted: boolean;
  completedUserIds?: number[]; // which users have marked complete
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Users
export function loadUsers(): AppUser[] {
  const existing = readJson<AppUser[]>(USERS_KEY);
  if (existing && Array.isArray(existing)) return existing;
  const initialized: AppUser[] = [];
  writeJson(USERS_KEY, initialized);
  return initialized;
}

export function saveUsers(users: AppUser[]): void {
  writeJson(USERS_KEY, users);
}

// Requests
export function loadRequests(): SwapRequest[] {
  const existing = readJson<SwapRequest[]>(REQUESTS_KEY);
  if (existing && Array.isArray(existing)) return existing;
  const initialized: SwapRequest[] = [];
  writeJson(REQUESTS_KEY, initialized);
  return initialized;
}

export function saveRequests(requests: SwapRequest[]): void {
  writeJson(REQUESTS_KEY, requests);
}

// Announcements
export function loadAnnouncements(): Announcement[] {
  return readJson<Announcement[]>(ANNOUNCEMENTS_KEY) ?? [];
}

export function saveAnnouncements(list: Announcement[]): void {
  writeJson(ANNOUNCEMENTS_KEY, list);
}

// Chats
export function loadChats(): ChatThread[] {
  const existing = readJson<ChatThread[]>(CHATS_KEY);
  if (existing && Array.isArray(existing)) return existing;
  const initialized: ChatThread[] = [];
  writeJson(CHATS_KEY, initialized);
  return initialized;
}

export function saveChats(chats: ChatThread[]): void {
  writeJson(CHATS_KEY, chats);
}


