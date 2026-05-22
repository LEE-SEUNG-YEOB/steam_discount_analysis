import type { GameReport } from "@/types"
import { GameInfoCard } from "./GameInfoCard"
import { GameDiscountChart } from "./GameDiscountChart"
import { ChartCard } from "@/components/common/ChartCard"
import { generateReportComment } from "@/lib/report"
import { formatRate } from "@/lib/format"

interface ReportPanelProps {
  game: GameReport
}

export function ReportPanel({ game }: ReportPanelProps) {
  const comment = generateReportComment(game)

  return (
    <div className="space-y-6">
      <GameInfoCard game={game} />

      <ChartCard title="반응률 비교" description="해당 게임 vs 장르 중앙값 vs 전체 중앙값">
        <GameDiscountChart game={game} />
      </ChartCard>

      {game.season_response !== undefined && game.nonseason_response !== undefined && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">시즌 세일 반응률</p>
            <p className="text-xl font-bold mt-1">{formatRate(game.season_response)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">비시즌 할인 반응률</p>
            <p className="text-xl font-bold mt-1">{formatRate(game.nonseason_response)}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-muted/20 p-4">
        <h3 className="font-semibold text-sm mb-2">자동 해석 코멘트</h3>
        <p className="text-sm leading-relaxed whitespace-pre-line">{comment}</p>
      </div>
    </div>
  )
}
