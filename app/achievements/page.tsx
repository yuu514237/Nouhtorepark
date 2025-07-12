"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Star, Target, Award, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "games" | "time" | "score" | "special"
  rarity: "common" | "rare" | "epic" | "legendary"
  progress: number
  maxProgress: number
  completed: boolean
  completedAt?: string
  reward: {
    type: "badge" | "experience" | "avatar" | "title"
    value: string | number
  }
}

// 進捗計算 & ローカルストレージ同期
function getUpdatedAchievements(): Achievement[] {
  // --- 取得 ------------------------------
  const numberTouchScores = JSON.parse(localStorage.getItem("gameScores_number-touch") || "[]")
  const calculationRaceScores = JSON.parse(localStorage.getItem("gameScores_calculation-race") || "[]")
  const logicMazeScores = JSON.parse(localStorage.getItem("gameScores_logic-maze") || "[]")
  const playSessions = JSON.parse(localStorage.getItem("playSessions") || "[]")

  // --- 集計 ------------------------------
  const consecutiveDays = new Set(playSessions.map((s: any) => new Date(s.startTime).toDateString())).size

  const maxScore = Math.max(
    ...numberTouchScores.map((s: any) => s.score),
    ...calculationRaceScores.map((s: any) => s.score),
    ...logicMazeScores.map((s: any) => s.score),
    0,
  )

  const perfectGames =
    numberTouchScores.filter((s: any) => s.mistakes === 0).length +
    calculationRaceScores.filter((s: any) => s.accuracy === 100).length +
    logicMazeScores.filter((s: any) => s.mistakes === 0).length

  const speedClears =
    numberTouchScores.filter((s: any) => s.timeElapsed <= 10000).length +
    calculationRaceScores.filter((s: any) => s.correctAnswers >= 20).length +
    logicMazeScores.filter((s: any) => s.timeElapsed <= 10000).length

  const highAccuracyGames = calculationRaceScores.filter((s: any) => s.accuracy >= 90).length
  const calculationHighScores = calculationRaceScores.filter((s: any) => s.score >= 2000).length

  // --- 実績配列 ---------------------------
  return [
    {
      id: "first_game",
      title: "初めの一歩",
      description: "初めてゲームをプレイしよう",
      icon: "🎮",
      category: "games",
      rarity: "common",
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
      category: "games",
      rarity: "common",
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
      category: "games",
      rarity: "rare",
      progress: Math.min(5, highAccuracyGames),
      maxProgress: 5,
      completed: highAccuracyGames >= 5,
      reward: { type: "badge", value: "計算マスター" },
    },
    {
      id: "calculation_speed",
      title: "計算スピードスター",
      description: "計算レースで20問以上正解しよう",
      icon: "⚡",
      category: "games",
      rarity: "rare",
      progress: Math.min(
        20,
        calculationRaceScores.reduce((max: number, s: any) => Math.max(max, s.correctAnswers || 0), 0),
      ),
      maxProgress: 20,
      completed: calculationRaceScores.some((s: any) => s.correctAnswers >= 20),
      reward: { type: "badge", value: "高速計算" },
    },
    {
      id: "maze_navigator",
      title: "迷路の探検家",
      description: "論理迷路を5回クリアしよう",
      icon: "🗺️",
      category: "games",
      rarity: "common",
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
      category: "games",
      rarity: "epic",
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
      category: "games",
      rarity: "rare",
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
      category: "score",
      rarity: "common",
      progress: Math.min(1000, maxScore),
      maxProgress: 1000,
      completed: maxScore >= 1000,
      reward: { type: "experience", value: 50 },
    },
    {
      id: "calculation_master_score",
      title: "計算王",
      description: "計算レースで2000点以上を獲得しよう",
      icon: "👑",
      category: "score",
      rarity: "epic",
      progress: Math.min(
        2000,
        calculationRaceScores.reduce((max: number, s: any) => Math.max(max, s.score || 0), 0),
      ),
      maxProgress: 2000,
      completed: calculationHighScores > 0,
      reward: { type: "badge", value: "計算王" },
    },
    {
      id: "daily_player",
      title: "毎日の習慣",
      description: "7日連続でプレイしよう",
      icon: "📅",
      category: "time",
      rarity: "rare",
      progress: Math.min(7, consecutiveDays),
      maxProgress: 7,
      completed: consecutiveDays >= 7,
      reward: { type: "badge", value: "継続は力なり" },
    },
  ]
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [playerName, setPlayerName] = useState("プレイヤー")
  const [isClient, setIsClient] = useState(false)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setIsClient(true)
    const savedName = localStorage?.getItem("childName") || "プレイヤー"
    setPlayerName(savedName)

    // 最新の進捗をセット
    setAchievements(getUpdatedAchievements())
  }, [])

  // カテゴリーでフィルタリング
  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory === "all") return true
    if (selectedCategory === "completed") return achievement.completed
    if (selectedCategory === "in-progress") return !achievement.completed && achievement.progress > 0
    return achievement.category === selectedCategory
  })

  // レアリティ別の色設定
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 border-gray-300 text-gray-800"
      case "rare":
        return "bg-blue-100 border-blue-300 text-blue-800"
      case "epic":
        return "bg-purple-100 border-purple-300 text-purple-800"
      case "legendary":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  // レアリティ別のバッジ色
  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // 統計情報の計算
  const stats = {
    total: achievements.length,
    completed: achievements.filter((a) => a.completed).length,
    inProgress: achievements.filter((a) => !a.completed && a.progress > 0).length,
    locked: achievements.filter((a) => a.progress === 0).length,
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">実績</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{playerName}さんの実績</div>
            <div className="text-lg font-bold text-gray-800">
              {stats.completed}/{stats.total} 達成
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">達成済み</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">進行中</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Lock className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <div className="text-2xl font-bold text-gray-600">{stats.locked}</div>
              <div className="text-sm text-gray-600">未開始</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round((stats.completed / stats.total) * 100)}%
              </div>
              <div className="text-sm text-gray-600">達成率</div>
            </CardContent>
          </Card>
        </div>

        {/* 全体進捗バー */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">全体の進捗</h2>
              <Badge className="bg-yellow-500 text-white">
                {stats.completed}/{stats.total}
              </Badge>
            </div>
            <Progress value={(stats.completed / stats.total) * 100} className="h-4 mb-2" />
            <div className="text-sm text-gray-600 text-center">
              あと{stats.total - stats.completed}個の実績でコンプリート！
            </div>
          </CardContent>
        </Card>

        {/* フィルタータブ */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="completed">達成済み</TabsTrigger>
            <TabsTrigger value="in-progress">進行中</TabsTrigger>
            <TabsTrigger value="games">ゲーム</TabsTrigger>
            <TabsTrigger value="score">スコア</TabsTrigger>
            <TabsTrigger value="time">時間</TabsTrigger>
            <TabsTrigger value="special">特別</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 実績リスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all hover:scale-105 ${
                achievement.completed
                  ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-300"
                  : "bg-white/90 backdrop-blur-sm"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        achievement.completed ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {achievement.completed ? "✅" : achievement.progress > 0 ? achievement.icon : "🔒"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge className={getRarityBadgeColor(achievement.rarity)}>{achievement.rarity.toUpperCase()}</Badge>
                </div>

                {/* 進捗バー */}
                {!achievement.completed && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>進捗</span>
                      <span>
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                  </div>
                )}

                {/* 報酬情報 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      報酬:{" "}
                      {achievement.reward.type === "experience"
                        ? `${achievement.reward.value}EXP`
                        : achievement.reward.value}
                    </span>
                  </div>
                  {achievement.completed && achievement.completedAt && (
                    <div className="text-xs text-gray-500">
                      {new Date(achievement.completedAt).toLocaleDateString("ja-JP")}達成
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">該当する実績がありません</h3>
              <p className="text-gray-500">他のカテゴリーを確認してみてください。</p>
            </CardContent>
          </Card>
        )}

        {/* 特別な実績の紹介 */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-8 h-8" />
              <h2 className="text-xl font-bold">特別な実績に挑戦しよう！</h2>
            </div>
            <p className="mb-4 opacity-90">
              レアリティの高い実績を達成すると、特別なバッジやアバターがもらえます。
              毎日コツコツとゲームをプレイして、すべての実績をコンプリートしよう！
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20">🏆 レジェンダリー実績</Badge>
              <Badge className="bg-white/20">👑 特別アバター</Badge>
              <Badge className="bg-white/20">🎖️ 称号システム</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
