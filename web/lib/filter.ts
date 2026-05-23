import type { DashboardEvent, Genre, ReviewType, SentimentGroup } from "@/types"

// ─── 리뷰 유형 필터 ────────────────────────────────────────────────────────

export const REVIEW_TYPE_OPTIONS = [
  { value: "all" as ReviewType, label: "전체 리뷰" },
  { value: "positive" as ReviewType, label: "긍정 리뷰" },
  { value: "negative" as ReviewType, label: "부정 리뷰" },
] as const

/** 리뷰 유형에 따른 반응률 컬럼 */
export const metricByReviewType = {
  all: "response_rate_all",
  positive: "response_rate_positive",
  negative: "response_rate_negative",
} as const satisfies Record<ReviewType, keyof DashboardEvent>

/** 이벤트에서 리뷰 유형에 맞는 반응률 값 반환 */
export function getResponseRate(
  event: DashboardEvent,
  reviewType: ReviewType
): number | undefined {
  return event[metricByReviewType[reviewType]] as number | undefined
}

/** 리뷰 유형 기준 반응률이 존재하는 이벤트만 필터 */
export function filterByReviewType(
  events: DashboardEvent[],
  reviewType: ReviewType
): DashboardEvent[] {
  if (reviewType === "all") return events
  return events.filter((e) => {
    const v = getResponseRate(e, reviewType)
    return v !== null && v !== undefined
  })
}

// ─── 평판 변화 필터 ────────────────────────────────────────────────────────

export const SENTIMENT_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "up" as const, label: "긍정률 상승" },
  { value: "neutral" as const, label: "긍정률 유지" },
  { value: "down" as const, label: "긍정률 하락" },
] as const

export type SentimentFilter = "all" | "up" | "neutral" | "down"

/** CSV의 sentiment_group 값(여러 형식 혼재)을 필터 키로 매핑 */
const sentimentFilterMap: Record<SentimentFilter, SentimentGroup[] | null> = {
  all: null,
  up: ["up", "positive_rate_up"],
  neutral: ["neutral", "positive_rate_flat"],
  down: ["down", "positive_rate_down"],
}

export const sentimentLabelMap: Record<SentimentGroup, string> = {
  up: "긍정률 상승",
  neutral: "긍정률 유지",
  down: "긍정률 하락",
  positive_rate_up: "긍정률 상승",
  positive_rate_flat: "긍정률 유지",
  positive_rate_down: "긍정률 하락",
}

export function filterBySentiment(
  events: DashboardEvent[],
  sentiment: SentimentFilter
): DashboardEvent[] {
  const allowed = sentimentFilterMap[sentiment]
  if (allowed === null) return events
  return events.filter(
    (e) => e.sentiment_group !== undefined && allowed.includes(e.sentiment_group)
  )
}

// ─── 장르 필터 ─────────────────────────────────────────────────────────────

export const GENRE_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "Action" as Genre, label: "Action" },
  { value: "RPG" as Genre, label: "RPG" },
  { value: "Adventure" as Genre, label: "Adventure" },
  { value: "Casual/Lightweight" as Genre, label: "Casual/Lightweight" },
  { value: "Strategy/Simulation" as Genre, label: "Strategy/Simulation" },
] as const

export function filterByGenre(
  events: DashboardEvent[],
  genre: Genre | "all"
): DashboardEvent[] {
  if (genre === "all") return events
  return events.filter((e) => e.genre === genre)
}

// ─── 플레이타임 필터 ───────────────────────────────────────────────────────

export const PLAYTIME_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "2h" as const, label: "2시간 이상" },
  { value: "10h" as const, label: "10시간 이상" },
] as const

export type PlaytimeFilter = "all" | "2h" | "10h"

export function filterByPlaytime(
  events: DashboardEvent[],
  playtime: PlaytimeFilter
): DashboardEvent[] {
  // "all"은 "모든 리뷰어 기준" = 데이터의 playtime_filter="all" 행
  // "2h" / "10h"는 해당 세그먼트 행만 표시
  return events.filter((e) => e.playtime_filter === playtime)
}

// ─── 시즌 여부 필터 ────────────────────────────────────────────────────────

export const SEASON_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "season" as const, label: "시즌 세일" },
  { value: "nonseason" as const, label: "비시즌 할인" },
] as const

export type SeasonFilter = "all" | "season" | "nonseason"

export function filterBySeason(
  events: DashboardEvent[],
  season: SeasonFilter
): DashboardEvent[] {
  if (season === "all") return events
  return events.filter((e) =>
    season === "season" ? e.is_season_sale === true : e.is_season_sale === false
  )
}

// ─── 통합 필터 ─────────────────────────────────────────────────────────────

export interface DashboardFilters {
  genre: Genre | "all"
  playtime: PlaytimeFilter
  season: SeasonFilter
  reviewType: ReviewType
  sentiment: SentimentFilter
}

export const DEFAULT_FILTERS: DashboardFilters = {
  genre: "all",
  playtime: "all",
  season: "all",
  reviewType: "all",
  sentiment: "all",
}

export function applyFilters(
  events: DashboardEvent[],
  filters: DashboardFilters
): DashboardEvent[] {
  let result = events
  result = filterByGenre(result, filters.genre)
  result = filterByPlaytime(result, filters.playtime)
  result = filterBySeason(result, filters.season)
  result = filterBySentiment(result, filters.sentiment)
  result = filterByReviewType(result, filters.reviewType)
  return result
}

// ─── 집계 헬퍼 ─────────────────────────────────────────────────────────────

/** 이벤트 배열에서 특정 반응률의 평균 계산 (null/undefined 제외) */
export function avgResponseRate(
  events: DashboardEvent[],
  reviewType: ReviewType
): number | null {
  const values = events
    .map((e) => getResponseRate(e, reviewType))
    .filter((v): v is number => v !== null && v !== undefined)
  if (values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}
