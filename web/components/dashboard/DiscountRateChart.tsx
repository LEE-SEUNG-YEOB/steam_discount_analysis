"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { DashboardEvent, ReviewType } from "@/types"
import { getResponseRate } from "@/lib/filter"

interface DiscountRateChartProps {
  events: DashboardEvent[]
  reviewType?: ReviewType
}

const BINS = [
  { label: "10–30%", min: 10, max: 30 },
  { label: "30–50%", min: 30, max: 50 },
  { label: "50–70%", min: 50, max: 70 },
  { label: "70%+", min: 70, max: 101 },
]

export function DiscountRateChart({ events, reviewType = "all" }: DiscountRateChartProps) {
  const data = BINS.map((bin) => {
    const binEvents = events.filter(
      (e) => (e.discount_rate ?? 0) >= bin.min && (e.discount_rate ?? 0) < bin.max
    )
    const values = binEvents
      .map((e) => getResponseRate(e, reviewType))
      .filter((v): v is number => v !== null && v !== undefined)
    const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
    return { label: bin.label, 반응률: parseFloat(avg.toFixed(3)), n: values.length }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [v.toFixed(3), "반응률"]} />
        <Bar dataKey="반응률" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
