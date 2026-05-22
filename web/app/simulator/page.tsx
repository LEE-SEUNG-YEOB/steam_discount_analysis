import { PageHeader } from "@/components/layout/PageHeader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SimulatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="할인 전략 시뮬레이터"
        description="장르·할인율·시즌·빈도·목표 조건에 따른 전략 리스크를 진단합니다."
      />

      <Alert className="mb-6">
        <AlertTitle>팀원 담당 기능</AlertTitle>
        <AlertDescription>
          Strategy Simulator는 팀원 담당 기능이며, SimulatorInput / SimulatorResult 타입에 맞춰 통합 예정입니다.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-4">입력 폼 자리</h3>
          <div className="space-y-3">
            {[
              "장르 (Action / RPG / Adventure / Casual/Lightweight / Strategy/Simulation)",
              "할인율 (10% ~ 90%)",
              "할인 시점 (시즌 세일 / 비시즌 할인)",
              "연간 할인 빈도 (1회 / 2회 / 3회 이상)",
              "전략 목표 (단기 유입 / 장기 유지 / 만족도 관리)",
            ].map((label) => (
              <div key={label} className="flex rounded border p-3 text-sm text-muted-foreground">
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-4">진단 결과 자리</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• 전략 유형 (단기 유입형 / 유지율 주의형 / 만족도 리스크형 / 반복 할인 피로형)</p>
            <p>• 단기 반응 가능성</p>
            <p>• 유지율 리스크</p>
            <p>• 만족도 리스크</p>
            <p>• 반복 할인 피로도</p>
            <p>• 근거 통계 및 표본 크기 경고</p>
            <p className="pt-2 text-xs border-t">
              ※ 이 결과는 예측 모델이 아니라 과거 유사 조건 기준의 전략 참고용 진단입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
