import type { GameReport } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatPercent, formatRate } from "@/lib/format"

interface GameInfoCardProps {
  game: GameReport
}

const METRICS = [
  { label: "평균 할인율", accent: "bg-blue-500" },
  { label: "최고 할인율", accent: "bg-violet-400" },
  { label: "평균 반응률", accent: "bg-emerald-400" },
  { label: "평균 유지율", accent: "bg-amber-400" },
] as const

export function GameInfoCard({ game }: GameInfoCardProps) {
  const values = [
    formatPercent(game.avg_discount_rate),
    formatPercent(game.max_discount_rate),
    formatRate(game.avg_response_rate),
    formatRate(game.avg_retention_rate),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold">{game.name}</h2>
        <Badge>{game.genre}</Badge>
        <span className="text-sm text-muted-foreground">유효 이벤트 {game.valid_event_count}건</span>
        {game.valid_event_count === 1 && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">표본 1건</span>
        )}
        {game.valid_event_count === 2 && (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">표본 2건</span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center divide-x divide-slate-200">
          {METRICS.map(({ label, accent }, i) => (
            <div key={label} className="flex-1 px-5 py-5 text-center">
              <div className={`w-5 h-0.5 rounded-full ${accent} mx-auto mb-3`} />
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{values[i]}</p>
              <p className="text-xs text-slate-500 mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
