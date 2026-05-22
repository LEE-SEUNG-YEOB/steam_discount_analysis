import type { Genre } from "@/types"

export const GENRES: Genre[] = [
  "Action",
  "RPG",
  "Adventure",
  "Casual/Lightweight",
  "Strategy/Simulation",
]

export const PLAYTIME_FILTERS = [
  { value: "all", label: "전체" },
  { value: "2h", label: "2시간 이상" },
  { value: "10h", label: "10시간 이상" },
] as const

export const SEASON_FILTERS = [
  { value: "all", label: "전체" },
  { value: "season", label: "시즌 세일" },
  { value: "nonseason", label: "비시즌 할인" },
] as const

export const SENTIMENT_FILTERS = [
  { value: "all", label: "전체" },
  { value: "positive_rate_up", label: "긍정률 상승" },
  { value: "positive_rate_flat", label: "긍정률 유지" },
  { value: "positive_rate_down", label: "긍정률 하락" },
] as const

export const GENRE_SAMPLE_THRESHOLD = 20
