"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { DashboardEvent } from "@/types"

interface SeasonalityChartProps {
  events: DashboardEvent[]
}

function avg(arr: DashboardEvent[], key: "response_rate_all" | "retention_rate") {
  if (!arr.length) return 0
  return arr.reduce((s, e) => s + e[key], 0) / arr.length
}

export function SeasonalityChart({ events }: SeasonalityChartProps) {
  const seasonal = events.filter((e) => e.is_season_sale)
  const nonSeasonal = events.filter((e) => !e.is_season_sale)

  const data = [
    {
      name: "시즌 세일",
      반응률: parseFloat(avg(seasonal, "response_rate_all").toFixed(3)),
      유지율: parseFloat(avg(seasonal, "retention_rate").toFixed(3)),
    },
    {
      name: "비시즌",
      반응률: parseFloat(avg(nonSeasonal, "response_rate_all").toFixed(3)),
      유지율: parseFloat(avg(nonSeasonal, "retention_rate").toFixed(3)),
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
