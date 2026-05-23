"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { SummaryData } from "@/types"
import { PageHeader } from "@/components/layout/PageHeader"
import { MetricCard } from "@/components/common/MetricCard"
import { SectionTitle } from "@/components/common/SectionTitle"
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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Steam 할인 전략 분석 도구"
        description="Steam 할인 데이터를 기반으로 전략 결과를 확인하고, 게임별 리포트를 생성하며, 할인 전략 리스크를 진단합니다."
      />

      <div className="mb-8 rounded-lg border bg-amber-50 p-5">
        <p className="text-xs text-muted-foreground mb-1">핵심 메시지</p>
        <p className="text-base font-semibold leading-relaxed">{summary.main_message}</p>
      </div>

      <SectionTitle>데이터 규모</SectionTitle>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10">
        <MetricCard title="분석 게임 수" value={summary.games_count} unit="개" />
        <MetricCard title="수집 할인 이벤트" value={summary.discount_events_collected} unit="건" />
        <MetricCard title="유효 분석 이벤트" value={summary.valid_events} unit="건" />
        <MetricCard title="수집 리뷰" value={formatReviews(summary.reviews_count)} unit="건" />
      </div>

      <SectionTitle>주요 기능</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-2">분석 대시보드</h3>
          <p className="text-sm text-muted-foreground mb-4">
            할인율·장르·시즌성·긍정률 변화를 필터로 탐색하는 인터랙티브 대시보드
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Dashboard 보기</Link>
          </Button>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-2">게임별 리포트 생성기</h3>
          <p className="text-sm text-muted-foreground mb-4">
            특정 게임의 할인 패턴, 장르 비교, 실제 수치 기반 자동 해석 코멘트 생성
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/report">Report 보기</Link>
          </Button>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-2">할인 전략 시뮬레이터</h3>
          <p className="text-sm text-muted-foreground mb-4">
            장르·할인율·시즌·빈도·목표 조건에 따른 전략 리스크 진단 도구
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/simulator">Simulator 보기</Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/methodology">분석 방법론 보기</Link>
        </Button>
      </div>
    </div>
  )
}
