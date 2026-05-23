"use client"

import { useEffect, useMemo, useState } from "react"
import type {
  DashboardEvent,
  SimulatorInput,
  SimulatorResult,
  SimulatorRule,
} from "@/types"
import { FadeUp } from "@/components/ui/motion"
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

  const sampleCount = useMemo(() => {
    if (!input) return 0
    const ev = events.find(
      (e) => e.genre === input.genre && e.playtime_filter === "all",
    )
    return ev?.valid_event_count_for_genre ?? 0
  }, [input, events])

  const result: SimulatorResult | null = useMemo(() => {
    if (!input || rules.length === 0) return null
    return runSim(input, rules)
  }, [input, rules, sampleCount])

  return (
    <div>
      {/* ── 페이지 헤더 ── */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            할인 전략 시뮬레이터
          </h1>
          <p className="text-slate-500">
            장르·할인율·시즌·빈도·목표 조건에 따른 전략 리스크를 진단합니다.
          </p>
        </div>
      </section>

      {loading && (
        <section className="bg-white">
          <div className="container mx-auto px-4 py-16 text-center text-sm text-slate-400">
            데이터 로딩 중...
          </div>
        </section>
      )}

      {error && (
        <section className="bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              룰 또는 이벤트 데이터를 불러올 수 없습니다.{" "}
              <code className="font-mono">python scripts/build_app_data.py</code> 실행 후 다시 시도하세요.
            </div>
          </div>
        </section>
      )}

      {!loading && !error && (
        <section className="bg-slate-50">
          <div className="container mx-auto px-4 py-8">
            <FadeUp className="grid gap-6 md:grid-cols-2">
              <SimulatorForm onSubmit={setInput} />

              {result && input ? (
                <StrategyResult
                  result={result}
                  order={orderSlots(input.strategy_goal)}
                  genre={input.genre}
                  sampleCount={sampleCount}
                />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-8 flex items-center justify-center min-h-[200px] shadow-sm">
                  <p className="text-sm text-slate-400 text-center leading-relaxed">
                    왼쪽 폼에서 조건을 선택하고<br />
                    <span className="font-semibold text-slate-600">진단 실행</span>을 누르세요.
                  </p>
                </div>
              )}
            </FadeUp>
          </div>
        </section>
      )}

      <section className="border-t bg-white">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-slate-400">
            ※ 이 결과는 예측 모델이 아니라 과거 유사 조건 기준의 전략 참고용 진단입니다.
            통계적 신뢰도를 함께 확인하세요.
          </p>
        </div>
      </section>
    </div>
  )
}
