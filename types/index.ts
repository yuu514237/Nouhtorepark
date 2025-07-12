// 型定義の統一
export interface ChildProfile {
  id: string
  name: string
  avatar: string
  level: number
  totalScore: number
  experience: number
  experienceToNext: number
  badges: Badge[]
  todayPlayTime: number
  maxPlayTime: number
  createdAt: string
  lastPlayed: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface GameScore {
  id: string
  gameType: "number-touch" | "memory-match" | "sound-copy" | "logic-maze"
  score: number
  timeElapsed: number
  mistakes: number
  playedAt: string
  experienceGained: number
}

export interface PlaySession {
  id: string
  startTime: string
  endTime?: string
  duration: number
  gamesPlayed: number
  totalScore: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  completed: boolean
  reward?: {
    type: "badge" | "experience" | "avatar"
    value: string | number
  }
}

export interface GameState {
  isPlaying: boolean
  isPaused: boolean
  currentScore: number
  timeElapsed: number
  mistakes: number
}
