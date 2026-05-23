"use client"

import { useState, useEffect } from "react"
import { SlidersHorizontal, X } from "lucide-react"
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
      <span className="text-xs font-medium text-slate-500">{label}</span>
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

function EmptyState({ isReviewTypeEmpty }: { isReviewTypeEmpty: boolean }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
      <p className="text-sm text-slate-400 text-center px-4 leading-relaxed">
        {isReviewTypeEmpty ? (
          <>이 조건에서는 긍정/부정 리뷰 기준 반응률을 계산할 수 없습니다.<br />전체 리뷰 기준으로 확인해 주세요.</>
        ) : (
          <>선택한 조건에 해당하는 이벤트가 없습니다.<br />필터를 조정해 주세요.</>
        )}
      </p>
    </div>
  )
}

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
    ([k, v]) => v !== DEFAULT_FILTERS[k as keyof DashboardFilters],
  ).length

  const reviewTypeLabel = REVIEW_TYPE_OPTIONS.find((o) => o.value === filters.reviewType)?.label

  return (
    <div>
      {/* ── 페이지 헤더 ── */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">분석 대시보드</h1>
          <p className="text-slate-500">
            할인율·장르·시즌성·긍정률 변화를 기준으로 분석 결과를 탐색합니다.
          </p>
        </div>
      </section>

      {/* ── 필터 바 ── */}
      <section className="border-b bg-slate-50 sticky top-14 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              필터
            </div>
            <FilterSelect label="장르" value={filters.genre} options={GENRE_OPTIONS} onChange={(v) => setFilter("genre", v)} />
            <FilterSelect label="플레이타임" value={filters.playtime} options={PLAYTIME_OPTIONS} onChange={(v) => setFilter("playtime", v)} />
            <FilterSelect label="시즌 여부" value={filters.season} options={SEASON_OPTIONS} onChange={(v) => setFilter("season", v)} />
            <FilterSelect label="리뷰 유형" value={filters.reviewType} options={REVIEW_TYPE_OPTIONS} onChange={(v) => setFilter("reviewType", v)} />
            <FilterSelect label="평판 변화" value={filters.sentiment} options={SENTIMENT_OPTIONS} onChange={(v) => setFilter("sentiment", v)} />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <X className="h-3 w-3" />
                초기화 ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 로딩 / 에러 ── */}
      {loading && (
        <section className="bg-white">
          <div className="container mx-auto px-4 py-16 text-center text-sm text-slate-400">
            데이터 로딩 중...
          </div>
        </section>
      )}

      {loadError && (
        <section className="bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              데이터 파일을 찾을 수 없습니다.{" "}
              <code className="font-mono">python scripts/build_app_data.py</code>를 실행하세요.
            </div>
          </div>
        </section>
      )}

      {!loading && !loadError && (
        <>
          {/* ── 통계 카드 ── */}
          <section className="border-b bg-white">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  { label: "분석 게임 수", value: "55개" },
                  { label: "수집 할인 이벤트", value: "808건" },
                  { label: "유효 분석 이벤트", value: "263건" },
                  { label: "필터 적용 이벤트", value: `${filtered.length}건` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 차트 그리드 ── */}
          <section className="border-b bg-slate-50">
            <div className="container mx-auto px-4 py-8">
              <div className="grid gap-5 md:grid-cols-2">
                <ChartCard
                  title="할인율 구간별 반응률"
                  description={`리뷰 유형: ${reviewTypeLabel}`}
                >
                  {isEmpty || isReviewTypeEmpty ? (
                    <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} />
                  ) : (
                    <DiscountRateChart events={reviewFiltered} reviewType={filters.reviewType} />
                  )}
                </ChartCard>

                <ChartCard
                  title="장르별 반응률"
                  description={`리뷰 유형: ${reviewTypeLabel}`}
                >
                  {isEmpty || isReviewTypeEmpty ? (
                    <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} />
                  ) : (
                    <GenreChart events={reviewFiltered} reviewType={filters.reviewType} />
                  )}
                </ChartCard>

                <ChartCard
                  title="시즌/비시즌 반응률·유지율"
                  description={`리뷰 유형: ${reviewTypeLabel}`}
                >
                  {isEmpty || isReviewTypeEmpty ? (
                    <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} />
                  ) : (
                    <SeasonalityChart events={reviewFiltered} reviewType={filters.reviewType} />
                  )}
                </ChartCard>

                <ChartCard title="평판 변화 분포" description="긍정률 변화 기준 이벤트 분류">
                  <SentimentDistribution events={filtered} />
                </ChartCard>
              </div>
            </div>
          </section>

          {/* ── Placebo Test ── */}
          <section className="border-b bg-slate-50">
            <div className="container mx-auto px-4 pb-8">
              <PlaceboValidationCard />
            </div>
          </section>

          {/* ── 통계 요약표 ── */}
          <section className="bg-white">
            <div className="container mx-auto px-4 py-10">
              <h2 className="text-base font-semibold text-slate-900 mb-5">통계 결과 요약</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-6 text-xs font-semibold text-slate-400 uppercase tracking-wide">구분</th>
                      <th className="text-left py-2 pr-6 text-xs font-semibold text-slate-400 uppercase tracking-wide">결과</th>
                      <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">해석</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "할인율 효과",
                        badge: "p=0.004",
                        badgeStyle: "bg-blue-50 text-blue-700",
                        note: "상대적으로 강한 신호",
                      },
                      {
                        label: "장르 차이",
                        badge: "p=0.52",
                        badgeStyle: "bg-slate-100 text-slate-500",
                        note: "탐색적 패턴",
                      },
                      {
                        label: "시즌성",
                        badge: "약함",
                        badgeStyle: "bg-slate-100 text-slate-500",
                        note: "탐색적 패턴",
                      },
                      {
                        label: "Placebo Test",
                        badge: "실제 > 비할인",
                        badgeStyle: "bg-emerald-50 text-emerald-700",
                        note: "지표 검증",
                      },
                    ].map(({ label, badge, badgeStyle, note }) => (
                      <tr key={label} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-6 font-medium text-slate-900">{label}</td>
                        <td className="py-3 pr-6">
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-medium ${badgeStyle}`}>
                            {badge}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

// ─── 평판 변화 분포 ────────────────────────────────────────────────────────

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
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        데이터 없음
      </div>
    )
  }

  const bars = [
    { label: "긍정률 상승", count: counts.up, color: "bg-emerald-500" },
    { label: "긍정률 유지", count: counts.neutral, color: "bg-slate-300" },
    { label: "긍정률 하락", count: counts.down, color: "bg-rose-400" },
  ]

  return (
    <div className="space-y-3 pt-2">
      {bars.map(({ label, count, color }) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{label}</span>
            <span className="font-medium">
              {count}건 ({total > 0 ? Math.round((count / total) * 100) : 0}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all`}
              style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-400 pt-1">총 {total}건</p>
    </div>
  )
}
