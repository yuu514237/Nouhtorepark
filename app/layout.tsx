import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/ErrorBoundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "のうトレパーク - 子供向け脳トレーニングゲーム",
  description: "楽しく遊んで脳を鍛えよう！数字タッチ、絵合わせ、論理迷路で記憶力・反射神経・論理思考力を向上させます。",
  keywords: ["脳トレ", "子供", "ゲーム", "教育", "記憶力", "反射神経", "論理思考"],
  authors: [{ name: "Brain Training Park Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "のうトレパーク",
    description: "子供向け脳トレーニングゲーム",
    type: "website",
    locale: "ja_JP",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
