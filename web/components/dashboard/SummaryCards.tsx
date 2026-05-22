import type { SummaryData } from "@/types"
import { MetricCard } from "@/components/common/MetricCard"

interface SummaryCardsProps {
  data: SummaryData
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <MetricCard title="분석 게임 수" value={data.games_count} unit="개" />
      <MetricCard title="수집 할인 이벤트" value={data.discount_events_collected} unit="건" />
      <MetricCard title="유효 분석 이벤트" value={data.valid_events} unit="건" />
      <MetricCard
        title="수집 리뷰"
        value={`${Math.round(data.reviews_count / 10000)}만+`}
        unit="건"
      />
    </div>
  )
}
