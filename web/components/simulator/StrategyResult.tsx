"use client"

import type { SimulatorResult } from "@/types"
import type { Genre } from "@/types"
import type { Slot } from "@/lib/simulator"
import { EvidenceList } from "./EvidenceList"
import { SampleSizeWarning } from "./SampleSizeWarning"
import { Stagger, StaggerItem } from "@/components/ui/motion"

interface StrategyResultProps {
  result: SimulatorResult
  order: Slot[]
  genre: Genre
  sampleCount: number
}

const LABELS: Record<Slot, string> = {
  response:     "단기 반응 가능성",
  retention:    "유지율 리스크",
  satisfaction: "만족도 리스크",
  fatigue:      "반복 할인 피로도",
}

const SLOT_STYLE: Record<Slot, { border: string; label: string }> = {
  response:     { border: "border-l-blue-400",   label: "text-blue-600" },
  retention:    { border: "border-l-amber-400",  label: "text-amber-600" },
  satisfaction: { border: "border-l-orange-400", label: "text-orange-600" },
  fatigue:      { border: "border-l-red-400",    label: "text-red-600" },
}

const TYPE_STYLE: Record<string, string> = {
  "단기 유입형":      "bg-blue-50 text-blue-700",
  "유지율 주의형":    "bg-amber-50 text-amber-700",
  "만족도 리스크형":  "bg-orange-50 text-orange-700",
  "반복 할인 피로형": "bg-red-50 text-red-700",
  "균형형":           "bg-emerald-50 text-emerald-700",
}

export function StrategyResult({ result, order, genre, sampleCount }: StrategyResultProps) {
  const comments: Record<Slot, string> = {
    response:     result.response_comment,
    retention:    result.retention_comment,
    satisfaction: result.satisfaction_comment,
    fatigue:      result.fatigue_comment,
  }

  const typeStyle = TYPE_STYLE[result.strategy_type] ?? "bg-slate-100 text-slate-600"
  const hasComments = order.some((s) => comments[s])

  return (
    <Stagger className="space-y-4">
      {/* 진단 결과 */}
      <StaggerItem className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <h3 className="font-bold text-slate-900">진단 결과</h3>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${typeStyle}`}>
            {result.strategy_type}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
      </StaggerItem>

      <StaggerItem>
        <SampleSizeWarning genre={genre} count={sampleCount} />
      </StaggerItem>

      {/* 전략 코멘트 */}
      <StaggerItem className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="font-bold text-sm text-slate-900 mb-4">전략 코멘트</h4>
        {!hasComments ? (
          <p className="text-sm text-slate-400">해당 조건에서 매칭된 룰이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {order.map((slot) => {
              const text = comments[slot]
              if (!text) return null
              const { border, label } = SLOT_STYLE[slot]
              return (
                <div key={slot} className={`border-l-4 ${border} pl-4`}>
                  <p className={`text-xs font-bold mb-1 uppercase tracking-wide ${label}`}>
                    {LABELS[slot]}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
                </div>
              )
            })}
          </div>
        )}
      </StaggerItem>

      {/* 근거 */}
      {result.evidences.length > 0 && (
        <StaggerItem className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 mb-4">근거</h4>
          <EvidenceList items={result.evidences} />
        </StaggerItem>
      )}
    </Stagger>
  )
}
