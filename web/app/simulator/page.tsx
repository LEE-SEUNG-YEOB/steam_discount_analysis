"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type {
  DashboardEvent,
  SimulatorInput,
  SimulatorResult,
  SimulatorRule,
} from "@/types"
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion"
import { SimulatorForm } from "@/components/simulator/SimulatorForm"
import { StrategyResult } from "@/components/simulator/StrategyResult"
import { fetchDashboardEvents, fetchSimulatorRules } from "@/lib/data"
import { orderSlots, runSim } from "@/lib/simulator"

export default function SimulatorPage() {
  const [rules, setRules] = useState<SimulatorRule[]>([])
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [input, setInput] = useState<SimulatorInput | null>(null)
  const [resultKey, setResultKey] = useState(0)
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
          <FadeUp>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Strategy Simulator</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              할인 전략 시뮬레이터
            </h1>
            <p className="text-slate-500 text-sm">
              장르·할인율·시즌·빈도·목표 조건을 입력하면 분석 데이터 기반으로 전략 리스크를 진단합니다.
            </p>
          </FadeUp>
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
              <SimulatorForm onSubmit={(v) => { setInput(v); setResultKey((k) => k + 1) }} />

              <AnimatePresence mode="wait">
                {result && input ? (
                  <motion.div
                    key={resultKey}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <StrategyResult
                      result={result}
                      order={orderSlots(input.strategy_goal)}
                      genre={input.genre}
                      sampleCount={sampleCount}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border border-slate-200 bg-white p-8 flex items-center justify-center min-h-[200px] shadow-sm"
                  >
                    <p className="text-sm text-slate-400 text-center leading-relaxed">
                      왼쪽 폼에서 조건을 선택하고<br />
                      <span className="font-semibold text-slate-600">진단 실행</span>을 누르세요.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* ── 용어 안내 ── */}
      <section className="border-t bg-slate-50">
        <div className="container mx-auto px-4 py-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">용어 안내</p>
          <div className="grid md:grid-cols-2 gap-10">

            {/* 진단 유형 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 rounded-full bg-slate-400" />
                <p className="text-sm font-bold text-slate-700">진단 유형</p>
              </div>
              <Stagger className="divide-y divide-slate-200">
                {[
                  { name: "단기 유입형",      desc: "할인율이 높아 할인 기간 내 리뷰·관심이 크게 늘어나는 패턴. 단기 노출 확대에 유리하지만 장기 효과는 별도로 확인이 필요합니다." },
                  { name: "유지율 주의형",    desc: "반응은 높지만 할인으로 유입된 유저가 장기 플레이로 이어지는 비율이 낮은 패턴. 주로 시즌 세일에서 관찰됩니다." },
                  { name: "만족도 리스크형",  desc: "반응은 좋지만 할인 후 긍정 리뷰 비율이 소폭 하락하는 경향이 나타난 패턴. Action 장르에서 관찰됩니다." },
                  { name: "반복 할인 피로형", desc: "연 3회 이상 할인 시 유저가 할인에 익숙해져 반응률이 점차 떨어질 수 있는 패턴." },
                  { name: "균형형",           desc: "위 리스크가 크게 관찰되지 않은 조건. 단, 데이터가 충분하지 않아 참고 수준입니다." },
                ].map(({ name, desc }) => (
                  <StaggerItem key={name} className="py-3.5">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{name}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            {/* 전략 코멘트 지표 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 rounded-full bg-blue-400" />
                <p className="text-sm font-bold text-slate-700">전략 코멘트 지표</p>
              </div>
              <Stagger className="divide-y divide-slate-200">
                {[
                  { name: "단기 반응 가능성", desc: "할인 기간 중 리뷰·관심이 얼마나 늘어나는지를 나타냅니다. 할인의 즉각적인 효과를 보여주는 지표입니다." },
                  { name: "유지율 리스크",    desc: "할인으로 유입된 유저가 장기 플레이로 이어지지 않을 가능성입니다. 높을수록 단발성 구매에 그칠 우려가 있습니다." },
                  { name: "만족도 리스크",    desc: "할인 후 긍정 리뷰 비율(긍정률)이 하락할 가능성입니다. 할인 구매 유저와 기존 유저의 게임 경험 차이를 반영합니다." },
                  { name: "반복 할인 피로도", desc: "잦은 할인으로 유저가 '세일만 기다리는' 습관이 생겨 정가 구매율이 낮아질 가능성입니다." },
                ].map(({ name, desc }) => (
                  <StaggerItem key={name} className="py-3.5">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{name}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
