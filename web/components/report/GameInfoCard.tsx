import type { GameReport } from "@/types"
import { MetricCard } from "@/components/common/MetricCard"
import { Badge } from "@/components/ui/badge"
import { formatPercent, formatRate } from "@/lib/format"

interface GameInfoCardProps {
  game: GameReport
}

export function GameInfoCard({ game }: GameInfoCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold">{game.name}</h2>
        <Badge>{game.genre}</Badge>
        <span className="text-sm text-muted-foreground">유효 이벤트 {game.valid_event_count}건</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard title="평균 할인율" value={formatPercent(game.avg_discount_rate)} />
        <MetricCard title="최고 할인율" value={formatPercent(game.max_discount_rate)} />
        <MetricCard title="평균 반응률" value={formatRate(game.avg_response_rate)} />
        <MetricCard title="평균 유지율" value={formatRate(game.avg_retention_rate)} />
      </div>
    </div>
  )
}
