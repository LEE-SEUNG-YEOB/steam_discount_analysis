export type Genre =
  | "Action"
  | "RPG"
  | "Adventure"
  | "Casual/Lightweight"
  | "Strategy/Simulation"

export type Confidence = "strong" | "exploratory"

export type ReviewType = "all" | "positive" | "negative"

export type SentimentGroup =
  | "up"
  | "neutral"
  | "down"
  | "positive_rate_up"
  | "positive_rate_flat"
  | "positive_rate_down"

export interface SummaryData {
  games_count: number
  discount_events_collected: number
  valid_events: number
  reviews_count: number
  main_message: string
}

export interface GameInfo {
  app_id: number
  name: string
  genre: Genre
  release_date?: string
  price?: number
  tags?: string[]
}

export interface GameReport {
  appid: number
  name: string
  genre: string
  valid_event_count: number
  avg_discount_rate: number
  max_discount_rate: number
  avg_response_rate: number
  avg_retention_rate: number
  genre_median_response: number
  overall_median_response: number
  season_response?: number
  nonseason_response?: number
  discount_frequency: number
}

export interface DashboardEvent {
  event_id: string
  appid: number
  game_name: string
  genre: string
  discount_start: string
  playtime_filter: "all" | "2h" | "10h"
  discount_rate?: number
  is_season_sale?: boolean

  response_rate_all?: number
  response_rate_positive?: number
  response_rate_negative?: number
  retention_rate?: number

  positive_count_before?: number
  positive_count_during?: number
  negative_count_before?: number
  negative_count_during?: number

  positive_rate_before?: number
  positive_rate_during?: number
  positive_rate_delta?: number
  sentiment_group?: SentimentGroup

  valid_event_count_for_genre?: number
}

export interface SimulatorRule {
  id: string
  condition: string
  message: string
  evidence: string
  chart?: string
  confidence: Confidence
}

export interface EvidenceItem {
  title: string
  description: string
  source: string
  confidence: Confidence
  chart?: string
}

export interface SimulatorInput {
  genre: Genre
  discount_rate: number
  is_season_sale: boolean
  annual_discount_frequency: "1회" | "2회" | "3회 이상"
  strategy_goal: "단기 유입" | "장기 유지" | "만족도 관리"
}

export interface SimulatorResult {
  strategy_type: string
  summary: string
  response_comment: string
  retention_comment: string
  satisfaction_comment: string
  fatigue_comment: string
  evidences: EvidenceItem[]
  warnings: string[]
}
