"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BarChart3, FileText, Sliders, ArrowRight, TrendingUp } from "lucide-react"
import type { SummaryData } from "@/types"
import { Button } from "@/components/ui/button"
import { FadeUp, Stagger, StaggerItem, CountUp } from "@/components/ui/motion"

const FALLBACK: SummaryData = {
  games_count: 55,
  discount_events_collected: 808,
  valid_events: 263,
  reviews_count: 2_570_000,
  main_message: "할인은 단기 유입을 만들지만, 그 유입이 장기 유지나 긍정적 경험으로 이어지는지는 조건에 따라 달랐습니다.",
}

const FEATURES = [
  {
    icon: BarChart3,
    href: "/dashboard",
    label: "분석 대시보드",
    description: "할인율·장르·시즌성·긍정률 변화를 5가지 필터로 탐색하는 인터랙티브 차트",
    cta: "Dashboard 보기",
  },
  {
    icon: FileText,
    href: "/report",
    label: "게임별 리포트",
    description: "특정 게임의 할인 패턴, 장르 평균 비교, 실제 수치 기반 자동 코멘트",
    cta: "Report 보기",
  },
  {
    icon: Sliders,
    href: "/simulator",
    label: "전략 시뮬레이터",
    description: "장르·할인율·시즌·빈도·목표 조건에 따른 전략 리스크 룰 기반 진단",
    cta: "Simulator 보기",
  },
]

const SENTIMENT_DATA = [
  { label: "긍정률 상승", count: 75, pct: 29, color: "bg-emerald-400" },
  { label: "긍정률 유지", count: 63, pct: 24, color: "bg-slate-300" },
  { label: "긍정률 하락", count: 123, pct: 47, color: "bg-rose-400" },
]

const METRICS = [
  { label: "분석 게임", value: 55, suffix: "개" },
  { label: "수집 이벤트", value: 808, suffix: "건" },
  { label: "유효 이벤트", value: 263, suffix: "건" },
  { label: "수집 리뷰", value: 257, suffix: "만+" },
] as const

