"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Supabaseが設定されていない場合は認証なしとして扱う
    if (!isSupabaseConfigured) {
      setUser(null)
      setLoading(false)
      return
    }

    // 現在のセッションを取得
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.warn("Auth session error:", error)
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.warn("Auth session error:", error)
        setUser(null)
      }
      setLoading(false)
    }

    getSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)
      setUser(session?.user ?? null)
      setLoading(false)

      // セッション情報をクッキーに保存（ミドルウェア用）
      if (session?.access_token) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`
      } else {
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!isSupabaseConfigured) return

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
      // クッキーをクリア
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    } catch (error) {
      console.warn("Sign out failed:", error)
    }
  }

  return {
    user,
    loading,
    signOut,
  }
}
