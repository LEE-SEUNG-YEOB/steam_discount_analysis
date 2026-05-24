import type { GameReport } from "@/types"
import { GameInfoCard } from "./GameInfoCard"
import { GameDiscountChart } from "./GameDiscountChart"
import { ChartCard } from "@/components/common/ChartCard"
import { generateReportComment } from "@/lib/report"

interface ReportPanelProps {
  game: GameReport
}

export function ReportPanel({ game }: ReportPanelProps) {
  const comment = generateReportComment(game)

  return (
    <div className="space-y-6">
      <GameInfoCard game={game} />

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="반응률 비교" description="이 게임 vs 장르·전체 평균">
          <GameDiscountChart game={game} />
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">자동 해석</p>
          <div className="space-y-4 flex-1">
            {comment.split("\n").map((line, i) => (
              <p key={i} className="text-base text-slate-700 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
