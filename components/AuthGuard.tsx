"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = true, redirectTo = "/auth" }: AuthGuardProps) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        window.location.href = redirectTo
      } else if (!requireAuth && user) {
        window.location.href = "/parent"
      }
    }
  }, [user, loading, requireAuth, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // リダイレクト中
  }

  if (!requireAuth && user) {
    return null // リダイレクト中
  }

  return <>{children}</>
}
