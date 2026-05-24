"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { DashboardEvent } from "@/types"
import { aggregateGenreSentiment } from "@/lib/dashboard"

interface Props {
  events: DashboardEvent[]
}

const COLORS = {
  down: "#f87171",
  neutral: "#cbd5e1",
  up: "#4ade80",
}

const LABELS: Record<string, string> = {
  down: "긍정률 하락",
  neutral: "유지",
  up: "상승",
}

export function SentimentByGenreChart({ events }: Props) {
  const raw = aggregateGenreSentiment(events)

  if (raw.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-400 text-center px-4">
          선택한 조건에 해당하는 평판 변화 데이터가 없습니다.
        </p>
      </div>
    )
  }

  const data = raw.map((d) => ({
    genre: d.genre,
    down: parseFloat(d.down.toFixed(1)),
    neutral: parseFloat(d.neutral.toFixed(1)),
    up: parseFloat(d.up.toFixed(1)),
    total: d.total,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="genre"
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}%`,
            LABELS[name] ?? name,
          ]}
          contentStyle={{
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.12)",
            fontSize: "12px",
            padding: "8px 12px",
          }}
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
        />
        <Legend
          formatter={(value: string) => LABELS[value] ?? value}
          wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="down" stackId="a" fill={COLORS.down} radius={[4, 0, 0, 4]} />
        <Bar dataKey="neutral" stackId="a" fill={COLORS.neutral} />
        <Bar dataKey="up" stackId="a" fill={COLORS.up} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
