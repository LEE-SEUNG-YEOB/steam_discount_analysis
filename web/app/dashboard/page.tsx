"use client"

import { useState, useEffect } from "react"
import { SlidersHorizontal, X, BarChart3 } from "lucide-react"
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
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion"
import { DiscountRateChart, type ChartMode } from "@/components/dashboard/DiscountRateChart"
import { GenreChart } from "@/components/dashboard/GenreChart"
import { SeasonalityChart } from "@/components/dashboard/SeasonalityChart"
import { SentimentByGenreChart } from "@/components/dashboard/SentimentByGenreChart"
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
  isActive,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
  isActive?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-[11px] font-semibold tracking-wide ${isActive ? "text-blue-600" : "text-slate-400"}`}>{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className={`h-8 text-xs w-32 transition-colors ${isActive ? "border-blue-400 bg-blue-50 text-blue-900" : "bg-white"}`}>
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

function ModeToggle({ mode, onChange }: { mode: ChartMode; onChange: (m: ChartMode) => void }) {
  return (
    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
      {(["median", "mean"] as ChartMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-2.5 py-1 transition-colors ${
            mode === m
              ? "bg-slate-900 text-white font-medium"
              : "bg-white text-slate-400 hover:text-slate-600"
          }`}
        >
          {m === "median" ? "중앙값" : "평균값"}
        </button>
      ))}
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

const STAT_CONFIG = [
  { key: "games",   label: "분석 게임 수",     accent: "bg-blue-500",    sub: "전체 55개" },
  { key: "collect", label: "수집 할인 이벤트",  accent: "bg-slate-300",   sub: "전체 기준" },
  { key: "valid",   label: "유효 분석 이벤트",  accent: "bg-violet-400",  sub: "전체 263건" },
  { key: "applied", label: "필터 적용 이벤트",  accent: "bg-emerald-400", sub: null },
]

const FINDINGS = [
  {
    dot: "bg-blue-500",
    title: "25% 미만 할인은 반응률이 절반 수준",
    verdict: "유의미한 신호",
    verdictStyle: "bg-blue-50 text-blue-700",
    body: "소폭 할인(~25%)의 반응률은 0.125로, 50% 이상 할인(0.280~0.324)의 절반에 그칩니다. 단순히 '많이 깎을수록 좋다'가 아닌, 25~50% 구간이 최소 임계점으로 보입니다.",
  },
  {
    dot: "bg-slate-400",
    title: "장르별 차이는 탐색적 수준",
    verdict: "탐색적 패턴",
    verdictStyle: "bg-slate-100 text-slate-500",
    body: "장르마다 반응률 분포가 다르게 나타나지만, 통계적 유의성은 낮아 참고 수준입니다.",
  },
  {
    dot: "bg-slate-400",
    title: "시즌 세일 효과 뚜렷하지 않음",
    verdict: "탐색적 패턴",
    verdictStyle: "bg-slate-100 text-slate-500",
    body: "시즌 세일과 비시즌 할인 간 반응률 차이가 일관되게 나타나지 않습니다.",
  },
  {
    dot: "bg-emerald-500",
    title: "반응률 지표, 할인 이벤트 감지 확인",
    verdict: "지표 검증됨",
    verdictStyle: "bg-emerald-50 text-emerald-700",
    body: "실제 할인 기간의 반응률이 비할인 랜덤 기간보다 높아, 지표가 의미 있음을 확인했습니다.",
  },
] as const

