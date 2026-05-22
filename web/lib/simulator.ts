import type { SimulatorInput, SimulatorResult, SimulatorRule, EvidenceItem } from "@/types"

export function runSimulator(
  input: SimulatorInput,
  rules: SimulatorRule[]
): SimulatorResult {
  const evidences: EvidenceItem[] = rules
    .filter((r) => r.confidence === "strong")
    .slice(0, 3)
    .map((r) => ({
      title: r.condition,
      description: r.message,
      source: r.evidence,
      confidence: r.confidence,
      chart: r.chart,
    }))

  return {
    strategy_type: "분석 중",
    summary: "팀원 담당 시뮬레이터 로직이 구현되면 여기에 결과가 표시됩니다.",
    response_comment: "",
    retention_comment: "",
    satisfaction_comment: "",
    fatigue_comment: "",
    evidences,
    warnings: [],
  }
}
