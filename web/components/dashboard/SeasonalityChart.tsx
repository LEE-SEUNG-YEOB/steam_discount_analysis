"use client"

import type { DashboardEvent, ReviewType } from "@/types"
import { getResponseRate } from "@/lib/filter"

interface SeasonalityChartProps {
  events: DashboardEvent[]
  reviewType?: ReviewType
}

function avgValues(arr: DashboardEvent[], reviewType: ReviewType): number {
  const values = arr
    .map((e) => getResponseRate(e, reviewType))
    .filter((v): v is number => v !== null && v !== undefined)
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
}

function avgRetention(arr: DashboardEvent[]): number {
  const values = arr
    .map((e) => e.retention_rate)
    .filter((v): v is number => v !== null && v !== undefined)
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
}

interface StatRowProps {
  label: string
  season: number
  nonSeason: number
  color: string
}

function StatRow({ label, season, nonSeason, color }: StatRowProps) {
  const delta = nonSeason - season
  const isUp = delta > 0

  return (
    <div className="space-y-2">
      <p className={`text-xs font-semibold uppercase tracking-widest ${color}`}>{label}</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-700 tabular-nums">{season.toFixed(3)}</p>
          <p className="text-xs text-slate-400 mt-0.5">시즌 세일</p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className={`text-xs font-bold ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
            {isUp ? "▲" : "▼"} {Math.abs(delta).toFixed(3)}
          </span>
          <div className="w-px h-6 bg-slate-200" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-700 tabular-nums">{nonSeason.toFixed(3)}</p>
          <p className="text-xs text-slate-400 mt-0.5">비시즌</p>
        </div>
      </div>
    </div>
  )
}

export function SeasonalityChart({ events, reviewType = "all" }: SeasonalityChartProps) {
  const seasonal = events.filter((e) => e.is_season_sale === true)
  const nonSeasonal = events.filter((e) => e.is_season_sale === false)

  const seasonResponse = avgValues(seasonal, reviewType)
  const nonSeasonResponse = avgValues(nonSeasonal, reviewType)
  const seasonRetention = avgRetention(seasonal)
  const nonSeasonRetention = avgRetention(nonSeasonal)

  return (
    <div className="space-y-6 py-2">
      <StatRow
        label="반응률"
        season={seasonResponse}
        nonSeason={nonSeasonResponse}
        color="text-blue-500"
      />
      <div className="w-full h-px bg-slate-100" />
      <StatRow
        label="유지율"
        season={seasonRetention}
        nonSeason={nonSeasonRetention}
        color="text-emerald-500"
      />
    </div>
  )
}
