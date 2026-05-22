import { ChartCard } from "@/components/common/ChartCard"
import { Badge } from "@/components/ui/badge"

export function PlaceboValidationCard() {
  return (
    <ChartCard
      title="지표 검증: Placebo Test"
      description="Engagement 반응률 지표가 실제 할인 이벤트를 감지할 수 있는지 확인하는 검증 단계입니다."
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">지표 검증</Badge>
          <span className="text-muted-foreground text-xs">핵심 인사이트가 아닌 지표 타당성 확인</span>
        </div>
        <p className="text-muted-foreground">
          진짜 할인 기간의 반응률은 비할인 랜덤 기간보다 높게 나타났습니다. 이는 Engagement 반응률 지표가 할인
          이벤트를 구분할 수 있음을 보여줍니다.
        </p>
        <p className="text-xs text-muted-foreground border-t pt-2">
          단, 이는 완전한 인과관계 증명이 아니라 지표 타당성 확인입니다.
        </p>
      </div>
    </ChartCard>
  )
}
