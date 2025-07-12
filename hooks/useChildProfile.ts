"use client"

import { useState, useEffect, useCallback } from "react"
import type { ChildProfile, Badge, GameScore } from "@/types"

const DEFAULT_PROFILE: Omit<ChildProfile, "id"> = {
  name: "",
  avatar: "🦁",
  level: 1,
  totalScore: 0,
  experience: 0,
  experienceToNext: 100,
  badges: [],
  todayPlayTime: 0,
  maxPlayTime: 30,
  createdAt: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
}

// 今日のプレイ時間を計算する関数を追加
const calculateTodayPlayTime = (): number => {
  if (typeof window === "undefined") return 0

  const sessions = JSON.parse(localStorage.getItem("playSessions") || "[]")
  const today = new Date().toDateString()
  const todaySessions = sessions.filter((s: any) => new Date(s.startTime).toDateString() === today)
  return todaySessions.reduce((total: number, s: any) => total + (s.duration || 0), 0)
}

export const useChildProfile = () => {
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // プロフィール読み込み
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (typeof window === "undefined") return

      const savedProfile = localStorage.getItem("childProfile")
      const savedName = localStorage.getItem("childName")
      const savedAvatar = localStorage.getItem("childAvatar")

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as ChildProfile
        // 今日のプレイ時間を再計算
        const todayPlayTime = calculateTodayPlayTime()

        // 名前とアバターを個別に保存されたものから取得（優先）
        const updatedProfile = {
          ...parsed,
          todayPlayTime,
          name: savedName || parsed.name || "",
          avatar: savedAvatar || parsed.avatar || "🦁",
        }
        setProfile(updatedProfile)
        // 更新されたプロフィールを保存
        localStorage.setItem("childProfile", JSON.stringify(updatedProfile))
      } else if (savedName) {
        // プロフィールはないが名前がある場合、新規作成
        const newProfile: ChildProfile = {
          ...DEFAULT_PROFILE,
          id: `child_${Date.now()}`,
          name: savedName,
          avatar: savedAvatar || "🦁",
          todayPlayTime: calculateTodayPlayTime(),
        }
        setProfile(newProfile)
        localStorage.setItem("childProfile", JSON.stringify(newProfile))
      } else {
        // 何もない場合はnullのまま
        setProfile(null)
      }
    } catch (err) {
      setError("プロフィールの読み込みに失敗しました")
      console.error("Profile load error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // プロフィール保存
  const saveProfile = useCallback(async (updatedProfile: ChildProfile) => {
    try {
      setError(null)
      if (typeof window === "undefined") return

      // プロフィール全体を保存
      localStorage.setItem("childProfile", JSON.stringify(updatedProfile))
      // 名前とアバターを個別にも保存
      localStorage.setItem("childName", updatedProfile.name)
      localStorage.setItem("childAvatar", updatedProfile.avatar)
      setProfile(updatedProfile)
    } catch (err) {
      setError("プロフィールの保存に失敗しました")
      console.error("Profile save error:", err)
    }
  }, [])

  // プロフィール更新
  const updateProfile = useCallback(
    async (updates: Partial<ChildProfile>) => {
      try {
        if (!profile && updates.name) {
          // プロフィールがない場合は新規作成
          const newProfile: ChildProfile = {
            ...DEFAULT_PROFILE,
            id: `child_${Date.now()}`,
            ...updates,
          }
          await saveProfile(newProfile)
          return newProfile
        }

        if (profile) {
          const updatedProfile = { ...profile, ...updates }
          await saveProfile(updatedProfile)
          return updatedProfile
        }
      } catch (error) {
        console.error("Update profile error:", error)
        throw error
      }
    },
    [profile, saveProfile],
  )

  // 経験値追加とレベルアップ処理
  const addExperience = useCallback(
    (exp: number) => {
      if (!profile) return

      let newExperience = profile.experience + exp
      let newLevel = profile.level
      let experienceToNext = profile.experienceToNext

      // レベルアップ判定
      while (newExperience >= experienceToNext) {
        newExperience -= experienceToNext
        newLevel++
        experienceToNext = newLevel * 100 // レベルが上がるほど必要経験値増加
      }

      const updatedProfile = {
        ...profile,
        experience: newExperience,
        level: newLevel,
        experienceToNext,
        lastPlayed: new Date().toISOString(),
      }

      saveProfile(updatedProfile)

      // レベルアップした場合は通知
      if (newLevel > profile.level) {
        return { leveledUp: true, newLevel }
      }

      return { leveledUp: false, newLevel }
    },
    [profile, saveProfile],
  )

  // バッジ追加
  const addBadge = useCallback(
    (badge: Omit<Badge, "earnedAt">) => {
      if (!profile) return

      const newBadge: Badge = {
        ...badge,
        earnedAt: new Date().toISOString(),
      }

      const updatedProfile = {
        ...profile,
        badges: [...profile.badges, newBadge],
      }

      saveProfile(updatedProfile)
      return newBadge
    },
    [profile, saveProfile],
  )

  // スコア記録
  const recordScore = useCallback(
    (gameScore: Omit<GameScore, "id" | "playedAt">) => {
      if (!profile) return

      const score: GameScore = {
        ...gameScore,
        id: `score_${Date.now()}`,
        playedAt: new Date().toISOString(),
      }

      // 経験値追加
      const expResult = addExperience(gameScore.experienceGained)

      // 総スコア更新
      const updatedProfile = {
        ...profile,
        totalScore: profile.totalScore + gameScore.score,
      }

      saveProfile(updatedProfile)

      return { score, ...expResult }
    },
    [profile, addExperience, saveProfile],
  )

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    addExperience,
    addBadge,
    recordScore,
    saveProfile,
    loadProfile,
  }
}
