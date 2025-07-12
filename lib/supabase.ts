import { createClient } from "@supabase/supabase-js"

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabaseが設定されているかチェック
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)

// モッククライアント（Supabase未設定時用）
const mockSupabaseClient = {
  auth: {
    signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured") }),
    signUp: async () => ({ data: null, error: new Error("Supabase not configured") }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: async () => ({ error: new Error("Supabase not configured") }),
    updateUser: async () => ({ error: new Error("Supabase not configured") }),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: new Error("Supabase not configured") }),
    update: () => ({ data: null, error: new Error("Supabase not configured") }),
    delete: () => ({ data: null, error: new Error("Supabase not configured") }),
  }),
}

// 実際のSupabaseクライアント（設定されている場合のみ）
let realSupabaseClient: any = null

if (isSupabaseConfigured) {
  try {
    realSupabaseClient = createClient(supabaseUrl!, supabaseKey!)
  } catch (error) {
    console.warn("Supabase client creation failed:", error)
  }
}

// エクスポートするクライアント
export const supabase = realSupabaseClient || mockSupabaseClient

// Types for our database
export interface User {
  id: string
  email?: string
  name: string
  role: "parent" | "child"
  parent_id?: string
  avatar?: string
  age?: number
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  user_id: string
  game_type: string
  score: number
  time_taken?: number
  mistakes: number
  played_at: string
}

export interface Badge {
  id: string
  user_id: string
  badge_name: string
  badge_description?: string
  earned_at: string
}

export interface PlaySession {
  id: string
  user_id: string
  started_at: string
  ended_at?: string
  duration?: number
  games_played: number
}

export interface UserSettings {
  id: string
  user_id: string
  daily_time_limit: number
  play_schedule: "anytime" | "after-school" | "weekend"
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}
