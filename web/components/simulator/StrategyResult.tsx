import type { SimulatorResult } from "@/types"

interface StrategyResultProps {
  result: SimulatorResult
}

export function StrategyResult({ result }: StrategyResultProps) {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-sm text-muted-foreground">
        StrategyResult — 팀원 담당 컴포넌트입니다. SimulatorResult 타입에 맞춰 구현 예정.
      </p>
    </div>
  )
}
