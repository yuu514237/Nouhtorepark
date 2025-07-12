"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ChildProfile, PlaySession } from "@/types"

export const usePlayTimeManager = (profile: ChildProfile | null) => {
  const [currentSession, setCurrentSession] = useState<PlaySession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [showTimeWarning, setShowTimeWarning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // セッション開始
  const startSession = useCallback(() => {
    if (!profile) return

    const session: PlaySession = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      duration: 0,
      gamesPlayed: 0,
      totalScore: 0,
    }

    setCurrentSession(session)
    setTimeRemaining((profile.maxPlayTime - profile.todayPlayTime) * 60) // 秒に変換
    setIsTimeUp(false)
    setShowTimeWarning(false)

    // 1秒ごとに時間を更新
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1

        // 5分前に警告表示
        if (newTime === 300 && !showTimeWarning) {
          setShowTimeWarning(true)
        }

        // 時間切れ
        if (newTime <= 0) {
          setIsTimeUp(true)
          return 0
        }

        return newTime
      })
    }, 1000)
  }, [profile, showTimeWarning])

  // セッション終了
  const endSession = useCallback(() => {
    if (!currentSession) return

    const endTime = new Date().toISOString()
    const duration = Math.floor(
      (new Date(endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000 / 60,
    ) // 分に変換

    const completedSession: PlaySession = {
      ...currentSession,
      endTime,
      duration,
    }

    // セッション情報を保存
    if (typeof window !== "undefined") {
      const sessions = JSON.parse(localStorage.getItem("playSessions") || "[]")
      sessions.push(completedSession)
      localStorage.setItem("playSessions", JSON.stringify(sessions))

      // 今日のプレイ時間を更新
      const today = new Date().toDateString()
      const todaySessions = sessions.filter((s: PlaySession) => new Date(s.startTime).toDateString() === today)
      const todayPlayTime = todaySessions.reduce((total: number, s: PlaySession) => total + s.duration, 0)

      // プロフィールの今日のプレイ時間を更新
      if (profile) {
        const updatedProfile = { ...profile, todayPlayTime }
        localStorage.setItem("childProfile", JSON.stringify(updatedProfile))
      }
    }

    // クリーンアップ
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setCurrentSession(null)
    setTimeRemaining(0)
    setShowTimeWarning(false)

    return completedSession
  }, [currentSession, profile])

  // ゲーム完了時の記録
  const recordGameCompletion = useCallback(
    (score: number) => {
      if (!currentSession) return

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              gamesPlayed: prev.gamesPlayed + 1,
              totalScore: prev.totalScore + score,
            }
          : null,
      )
    },
    [currentSession],
  )

  // 時間フォーマット
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // 時間切れ時の自動セッション終了
  useEffect(() => {
    if (isTimeUp && currentSession) {
      endSession()
    }
  }, [isTimeUp, currentSession, endSession])

  return {
    currentSession,
    timeRemaining,
    isTimeUp,
    showTimeWarning,
    startSession,
    endSession,
    recordGameCompletion,
    formatTime,
    isSessionActive: !!currentSession,
  }
}
