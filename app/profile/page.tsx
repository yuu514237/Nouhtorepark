"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, User, Save, Trophy, Star, Edit3 } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🦁")
  const [originalName, setOriginalName] = useState("")
  const [originalAvatar, setOriginalAvatar] = useState("🦁")
  const [isClient, setIsClient] = useState(false)
  const [profile, setProfile] = useState<{
    level: number
    totalScore: number
    badges: any[]
    todayPlayTime: number
    name: string
  } | null>(null)

  // クライアントサイドでのみlocalStorageにアクセス
  useEffect(() => {
    setIsClient(true)
    const savedName = localStorage.getItem("childName") || "たろう"
    const savedAvatar = localStorage.getItem("childAvatar") || "🦁"
    setName(savedName)
    setAvatar(savedAvatar)
    setOriginalName(savedName)
    setOriginalAvatar(savedAvatar)

    // モックのプロフィールデータを設定
    setProfile({
      name: savedName,
      level: 5,
      totalScore: 1250,
      badges: [
        { name: "初心者", description: "初めてゲームをクリア", icon: "🏆" },
        { name: "集中力マスター", description: "5回連続でミスなしクリア", icon: "🎯" },
        { name: "スピードスター", description: "10秒以内でクリア", icon: "⚡" },
      ],
      todayPlayTime: 15,
    })
  }, [])

  const handleSave = () => {
    if (name.trim() && isClient) {
      localStorage.setItem("childName", name)
      localStorage.setItem("childAvatar", avatar)
      setOriginalName(name)
      setOriginalAvatar(avatar)
      setIsEditing(false)
      setProfile({ ...profile, name: name })
    }
  }

  const handleCancel = () => {
    setName(originalName)
    setAvatar(originalAvatar)
    setIsEditing(false)
  }

  // クライアントサイドでレンダリングされるまでローディング表示
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  // ゲーム別ベストスコアを取得する関数
  const getGameBestScores = () => {
    if (typeof window === "undefined") return {}

    const games = ["number-touch", "memory-match", "logic-maze"]
    const gameNames = ["数字タッチ", "絵合わせ", "論理迷路"]
    const bestScores: { [key: string]: number } = {}

    games.forEach((gameType, index) => {
      const gameScores = JSON.parse(localStorage.getItem(`gameScores_${gameType}`) || "[]")
      bestScores[gameNames[index]] =
        gameScores.length > 0 ? Math.max(...gameScores.map((score: any) => score.score)) : 0
    })

    return bestScores
  }

  // userStatsを動的に計算
  const userStats = {
    level: profile?.level || 1,
    totalScore: profile?.totalScore || 0,
    badges: profile?.badges || [],
    gamesPlayed: 38, // これは後で実際のデータから計算
    bestScores: getGameBestScores(),
    playTime: {
      today: profile?.todayPlayTime || 0,
      thisWeek: 85, // これは後で実際のデータから計算
      total: 420, // これは後で実際のデータから計算
    },
  }

  const availableAvatars = ["🦁", "🐱", "🐶", "🐸", "🐼", "🦊", "🐻", "🐰", "🐯", "🐨"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">プロフィール</h1>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Edit3 className="w-4 h-4 mr-2" />
              編集
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Card */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarFallback className="text-4xl bg-gradient-to-br from-yellow-400 to-orange-500">
                  {avatar}
                </AvatarFallback>
              </Avatar>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">なまえ</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="なまえを入力してね"
                    className="text-center text-xl font-bold"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">アバター</label>
                  <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                    {availableAvatars.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className={`w-12 h-12 rounded-full border-2 text-xl transition-all ${
                          avatar === emoji
                            ? "border-blue-500 bg-blue-50 scale-110"
                            : "border-gray-300 hover:border-blue-300 hover:scale-105"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="text-3xl font-bold text-gray-800">{profile?.name || "プレイヤー"}さん</CardTitle>
                <CardDescription className="text-lg">レベル {profile?.level || 1}</CardDescription>
              </>
            )}
          </CardHeader>

          {!isEditing && (
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {(profile?.totalScore || 0).toLocaleString()}
                </div>
                <div className="text-gray-600">総スコア</div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>次のレベルまで</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{userStats.gamesPlayed}</div>
                  <div className="text-sm text-gray-600">ゲーム数</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{profile?.badges?.length || 0}</div>
                  <div className="text-sm text-gray-600">バッジ</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{userStats.playTime.total}</div>
                  <div className="text-sm text-gray-600">総プレイ時間</div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {!isEditing && (
          <>
            {/* Badges */}
            <Card className="mb-6 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  獲得バッジ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{badge.name}</div>
                        <div className="text-sm text-gray-600">{badge.description}</div>
                      </div>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Best Scores */}
            <Card className="mb-6 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-500" />
                  ベストスコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(userStats.bestScores).map(([game, score]) => (
                    <div key={game} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-gray-800">{game}</div>
                      <div className="text-lg font-bold text-blue-600">
                        {score > 0 ? score.toLocaleString() : "未プレイ"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Play Time Stats */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-500" />
                  プレイ記録
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{userStats.playTime.today}分</div>
                    <div className="text-sm text-gray-600">今日</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{userStats.playTime.thisWeek}分</div>
                    <div className="text-sm text-gray-600">今週</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{userStats.playTime.total}分</div>
                    <div className="text-sm text-gray-600">合計</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
