"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  TrendingUp,
  Clock,
  Settings,
  Plus,
  BarChart3,
  Calendar,
  Trophy,
  Target,
  Brain,
  LogOut,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useAuth } from "@/hooks/useAuth"
import { useParentAnalytics } from "@/hooks/useParentAnalytics"
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"

export default function ParentDashboard() {
  const { user, loading, signOut } = useAuth()
  const { analyticsData, timeSettings, saveTimeSettings, refreshData } = useParentAnalytics()
  const [selectedChild, setSelectedChild] = useState("child1")
  const [isSaving, setIsSaving] = useState(false)

  // 時間設定の保存処理
  const handleTimeSettingsChange = async (newSettings: any) => {
    setIsSaving(true)
    try {
      const success = await saveTimeSettings(newSettings)
      if (success) {
        alert("設定を保存しました")
      } else {
        alert("設定の保存に失敗しました")
      }
    } catch (error) {
      alert("設定の保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  // 認証チェック
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/auth"
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return null // リダイレクト中
  }

  // Mock data - in real app this would come from Supabase
  const children = [
    {
      id: "child1",
      name: "たろう",
      avatar: "🦁",
      age: 7,
      level: 5,
      totalScore: 1250,
      todayPlayTime: 15,
      weeklyPlayTime: 85,
      maxDailyTime: 30,
      lastPlayed: "今日",
      badges: 3,
      favoriteGame: "数字タッチ",
    },
    {
      id: "child2",
      name: "はなこ",
      avatar: "🐱",
      age: 8,
      level: 7,
      totalScore: 1850,
      todayPlayTime: 22,
      weeklyPlayTime: 120,
      maxDailyTime: 45,
      lastPlayed: "今日",
      badges: 5,
      favoriteGame: "絵合わせ",
    },
  ]

  // 実際のプロフィールデータを取得
  const getChildProfile = () => {
    try {
      const profile = JSON.parse(localStorage.getItem("childProfile") || "{}")
      return {
        id: profile.id || "child1",
        name: profile.name || "お子様",
        avatar: profile.avatar || "🦁",
        age: profile.age || 7,
        level: profile.level || 1,
        totalScore: profile.totalScore || 0,
        todayPlayTime: profile.todayPlayTime || 0,
        weeklyPlayTime: analyticsData?.totalPlayTime || 0,
        maxDailyTime: timeSettings.dailyTimeLimit,
        lastPlayed: "今日",
        badges: profile.badges?.length || 0,
        favoriteGame: analyticsData?.favoriteGame || "未プレイ",
      }
    } catch {
      return {
        id: "child1",
        name: "お子様",
        avatar: "🦁",
        age: 7,
        level: 1,
        totalScore: 0,
        todayPlayTime: 0,
        weeklyPlayTime: 0,
        maxDailyTime: 30,
        lastPlayed: "未プレイ",
        badges: 0,
        favoriteGame: "未プレイ",
      }
    }
  }

  const currentChild = getChildProfile()

  // Mock score data for charts
  const scoreData = [
    { date: "1/1", score: 450 },
    { date: "1/2", score: 520 },
    { date: "1/3", score: 480 },
    { date: "1/4", score: 650 },
    { date: "1/5", score: 720 },
    { date: "1/6", score: 680 },
    { date: "1/7", score: 850 },
  ]

  const gameData = [
    { game: "数字タッチ", plays: 15, avgScore: 750 },
    { game: "絵合わせ", plays: 12, avgScore: 680 },
    { game: "音まね", plays: 3, avgScore: 420 },
    { game: "論理迷路", plays: 8, avgScore: 590 },
  ]

  const playTimeData = [
    { day: "月", time: 25 },
    { day: "火", time: 18 },
    { day: "水", time: 30 },
    { day: "木", time: 12 },
    { day: "金", time: 28 },
    { day: "土", time: 35 },
    { day: "日", time: 22 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">のうトレパーク</h1>
              <p className="text-sm text-gray-600">保護者ダッシュボード</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Children Selection */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  お子様の管理
                </CardTitle>
                <CardDescription>お子様を選択して詳細を確認</CardDescription>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                子供を追加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <Card
                  key={child.id}
                  className={`cursor-pointer transition-all ${
                    selectedChild === child.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedChild(child.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-2xl">{child.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{child.name}</h3>
                        <p className="text-sm text-gray-600">
                          {child.age}歳 • レベル {child.level}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="secondary">{child.badges}個のバッジ</Badge>
                          <span className="text-xs text-gray-500">最終プレイ: {child.lastPlayed}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{child.totalScore}</div>
                        <div className="text-xs text-gray-500">総スコア</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Child Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-500" />
                <Badge variant={currentChild.todayPlayTime > currentChild.maxDailyTime ? "destructive" : "default"}>
                  今日
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>プレイ時間</span>
                  <span>
                    {currentChild.todayPlayTime}/{currentChild.maxDailyTime}分
                  </span>
                </div>
                <Progress value={(currentChild.todayPlayTime / currentChild.maxDailyTime) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <Badge variant="secondary">今週</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-800">{currentChild.weeklyPlayTime}分</div>
                <div className="text-sm text-gray-600">週間プレイ時間</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <Badge variant="secondary">お気に入り</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-gray-800">{currentChild.favoriteGame}</div>
                <div className="text-sm text-gray-600">最もプレイしているゲーム</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="progress">学習進捗</TabsTrigger>
            <TabsTrigger value="analytics">詳細分析</TabsTrigger>
            <TabsTrigger value="games">ゲーム分析</TabsTrigger>
            <TabsTrigger value="time">時間管理</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsData ? (
              <AnalyticsDashboard data={analyticsData} childName={currentChild.name} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">分析データを読み込み中...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  スコア推移
                </CardTitle>
                <CardDescription>過去7日間のスコア変化</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>成長指標</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">記憶力</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-20 h-2" />
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">反射神経</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">論理思考</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-20 h-2" />
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">集中力</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={90} className="w-20 h-2" />
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>今週の実績</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">ゲーム完了数</span>
                    </div>
                    <span className="font-bold">38回</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">新しいバッジ</span>
                    </div>
                    <span className="font-bold">2個</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm">平均スコア</span>
                    </div>
                    <span className="font-bold">685点</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">連続プレイ日数</span>
                    </div>
                    <span className="font-bold">5日</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ゲーム別パフォーマンス</CardTitle>
                <CardDescription>各ゲームのプレイ回数と平均スコア</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gameData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="game" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="plays" fill="#3b82f6" name="プレイ回数" />
                    <Bar dataKey="avgScore" fill="#10b981" name="平均スコア" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            {analyticsData && (
              <Card>
                <CardHeader>
                  <CardTitle>週間プレイ時間</CardTitle>
                  <CardDescription>1日あたりのプレイ時間推移</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="playTime" fill="#8b5cf6" name="プレイ時間（分）" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>時間制限設定</CardTitle>
                <CardDescription>お子様のプレイ時間を管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">1日の制限時間</label>
                    <div className="mt-1">
                      <select
                        className="w-full p-2 border rounded-md"
                        value={timeSettings.dailyTimeLimit}
                        onChange={(e) =>
                          handleTimeSettingsChange({
                            ...timeSettings,
                            dailyTimeLimit: Number.parseInt(e.target.value),
                          })
                        }
                      >
                        <option value={15}>15分</option>
                        <option value={30}>30分</option>
                        <option value={45}>45分</option>
                        <option value={60}>60分</option>
                        <option value={90}>90分</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">プレイ可能時間</label>
                    <div className="mt-1">
                      <select
                        className="w-full p-2 border rounded-md"
                        value={timeSettings.playSchedule}
                        onChange={(e) =>
                          handleTimeSettingsChange({
                            ...timeSettings,
                            playSchedule: e.target.value as "anytime" | "after-school" | "weekend",
                          })
                        }
                      >
                        <option value="anytime">いつでも</option>
                        <option value="after-school">放課後のみ</option>
                        <option value="weekend">週末のみ</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={timeSettings.notificationsEnabled}
                    onChange={(e) =>
                      handleTimeSettingsChange({
                        ...timeSettings,
                        notificationsEnabled: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="notifications" className="text-sm">
                    通知を有効にする
                  </label>
                </div>
                <Button className="w-full" disabled={isSaving} onClick={() => alert("設定は自動保存されています")}>
                  {isSaving ? "保存中..." : "設定確認"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>アカウント設定</CardTitle>
                <CardDescription>お子様のアカウント情報を管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ニックネーム</label>
                    <input type="text" defaultValue={currentChild.name} className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">年齢</label>
                    <input
                      type="number"
                      defaultValue={currentChild.age}
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">アバター</label>
                  <div className="mt-2 flex space-x-2">
                    {["🦁", "🐱", "🐶", "🐸", "🐼", "🦊"].map((emoji) => (
                      <button
                        key={emoji}
                        className={`w-12 h-12 rounded-full border-2 text-xl ${
                          currentChild.avatar === emoji ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full">変更を保存</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
