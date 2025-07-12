"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Target, Gift, Sparkles } from "lucide-react"
import type { Achievement, Badge as BadgeType } from "@/types"

interface MotivationSystemProps {
  level: number
  experience: number
  experienceToNext: number
  badges: BadgeType[]
  onCelebration?: () => void
}

export function MotivationSystem({
  level,
  experience,
  experienceToNext,
  badges,
  onCelebration,
}: MotivationSystemProps) {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showNewBadge, setShowNewBadge] = useState<BadgeType | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  // 実績データ
  const getUpdatedAchievements = (): Achievement[] => {
    // ローカルストレージからゲームデータを取得
    const numberTouchScores = JSON.parse(localStorage.getItem("gameScores_number-touch") || "[]")
    const calculationRaceScores = JSON.parse(localStorage.getItem("gameScores_calculation-race") || "[]")
    const logicMazeScores = JSON.parse(localStorage.getItem("gameScores_logic-maze") || "[]")
    const playSessions = JSON.parse(localStorage.getItem("playSessions") || "[]")

    // 連続プレイ日数を計算
    const today = new Date().toDateString()
    const uniqueDays = new Set(playSessions.map((session: any) => new Date(session.startTime).toDateString()))
    const consecutiveDays = uniqueDays.size

    // 最高スコアを取得
    const maxScore = Math.max(
      ...numberTouchScores.map((s: any) => s.score),
      ...calculationRaceScores.map((s: any) => s.score),
      ...logicMazeScores.map((s: any) => s.score),
      0,
    )

    // ミス0回のゲーム数をカウント（計算レースは正解率100%）
    const perfectGames = [
      ...numberTouchScores.filter((s: any) => s.mistakes === 0),
      ...calculationRaceScores.filter((s: any) => s.accuracy === 100),
      ...logicMazeScores.filter((s: any) => s.mistakes === 0),
    ].length

    // 10秒以内のクリア数（計算レースは高速回答）
    const speedClears = [
      ...numberTouchScores.filter((s: any) => s.timeElapsed <= 10000),
      ...calculationRaceScores.filter((s: any) => s.correctAnswers >= 20), // 20問以上正解
      ...logicMazeScores.filter((s: any) => s.timeElapsed <= 10000),
    ].length

    // 計算レースの高正解率ゲーム数
    const highAccuracyGames = calculationRaceScores.filter((s: any) => s.accuracy >= 90).length

    return [
      {
        id: "first_game",
        title: "初めの一歩",
        description: "初めてゲームをプレイしよう",
        icon: "🎮",
        progress: Math.min(1, numberTouchScores.length + calculationRaceScores.length + logicMazeScores.length),
        maxProgress: 1,
        completed: numberTouchScores.length + calculationRaceScores.length + logicMazeScores.length > 0,
        reward: { type: "badge", value: "beginner" },
      },
      {
        id: "number_master",
        title: "数字マスター",
        description: "数字タッチを10回クリアしよう",
        icon: "🔢",
        progress: Math.min(10, numberTouchScores.length),
        maxProgress: 10,
        completed: numberTouchScores.length >= 10,
        reward: { type: "badge", value: "数字の達人" },
      },
      {
        id: "calculation_expert",
        title: "計算の達人",
        description: "計算レースで90%以上の正解率を5回達成しよう",
        icon: "🧮",
        progress: Math.min(5, highAccuracyGames),
        maxProgress: 5,
        completed: highAccuracyGames >= 5,
        reward: { type: "badge", value: "計算マスター" },
      },
      {
        id: "maze_navigator",
        title: "迷路の探検家",
        description: "論理迷路を5回クリアしよう",
        icon: "🗺️",
        progress: Math.min(5, logicMazeScores.length),
        maxProgress: 5,
        completed: logicMazeScores.length >= 5,
        reward: { type: "experience", value: 100 },
      },
      {
        id: "perfect_player",
        title: "パーフェクトプレイヤー",
        description: "完璧な成績でゲームを5回クリアしよう",
        icon: "✨",
        progress: Math.min(5, perfectGames),
        maxProgress: 5,
        completed: perfectGames >= 5,
        reward: { type: "badge", value: "完璧主義者" },
      },
      {
        id: "speed_demon",
        title: "スピードデーモン",
        description: "素早くゲームをクリアしよう",
        icon: "⚡",
        progress: Math.min(1, speedClears),
        maxProgress: 1,
        completed: speedClears > 0,
        reward: { type: "badge", value: "スピードスター" },
      },
      {
        id: "score_master",
        title: "スコアマスター",
        description: "1000点以上を獲得しよう",
        icon: "🏆",
        progress: Math.min(1000, maxScore),
        maxProgress: 1000,
        completed: maxScore >= 1000,
        reward: { type: "experience", value: 50 },
      },
      {
        id: "daily_player",
        title: "毎日の習慣",
        description: "7日連続でプレイしよう",
        icon: "📅",
        progress: Math.min(7, consecutiveDays),
        maxProgress: 7,
        completed: consecutiveDays >= 7,
        reward: { type: "badge", value: "継続は力なり" },
      },
    ]
  }

  // コンポーネントマウント時に実績を更新
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAchievements(getUpdatedAchievements())
    }
  }, [])

  // レベルアップ演出
  const triggerLevelUp = () => {
    setShowLevelUp(true)
    onCelebration?.()
    setTimeout(() => setShowLevelUp(false), 3000)
  }

  // 新バッジ演出
  const triggerNewBadge = (badge: BadgeType) => {
    setShowNewBadge(badge)
    onCelebration?.()
    setTimeout(() => setShowNewBadge(null), 3000)
  }

  // 経験値バーの色を動的に変更
  const getExpBarColor = () => {
    const percentage = (experience / experienceToNext) * 100
    if (percentage >= 80) return "bg-gradient-to-r from-yellow-400 to-orange-500"
    if (percentage >= 50) return "bg-gradient-to-r from-blue-400 to-purple-500"
    return "bg-gradient-to-r from-green-400 to-blue-500"
  }

  return (
    <div className="space-y-4">
      {/* レベルアップ演出 */}
      {showLevelUp && (
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-bounce">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">レベルアップ！</h2>
            <p className="text-lg">レベル {level} になりました！</p>
          </CardContent>
        </Card>
      )}

      {/* 新バッジ演出 */}
      {showNewBadge && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">新しいバッジ獲得！</h2>
            <div className="text-4xl mb-2">{showNewBadge.icon}</div>
            <p className="text-lg font-semibold">{showNewBadge.name}</p>
            <p className="text-sm opacity-90">{showNewBadge.description}</p>
          </CardContent>
        </Card>
      )}

      {/* 経験値バー */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">レベル {level}</span>
            </div>
            <span className="text-sm text-gray-600">
              {experience} / {experienceToNext} EXP
            </span>
          </div>
          <div className="relative">
            <Progress value={(experience / experienceToNext) * 100} className="h-3" />
            <div
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getExpBarColor()}`}
              style={{ width: `${(experience / experienceToNext) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 最近のバッジ */}
      {badges.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              獲得バッジ
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.slice(-6).map((badge, index) => (
                <Badge
                  key={badge.id}
                  variant="secondary"
                  className={`
                    ${badge.rarity === "legendary" ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : ""}
                    ${badge.rarity === "epic" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : ""}
                    ${badge.rarity === "rare" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : ""}
                    ${badge.rarity === "common" ? "bg-gray-100 text-gray-800" : ""}
                  `}
                >
                  <span className="mr-1">{badge.icon}</span>
                  {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 進行中の実績 */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            チャレンジ中
          </h3>
          <div className="space-y-3">
            {achievements
              .filter((a) => !a.completed)
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-600 mb-1">{achievement.description}</div>
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-500">
                    {achievement.progress}/{achievement.maxProgress}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 今日の目標 */}
      <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            今日の目標
          </h3>
          <p className="text-sm opacity-90 mb-3">3つのゲームをプレイして50EXPを獲得しよう！</p>
          <Progress value={60} className="h-2 bg-white/20" />
          <div className="text-xs mt-1 opacity-75">進捗: 60%</div>
        </CardContent>
      </Card>
    </div>
  )
}
