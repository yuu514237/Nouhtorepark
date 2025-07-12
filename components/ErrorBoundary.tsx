"use client"

import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Bug } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // エラー情報をローカルストレージに保存
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      const existingLogs = JSON.parse(localStorage.getItem("errorLogs") || "[]")
      existingLogs.push(errorLog)

      // 最新の10件のみ保持
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10)
      }

      localStorage.setItem("errorLogs", JSON.stringify(existingLogs))
    } catch (storageError) {
      console.error("Failed to save error log:", storageError)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  copyErrorInfo = async () => {
    const errorInfo = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2))
      alert("エラー情報をクリップボードにコピーしました")
    } catch (error) {
      console.error("Failed to copy error info:", error)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.handleReset} />
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">エラーが発生しました</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertTitle>アプリケーションエラー</AlertTitle>
                <AlertDescription>
                  申し訳ございません。予期しないエラーが発生しました。
                  {this.state.error && (
                    <div className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">{this.state.error.message}</div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button onClick={this.handleReset} className="w-full" variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再試行
                </Button>

                <Button onClick={this.handleReload} className="w-full bg-transparent" variant="outline">
                  ページを再読み込み
                </Button>

                <Button onClick={this.copyErrorInfo} className="w-full bg-transparent" variant="outline" size="sm">
                  <Bug className="w-4 h-4 mr-2" />
                  エラー情報をコピー
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>問題が続く場合は、ブラウザのキャッシュをクリアしてください。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// React 18のError Boundary Hook版
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo)

    // エラー情報をローカルストレージに保存
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      const existingLogs = JSON.parse(localStorage.getItem("errorLogs") || "[]")
      existingLogs.push(errorLog)
      localStorage.setItem("errorLogs", JSON.stringify(existingLogs))
    } catch (storageError) {
      console.error("Failed to save error log:", storageError)
    }
  }
}
