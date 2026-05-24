"use client"

import { motion } from "framer-motion"
import type { GameReport } from "@/types"

interface GameDiscountChartProps {
  game: GameReport
}

export function GameDiscountChart({ game }: GameDiscountChartProps) {
  const overall = game.overall_median_response
  const diff = game.avg_response_rate - overall
  const isAbove = diff >= 0

  const rows = [
    { label: game.name.length > 18 ? game.name.slice(0, 18) + "…" : game.name, value: game.avg_response_rate, star: true,  dot: "bg-blue-500 border-blue-500 shadow-blue-200",   text: "text-blue-600" },
    { label: "장르 평균", value: game.genre_median_response,  star: false, dot: "bg-violet-400 border-violet-400", text: "text-violet-500" },
    { label: "전체 평균", value: game.overall_median_response, star: false, dot: "bg-amber-400 border-amber-400",  text: "text-amber-500" },
  ]

  const max = Math.max(...rows.map((r) => r.value)) * 1.3
  const ticks = [0, 0.1, 0.2, 0.3, 0.4].filter((t) => t <= max)

  return (
    <div className="space-y-6 py-3">
      {/* 요약 배너 */}
      <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium ${isAbove ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
        <span>{isAbove ? "▲" : "▼"}</span>
        전체 평균보다 반응률이 <span className="font-bold">{Math.abs(diff).toFixed(3)}</span>{isAbove ? " 높습니다" : " 낮습니다"}
      </div>

      {/* 도트 비교 */}
      <div className="space-y-5 pt-1">
        {/* 눈금 헤더 */}
        <div className="flex ml-[136px] mb-1">
          {ticks.map((t) => (
            <div key={t} className="flex-1 text-xs text-slate-500 tabular-nums">{t.toFixed(1)}</div>
          ))}
        </div>

        {rows.map((row, i) => {
          const dotPct = (row.value / max) * 100
          return (
            <div key={row.label} className="flex items-center gap-4">
              {/* 라벨 */}
              <span className={`w-32 shrink-0 text-sm text-right ${row.star ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                {row.label}
              </span>

              {/* 트랙 */}
              <div className="relative flex-1 h-[2px] bg-slate-400">
                {/* 눈금 점 */}
                {ticks.map((t) => (
                  <div
                    key={t}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-500"
                    style={{ left: `${(t / max) * 100}%` }}
                  />
                ))}
                {/* 도트 */}
                <motion.div
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full border-2 ${row.dot} ${row.star ? "w-5 h-5 shadow-md" : "w-4 h-4"}`}
                  style={{ left: `${dotPct}%`, translateX: "-50%", translateY: "-50%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 }}
                />
              </div>

              {/* 수치 */}
              <span className={`w-14 shrink-0 text-sm font-mono tabular-nums font-bold ${row.text}`}>
                {row.value.toFixed(3)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
