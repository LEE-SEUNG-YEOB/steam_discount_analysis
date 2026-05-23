import type { SimulatorResult } from "@/types"
import type { Genre } from "@/types"
import type { Slot } from "@/lib/simulator"
import { EvidenceList } from "./EvidenceList"
import { SampleSizeWarning } from "./SampleSizeWarning"
import { Badge } from "@/components/ui/badge"

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
      <div className="rounded-lg border p-6 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">진단 결과</h3>
          <Badge>{result.strategy_type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{result.summary}</p>
      </div>

      <SampleSizeWarning genre={genre} count={sampleCount} />

      <div className="rounded-lg border p-6 space-y-4">
        <h4 className="font-semibold text-sm">전략 코멘트</h4>
        {order.every((s) => !comments[s]) ? (
          <p className="text-sm text-muted-foreground">해당 조건에서 매칭된 룰이 없습니다.</p>
        ) : (
          order.map((slot) => {
            const text = comments[slot]
            if (!text) return null
            return (
              <div key={slot} className="border-l-2 border-foreground/30 pl-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">{LABELS[slot]}</p>
                <p className="text-sm">{text}</p>
              </div>
            )
          })
        )}
      </div>

      {result.evidences.length > 0 && (
        <div className="rounded-lg border p-6 space-y-3">
          <h4 className="font-semibold text-sm">근거</h4>
          <EvidenceList items={result.evidences} />
        </div>
      )}
    </div>
  )
}
