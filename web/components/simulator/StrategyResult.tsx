import type { SimulatorResult } from "@/types"
import type { Genre } from "@/types"
import type { Slot } from "@/lib/simulator"
import { EvidenceList } from "./EvidenceList"
import { SampleSizeWarning } from "./SampleSizeWarning"

interface StrategyResultProps {
  result: SimulatorResult
  order: Slot[]
  genre: Genre
  sampleCount: number
}

const LABELS: Record<Slot, string> = {
  response: "단기 반응 가능성",
  retention: "유지율 리스크",
  satisfaction: "만족도 리스크",
  fatigue: "반복 할인 피로도",
}

export function StrategyResult({ result, order, genre, sampleCount }: StrategyResultProps) {
  const comments: Record<Slot, string> = {
    response: result.response_comment,
    retention: result.retention_comment,
    satisfaction: result.satisfaction_comment,
    fatigue: result.fatigue_comment,
  }

  return (
    <div className="space-y-4">
      {/* 진단 결과 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-slate-900">진단 결과</h3>
          <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {result.strategy_type}
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{result.summary}</p>
      </div>

      <SampleSizeWarning genre={genre} count={sampleCount} />

      {/* 전략 코멘트 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h4 className="font-semibold text-sm text-slate-900">전략 코멘트</h4>
        {order.every((s) => !comments[s]) ? (
          <p className="text-sm text-slate-400">해당 조건에서 매칭된 룰이 없습니다.</p>
        ) : (
          order.map((slot) => {
            const text = comments[slot]
            if (!text) return null
            return (
              <div key={slot} className="border-l-2 border-blue-200 pl-3">
                <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                  {LABELS[slot]}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
              </div>
            )
          })
        )}
      </div>

      {/* 근거 */}
      {result.evidences.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h4 className="font-semibold text-sm text-slate-900">근거</h4>
          <EvidenceList items={result.evidences} />
        </div>
      )}
    </div>
  )
}
