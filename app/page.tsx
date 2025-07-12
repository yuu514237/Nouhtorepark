"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Brain, Trophy, Star, User, Target, Hash, Mail, Lock, GamepadIcon, Calculator } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChildProfile } from "@/hooks/useChildProfile"
import { usePlayTimeManager } from "@/hooks/usePlayTimeManager"
import { MotivationSystem } from "@/components/MotivationSystem"
import { PlayTimeAlert } from "@/components/PlayTimeAlert"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const [showNameSetup, setShowNameSetup] = useState(false)
  const [tempName, setTempName] = useState("")
  const [tempAvatar, setTempAvatar] = useState("🦁")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [parentName, setParentName] = useState("")
  const { profile, loading, error, updateProfile } = useChildProfile()
  const playTimeManager = usePlayTimeManager(profile)
  const [currentUser, setCurrentUser] = useState(null)

  // ゲームのベストスコアを取得する関数
  const getGameBestScore = (gameType: string) => {
    if (!profile) return 0
    try {
      const gameScores = JSON.parse(localStorage.getItem(`gameScores_${gameType}`) || "[]")
      if (gameScores.length === 0) return 0
      return Math.max(...gameScores.map((score: any) => score.score))
    } catch (error) {
      console.error(`Error loading scores for ${gameType}:`, error)
      return 0
    }
  }

  const games = [
    {
      id: "number-touch",
      name: "数字タッチ",
      description: "1から9まで順番にタッチしよう！",
      icon: Hash,
      color: "bg-blue-500",
      bestScore: getGameBestScore("number-touch"),
      difficulty: "かんたん",
    },
    {
      id: "calculation-race",
      name: "計算レース",
      description: "60秒で計算問題をたくさん解こう！",
      icon: Calculator,
      color: "bg-orange-500",
      bestScore: getGameBestScore("calculation-race"),
      difficulty: "ふつう",
    },
    {
      id: "logic-maze",
      name: "論理迷路",
      description: "正しい道を選んでゴールしよう！",
      icon: Target,
      color: "bg-red-500",
      bestScore: getGameBestScore("logic-maze"),
      difficulty: "むずかしい",
    },
  ]

  // 認証状態の監視（Supabase設定時のみ）
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCurrentUser(null)
      return
    }

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setCurrentUser(session?.user || null)
      } catch (error) {
        console.warn("Session check failed:", error)
        setCurrentUser(null)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      alert("Supabaseが設定されていません。後で設定してください。")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(`ログインエラー: ${error.message}`)
        return
      }

      if (data.user) {
        setCurrentUser(data.user)
        setShowAuth(false)
        if (!profile?.name) {
          setShowNameSetup(true)
        }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      alert("ログインに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      alert("Supabaseが設定されていません。後で設定してください。")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: parentName,
          },
        },
      })

      if (error) {
        alert(`登録エラー: ${error.message}`)
        return
      }

      if (data.user) {
        if (!data.session) {
          alert("確認メールを送信しました。メールをチェックしてアカウントを有効化してください。")
        } else {
          setCurrentUser(data.user)
          setShowAuth(false)
          setShowNameSetup(true)
        }
      }
    } catch (error) {
      console.error("Sign up error:", error)
      alert("登録に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!tempName.trim()) return

    try {
      // ローカルストレージに直接保存
      localStorage.setItem("childName", tempName)
      localStorage.setItem("childAvatar", tempAvatar)

      // プロフィールを作成/更新
      await updateProfile({ name: tempName, avatar: tempAvatar })

      // 名前設定画面を閉じる
      setShowNameSetup(false)

      // 少し待ってからリロード
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error("Profile save error:", error)
      alert("プロフィールの保存に失敗しました")
    }
  }

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setCurrentUser(null)
  }

  const handleShareProfile = async () => {
    if (!profile) return

    const shareText = `${profile.name}さんの のうトレパーク成績\nレベル: ${profile.level}\n総スコア: ${profile.totalScore.toLocaleString()}\nバッジ: ${profile.badges.length}個`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "のうトレパーク - 成績シェア",
          text: shareText,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        alert("成績をクリップボードにコピーしました！")
      } catch (error) {
        console.error("Copy failed:", error)
        const textArea = document.createElement("textarea")
        textArea.value = shareText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        alert("成績をクリップボードにコピーしました！")
      }
    }
  }

  // エラーハンドリング
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">エラーが発生しました</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              ページを再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  // 子供のプロフィール設定画面（最優先で表示）
  if (showNameSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">プロフィールを作ろう！</CardTitle>
            <CardDescription>きみの名前とアバターを選んでね</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="child-name" className="text-sm font-medium text-gray-700">
                なまえ
              </Label>
              <Input
                id="child-name"
                type="text"
                placeholder="なまえを入力してね"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="mt-1 text-lg"
                maxLength={10}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">アバター</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {["🦁", "🐱", "🐶", "🐸", "🐼", "🦊"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setTempAvatar(emoji)}
                    className={`w-16 h-16 rounded-full border-2 text-2xl transition-all ${
                      tempAvatar === emoji
                        ? "border-blue-500 bg-blue-50 scale-110"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveName}
              disabled={!tempName.trim()}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
            >
              <User className="w-5 h-5 mr-2" />
              ゲーム開始！
            </Button>

            <Button variant="outline" onClick={() => setShowNameSetup(false)} className="w-full">
              戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 認証画面（Supabase設定時のみ表示）
  if (isSupabaseConfigured && showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">のうトレパーク</CardTitle>
            <CardDescription>アカウントでログインしてデータを保存</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">ログイン</TabsTrigger>
                <TabsTrigger value="signup">新規登録</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">メールアドレス</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="parent@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">パスワード</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "ログイン中..." : "ログイン"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">保護者のお名前</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="田中太郎"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">メールアドレス</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="parent@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">パスワード</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="8文字以上"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "登録中..." : "新規登録"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center space-y-2">
              <Button variant="outline" onClick={() => setShowAuth(false)} className="text-sm">
                戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // プロフィールがない場合の初期画面
  if (!profile?.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">のうトレパーク</CardTitle>
            <CardDescription>楽しく遊んで脳を鍛えよう！</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSupabaseConfigured && !showAuth && (
              <>
                <Button
                  onClick={() => setShowAuth(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-6"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  アカウントでログイン
                </Button>
                <div className="text-center text-sm text-gray-600">または</div>
              </>
            )}

            <Button
              onClick={() => {
                console.log("ゲームを始めるボタンがクリックされました")
                setShowNameSetup(true)
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
            >
              <GamepadIcon className="w-5 h-5 mr-2" />
              ゲームを始める
            </Button>

            {isSupabaseConfigured && (
              <div className="text-center">
                <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-800">
                  保護者の方はこちら
                </Link>
              </div>
            )}

            {!isSupabaseConfigured && (
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  現在はオフラインモードです。
                  <br />
                  データはブラウザに保存されます。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // メインゲーム画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">のうトレパーク</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">今日のプレイ時間</div>
              <div className="text-lg font-bold text-gray-800">
                {profile.todayPlayTime}分 / {profile.maxPlayTime}分
              </div>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-2xl">{profile.avatar}</AvatarFallback>
            </Avatar>
            {isSupabaseConfigured && currentUser && (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:text-gray-800">
                ログアウト
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {profile && (
          <>
            <MotivationSystem
              level={profile.level}
              experience={profile.experience}
              experienceToNext={profile.experienceToNext}
              badges={profile.badges}
            />

            <PlayTimeAlert
              timeRemaining={playTimeManager.timeRemaining}
              showWarning={playTimeManager.showTimeWarning}
              isTimeUp={playTimeManager.isTimeUp}
              onEndSession={() => {
                playTimeManager.endSession()
              }}
            />
          </>
        )}

        {/* User Stats */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{profile.name}さん</h2>
                <p className="text-gray-600">レベル {profile.level}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">総スコア</div>
                <div className="text-2xl font-bold text-yellow-600">{profile.totalScore.toLocaleString()}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>次のレベルまで</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, index) => (
                <Badge key={badge.id || index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${game.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <game.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant={game.bestScore > 0 ? "default" : "secondary"}>{game.difficulty}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2">{game.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{game.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">ベストスコア</div>
                      <div className="font-bold text-gray-800">
                        {game.bestScore > 0 ? game.bestScore.toLocaleString() : "未プレイ"}
                      </div>
                    </div>
                    <Link href={`/games/${game.id}`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        プレイ
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/profile">
              <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-semibold text-gray-800">プロフィール</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/achievements">
              <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="font-semibold text-gray-800">実績</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <Card className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 text-white">
          <CardContent className="p-4 text-center">
            <h3 className="font-bold mb-2">成績をシェアしよう！</h3>
            <Button
              onClick={handleShareProfile}
              variant="outline"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              成績をシェア
            </Button>
          </CardContent>
        </Card>

        {/* Parent Dashboard Link - Supabase設定時のみ表示 */}
        {isSupabaseConfigured && (
          <Card className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">保護者の方へ</h3>
              <p className="mb-4 opacity-90">お子様の学習進捗や設定を管理できます</p>
              <Link href="/parent">
                <Button variant="outline" className="bg-white text-purple-600 hover:bg-gray-100">
                  保護者ダッシュボードを開く
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* オフラインモード表示 */}
        {!isSupabaseConfigured && (
          <Card className="mt-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">オフラインモード</h3>
              <p className="mb-2 opacity-90">現在はブラウザにデータを保存しています</p>
              <p className="text-sm opacity-75">アカウント機能を使用するには、Supabaseの設定が必要です</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