export default function HomePage() {
  const [summary, setSummary] = useState<SummaryData>(FALLBACK)

  useEffect(() => {
    fetch("/data/summary.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SummaryData | null) => { if (data) setSummary(data) })
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO — 왼쪽 정렬, 단일 컬럼
      ═══════════════════════════════════════════ */}
      {/* ── 히어로 + 이벤트 수: 배경 공유 래퍼 ── */}
      <div className="relative overflow-hidden bg-white">
        {/* 배경 장식 레이어 */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(219,234,254,0.5) 0%, rgba(237,233,254,0.4) 40%, rgba(252,231,243,0.3) 70%, transparent 100%)" }} />
        <svg aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[900px] h-[380px] opacity-[0.07]" viewBox="0 0 680 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="0,200 80,170 160,210 240,130 320,155 400,90 460,120 520,70 600,100 680,55" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points="0,200 80,170 160,210 240,130 320,155 400,90 460,120 520,70 600,100 680,55 680,260 0,260" fill="#3b82f6" opacity="0.25" />
          <polyline points="0,230 80,215 160,238 240,190 320,205 400,165 460,182 520,148 600,168 680,130" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          {[80,160,240,320,400,460,520,600].map((x, i) => {
            const y = [170,210,130,155,90,120,70,100][i]
            return <circle key={x} cx={x} cy={y} r="3.5" fill="#3b82f6" />
          })}
        </svg>

        {/* 히어로 */}
        <section className="relative">
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="max-w-6xl grid md:grid-cols-[1fr_300px] gap-12 items-center">
          <div className="pl-10">
            {/* 배지 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
                <TrendingUp className="h-3.5 w-3.5" />
                Steam 할인 데이터 기반 분석
              </span>
            </motion.div>

            {/* 헤딩 — 크게 + 그라디언트 */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="text-6xl sm:text-[5rem] font-bold tracking-tight text-slate-900 leading-[1.08] mb-5"
            >
              할인이 유저 반응에
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                미치는 영향
              </span>
            </motion.h1>

            {/* 서브텍스트 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="text-xl text-slate-500 leading-relaxed mb-10 max-w-xl"
            >
              Steam 게임 55개의 할인 이벤트를 분석해 반응률, 유지율,
              만족도 변화를 데이터로 탐색합니다.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Button asChild size="lg" className="text-base px-7 py-6">
                <Link href="/dashboard">
                  대시보드 탐색 <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-7 py-6">
                <Link href="/simulator">전략 진단</Link>
              </Button>
            </motion.div>
          </div>

          {/* ── 오른쪽: 긍정률 변화 분포 테저 ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="hidden md:flex flex-col justify-center gap-5 pt-10"
          >
            {/* 핵심 수치 콜아웃 */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                할인 후 평판 변화
              </p>
              <div className="border-l-2 border-rose-300 pl-3 space-y-1">
                <p className="text-sm text-slate-500">할인 후 오히려 평점이 낮아진 비율</p>
                <p className="text-4xl font-bold text-rose-500 leading-none">47%</p>
                <p className="text-sm text-slate-500">할인이 항상 좋은 반응을 만들지는 않았습니다</p>
              </div>
            </div>

            {/* 스택 바 */}
            <div>
              <div className="flex h-3 w-full rounded-full overflow-hidden gap-px">
                {SENTIMENT_DATA.map(({ label, pct, color }, i) => (
                  <motion.div
                    key={label}
                    className={`h-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 + i * 0.12 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2.5">
                {SENTIMENT_DATA.map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
                    <span className="text-xs text-slate-500">{label.replace("긍정률 ", "")} {pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-full h-px bg-slate-200" />

            {/* 시즌 vs 비시즌 유지율 */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                할인 후 유저 유지율
              </p>
              <div className="flex gap-4">
                <div className="border-l-2 border-slate-300 pl-3">
                  <p className="text-xs text-slate-400 mb-0.5">시즌 세일</p>
                  <p className="text-3xl font-bold text-slate-700 leading-none">12%</p>
                </div>
                <div className="border-l-2 border-blue-400 pl-3">
                  <p className="text-xs text-slate-400 mb-0.5">비시즌 세일</p>
                  <p className="text-3xl font-bold text-blue-600 leading-none">23%</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">큰 세일보다 조용한 할인이 유저를 더 오래 붙잡았습니다</p>
            </div>
          </motion.div>

          </div>
        </div>
        </section>

        {/* ── METRICS ── */}
        <section className="relative">
        <div className="container mx-auto px-4 py-14">
          <Stagger className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-slate-200">
              {METRICS.map(({ label, value, suffix }) => (
                <StaggerItem key={label} className="px-10 py-4 sm:py-0 text-center">
                  <div className="w-6 h-0.5 bg-blue-500 mx-auto mb-4 rounded-full" />
                  <p className="text-4xl font-bold text-slate-900 tabular-nums leading-none tracking-tight">
                    <CountUp value={value} />
                    <span className="text-lg font-normal text-slate-400 ml-1">{suffix}</span>
                  </p>
                  <p className="mt-2.5 text-sm text-slate-500">{label}</p>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </div>
        </section>
      </div>{/* /배경 공유 래퍼 */}

      {/* ═══════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════ */}
      <section className="bg-[#f2f4fb]">
        <div className="container mx-auto px-4 py-16">
          <FadeUp>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Features
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mb-10">
              데이터를 다양한 방법으로 탐색하세요
            </h2>
          </FadeUp>
          <Stagger className="grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, href, label, description, cta }) => (
              <StaggerItem key={href}>
                <Link
                  href={href}
                  className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md h-full"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">{description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                    {cta} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER NOTE
      ═══════════════════════════════════════════ */}
      <section className="border-t border-slate-200/70 bg-white">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            ※ 과거 유사 조건 기반의 탐색적 분석 결과입니다. 예측 모델이 아닙니다.
          </p>
        </div>
      </section>
    </div>
  )
}
