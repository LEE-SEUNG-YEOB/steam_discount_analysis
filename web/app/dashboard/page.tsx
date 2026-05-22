import { PageHeader } from "@/components/layout/PageHeader"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="분석 대시보드"
        description="할인율·장르·시즌성·긍정률 변화를 기준으로 분석 결과를 탐색합니다."
      />

      {/* Filters placeholder */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg border p-4 bg-muted/30">
        {["장르 필터", "플레이타임 필터", "시즌 여부 필터", "평판 변화 필터"].map((f) => (
          <div key={f} className="rounded border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            {f} 자리
          </div>
        ))}
      </div>

      {/* Summary cards placeholder */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {["55개 게임", "808건 이벤트", "263건 유효", "257만+ 리뷰"].map((v) => (
          <div key={v} className="rounded-lg border p-4 text-center">
            <p className="text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 h-64 flex items-center justify-center bg-muted/20">
          <p className="text-sm text-muted-foreground">할인율 구간별 반응률 차트 자리</p>
        </div>
        <div className="rounded-lg border p-6 h-64 flex items-center justify-center bg-muted/20">
          <p className="text-sm text-muted-foreground">장르별 반응률 차트 자리</p>
        </div>
        <div className="rounded-lg border p-6 h-64 flex items-center justify-center bg-muted/20">
          <p className="text-sm text-muted-foreground">시즌/비시즌 반응률·유지율 차트 자리</p>
        </div>
        <div className="rounded-lg border p-6 h-64 flex items-center justify-center bg-muted/20">
          <p className="text-sm text-muted-foreground">긍정률 변화 분포 차트 자리</p>
        </div>
      </div>

      {/* Placebo test */}
      <div className="mt-6 rounded-lg border p-5 bg-muted/10">
        <h3 className="font-semibold mb-2">지표 검증: Placebo Test</h3>
        <p className="text-sm text-muted-foreground">
          실제 할인 기간 반응률 vs 비할인 랜덤 기간 반응률 비교 카드 자리
        </p>
      </div>

      {/* Stats summary table placeholder */}
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
    </div>
  )
}