export default function DashboardPage() {
  const [allEvents, setAllEvents] = useState<DashboardEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)
  const [discountMode, setDiscountMode] = useState<ChartMode>("median")
  const [genreMode, setGenreMode] = useState<ChartMode>("median")

  useEffect(() => {
    fetch("/data/dashboard_events.json")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: DashboardEvent[]) => { setAllEvents(data); setLoading(false) })
      .catch(() => { setLoadError(true); setLoading(false) })
  }, [])

  const setFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const filtered = applyFilters(allEvents, filters)
  const reviewFiltered = filterByReviewType(filtered, filters.reviewType)
  const filteredBase = filtered
  const filteredGameCount = new Set(filteredBase.map((e) => e.appid)).size

  const isEmpty = filtered.length === 0
  const isReviewTypeEmpty = !isEmpty && reviewFiltered.length === 0

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v !== DEFAULT_FILTERS[k as keyof DashboardFilters],
  ).length

  const reviewTypeLabel = REVIEW_TYPE_OPTIONS.find((o) => o.value === filters.reviewType)?.label

  const statValues: Record<string, string> = {
    games:   `${filteredGameCount}개`,
    collect: "808건",
    valid:   `${filteredBase.length}건`,
    applied: `${filtered.length}건`,
  }

  return (
    <div>
      {/* ── 페이지 헤더 ── */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
                Analysis Dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">분석 대시보드</h1>
              <p className="text-slate-500 text-sm">
                할인율·장르·시즌성·긍정률 변화를 기준으로 분석 결과를 탐색합니다.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
              <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
              5개 필터 · 5개 차트
            </div>
          </div>
        </div>
      </section>

      {/* ── 필터 바 ── */}
      <section className="border-b bg-slate-50 sticky top-14 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex flex-col gap-2 pl-4 pr-4 border-r border-slate-200 shrink-0">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold text-slate-600 tracking-wide">필터</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <X className="h-2.5 w-2.5" />
                  초기화 {activeFilterCount > 1 ? `(${activeFilterCount})` : ""}
                </button>
              )}
            </div>
            <FilterSelect label="장르" value={filters.genre} options={GENRE_OPTIONS} onChange={(v) => setFilter("genre", v)} isActive={filters.genre !== DEFAULT_FILTERS.genre} />
            <FilterSelect label="플레이타임" value={filters.playtime} options={PLAYTIME_OPTIONS} onChange={(v) => setFilter("playtime", v)} isActive={filters.playtime !== DEFAULT_FILTERS.playtime} />
            <FilterSelect label="시즌 여부" value={filters.season} options={SEASON_OPTIONS} onChange={(v) => setFilter("season", v)} isActive={filters.season !== DEFAULT_FILTERS.season} />
            <FilterSelect label="리뷰 유형" value={filters.reviewType} options={REVIEW_TYPE_OPTIONS} onChange={(v) => setFilter("reviewType", v)} isActive={filters.reviewType !== DEFAULT_FILTERS.reviewType} />
            <FilterSelect label="평판 변화" value={filters.sentiment} options={SENTIMENT_OPTIONS} onChange={(v) => setFilter("sentiment", v)} isActive={filters.sentiment !== DEFAULT_FILTERS.sentiment} />
          </div>
        </div>
      </section>

      {/* ── 로딩 / 에러 ── */}
      {loading && (
        <div className="container mx-auto px-4 py-20 text-center text-sm text-slate-400">
          데이터 로딩 중...
        </div>
      )}
      {loadError && (
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            데이터 파일을 찾을 수 없습니다.{" "}
            <code className="font-mono">python scripts/build_app_data.py</code>를 실행하세요.
          </div>
        </div>
      )}

      {!loading && !loadError && (
        <>
          {/* ── 통계 스트립 ── */}
          <section className="border-b bg-white">
            <div className="container mx-auto px-4">
              <FadeUp>
                <div className="flex items-center">
                  {STAT_CONFIG.map(({ key, label, accent, sub }, i) => (
                    <>
                      {i > 0 && <div key={`sep-${i}`} className="w-px h-10 bg-slate-200 shrink-0" />}
                      <div key={key} className="flex-1 px-6 py-6 text-center">
                        <div className={`w-5 h-0.5 rounded-full ${accent} mx-auto mb-3`} />
                        <p className="text-3xl font-bold text-slate-900 tabular-nums">{statValues[key]}</p>
                        <p className="text-xs text-slate-500 mt-1.5">{label}</p>
                        {sub && <p className="text-xs text-slate-300 mt-0.5">{sub}</p>}
                      </div>
                    </>
                  ))}
                </div>
              </FadeUp>
            </div>
          </section>

          {/* ── 차트 그리드 ── */}
          <section className="bg-[#f2f4fb]">
            <div className="container mx-auto px-4 py-10">
              <FadeUp>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Charts</p>
                <h2 className="text-lg font-bold text-slate-900 mb-6">인터랙티브 차트</h2>
              </FadeUp>
              <Stagger className="grid gap-5 md:grid-cols-2">
                <StaggerItem>
                  <ChartCard title="할인율 구간별 반응률" description={`리뷰 유형: ${reviewTypeLabel}`} headerRight={<ModeToggle mode={discountMode} onChange={setDiscountMode} />}>
                    {isEmpty || isReviewTypeEmpty ? <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} /> : <DiscountRateChart events={reviewFiltered} reviewType={filters.reviewType} mode={discountMode} />}
                  </ChartCard>
                </StaggerItem>
                <StaggerItem>
                  <ChartCard title="장르별 반응률" description={`리뷰 유형: ${reviewTypeLabel}`} headerRight={<ModeToggle mode={genreMode} onChange={setGenreMode} />}>
                    {isEmpty || isReviewTypeEmpty ? <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} /> : <GenreChart events={reviewFiltered} reviewType={filters.reviewType} mode={genreMode} />}
                  </ChartCard>
                </StaggerItem>
                <StaggerItem>
                  <ChartCard title="시즌/비시즌 반응률·유지율" description={`리뷰 유형: ${reviewTypeLabel}`}>
                    {isEmpty || isReviewTypeEmpty ? <EmptyState isReviewTypeEmpty={isReviewTypeEmpty} /> : <SeasonalityChart events={reviewFiltered} reviewType={filters.reviewType} />}
                  </ChartCard>
                </StaggerItem>
                <StaggerItem>
                  <ChartCard title="평판 변화 분포" description="긍정률 변화 기준 이벤트 분류">
                    <SentimentDistribution events={filtered} />
                  </ChartCard>
                </StaggerItem>
                <StaggerItem className="md:col-span-2">
                  <ChartCard
                    title="장르별 평판 변화 분포"
                    description="장르별 긍정률 상승/유지/하락 이벤트 비율"
                  >
                    {isEmpty ? <EmptyState isReviewTypeEmpty={false} /> : <SentimentByGenreChart events={filtered} />}
                  </ChartCard>
                  <p className="text-xs text-slate-400 mt-2 px-1 leading-relaxed">
                    ※ 전체 분포뿐 아니라 장르별로 긍정률 하락 비중을 확인할 수 있습니다.
                    단순 유입량이 아닌, 유입의 질이 장르별로 다르게 나타남을 보여줍니다.
                  </p>
                </StaggerItem>
              </Stagger>
            </div>
          </section>

          {/* ── 통계 결과 요약 ── */}
          <section className="bg-white border-t">
            <div className="container mx-auto px-4 py-10">
              <FadeUp>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Summary</p>
                <h2 className="text-lg font-bold text-slate-900 mb-6">통계 결과 요약</h2>
              </FadeUp>
              <div className="py-2">
                {FINDINGS.map(({ dot, title, verdict, verdictStyle, body }, i) => (
                  <div key={title} className="flex gap-5">
                    {/* 타임라인 줄기 */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white ${dot}`}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {i < FINDINGS.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 my-1.5" />
                      )}
                    </div>
                    {/* 내용 */}
                    <div className={`flex-1 ${i < FINDINGS.length - 1 ? "pb-8" : ""}`}>
                      <div className="flex items-start justify-between gap-3 mb-1.5 -mt-0.5">
                        <h3 className="font-semibold text-slate-900 leading-snug">{title}</h3>
                        <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${verdictStyle}`}>{verdict}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
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
  if (total === 0) return <div className="flex h-32 items-center justify-center text-sm text-slate-400">데이터 없음</div>

  const bars = [
    { label: "긍정률 상승", count: counts.up,      color: "bg-emerald-400" },
    { label: "긍정률 유지", count: counts.neutral,  color: "bg-slate-300" },
    { label: "긍정률 하락", count: counts.down,     color: "bg-rose-400" },
  ]

  return (
    <div className="space-y-3 pt-2">
      {bars.map(({ label, count, color }) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{label}</span>
            <span className="font-semibold text-slate-700">
              {count}건 <span className="text-slate-400 font-normal">({Math.round((count / total) * 100)}%)</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${(count / total) * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-400 pt-1">총 {total}건</p>
    </div>
  )
}
