"use client"

import type { GameReport } from "@/types"
import { GameInfoCard } from "./GameInfoCard"
import { GameDiscountChart } from "./GameDiscountChart"
import { ChartCard } from "@/components/common/ChartCard"
import { generateReportComment } from "@/lib/report"
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion"

interface ReportPanelProps {
  game: GameReport
}

export function ReportPanel({ game }: ReportPanelProps) {
  const comment = generateReportComment(game)

  return (
    <div className="space-y-6">
      <FadeUp>
        <GameInfoCard game={game} />
      </FadeUp>

      {game.valid_event_count <= 2 && (
        <FadeUp delay={0.08}>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 leading-relaxed">
            {game.valid_event_count === 1
              ? "본 게임은 유효 할인 이벤트가 1건뿐이라, 모든 수치가 단일 이벤트의 결과를 반영합니다."
              : "본 게임은 유효 할인 이벤트가 2건으로 적은 편입니다. 결과 해석에 참고해주세요."}
          </div>
        </FadeUp>
      )}

      <Stagger className="grid md:grid-cols-2 gap-4">
        <StaggerItem>
          <ChartCard title="반응률 비교" description="이 게임 vs 장르·전체 평균">
            <GameDiscountChart game={game} />
          </ChartCard>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">자동 해석</p>
            <div className="space-y-4 flex-1">
              {comment.split("\n").map((line, i) => (
                <p key={i} className="text-base text-slate-700 leading-relaxed">{line}</p>
              ))}
            </div>
          </div>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
