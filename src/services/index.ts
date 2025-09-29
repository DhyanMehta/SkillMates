// Main service layer that exports all Supabase services
// This replaces the old local storage services

export { userService } from './supabaseUserService';
export { requestService } from './supabaseRequestService';
export { chatService } from './supabaseChatService';
export { announcementService } from './supabaseAnnouncementService';

// Re-export types for convenience
export type { AppUser } from './supabaseUserService';
export type { SwapRequest, SwapStatus } from './supabaseRequestService';
export type { ChatMessage, ChatThread } from './supabaseChatService';
export type { Announcement } from './supabaseAnnouncementService';

// Export supabase client for direct access if needed
export { supabase } from '../lib/supabase';