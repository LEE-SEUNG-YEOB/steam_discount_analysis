"use client"

import { useState, useEffect } from "react"
import type { DashboardEvent } from "@/types"
import {
  applyFilters,
  DEFAULT_FILTERS,
  GENRE_OPTIONS,
  PLAYTIME_OPTIONS,
  SEASON_OPTIONS,
  REVIEW_TYPE_OPTIONS,
  SENTIMENT_OPTIONS,
  filterByReviewType,
  type DashboardFilters,
} from "@/lib/filter"
import { PageHeader } from "@/components/layout/PageHeader"
import { ChartCard } from "@/components/common/ChartCard"
import { DiscountRateChart } from "@/components/dashboard/DiscountRateChart"
import { GenreChart } from "@/components/dashboard/GenreChart"
import { SeasonalityChart } from "@/components/dashboard/SeasonalityChart"
import { PlaceboValidationCard } from "@/components/dashboard/PlaceboValidationCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// ─── 필터 셀렉트 ──────────────────────────────────────────────────────────

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ─── 빈 데이터 안내 ───────────────────────────────────────────────────────

function EmptyState({ isReviewTypeEmpty }: { isReviewTypeEmpty: boolean }) {
  if (isReviewTypeEmpty) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/20">
        <p className="text-sm text-muted-foreground text-center px-4">
          이 조건에서는 긍정/부정 리뷰 기준 반응률을 계산할 수 없습니다.
          <br />
          전체 리뷰 기준으로 확인해 주세요.
        </p>
      </div>
    )
  }
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/20">
      <p className="text-sm text-muted-foreground text-center px-4">
        선택한 조건에 해당하는 이벤트가 없습니다.
        <br />
        장르, 플레이타임, 리뷰 유형, 평판 변화 필터를 조정해 주세요.
      </p>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [allEvents, setAllEvents] = useState<DashboardEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)

  useEffect(() => {
    fetch("/data/dashboard_events.json")
      .then((r) => {
        if (!r.ok) throw new Error("fetch 실패")
        return r.json()
      })
      .then((data: DashboardEvent[]) => {
        setAllEvents(data)
        setLoading(false)
      })
      .catch(() => {
        setLoadError(true)
        setLoading(false)
      })
  }, [])

  const setFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const filtered = applyFilters(allEvents, filters)
  const reviewFiltered = filterByReviewType(filtered, filters.reviewType)

  const isEmpty = filtered.length === 0
  const isReviewTypeEmpty = !isEmpty && reviewFiltered.length === 0

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v !== DEFAULT_FILTERS[k as keyof DashboardFilters]
  ).length

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="분석 대시보드"
        description="할인율·장르·시즌성·긍정률 변화를 기준으로 분석 결과를 탐색합니다."
      />

      {/* ── 필터 바 ── */}
      <div className="mb-6 rounded-lg border p-4 bg-muted/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium">필터</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}개 적용 중
            </Badge>
          )}
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-xs text-muted-foreground underline hover:text-foreground ml-1"
            >
              초기화
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <FilterSelect
            label="장르"
            value={filters.genre}
            options={GENRE_OPTIONS}
            onChange={(v) => setFilter("genre", v)}
          />
          <FilterSelect
            label="플레이타임"
            value={filters.playtime}
            options={PLAYTIME_OPTIONS}
            onChange={(v) => setFilter("playtime", v)}
          />
          <FilterSelect
            label="시즌 여부"
            value={filters.season}
            options={SEASON_OPTIONS}
            onChange={(v) => setFilter("season", v)}
          />
          <FilterSelect
            label="리뷰 유형"
            value={filters.reviewType}
            options={REVIEW_TYPE_OPTIONS}
            onChange={(v) => setFilter("reviewType", v)}
          />
          <FilterSelect
            label="평판 변화"
            value={filters.sentiment}
            options={SENTIMENT_OPTIONS}
            onChange={(v) => setFilter("sentiment", v)}
          />
        </div>
      </div>

      {/* ── 로딩 / 에러 상태 ── */}
      {loading && (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          데이터 로딩 중...
        </div>
      )}

      {loadError && (
        <div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
          데이터 파일을 찾을 수 없습니다. public/data/dashboard_events.json 파일이 존재하는지 확인하세요.
          <br />
          필요하다면 <code className="font-mono">python scripts/build_app_data.py</code>를 실행하세요.
        </div>
      )}

      {/* ── 요약 카드 ── */}
      {!loading && !loadError && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
            {[
              { label: "분석 게임 수", value: "55개" },
              { label: "수집 할인 이벤트", value: "808건" },
              { label: "유효 분석 이벤트", value: "263건" },
              { label: "필터 적용 이벤트", value: `${filtered.length}건` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* ── 차트 영역 ── */}
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard
              title="할인율 구간별 반응률"
              description={`리뷰 유형: ${REVIEW_TYPE_OPTIONS.find((o) => o.value === filters.reviewType)?.label}`}
            >
              {isEmpty || isReviewTypeEmpty ? (
                <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} />
              ) : (
                <DiscountRateChart events={reviewFiltered} reviewType={filters.reviewType} />
              )}
            </ChartCard>

            <ChartCard
              title="장르별 반응률"
              description={`리뷰 유형: ${REVIEW_TYPE_OPTIONS.find((o) => o.value === filters.reviewType)?.label}`}
            >
              {isEmpty || isReviewTypeEmpty ? (
                <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} />
              ) : (
                <GenreChart events={reviewFiltered} reviewType={filters.reviewType} />
              )}
            </ChartCard>

            <ChartCard
              title="시즌/비시즌 반응률·유지율"
              description={`리뷰 유형: ${REVIEW_TYPE_OPTIONS.find((o) => o.value === filters.reviewType)?.label}`}
            >
              {isEmpty || isReviewTypeEmpty ? (
                <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} />
              ) : (
                <SeasonalityChart events={reviewFiltered} reviewType={filters.reviewType} />
              )}
            </ChartCard>

            <ChartCard
              title="평판 변화 분포"
              description="긍정률 변화 기준 이벤트 분류"
            >
              <SentimentDistribution events={filtered} />
            </ChartCard>
          </div>

          {/* ── Placebo Test ── */}
          <div className="mt-6">
            <PlaceboValidationCard />
          </div>

          {/* ── 통계 요약표 ── */}
          <div className="mt-6 rounded-lg border p-5">
            <h3 className="font-semibold mb-3">통계 결과 요약</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">구분</th>
                    <th className="text-left py-2 pr-4 font-medium">결과</th>
                    <th className="text-left py-2 font-medium">해석</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">할인율 효과</td>
                    <td className="py-2 pr-4">p=0.004</td>
                    <td className="py-2">상대적으로 강한 신호</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">장르 차이</td>
                    <td className="py-2 pr-4">p=0.52</td>
                    <td className="py-2">탐색적 패턴</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">시즌성</td>
                    <td className="py-2 pr-4">p-value 약함</td>
                    <td className="py-2">탐색적 패턴</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Placebo Test</td>
                    <td className="py-2 pr-4">실제 &gt; 비할인</td>
                    <td className="py-2">지표 검증</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── 평판 변화 분포 차트 (inline) ────────────────────────────────────────

function SentimentDistribution({ events }: { events: DashboardEvent[] }) {
  const counts = { up: 0, neutral: 0, down: 0 }
  for (const e of events) {
    const sg = e.sentiment_group
    if (!sg) continue
    if (sg === "up" || sg === "positive_rate_up") counts.up++
    else if (sg === "neutral" || sg === "positive_rate_flat") counts.neutral++
    else if (sg === "down" || sg === "positive_rate_down") counts.down++
  }
  const total = counts.up + counts.neutral + counts.down
  if (total === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        데이터 없음
      </div>
    )
  }

  const bars = [
    { label: "긍정률 상승", count: counts.up, color: "bg-emerald-500" },
    { label: "긍정률 유지", count: counts.neutral, color: "bg-slate-400" },
    { label: "긍정률 하락", count: counts.down, color: "bg-rose-400" },
  ]

  return (
    <div className="space-y-3 pt-2">
      {bars.map(({ label, count, color }) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{label}</span>
            <span>
              {count}건 ({total > 0 ? Math.round((count / total) * 100) : 0}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground pt-1">총 {total}건</p>
    </div>
  )
}
