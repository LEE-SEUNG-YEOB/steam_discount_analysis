// 할인 전략 시뮬레이터 룰 엔진
// 입력 조건 → 8개 룰 매칭 → 4개 슬롯별 코멘트 + 전략 유형 생성
import type {
  SimulatorInput,
  SimulatorResult,
  SimulatorRule,
  EvidenceItem,
} from "@/types"

// 룰이 들어가는 4개 코멘트 슬롯 분류
export type Slot = "response" | "retention" | "satisfaction" | "fatigue"

type RuleMeta = { match: (i: SimulatorInput) => boolean; slot: Slot }

// 8개 룰의 매칭 조건과 슬롯 매핑
// id는 룰 데이터 json의 id와 1:1 대응
const RULES: Record<string, RuleMeta> = {
  discount_rate_high:     { match: (i) => i.discount_rate >= 60, slot: "response" },
  discount_rate_low:      { match: (i) => i.discount_rate < 30, slot: "response" },
  season_sale_retention:  { match: (i) => i.is_season_sale === true, slot: "retention" },
  nonseason_retention:    { match: (i) => i.is_season_sale === false, slot: "retention" },
  action_satisfaction:    { match: (i) => i.genre === "Action", slot: "satisfaction" },
  rpg_retention:          { match: (i) => i.genre === "RPG", slot: "retention" },
  casual_response:        { match: (i) => i.genre === "Casual/Lightweight", slot: "response" },
  high_frequency_fatigue: { match: (i) => i.annual_discount_frequency === "3회 이상", slot: "fatigue" },
}

// 전략 목표별 코멘트 출력 순서
// 계산 결과는 동일하고 표시 순서만 바뀜
const GOAL_ORDER: Record<SimulatorInput["strategy_goal"], Slot[]> = {
  "단기 유입":   ["response", "retention", "satisfaction", "fatigue"],
  "장기 유지":   ["retention", "response", "satisfaction", "fatigue"],
  "만족도 관리": ["satisfaction", "retention", "response", "fatigue"],
}

// 목표 입력에 맞는 슬롯 순서 반환
export function orderSlots(goal: SimulatorInput["strategy_goal"]): Slot[] {
  return GOAL_ORDER[goal]
}

// 매칭된 룰 기반 전략 유형 결정
// 우선순위 피로 > 만족도 > 유지율 > 단기 유입 > 균형
function pickType(matched: SimulatorRule[], input: SimulatorInput): string {
  const has = (id: string) => matched.some((r) => r.id === id)
  if (has("high_frequency_fatigue")) return "반복 할인 피로형"
  if (has("action_satisfaction")) return "만족도 리스크형"
  if (has("season_sale_retention")) return "유지율 주의형"
  if (input.discount_rate >= 60) return "단기 유입형"
  return "균형형"
}

// 메인 진단 함수
// 룰 매칭 → 슬롯 그룹핑 → 메시지 합치기 → 결과 반환
export function runSim(
  input: SimulatorInput,
  rules: SimulatorRule[],
): SimulatorResult {
  // 입력 조건에 부합하는 룰만 추림
  const matched = rules.filter((r) => RULES[r.id]?.match(input))

  // 매칭 룰을 슬롯별로 분류
  const bySlot: Record<Slot, SimulatorRule[]> = {
    response: [], retention: [], satisfaction: [], fatigue: [],
  }
  for (const r of matched) {
    const slot = RULES[r.id]?.slot
    if (slot) bySlot[slot].push(r)
  }

  // 같은 슬롯 메시지를 한 줄로 합침
  const join = (rs: SimulatorRule[]) => rs.map((r) => r.message).join(" ")

  // 근거 카드용 데이터 변환
  const evidences: EvidenceItem[] = matched.map((r) => ({
    title: r.condition,
    description: r.message,
    source: r.evidence,
    confidence: r.confidence,
    chart: r.chart,
  }))

  // 향후 확장용 빈 배열 (표본 경고는 UI에서 처리)
  const warnings: string[] = []

  const strategyType = pickType(matched, input)
  const seasonLabel = input.is_season_sale ? "시즌 세일" : "비시즌 할인"

  return {
    strategy_type: strategyType,
    summary: `${input.genre} · 할인율 ${input.discount_rate}% · ${seasonLabel} · 연 ${input.annual_discount_frequency} 조건은 ${strategyType} 경향을 보입니다.`,
    response_comment: join(bySlot.response),
    retention_comment: join(bySlot.retention),
    satisfaction_comment: join(bySlot.satisfaction),
    fatigue_comment: join(bySlot.fatigue),
    evidences,
    warnings,
  }
}
