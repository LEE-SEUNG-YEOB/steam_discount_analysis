"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { DashboardEvent, ReviewType } from "@/types"
import { getResponseRate } from "@/lib/filter"

export type ChartMode = "median" | "mean"

interface DiscountRateChartProps {
  events: DashboardEvent[]
  reviewType?: ReviewType
  mode?: ChartMode
}

const BINS = [
  { label: "10–30%", min: 10, max: 30 },
  { label: "30–50%", min: 30, max: 50 },
  { label: "50–70%", min: 50, max: 70 },
  { label: "70%+", min: 70, max: 101 },
]

const BLUES = ["#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"]

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function DiscountRateChart({ events, reviewType = "all", mode = "median" }: DiscountRateChartProps) {
  const data = BINS.map((bin) => {
    const binEvents = events.filter(
      (e) => (e.discount_rate ?? 0) >= bin.min && (e.discount_rate ?? 0) < bin.max
    )
    const values = binEvents
      .map((e) => getResponseRate(e, reviewType))
      .filter((v): v is number => v !== null && v !== undefined)
    const val = mode === "median"
      ? median(values)
      : values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
    return { label: bin.label, 반응률: parseFloat(val.toFixed(3)), n: values.length }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 12, left: -16, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v: number) => [v.toFixed(3), "반응률"]}
          contentStyle={{
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.12)",
            fontSize: "12px",
            padding: "8px 12px",
          }}
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
        />
        <Bar dataKey="반응률" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={BLUES[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
