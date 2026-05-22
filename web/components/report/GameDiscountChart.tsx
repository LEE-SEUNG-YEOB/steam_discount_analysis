"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { GameReport } from "@/types"

interface GameDiscountChartProps {
  game: GameReport
}

export function GameDiscountChart({ game }: GameDiscountChartProps) {
  const data = [
    { name: game.name.slice(0, 12), 반응률: game.avg_response_rate },
    { name: "장르 중앙값", 반응률: game.genre_median_response },
    { name: "전체 중앙값", 반응률: game.overall_median_response },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [v.toFixed(3), "반응률"]} />
        <Bar dataKey="반응률" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
