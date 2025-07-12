"use client"

import { useState, useEffect, useCallback } from "react"

interface GameScore {
  id: string
  score: number
  timeElapsed: number
  mistakes?: number
  accuracy?: number
  correctAnswers?: number
  maxStreak?: number
  level?: number
  moves?: number
  playedAt: string
}

interface AnalyticsData {
  totalGamesPlayed: number
  averageScore: number
  totalPlayTime: number
  favoriteGame: string
  strongestSkill: string
  weakestSkill: string
  weeklyProgress: Array<{ date: string; score: number; playTime: number }>
  gamePerformance: Array<{ game: string; plays: number; avgScore: number; improvement: number }>
  skillAnalysis: {
    memory: number
    reflexes: number
    logic: number
    concentration: number
  }
  playPatterns: {
    bestTimeOfDay: string
    averageSessionLength: number
    consistencyScore: number
  }
}

interface TimeSettings {
  dailyTimeLimit: number
  playSchedule: "anytime" | "after-school" | "weekend"
  notificationsEnabled: boolean
}

export const useParentAnalytics = (childId?: string) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    dailyTimeLimit: 30,
    playSchedule: "anytime",
    notificationsEnabled: true,
  })
  const [loading, setLoading] = useState(true)

  // ゲームデータを分析する関数
  const analyzeGameData = useCallback((): AnalyticsData => {
    // ローカルストレージからデータを取得
    const numberTouchScores: GameScore[] = JSON.parse(localStorage.getItem("gameScores_number-touch") || "[]")
    const calculationRaceScores: GameScore[] = JSON.parse(localStorage.getItem("gameScores_calculation-race") || "[]")
    const logicMazeScores: GameScore[] = JSON.parse(localStorage.getItem("gameScores_logic-maze") || "[]")
    const playSessions = JSON.parse(localStorage.getItem("playSessions") || "[]")

    // 全ゲームスコアを統合
    const allScores = [
      ...numberTouchScores.map((s) => ({ ...s, gameType: "number-touch" })),
      ...calculationRaceScores.map((s) => ({ ...s, gameType: "calculation-race" })),
      ...logicMazeScores.map((s) => ({ ...s, gameType: "logic-maze" })),
    ]

    // 基本統計
    const totalGamesPlayed = allScores.length
    const averageScore =
      totalGamesPlayed > 0 ? Math.round(allScores.reduce((sum, score) => sum + score.score, 0) / totalGamesPlayed) : 0
    const totalPlayTime = playSessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0)

    // お気に入りゲーム分析
    const gamePlayCounts = {
      "number-touch": numberTouchScores.length,
      "calculation-race": calculationRaceScores.length,
      "logic-maze": logicMazeScores.length,
    }
    const favoriteGame = Object.entries(gamePlayCounts).reduce((a, b) =>
      gamePlayCounts[a[0] as keyof typeof gamePlayCounts] > gamePlayCounts[b[0] as keyof typeof gamePlayCounts] ? a : b,
    )[0]

    // スキル分析
    const memoryScore =
      numberTouchScores.length > 0
        ? Math.round(numberTouchScores.reduce((sum, s) => sum + s.score, 0) / numberTouchScores.length / 10)
        : 0
    const reflexScore =
      numberTouchScores.length > 0
        ? Math.round(
            100 - numberTouchScores.reduce((sum, s) => sum + (s.timeElapsed || 0), 0) / numberTouchScores.length / 100,
          )
        : 0
    const logicScore =
      logicMazeScores.length > 0
        ? Math.round(logicMazeScores.reduce((sum, s) => sum + s.score, 0) / logicMazeScores.length / 10)
        : 0
    const concentrationScore =
      calculationRaceScores.length > 0
        ? Math.round(
            calculationRaceScores.reduce((sum, s) => sum + (s.accuracy || 0), 0) / calculationRaceScores.length,
          )
        : 0

    const skillAnalysis = {
      memory: Math.min(100, memoryScore),
      reflexes: Math.min(100, Math.max(0, reflexScore)),
      logic: Math.min(100, logicScore),
      concentration: Math.min(100, concentrationScore),
    }

    // 最強・最弱スキル
    const skillEntries = Object.entries(skillAnalysis)
    const strongestSkill = skillEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    const weakestSkill = skillEntries.reduce((a, b) => (a[1] < b[1] ? a : b))[0]

    // 週間進捗データ
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    const weeklyProgress = last7Days.map((date) => {
      const dayScores = allScores.filter((score) => score.playedAt.split("T")[0] === date)
      const daySessions = playSessions.filter((session: any) => session.startTime.split("T")[0] === date)

      return {
        // ✨ Fix: use valid options for toLocaleDateString
        date: new Date(date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }),
        score: dayScores.length > 0 ? Math.round(dayScores.reduce((sum, s) => sum + s.score, 0) / dayScores.length) : 0,
        playTime: daySessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0),
      }
    })

    // ゲーム別パフォーマンス
    const gamePerformance = [
      {
        game: "数字タッチ",
        plays: numberTouchScores.length,
        avgScore:
          numberTouchScores.length > 0
            ? Math.round(numberTouchScores.reduce((sum, s) => sum + s.score, 0) / numberTouchScores.length)
            : 0,
        improvement: calculateImprovement(numberTouchScores),
      },
      {
        game: "計算レース",
        plays: calculationRaceScores.length,
        avgScore:
          calculationRaceScores.length > 0
            ? Math.round(calculationRaceScores.reduce((sum, s) => sum + s.score, 0) / calculationRaceScores.length)
            : 0,
        improvement: calculateImprovement(calculationRaceScores),
      },
      {
        game: "論理迷路",
        plays: logicMazeScores.length,
        avgScore:
          logicMazeScores.length > 0
            ? Math.round(logicMazeScores.reduce((sum, s) => sum + s.score, 0) / logicMazeScores.length)
            : 0,
        improvement: calculateImprovement(logicMazeScores),
      },
    ]

    // プレイパターン分析
    const playPatterns = {
      bestTimeOfDay: "午後", // 簡略化
      averageSessionLength:
        playSessions.length > 0
          ? Math.round(playSessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / playSessions.length)
          : 0,
      consistencyScore: calculateConsistencyScore(playSessions),
    }

    return {
      totalGamesPlayed,
      averageScore,
      totalPlayTime,
      favoriteGame: getFavoriteGameName(favoriteGame),
      strongestSkill: getSkillName(strongestSkill),
      weakestSkill: getSkillName(weakestSkill),
      weeklyProgress,
      gamePerformance,
      skillAnalysis,
      playPatterns,
    }
  }, [])

  // 改善度計算
  const calculateImprovement = (scores: GameScore[]): number => {
    if (scores.length < 2) return 0
    const recent = scores.slice(-3).reduce((sum, s) => sum + s.score, 0) / Math.min(3, scores.length)
    const older = scores.slice(0, 3).reduce((sum, s) => sum + s.score, 0) / Math.min(3, scores.length)
    return Math.round(((recent - older) / older) * 100)
  }

  // 一貫性スコア計算
  const calculateConsistencyScore = (sessions: any[]): number => {
    if (sessions.length < 3) return 0
    const durations = sessions.map((s) => s.duration || 0)
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length
    return Math.max(0, Math.min(100, 100 - (Math.sqrt(variance) / avg) * 100))
  }

  // ゲーム名変換
  const getFavoriteGameName = (gameType: string): string => {
    const gameNames: { [key: string]: string } = {
      "number-touch": "数字タッチ",
      "calculation-race": "計算レース",
      "logic-maze": "論理迷路",
    }
    return gameNames[gameType] || "未プレイ"
  }

  // スキル名変換
  const getSkillName = (skill: string): string => {
    const skillNames: { [key: string]: string } = {
      memory: "記憶力",
      reflexes: "反射神経",
      logic: "論理思考",
      concentration: "集中力",
    }
    return skillNames[skill] || skill
  }

  // 時間設定を保存
  const saveTimeSettings = useCallback(async (newSettings: TimeSettings) => {
    try {
      localStorage.setItem("parentTimeSettings", JSON.stringify(newSettings))
      setTimeSettings(newSettings)

      // 子供のプロフィールにも反映
      const childProfile = JSON.parse(localStorage.getItem("childProfile") || "{}")
      if (childProfile.id) {
        childProfile.maxPlayTime = newSettings.dailyTimeLimit
        localStorage.setItem("childProfile", JSON.stringify(childProfile))
      }

      return true
    } catch (error) {
      console.error("Failed to save time settings:", error)
      return false
    }
  }, [])

  // 時間設定を読み込み
  const loadTimeSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem("parentTimeSettings")
      if (saved) {
        setTimeSettings(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Failed to load time settings:", error)
    }
  }, [])

  // データ更新
  const refreshData = useCallback(() => {
    setLoading(true)
    try {
      const data = analyzeGameData()
      setAnalyticsData(data)
    } catch (error) {
      console.error("Failed to analyze data:", error)
    } finally {
      setLoading(false)
    }
  }, [analyzeGameData])

  useEffect(() => {
    loadTimeSettings()
    refreshData()
  }, [loadTimeSettings, refreshData])

  return {
    analyticsData,
    timeSettings,
    loading,
    saveTimeSettings,
    refreshData,
  }
}
