"use client"

// 시뮬레이터 페이지 컨테이너
// 룰 + 이벤트 로드 → 입력 받아 진단 실행 → 결과 표시
import { useEffect, useMemo, useState } from "react"
import type {
  DashboardEvent,
  SimulatorInput,
  SimulatorResult,
  SimulatorRule,
} from "@/types"
import { PageHeader } from "@/components/layout/PageHeader"
import { SimulatorForm } from "@/components/simulator/SimulatorForm"
import { StrategyResult } from "@/components/simulator/StrategyResult"
import { fetchDashboardEvents, fetchSimulatorRules } from "@/lib/data"
import { orderSlots, runSim } from "@/lib/simulator"

export default function SimulatorPage() {
  const [rules, setRules] = useState<SimulatorRule[]>([])
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [input, setInput] = useState<SimulatorInput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 룰과 대시보드 이벤트 비동기 로딩
  useEffect(() => {
    Promise.all([fetchSimulatorRules(), fetchDashboardEvents()])
      .then(([r, e]) => {
        setRules(r)
        setEvents(e)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  // 선택 장르의 유효 이벤트 수 추출 (표본 경고용)
  const sampleCount = useMemo(() => {
    if (!input) return 0
    const ev = events.find(
      (e) => e.genre === input.genre && e.playtime_filter === "all",
    )
    return ev?.valid_event_count_for_genre ?? 0
  }, [input, events])

  // 입력 또는 룰 변경 시 진단 재계산
  const result: SimulatorResult | null = useMemo(() => {
    if (!input || rules.length === 0) return null
    return runSim(input, rules)
  }, [input, rules])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="할인 전략 시뮬레이터"
        description="장르·할인율·시즌·빈도·목표 조건에 따른 전략 리스크를 진단합니다."
      />

      {loading && (
        <div className="mb-4 flex h-24 items-center justify-center text-sm text-muted-foreground">
          데이터 로딩 중...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
          룰 또는 이벤트 데이터를 불러올 수 없습니다.
          <br />
          <code className="font-mono">python scripts/build_app_data.py</code> 실행 후 다시 시도하세요.
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* 좌측 입력 폼 → 우측 결과 패널 */}
          <SimulatorForm onSubmit={setInput} />

          {result && input ? (
            <StrategyResult
              result={result}
              order={orderSlots(input.strategy_goal)}
              genre={input.genre}
              sampleCount={sampleCount}
            />
          ) : (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              왼쪽 폼에서 조건을 선택하고 <b>진단 실행</b>을 누르세요.
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-muted-foreground border-t pt-4">
        ※ 이 결과는 예측 모델이 아니라 과거 유사 조건 기준의 전략 참고용 진단입니다.
        통계적 신뢰도를 함께 확인하세요.
      </p>
    </div>
  )
}
