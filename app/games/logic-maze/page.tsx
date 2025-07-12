"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Trophy,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowLeftIcon,
  ArrowRight,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"

interface Position {
  x: number
  y: number
}

interface MazeCell {
  isWall: boolean
  isPath: boolean
  isStart: boolean
  isGoal: boolean
  isVisited: boolean
}

interface DifficultyLevel {
  id: number
  name: string
  description: string
  size: number
  timeLimit: number
  stars: string
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 1, name: "かんたん", description: "小さな迷路", size: 6, timeLimit: 120, stars: "★☆☆☆" },
  { id: 2, name: "ふつう", description: "標準的な迷路", size: 8, timeLimit: 90, stars: "★★☆☆" },
  { id: 3, name: "むずかしい", description: "大きな迷路", size: 10, timeLimit: 60, stars: "★★★☆" },
  { id: 4, name: "エキスパート", description: "巨大な迷路", size: 12, timeLimit: 45, stars: "★★★★" },
]

export default function LogicMazeGame() {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready")
  const [maze, setMaze] = useState<MazeCell[][]>([])
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 1, y: 1 })
  const [goalPosition, setGoalPosition] = useState<Position>({ x: 1, y: 1 })
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [playerName, setPlayerName] = useState("プレイヤー")
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showHint, setShowHint] = useState(false)
  const [hintPath, setHintPath] = useState<Position[]>([])
  const [hintsUsed, setHintsUsed] = useState(0)

  const currentDifficulty = DIFFICULTY_LEVELS.find((d) => d.id === currentLevel) || DIFFICULTY_LEVELS[0]
  const MAZE_SIZE = currentDifficulty.size

  // 迷路生成アルゴリズム（再帰的バックトラッキング）
  const generateMaze = useCallback(() => {
    const size = MAZE_SIZE
    const newMaze: MazeCell[][] = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({
            isWall: true,
            isPath: false,
            isStart: false,
            isGoal: false,
            isVisited: false,
          })),
      )

    // 迷路生成のためのヘルパー関数
    const isValidCell = (x: number, y: number) => {
      return x >= 0 && x < size && y >= 0 && y < size
    }

    const getNeighbors = (x: number, y: number) => {
      const neighbors = []
      const directions = [
        [0, -2],
        [2, 0],
        [0, 2],
        [-2, 0], // 上、右、下、左（2マス間隔）
      ]

      for (const [dx, dy] of directions) {
        const nx = x + dx
        const ny = y + dy
        if (isValidCell(nx, ny) && newMaze[ny][nx].isWall) {
          neighbors.push([nx, ny])
        }
      }
      return neighbors
    }

    // 再帰的バックトラッキングで迷路生成
    const carvePath = (x: number, y: number) => {
      newMaze[y][x].isWall = false
      newMaze[y][x].isPath = true

      const neighbors = getNeighbors(x, y)
      // ランダムに隣接セルを選択
      for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]]
      }

      for (const [nx, ny] of neighbors) {
        if (newMaze[ny][nx].isWall) {
          // 現在のセルと隣接セルの間の壁を削除
          const wallX = x + (nx - x) / 2
          const wallY = y + (ny - y) / 2
          newMaze[wallY][wallX].isWall = false
          newMaze[wallY][wallX].isPath = true

          carvePath(nx, ny)
        }
      }
    }

    // 迷路生成開始（奇数座標から開始）
    carvePath(1, 1)

    // 追加の道を作成（難易度に応じて）
    const additionalPaths = Math.floor(size * currentLevel * 0.1)
    for (let i = 0; i < additionalPaths; i++) {
      const x = Math.floor(Math.random() * (size - 2)) + 1
      const y = Math.floor(Math.random() * (size - 2)) + 1
      if (newMaze[y][x].isWall) {
        newMaze[y][x].isWall = false
        newMaze[y][x].isPath = true
      }
    }

    // スタートとゴールを設定
    const startPos = { x: 1, y: 1 }
    let goalPos = { x: size - 2, y: size - 2 }

    // ゴール位置を調整（道があることを確認）
    if (newMaze[goalPos.y][goalPos.x].isWall) {
      // 右下から道を探す
      for (let y = size - 2; y >= 1; y--) {
        for (let x = size - 2; x >= 1; x--) {
          if (newMaze[y][x].isPath) {
            goalPos = { x, y }
            break
          }
        }
        if (!newMaze[goalPos.y][goalPos.x].isWall) break
      }
    }

    newMaze[startPos.y][startPos.x].isStart = true
    newMaze[startPos.y][startPos.x].isPath = true
    newMaze[startPos.y][startPos.x].isWall = false

    newMaze[goalPos.y][goalPos.x].isGoal = true
    newMaze[goalPos.y][goalPos.x].isPath = true
    newMaze[goalPos.y][goalPos.x].isWall = false

    setMaze(newMaze)
    setPlayerPosition(startPos)
    setGoalPosition(goalPos)
    setHintPath([])
    setShowHint(false)
  }, [MAZE_SIZE, currentLevel])

  // 最短経路を計算（ヒント用）
  const calculateShortestPath = useCallback(() => {
    if (maze.length === 0) return []

    const queue: Array<{ pos: Position; path: Position[] }> = [{ pos: playerPosition, path: [playerPosition] }]
    const visited = new Set<string>()
    visited.add(`${playerPosition.x},${playerPosition.y}`)

    const directions = [
      { x: 0, y: -1 }, // 上
      { x: 1, y: 0 }, // 右
      { x: 0, y: 1 }, // 下
      { x: -1, y: 0 }, // 左
    ]

    while (queue.length > 0) {
      const { pos, path } = queue.shift()!

      if (pos.x === goalPosition.x && pos.y === goalPosition.y) {
        return path
      }

      for (const dir of directions) {
        const newPos = { x: pos.x + dir.x, y: pos.y + dir.y }
        const key = `${newPos.x},${newPos.y}`

        if (
          newPos.x >= 0 &&
          newPos.x < MAZE_SIZE &&
          newPos.y >= 0 &&
          newPos.y < MAZE_SIZE &&
          !maze[newPos.y][newPos.x].isWall &&
          !visited.has(key)
        ) {
          visited.add(key)
          queue.push({ pos: newPos, path: [...path, newPos] })
        }
      }
    }

    return []
  }, [maze, playerPosition, goalPosition, MAZE_SIZE])

  // ヒント表示
  const showHintPath = () => {
    if (hintsUsed >= 3) return // 最大3回まで

    const path = calculateShortestPath()
    setHintPath(path.slice(0, Math.min(5, path.length))) // 最初の5ステップのみ表示
    setShowHint(true)
    setHintsUsed((prev) => prev + 1)

    // 3秒後にヒントを非表示
    setTimeout(() => {
      setShowHint(false)
    }, 3000)
  }

  // ベストスコアを読み込む関数
  const loadBestScore = useCallback(() => {
    if (typeof window === "undefined") return

    const gameScores = JSON.parse(localStorage.getItem("gameScores_logic-maze") || "[]")
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
    if (gameState === "playing" && startTime && timeLeft > 0) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = now - startTime
        const remaining = Math.max(0, currentDifficulty.timeLimit * 1000 - elapsed)

        setTimeElapsed(elapsed)
        setTimeLeft(Math.ceil(remaining / 1000))

        if (remaining <= 0) {
          finishGame(true) // タイムアップ
        }
      }, 100)
    }
    return () => clearInterval(interval)
  }, [gameState, startTime, timeLeft, currentDifficulty.timeLimit])

  // プレイヤー移動
  const movePlayer = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (gameState !== "playing") return

      const newPosition = { ...playerPosition }

      switch (direction) {
        case "up":
          newPosition.y = Math.max(0, newPosition.y - 1)
          break
        case "down":
          newPosition.y = Math.min(MAZE_SIZE - 1, newPosition.y + 1)
          break
        case "left":
          newPosition.x = Math.max(0, newPosition.x - 1)
          break
        case "right":
          newPosition.x = Math.min(MAZE_SIZE - 1, newPosition.x + 1)
          break
      }

      // 壁でない場合のみ移動
      if (!maze[newPosition.y][newPosition.x].isWall) {
        setPlayerPosition(newPosition)
        setMoves((prev) => prev + 1)

        // 訪問済みマークを付ける
        const newMaze = [...maze]
        newMaze[newPosition.y][newPosition.x].isVisited = true
        setMaze(newMaze)

        // ゴールに到達したかチェック
        if (newPosition.x === goalPosition.x && newPosition.y === goalPosition.y) {
          finishGame(false)
        }
      }
    },
    [gameState, playerPosition, maze, goalPosition, MAZE_SIZE],
  )

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== "playing") return

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault()
          movePlayer("up")
          break
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault()
          movePlayer("down")
          break
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault()
          movePlayer("left")
          break
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault()
          movePlayer("right")
          break
        case "h":
        case "H":
          event.preventDefault()
          showHintPath()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState, movePlayer])

  const finishGame = useCallback(
    (isTimeUp = false) => {
      if (gameState !== "playing") return // 重複実行防止

      const finalTime = Date.now()
      const totalTime = startTime ? finalTime - startTime : 0

      // スコア計算
      let calculatedScore = 0
      if (!isTimeUp) {
        const timeBonus = Math.max(0, (currentDifficulty.timeLimit * 1000 - totalTime) / 100)
        const moveBonus = Math.max(0, (MAZE_SIZE * MAZE_SIZE - moves) * 10)
        const difficultyBonus = currentLevel * 200
        const hintPenalty = hintsUsed * 50
        calculatedScore = Math.floor(1000 + timeBonus + moveBonus + difficultyBonus - hintPenalty)
      }

      setScore(calculatedScore)
      setGameState("finished")

      // スコアをlocalStorageに保存
      const gameScore = {
        id: `score_${Date.now()}`,
        score: calculatedScore,
        timeElapsed: totalTime,
        moves: moves,
        level: currentLevel,
        hintsUsed: hintsUsed,
        isTimeUp: isTimeUp,
        playedAt: new Date().toISOString(),
      }

      const existingScores = JSON.parse(localStorage.getItem("gameScores_logic-maze") || "[]")
      existingScores.push(gameScore)
      localStorage.setItem("gameScores_logic-maze", JSON.stringify(existingScores))

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
    },
    [gameState, startTime, moves, currentLevel, hintsUsed, bestScore, currentDifficulty.timeLimit, MAZE_SIZE],
  )

  const startGame = () => {
    setGameState("playing")
    setStartTime(Date.now())
    setTimeElapsed(0)
    setTimeLeft(currentDifficulty.timeLimit)
    setScore(0)
    setMoves(0)
    setHintsUsed(0)
    generateMaze()
  }

  const resetGame = () => {
    setGameState("ready")
    setStartTime(null)
    setTimeElapsed(0)
    setTimeLeft(0)
    setScore(0)
    setMoves(0)
    setHintsUsed(0)
    setShowHint(false)
    setHintPath([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
            <h1 className="text-2xl font-bold text-white ml-4">論理迷路</h1>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">論理迷路ゲーム</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-600">スタートからゴールまでの道を見つけよう！</p>
                <p className="text-sm text-gray-500">矢印キーまたはボタンで移動、Hキーでヒント</p>
              </div>

              {/* 難易度選択 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">難易度を選択</label>
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTY_LEVELS.map((difficulty) => (
                    <button
                      key={difficulty.id}
                      onClick={() => setCurrentLevel(difficulty.id)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        currentLevel === difficulty.id
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-orange-300"
                      }`}
                    >
                      <div className="font-semibold">{difficulty.name}</div>
                      <div className="text-xs text-gray-600">{difficulty.description}</div>
                      <div className="text-xs text-gray-500">
                        {difficulty.size}×{difficulty.size} • {difficulty.timeLimit}秒
                      </div>
                      <div className="text-xs">{difficulty.stars}</div>
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
                  <div className="text-2xl font-bold text-red-600">
                    {currentDifficulty.size}×{currentDifficulty.size}
                  </div>
                  <div className="text-sm text-gray-600">迷路サイズ</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">{currentDifficulty.stars}</div>
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
                {playerName}さん、{score > 0 ? (isNewRecord ? "新記録達成！" : "ゴール到達！") : "時間切れ！"}
              </CardTitle>
              {isNewRecord && score > 0 && <Badge className="bg-yellow-500 text-white">NEW RECORD</Badge>}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{score}</div>
                <div className="text-gray-600">スコア</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-red-600">{(timeElapsed / 1000).toFixed(1)}秒</div>
                  <div className="text-sm text-gray-600">クリア時間</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-pink-600">{moves}</div>
                  <div className="text-sm text-gray-600">移動回数</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{currentDifficulty.name}</div>
                  <div className="text-sm text-gray-600">難易度</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{hintsUsed}</div>
                  <div className="text-sm text-gray-600">ヒント使用</div>
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
            <h1 className="text-xl font-bold text-white ml-4">論理迷路 - {currentDifficulty.name}</h1>
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
              <div
                className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-orange-600"}`}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">残り時間</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{moves}</div>
              <div className="text-sm text-gray-600">移動回数</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">
                {currentDifficulty.size}×{currentDifficulty.size}
              </div>
              <div className="text-sm text-gray-600">迷路サイズ</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{3 - hintsUsed}</div>
              <div className="text-sm text-gray-600">ヒント残り</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-8">
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${MAZE_SIZE}, minmax(0, 1fr))`,
                maxWidth: `${Math.min(400, MAZE_SIZE * 30)}px`,
              }}
            >
              {maze.map((row, y) =>
                row.map((cell, x) => {
                  const isPlayerHere = playerPosition.x === x && playerPosition.y === y
                  const isOnHintPath = showHint && hintPath.some((pos) => pos.x === x && pos.y === y)

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`aspect-square rounded-sm flex items-center justify-center text-lg font-bold transition-all ${
                        cell.isWall
                          ? "bg-gray-800"
                          : cell.isStart
                            ? "bg-green-400 text-white"
                            : cell.isGoal
                              ? "bg-red-400 text-white"
                              : isOnHintPath
                                ? "bg-yellow-200 border-2 border-yellow-400"
                                : cell.isVisited
                                  ? "bg-blue-200"
                                  : "bg-gray-100"
                      }`}
                      style={{ fontSize: `${Math.max(8, 20 - MAZE_SIZE)}px` }}
                    >
                      {isPlayerHere ? (
                        <span className="text-2xl">🚀</span>
                      ) : cell.isStart ? (
                        "S"
                      ) : cell.isGoal ? (
                        "G"
                      ) : (
                        ""
                      )}
                    </div>
                  )
                }),
              )}
            </div>

            <div className="text-center mt-6">
              <p className="text-lg text-gray-700 mb-4">
                🚀 から <span className="font-bold text-red-600">G</span> まで進もう！
              </p>
              {showHint && (
                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-2 mb-4">
                  <p className="text-sm text-yellow-800">💡 ヒント: 黄色い道をたどってみよう！</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">矢印キーまたはボタンで移動</p>
            </div>
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mb-4">
              <div></div>
              <Button onClick={() => movePlayer("up")} variant="outline" size="lg" className="aspect-square">
                <ArrowUp className="w-6 h-6" />
              </Button>
              <div></div>
              <Button
                onClick={showHintPath}
                disabled={hintsUsed >= 3}
                variant="outline"
                size="lg"
                className="aspect-square bg-yellow-50 hover:bg-yellow-100"
              >
                <Lightbulb className="w-6 h-6" />
              </Button>
              <Button onClick={() => movePlayer("left")} variant="outline" size="lg" className="aspect-square">
                <ArrowLeftIcon className="w-6 h-6" />
              </Button>
              <div></div>
              <Button onClick={() => movePlayer("right")} variant="outline" size="lg" className="aspect-square">
                <ArrowRight className="w-6 h-6" />
              </Button>
              <div></div>
              <div></div>
              <Button onClick={() => movePlayer("down")} variant="outline" size="lg" className="aspect-square">
                <ArrowDown className="w-6 h-6" />
              </Button>
              <div></div>
              <div></div>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>Hキーでヒント表示（残り{3 - hintsUsed}回）</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
