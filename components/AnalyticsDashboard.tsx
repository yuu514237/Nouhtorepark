"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Clock, Brain, Zap, Eye, Lightbulb, Award, AlertCircle } from "lucide-react"

interface AnalyticsData {
  totalGamesPlayed: number
  averageScore: number
  totalPlayTime: number
  favoriteGame: string
  strongestSkill: string
  weakestSkill: string
  weeklyProgress: Array<{ date: string; score: number; playTime: number }>
  gamePerformance: Array<{ game: string; plays: number; avgScore: number; improvement: number }>
  skillAnalysis: {
    memory: number
    reflexes: number
    logic: number
    concentration: number
  }
  playPatterns: {
    bestTimeOfDay: string
    averageSessionLength: number
    consistencyScore: number
  }
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
  childName: string
}

export function AnalyticsDashboard({ data, childName }: AnalyticsDashboardProps) {
  // スキルデータをレーダーチャート用に変換
  const skillRadarData = [
    { skill: "記憶力", value: data.skillAnalysis.memory, fullMark: 100 },
    { skill: "反射神経", value: data.skillAnalysis.reflexes, fullMark: 100 },
    { skill: "論理思考", value: data.skillAnalysis.logic, fullMark: 100 },
    { skill: "集中力", value: data.skillAnalysis.concentration, fullMark: 100 },
  ]

  // 改善度の色を取得
  const getImprovementColor = (improvement: number) => {
    if (improvement > 10) return "text-green-600"
    if (improvement > 0) return "text-blue-600"
    if (improvement > -10) return "text-yellow-600"
    return "text-red-600"
  }

  // 改善度のアイコンを取得
  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) return <TrendingUp className="w-4 h-4" />
    if (improvement < 0) return <TrendingDown className="w-4 h-4" />
    return <Target className="w-4 h-4" />
  }

  // スキルレベルの説明を取得
  const getSkillDescription = (value: number) => {
    if (value >= 80) return "とても優秀"
    if (value >= 60) return "良好"
    if (value >= 40) return "普通"
    if (value >= 20) return "要練習"
    return "これから"
  }

  // 学習アドバイスを生成
  const generateAdvice = () => {
    const advice = []

    if (data.skillAnalysis.memory < 50) {
      advice.push("記憶力向上のため、数字タッチゲームを重点的に練習しましょう")
    }

    if (data.skillAnalysis.reflexes < 50) {
      advice.push("反射神経を鍛えるため、短時間で集中してプレイしましょう")
    }

    if (data.skillAnalysis.logic < 50) {
      advice.push("論理思考力向上のため、論理迷路ゲームにチャレンジしましょう")
    }

    if (data.skillAnalysis.concentration < 50) {
      advice.push("集中力向上のため、計算レースで正確性を重視しましょう")
    }

    if (data.playPatterns.consistencyScore < 60) {
      advice.push("学習効果を高めるため、毎日決まった時間にプレイしましょう")
    }

    if (advice.length === 0) {
      advice.push("素晴らしい成績です！この調子で続けましょう")
    }

    return advice
  }

  const learningAdvice = generateAdvice()

  return (
    <div className="space-y-6">
      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総ゲーム数</p>
                <p className="text-2xl font-bold">{data.totalGamesPlayed}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均スコア</p>
                <p className="text-2xl font-bold">{data.averageScore}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総プレイ時間</p>
                <p className="text-2xl font-bold">{data.totalPlayTime}分</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">お気に入り</p>
                <p className="text-lg font-bold">{data.favoriteGame}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* スキル分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              スキル分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name={childName}
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>スキル詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.skillAnalysis).map(([skill, value]) => {
              const skillNames: { [key: string]: { name: string; icon: any } } = {
                memory: { name: "記憶力", icon: Brain },
                reflexes: { name: "反射神経", icon: Zap },
                logic: { name: "論理思考", icon: Lightbulb },
                concentration: { name: "集中力", icon: Eye },
              }

              const skillInfo = skillNames[skill]
              const Icon = skillInfo.icon

              return (
                <div key={skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{skillInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{value}%</span>
                      <Badge variant={value >= 70 ? "default" : value >= 40 ? "secondary" : "destructive"}>
                        {getSkillDescription(value)}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* 週間進捗 */}
      <Card>
        <CardHeader>
          <CardTitle>週間進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="score" orientation="left" />
              <YAxis yAxisId="time" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                name="平均スコア"
              />
              <Line
                yAxisId="time"
                type="monotone"
                dataKey="playTime"
                stroke="#10b981"
                strokeWidth={2}
                name="プレイ時間(分)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ゲーム別パフォーマンス */}
      <Card>
        <CardHeader>
          <CardTitle>ゲーム別パフォーマンス</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.gamePerformance.map((game) => (
              <div key={game.game} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{game.game}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600">プレイ回数: {game.plays}</span>
                    <span className="text-sm text-gray-600">平均スコア: {game.avgScore}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${getImprovementColor(game.improvement)}`}>
                  {getImprovementIcon(game.improvement)}
                  <span className="font-semibold">
                    {game.improvement > 0 ? "+" : ""}
                    {game.improvement}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 学習パターン分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>学習パターン</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">最適な学習時間</span>
              <Badge>{data.playPatterns.bestTimeOfDay}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">平均セッション時間</span>
              <span className="font-semibold">{data.playPatterns.averageSessionLength}分</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">学習の一貫性</span>
                <span className="font-semibold">{data.playPatterns.consistencyScore}%</span>
              </div>
              <Progress value={data.playPatterns.consistencyScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              学習アドバイス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningAdvice.map((advice, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{advice}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 強み・弱み分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              強み
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-green-800">{data.strongestSkill}</p>
              <p className="text-sm text-green-700">
                {childName}さんの最も優れているスキルです。この強みを活かして他のスキルも伸ばしていきましょう。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Target className="w-5 h-5" />
              成長ポイント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-orange-800">{data.weakestSkill}</p>
              <p className="text-sm text-orange-700">重点的に練習することで、さらなる成長が期待できる分野です。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
