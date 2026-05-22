"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { DashboardEvent } from "@/types"
import { GENRES } from "@/lib/constants"

interface GenreChartProps {
  events: DashboardEvent[]
}

export function GenreChart({ events }: GenreChartProps) {
  const data = GENRES.map((genre) => {
    const genreEvents = events.filter((e) => e.genre === genre)
    const avg = genreEvents.length
      ? genreEvents.reduce((s, e) => s + e.response_rate_all, 0) / genreEvents.length
      : 0
    return { genre, 반응률: parseFloat(avg.toFixed(3)), n: genreEvents.length }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="genre" tick={{ fontSize: 9 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [v.toFixed(3), "반응률"]} />
        <Bar dataKey="반응률" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
