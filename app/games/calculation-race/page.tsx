"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, RotateCcw, Trophy, Calculator, Zap } from "lucide-react"
import Link from "next/link"

interface Problem {
  question: string
  answer: number
  options: number[]
  userAnswer?: number
  isCorrect?: boolean
}

export default function CalculationRaceGame() {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready")
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [problemIndex, setProblemIndex] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalProblems, setTotalProblems] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60) // 60秒制限
  const [startTime, setStartTime] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [playerName, setPlayerName] = useState("プレイヤー")
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [level, setLevel] = useState(1) // 1: 一桁, 2: 二桁, 3: 混合
  const [streak, setStreak] = useState(0) // 連続正解数
  const [maxStreak, setMaxStreak] = useState(0)

  // 問題生成関数
  const generateProblem = useCallback((): Problem => {
    let num1: number, num2: number, operation: string, answer: number, question: string

    if (level === 1) {
      // レベル1: 一桁の足し算・引き算
      num1 = Math.floor(Math.random() * 9) + 1
      num2 = Math.floor(Math.random() * 9) + 1
      operation = Math.random() > 0.5 ? "+" : "-"

      if (operation === "+") {
        answer = num1 + num2
        question = `${num1} + ${num2}`
      } else {
        // 引き算の場合、答えが負にならないように調整
        if (num1 < num2) [num1, num2] = [num2, num1]
        answer = num1 - num2
        question = `${num1} - ${num2}`
      }
    } else if (level === 2) {
      // レベル2: 二桁の足し算・引き算
      num1 = Math.floor(Math.random() * 90) + 10
      num2 = Math.floor(Math.random() * 90) + 10
      operation = Math.random() > 0.5 ? "+" : "-"

      if (operation === "+") {
        answer = num1 + num2
        question = `${num1} + ${num2}`
      } else {
        if (num1 < num2) [num1, num2] = [num2, num1]
        answer = num1 - num2
        question = `${num1} - ${num2}`
      }
    } else {
      // レベル3: 混合（掛け算も含む）
      const operations = ["+", "-", "×"]
      operation = operations[Math.floor(Math.random() * operations.length)]

      if (operation === "×") {
        num1 = Math.floor(Math.random() * 9) + 1
        num2 = Math.floor(Math.random() * 9) + 1
        answer = num1 * num2
        question = `${num1} × ${num2}`
      } else {
        num1 = Math.floor(Math.random() * 50) + 1
        num2 = Math.floor(Math.random() * 50) + 1

        if (operation === "+") {
          answer = num1 + num2
          question = `${num1} + ${num2}`
        } else {
          if (num1 < num2) [num1, num2] = [num2, num1]
          answer = num1 - num2
          question = `${num1} - ${num2}`
        }
      }
    }

    // 選択肢を生成（正解 + ダミー2つ）
    const options = [answer]
    while (options.length < 3) {
      const dummy = answer + (Math.floor(Math.random() * 6) - 3) // ±3の範囲でダミー
      if (dummy !== answer && dummy >= 0 && !options.includes(dummy)) {
        options.push(dummy)
      }
    }

    // 選択肢をシャッフル
    options.sort(() => Math.random() - 0.5)

    return { question, answer, options }
  }, [level])

  // ベストスコアを読み込む関数
  const loadBestScore = useCallback(() => {
    if (typeof window === "undefined") return

    const gameScores = JSON.parse(localStorage.getItem("gameScores_calculation-race") || "[]")
    if (gameScores.length > 0) {
      const best = Math.max(...gameScores.map((score: any) => score.score))
      setBestScore(best)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsClient(true)
      const savedName = localStorage?.getItem("childName") || "プレイヤー"
      setPlayerName(savedName)
      loadBestScore()
      setIsLoading(false)
    }

    loadData()
  }, [loadBestScore])

  // タイマー管理
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState, timeLeft])

  // 次の問題を生成
  const nextProblem = useCallback(() => {
    const newProblem = generateProblem()
    setCurrentProblem(newProblem)
    setProblemIndex((prev) => prev + 1)
  }, [generateProblem])

  // 答えを選択
  const selectAnswer = (selectedAnswer: number) => {
    if (!currentProblem || gameState !== "playing") return

    const isCorrect = selectedAnswer === currentProblem.answer
    setTotalProblems((prev) => prev + 1)

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
      setStreak((prev) => {
        const newStreak = prev + 1
        setMaxStreak((maxPrev) => Math.max(maxPrev, newStreak))
        return newStreak
      })
    } else {
      setStreak(0)
    }

    // 次の問題へ
    setTimeout(() => {
      nextProblem()
    }, 500)
  }

  // ゲーム終了
  const finishGame = () => {
    const timeElapsed = 60 - timeLeft

    // スコア計算
    const accuracyBonus = totalProblems > 0 ? (correctAnswers / totalProblems) * 500 : 0
    const speedBonus = correctAnswers * 50
    const streakBonus = maxStreak * 20
    const levelBonus = level * 100
    const calculatedScore = Math.floor(accuracyBonus + speedBonus + streakBonus + levelBonus)

    setScore(calculatedScore)
    setGameState("finished")

    // スコア保存
    const gameScore = {
      id: `score_${Date.now()}`,
      score: calculatedScore,
      correctAnswers,
      totalProblems,
      accuracy: totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0,
      maxStreak,
      level,
      timeElapsed,
      playedAt: new Date().toISOString(),
    }

    const existingScores = JSON.parse(localStorage.getItem("gameScores_calculation-race") || "[]")
    existingScores.push(gameScore)
    localStorage.setItem("gameScores_calculation-race", JSON.stringify(existingScores))

    // ベストスコア更新
    if (calculatedScore > bestScore) {
      setBestScore(calculatedScore)
    }

    // プロフィール総スコア更新
    const currentProfile = JSON.parse(localStorage.getItem("childProfile") || "{}")
    if (currentProfile.id) {
      currentProfile.totalScore = (currentProfile.totalScore || 0) + calculatedScore
      localStorage.setItem("childProfile", JSON.stringify(currentProfile))
    }
  }

  const startGame = () => {
    setGameState("playing")
    setStartTime(Date.now())
    setTimeLeft(60)
    setCorrectAnswers(0)
    setTotalProblems(0)
    setProblemIndex(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    nextProblem()
  }

  const resetGame = () => {
    setGameState("ready")
    setStartTime(null)
    setTimeLeft(60)
    setCorrectAnswers(0)
    setTotalProblems(0)
    setProblemIndex(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setCurrentProblem(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white ml-4">計算レース</h1>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">計算レースゲーム</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-600">60秒でできるだけ多くの計算問題を解こう！</p>
                <p className="text-sm text-gray-500">正確性とスピードが重要です</p>
              </div>

              {/* レベル選択 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">難易度を選択</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { level: 1, name: "かんたん", desc: "一桁の計算" },
                    { level: 2, name: "ふつう", desc: "二桁の計算" },
                    { level: 3, name: "むずかしい", desc: "掛け算も含む" },
                  ].map((option) => (
                    <button
                      key={option.level}
                      onClick={() => setLevel(option.level)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        level === option.level
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-orange-300"
                      }`}
                    >
                      <div className="font-semibold">{option.name}</div>
                      <div className="text-xs text-gray-600">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{bestScore}</div>
                  <div className="text-sm text-gray-600">ベストスコア</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">60秒</div>
                  <div className="text-sm text-gray-600">制限時間</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">
                    {level === 1 ? "★☆☆" : level === 2 ? "★★☆" : "★★★"}
                  </div>
                  <div className="text-sm text-gray-600">難易度</div>
                </div>
              </div>

              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                ゲームスタート
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameState === "finished") {
    const isNewRecord = score > bestScore
    const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white ml-4">ゲーム終了</h1>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">
                {playerName}さん、{isNewRecord ? "新記録達成！" : "お疲れ様！"}
              </CardTitle>
              {isNewRecord && <Badge className="bg-yellow-500 text-white">NEW RECORD</Badge>}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{score}</div>
                <div className="text-gray-600">スコア</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">正解数</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">正解率</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{totalProblems}</div>
                  <div className="text-sm text-gray-600">挑戦数</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-pink-600">{maxStreak}</div>
                  <div className="text-sm text-gray-600">最大連続</div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  もう一度プレイ
                </Button>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    ホームに戻る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white ml-4">計算レース</h1>
          </div>
          <Button onClick={resetGame} variant="ghost" className="text-white hover:bg-white/20">
            <RotateCcw className="w-5 h-5 mr-2" />
            リセット
          </Button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{timeLeft}</div>
              <div className="text-sm text-gray-600">残り時間</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">正解数</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalProblems}</div>
              <div className="text-sm text-gray-600">挑戦数</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{streak}</div>
              <div className="text-sm text-gray-600">連続正解</div>
            </CardContent>
          </Card>
        </div>

        {/* Time Progress Bar */}
        <Card className="bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <Progress value={(timeLeft / 60) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Problem Area */}
        {currentProblem && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-sm text-gray-600 mb-2">問題 {problemIndex}</div>
                <div className="text-6xl font-bold text-gray-800 mb-6">{currentProblem.question}</div>
                <div className="text-lg text-gray-600">答えを選んでください</div>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {currentProblem.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => selectAnswer(option)}
                    className="h-20 text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {streak > 0 && (
                <div className="text-center mt-6">
                  <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                    <Zap className="w-4 h-4 mr-1" />
                    {streak}連続正解！
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
