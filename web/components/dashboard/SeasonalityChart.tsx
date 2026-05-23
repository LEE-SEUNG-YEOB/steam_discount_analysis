"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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

export function SeasonalityChart({ events, reviewType = "all" }: SeasonalityChartProps) {
  const seasonal = events.filter((e) => e.is_season_sale === true)
  const nonSeasonal = events.filter((e) => e.is_season_sale === false)

  const avgRetention = (arr: DashboardEvent[]) => {
    const values = arr
      .map((e) => e.retention_rate)
      .filter((v): v is number => v !== null && v !== undefined)
    return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
  }

  const data = [
    {
      name: "시즌 세일",
      반응률: parseFloat(avgValues(seasonal, reviewType).toFixed(3)),
      유지율: parseFloat(avgRetention(seasonal).toFixed(3)),
    },
    {
      name: "비시즌",
      반응률: parseFloat(avgValues(nonSeasonal, reviewType).toFixed(3)),
      유지율: parseFloat(avgRetention(nonSeasonal).toFixed(3)),
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => v.toFixed(3)} />
        <Legend />
        <Bar dataKey="반응률" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="유지율" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
