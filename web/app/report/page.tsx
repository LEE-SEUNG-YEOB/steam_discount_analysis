import { PageHeader } from "@/components/layout/PageHeader"

export default function ReportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="게임별 리포트 생성기"
        description="게임을 선택하면 과거 할인 이력, 반응률, 장르 평균 비교를 자동으로 정리합니다."
      />

      {/* Game selector placeholder */}
      <div className="mb-6 rounded-lg border p-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">게임 선택:</span>
        <div className="rounded border bg-muted/30 px-4 py-2 text-sm text-muted-foreground w-64">
          GameSelector 드롭다운 자리
        </div>
      </div>

      {/* Metric cards placeholder */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        {["평균 할인율", "최고 할인율", "평균 반응률", "평균 유지율"].map((label) => (
          <div key={label} className="rounded-lg border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-muted-foreground">—</p>
          </div>
        ))}
      </div>

      {/* Comparison placeholder */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-lg border p-4 h-48 flex items-center justify-center bg-muted/20">
          <p className="text-sm text-muted-foreground">반응률 비교 차트 자리 (게임 vs 장르 중앙값 vs 전체 중앙값)</p>
        </div>
        <div className="grid grid-rows-2 gap-3">
          <div className="rounded-lg border p-4 flex items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">시즌 세일 반응률 자리</p>
          </div>
          <div className="rounded-lg border p-4 flex items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">비시즌 할인 반응률 자리</p>
          </div>
        </div>
      </div>

      {/* Auto comment placeholder */}
      <div className="rounded-lg border bg-muted/10 p-5 mb-4">
        <h3 className="font-semibold text-sm mb-2">자동 해석 코멘트</h3>
        <p className="text-sm text-muted-foreground">
          게임을 선택하면 실제 이벤트 수, 평균 반응률, 장르 중앙값, 시즌/비시즌 비교 수치를 포함한 자동 코멘트가 표시됩니다.
        </p>
      </div>

      {/* Download placeholder */}
      <div className="rounded border px-4 py-2 text-sm text-muted-foreground inline-block">
        Markdown 다운로드 버튼 자리
      </div>
    </div>
  )
}
