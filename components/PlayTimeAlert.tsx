"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle, Coffee } from "lucide-react"

interface PlayTimeAlertProps {
  timeRemaining: number
  showWarning: boolean
  isTimeUp: boolean
  onContinue?: () => void
  onTakeBreak?: () => void
  onEndSession?: () => void
}

export function PlayTimeAlert({
  timeRemaining,
  showWarning,
  isTimeUp,
  onContinue,
  onTakeBreak,
  onEndSession,
}: PlayTimeAlertProps) {
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (showWarning || isTimeUp) {
      setShowAlert(true)
    }
  }, [showWarning, isTimeUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!showAlert) return null

  if (isTimeUp) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-red-500 text-white">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">プレイ時間終了！</h2>
            <p className="mb-4">
              今日のプレイ時間が終了しました。
              <br />
              また明日遊びましょう！
            </p>
            <div className="space-y-2">
              <Button onClick={onEndSession} className="w-full bg-white text-red-500 hover:bg-gray-100">
                終了する
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-yellow-500 text-white">
          <CardContent className="p-6 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">もうすぐ時間です！</h2>
            <p className="mb-4">
              残り時間: <span className="font-bold text-2xl">{formatTime(timeRemaining)}</span>
            </p>
            <p className="text-sm mb-4 opacity-90">あと少しで今日のプレイ時間が終了します。</p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowAlert(false)
                  onContinue?.()
                }}
                className="w-full bg-white text-yellow-600 hover:bg-gray-100"
              >
                続ける
              </Button>
              <Button
                onClick={onTakeBreak}
                variant="outline"
                className="w-full border-white text-white hover:bg-white/20"
              >
                <Coffee className="w-4 h-4 mr-2" />
                休憩する
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
