import { createClient } from '@supabase/supabase-js'

// Direct Supabase configuration - no checks needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Database types (these will match your Supabase schema)
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    email: string
                    name: string
                    location?: string
                    avatar?: string
                    skills_offered: string[]
                    skills_wanted: string[]
                    availability: string
                    rating: number
                    reviews: number
                    is_public: boolean
                    bio?: string
                    is_banned: boolean
                    is_profile_approved: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    email: string
                    name: string
                    location?: string
                    avatar?: string
                    skills_offered?: string[]
                    skills_wanted?: string[]
                    availability?: string
                    rating?: number
                    reviews?: number
                    is_public?: boolean
                    bio?: string
                    is_banned?: boolean
                    is_profile_approved?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    email?: string
                    name?: string
                    location?: string
                    avatar?: string
                    skills_offered?: string[]
                    skills_wanted?: string[]
                    availability?: string
                    rating?: number
                    reviews?: number
                    is_public?: boolean
                    bio?: string
                    is_banned?: boolean
                    is_profile_approved?: boolean
                }
            }
            swap_requests: {
                Row: {
                    id: number
                    created_at: string
                    updated_at: string
                    from_user_id: string
                    to_user_id: string
                    offered_skill: string
                    requested_skill: string
                    message?: string
                    status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
                    rating_from_sender?: number
                    rating_from_recipient?: number
                    feedback_from_sender?: string
                    feedback_from_recipient?: string
                }
                Insert: {
                    id?: number
                    created_at?: string
                    updated_at?: string
                    from_user_id: string
                    to_user_id: string
                    offered_skill: string
                    requested_skill: string
                    message?: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled'
                    rating_from_sender?: number
                    rating_from_recipient?: number
                    feedback_from_sender?: string
                    feedback_from_recipient?: string
                }
                Update: {
                    id?: number
                    created_at?: string
                    updated_at?: string
                    from_user_id?: string
                    to_user_id?: string
                    offered_skill?: string
                    requested_skill?: string
                    message?: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled'
                    rating_from_sender?: number
                    rating_from_recipient?: number
                    feedback_from_sender?: string
                    feedback_from_recipient?: string
                }
            }
            announcements: {
                Row: {
                    id: string
                    created_at: string
                    message: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    message: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    message?: string
                }
            }
            chat_threads: {
                Row: {
                    id: string
                    created_at: string
                    request_id: number
                    participant_user_ids: string[]
                    is_completed: boolean
                    completed_user_ids?: string[]
                }
                Insert: {
                    id?: string
                    created_at?: string
                    request_id: number
                    participant_user_ids: string[]
                    is_completed?: boolean
                    completed_user_ids?: string[]
                }
                Update: {
                    id?: string
                    created_at?: string
                    request_id?: number
                    participant_user_ids?: string[]
                    is_completed?: boolean
                    completed_user_ids?: string[]
                }
            }
            chat_messages: {
                Row: {
                    id: string
                    created_at: string
                    thread_id: string
                    sender_user_id: string
                    content: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    thread_id: string
                    sender_user_id: string
                    content: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    thread_id?: string
                    sender_user_id?: string
                    content?: string
                }
            }
        }
    }
}