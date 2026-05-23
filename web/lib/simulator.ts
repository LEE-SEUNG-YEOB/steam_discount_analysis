import type {
  SimulatorInput,
  SimulatorResult,
  SimulatorRule,
  EvidenceItem,
} from "@/types"

export type Slot = "response" | "retention" | "satisfaction" | "fatigue"

type RuleMeta = { match: (i: SimulatorInput) => boolean; slot: Slot }

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

const GOAL_ORDER: Record<SimulatorInput["strategy_goal"], Slot[]> = {
  "단기 유입":   ["response", "retention", "satisfaction", "fatigue"],
  "장기 유지":   ["retention", "response", "satisfaction", "fatigue"],
  "만족도 관리": ["satisfaction", "retention", "response", "fatigue"],
}

export function orderSlots(goal: SimulatorInput["strategy_goal"]): Slot[] {
  return GOAL_ORDER[goal]
}

function pickType(matched: SimulatorRule[], input: SimulatorInput): string {
  const has = (id: string) => matched.some((r) => r.id === id)
  if (has("high_frequency_fatigue")) return "반복 할인 피로형"
  if (has("action_satisfaction")) return "만족도 리스크형"
  if (has("season_sale_retention")) return "유지율 주의형"
  if (input.discount_rate >= 60) return "단기 유입형"
  return "균형형"
}

export function runSim(
  input: SimulatorInput,
  rules: SimulatorRule[],
): SimulatorResult {
  const matched = rules.filter((r) => RULES[r.id]?.match(input))

  const bySlot: Record<Slot, SimulatorRule[]> = {
    response: [], retention: [], satisfaction: [], fatigue: [],
  }
  for (const r of matched) {
    const slot = RULES[r.id]?.slot
    if (slot) bySlot[slot].push(r)
  }

  const join = (rs: SimulatorRule[]) => rs.map((r) => r.message).join(" ")

  const evidences: EvidenceItem[] = matched.map((r) => ({
    title: r.condition,
    description: r.message,
    source: r.evidence,
    confidence: r.confidence,
    chart: r.chart,
  }))

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
