"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Auth callback error:", error)
        window.location.href = "/auth?error=callback_error"
        return
      }

      if (data.session) {
        // 認証成功時は保護者ダッシュボードにリダイレクト
        window.location.href = "/parent"
      } else {
        // セッションがない場合はログインページに戻る
        window.location.href = "/auth"
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-white text-xl">認証処理中...</div>
    </div>
  )
}
