"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Lock, User, Shield } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export default function AuthPage() {
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  // 既にログイン済みの場合は保護者ダッシュボードにリダイレクト
  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/parent"
    }
  }, [user, loading])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
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
        // ログイン成功時は保護者ダッシュボードにリダイレクト
        window.location.href = "/parent"
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
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })

      if (error) {
        alert(`登録エラー: ${error.message}`)
        return
      }

      if (data.user) {
        // メール確認が必要な場合
        if (!data.session) {
          alert("確認メールを送信しました。メールをチェックしてアカウントを有効化してください。")
        } else {
          // 即座にログインできる場合
          window.location.href = "/parent"
        }
      }
    } catch (error) {
      console.error("Sign up error:", error)
      alert("登録に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      alert("メールアドレスを入力してください")
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        alert(`エラー: ${error.message}`)
        return
      }

      alert("パスワードリセット用のメールを送信しました")
    } catch (error) {
      console.error("Password reset error:", error)
      alert("パスワードリセットに失敗しました")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white ml-4">保護者専用ログイン</h1>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">保護者ダッシュボード</CardTitle>
            <CardDescription>お子様の学習状況を詳しく管理できます</CardDescription>
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
                    {isLoading ? "ログイン中..." : "ダッシュボードにログイン"}
                  </Button>
                </form>

                <div className="text-center">
                  <Button variant="link" className="text-sm text-gray-600" onClick={handlePasswordReset}>
                    パスワードを忘れた方
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">お名前</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="田中太郎"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                    {isLoading ? "登録中..." : "アカウント作成"}
                  </Button>
                </form>

                <div className="text-xs text-gray-500 text-center">
                  登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">保護者ダッシュボードの機能</h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• お子様の詳細な学習進捗分析</li>
              <li>• プレイ時間の制限設定</li>
              <li>• ゲーム別パフォーマンス確認</li>
              <li>• 成長レポートの閲覧</li>
              <li>• 複数のお子様アカウント管理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
