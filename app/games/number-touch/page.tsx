"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, RotateCcw, Trophy, Target } from "lucide-react"
import Link from "next/link"

export default function NumberTouchGame() {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready")
  const [currentNumber, setCurrentNumber] = useState(1)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [playerName, setPlayerName] = useState("プレイヤー")
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Generate random positions for numbers 1-9
  const [numberPositions, setNumberPositions] = useState<{ [key: number]: { x: number; y: number } }>({})

  const generatePositions = useCallback(() => {
    const positions: { [key: number]: { x: number; y: number } } = {}
    const usedPositions: { x: number; y: number }[] = []

    for (let i = 1; i <= 9; i++) {
      let x, y
      let attempts = 0
      do {
        x = Math.random() * 80 // 0-80% to keep within bounds
        y = Math.random() * 80
        attempts++
      } while (attempts < 50 && usedPositions.some((pos) => Math.abs(pos.x - x) < 15 || Math.abs(pos.y - y) < 15))

      positions[i] = { x, y }
      usedPositions.push({ x, y })
    }

    setNumberPositions(positions)
  }, [])

  // ベストスコアを読み込む関数
  const loadBestScore = useCallback(() => {
    if (typeof window === "undefined") return

    const gameScores = JSON.parse(localStorage.getItem("gameScores_number-touch") || "[]")
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
      generatePositions()
      setIsLoading(false)
    }

    loadData()
  }, [generatePositions, loadBestScore])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === "playing" && startTime) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime)
      }, 10)
    }
    return () => clearInterval(interval)
  }, [gameState, startTime])

  const startGame = () => {
    setGameState("playing")
    setCurrentNumber(1)
    setStartTime(Date.now())
    setEndTime(null)
    setScore(0)
    setMistakes(0)
    setTimeElapsed(0)
    generatePositions()
  }

  const handleNumberClick = (number: number) => {
    if (gameState !== "playing") return

    if (number === currentNumber) {
      if (number === 9) {
        // Game completed
        const finalTime = Date.now()
        setEndTime(finalTime)
        const totalTime = finalTime - (startTime || 0)
        const calculatedScore = Math.max(1000 - Math.floor(totalTime / 10) - mistakes * 100, 100)
        setScore(calculatedScore)
        setGameState("finished")

        // スコアをlocalStorageに保存
        const gameScore = {
          id: `score_${Date.now()}`,
          score: calculatedScore,
          timeElapsed: totalTime,
          mistakes: mistakes,
          playedAt: new Date().toISOString(),
        }

        const existingScores = JSON.parse(localStorage.getItem("gameScores_number-touch") || "[]")
        existingScores.push(gameScore)
        localStorage.setItem("gameScores_number-touch", JSON.stringify(existingScores))

        // ベストスコア更新
        if (calculatedScore > bestScore) {
          setBestScore(calculatedScore)
        }

        // プロフィールの総スコアを更新
        const currentProfile = JSON.parse(localStorage.getItem("childProfile") || "{}")
        if (currentProfile.id) {
          currentProfile.totalScore = (currentProfile.totalScore || 0) + calculatedScore
          localStorage.setItem("childProfile", JSON.stringify(currentProfile))
        }
      } else {
        setCurrentNumber(currentNumber + 1)
      }
    } else {
      setMistakes(mistakes + 1)
    }
  }

  const resetGame = () => {
    setGameState("ready")
    setCurrentNumber(1)
    setStartTime(null)
    setEndTime(null)
    setScore(0)
    setMistakes(0)
    setTimeElapsed(0)
  }

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2)
  }

  // クライアントサイドでレンダリングされるまでローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white ml-4">数字タッチ</h1>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">数字タッチゲーム</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-600">1から9まで順番にタッチしよう！</p>
                <p className="text-sm text-gray-500">速く正確にタッチするほど高得点！</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{bestScore}</div>
                  <div className="text-sm text-gray-600">ベストスコア</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">9</div>
                  <div className="text-sm text-gray-600">数字の数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">★★☆</div>
                  <div className="text-sm text-gray-600">難易度</div>
                </div>
              </div>

              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 text-lg"
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

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
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
                {playerName}さん、{isNewRecord ? "新記録達成！" : "ゲーム完了！"}
              </CardTitle>
              {isNewRecord && <Badge className="bg-yellow-500 text-white">NEW RECORD</Badge>}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{score}</div>
                <div className="text-gray-600">スコア</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-600">{formatTime(timeElapsed)}秒</div>
                  <div className="text-sm text-gray-600">クリア時間</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">{mistakes}</div>
                  <div className="text-sm text-gray-600">ミス回数</div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  もう一度プレイ
                </Button>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white ml-4">数字タッチ</h1>
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
              <div className="text-2xl font-bold text-blue-600">{currentNumber}</div>
              <div className="text-sm text-gray-600">次の数字</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-gray-600">経過時間</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{mistakes}</div>
              <div className="text-sm text-gray-600">ミス</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{currentNumber - 1}/9</div>
              <div className="text-sm text-gray-600">進捗</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <Progress value={((currentNumber - 1) / 9) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Game Area */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300">
              {Object.entries(numberPositions).map(([num, pos]) => {
                const number = Number.parseInt(num)
                const isNext = number === currentNumber
                const isCompleted = number < currentNumber

                return (
                  <button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={`absolute w-16 h-16 rounded-full font-bold text-xl transition-all duration-200 transform hover:scale-110 ${
                      isCompleted
                        ? "bg-green-500 text-white cursor-default"
                        : isNext
                          ? "bg-yellow-400 text-gray-800 animate-pulse shadow-lg"
                          : "bg-white text-gray-800 border-2 border-gray-300 hover:border-blue-400"
                    }`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                    }}
                    disabled={isCompleted}
                  >
                    {isCompleted ? "✓" : number}
                  </button>
                )
              })}
            </div>

            <div className="text-center mt-6">
              <p className="text-lg text-gray-700">
                <span className="font-bold text-blue-600">{currentNumber}</span> をタッチしよう！
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
