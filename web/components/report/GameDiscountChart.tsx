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

  const sampleOpacity =
    game.valid_event_count === 1 ? 0.4
    : game.valid_event_count === 2 ? 0.7
    : 1

  const rows = [
    {
      label: game.name.length > 18 ? game.name.slice(0, 18) + "…" : game.name,
      value: game.avg_response_rate,
      count: game.valid_event_count,
      star: true,
      dot: "bg-blue-500 border-blue-500 shadow-blue-200",
      text: "text-blue-600",
    },
    { label: "장르 평균", value: game.genre_median_response,   count: null, star: false, dot: "bg-violet-400 border-violet-400", text: "text-violet-500" },
    { label: "전체 평균", value: game.overall_median_response, count: null, star: false, dot: "bg-amber-400 border-amber-400",  text: "text-amber-500"  },
  ]

  const minVal = Math.min(0, ...rows.map((r) => r.value)) * 1.1
  const maxVal = Math.max(...rows.map((r) => r.value)) * 1.3
  const range = maxVal - minVal
  const toPct = (v: number) => `${((v - minVal) / range) * 100}%`

  const rawStep = range / 5
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const tickStep = ([1, 2, 5, 10].find((s) => s * magnitude >= rawStep) ?? 10) * magnitude
  const tickDecimals = tickStep < 0.1 ? 2 : tickStep < 1 ? 1 : 0
  const tickStart = Math.ceil(minVal / tickStep) * tickStep
  const ticks: number[] = []
  for (let t = tickStart; t <= maxVal + tickStep * 0.01; t += tickStep) {
    ticks.push(parseFloat(t.toFixed(10)))
  }

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
        <div className="flex items-center gap-4 mb-1">
          <span className="w-32 shrink-0" />
          <div className="relative flex-1 h-4">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute bottom-0 text-xs text-slate-500 tabular-nums -translate-x-1/2"
                style={{ left: toPct(t) }}
              >
                {t.toFixed(tickDecimals)}
              </span>
            ))}
          </div>
          <div className="w-32 shrink-0" />
        </div>

        {rows.map((row, i) => {
          const opacity = row.star ? sampleOpacity : 1
          return (
            <div key={row.label} className="flex items-center gap-4" style={{ opacity }}>
              {/* 라벨 */}
              <span className={`w-32 shrink-0 text-sm text-right ${row.star ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                {row.label}
              </span>

              {/* 트랙 */}
              <div className="relative flex-1 h-[2px] bg-slate-400">
                {ticks.map((t) => (
                  <div
                    key={t}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-500"
                    style={{ left: toPct(t) }}
                  />
                ))}
                <motion.div
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full border-2 ${row.dot} ${row.star ? "w-5 h-5 shadow-md" : "w-4 h-4"}`}
                  style={{ left: toPct(row.value), translateX: "-50%", translateY: "-50%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 }}
                />
              </div>

              {/* 수치 + 이벤트 수 */}
              <div className="w-32 shrink-0">
                <span className={`text-sm font-mono tabular-nums font-bold ${row.text}`}>
                  {row.value.toFixed(3)}
                </span>
                {row.count !== null && (
                  <span className="ml-1.5 text-xs text-slate-400">
                    ({row.count}회 평균)
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 캡션 */}
      <p className="text-xs text-slate-400 leading-relaxed pt-1">
        일부 게임은 유효 할인 이벤트가 1건뿐이므로, 해당 반응률은 단일 할인 이벤트의 영향을 크게 받을 수 있습니다. 표본이 적은 게임은 흐리게 표시했습니다.
      </p>
    </div>
  )
}
