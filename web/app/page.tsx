"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, FileText, Sliders, ArrowRight, TrendingUp } from "lucide-react"
import type { SummaryData } from "@/types"
import { Button } from "@/components/ui/button"

function formatReviews(n: number): string {
  if (n >= 10_000) return `${Math.floor(n / 10_000)}만+`
  return n.toLocaleString("ko-KR")
}

const FALLBACK: SummaryData = {
  games_count: 55,
  discount_events_collected: 808,
  valid_events: 263,
  reviews_count: 2_570_000,
  main_message:
    "할인은 단기 유입을 만들지만, 그 유입이 장기 유지나 긍정적 경험으로 이어지는지는 조건에 따라 달랐습니다.",
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

export default function HomePage() {
  const [summary, setSummary] = useState<SummaryData>(FALLBACK)

  useEffect(() => {
    fetch("/data/summary.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SummaryData | null) => {
        if (data) setSummary(data)
      })
      .catch(() => {})
  }, [])

  const metrics = [
    { label: "분석 게임", value: summary.games_count, suffix: "개" },
    { label: "수집 이벤트", value: summary.discount_events_collected, suffix: "건" },
    { label: "유효 이벤트", value: summary.valid_events, suffix: "건" },
    { label: "수집 리뷰", value: formatReviews(summary.reviews_count), suffix: "건" },
  ]

  return (
    <div>
      {/* ── Hero ── */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 mb-6">
              <TrendingUp className="h-3 w-3" />
              Steam 할인 데이터 기반 분석
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight mb-4">
              할인이 유저 반응에<br />미치는 영향
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
              Steam 게임 55개의 할인 이벤트를 분석해 반응률, 유지율,
              만족도 변화를 데이터로 탐색합니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  대시보드 탐색
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/methodology">분석 방법론</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Insight ── */}
      <section className="border-b bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
            핵심 인사이트
          </p>
          <p className="text-xl font-semibold text-slate-900 leading-relaxed max-w-3xl">
            {summary.main_message}
          </p>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            데이터 규모
          </p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {metrics.map(({ label, value, suffix }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-slate-900 tabular-nums">
                  {value}
                  <span className="text-base font-normal text-slate-400 ml-1">{suffix}</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            주요 기능
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, href, label, description, cta }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md flex flex-col"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                  {description}
                </p>
                <span className="text-sm font-medium text-blue-600 group-hover:underline">
                  {cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
