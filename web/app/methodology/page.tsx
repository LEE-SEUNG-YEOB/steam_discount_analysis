import { Separator } from "@/components/ui/separator"

export default function MethodologyPage() {
  return (
    <div>
      {/* ── 페이지 헤더 ── */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">분석 방법론 및 한계</h1>
          <p className="text-slate-500">
            본 분석에서 사용한 지표 정의, 분석 방법, 해석 시 유의해야 할 한계를 설명합니다.
          </p>
        </div>
      </section>

      {/* ── 본문 ── */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">지표 정의</h2>
            <div className="space-y-3 text-sm text-slate-500 leading-relaxed">
              <p>
                <strong className="text-slate-900">Engagement 반응률:</strong>{" "}
                할인 기간 리뷰 수 / 전체 평균 일별 리뷰 수 비율. 할인이 얼마나 리뷰 반응을 유발했는지를 측정합니다.
              </p>
              <p>
                <strong className="text-slate-900">Engagement 유지율:</strong>{" "}
                할인 후 14일 리뷰 수 / 할인 기간 리뷰 수 비율. 할인 유입이 이후에도 지속되는지를 측정합니다.
              </p>
              <p>
                <strong className="text-slate-900">긍정률 변화:</strong>{" "}
                할인 기간 긍정 리뷰 비율 - 할인 전 기간 긍정 리뷰 비율. 만족도 변화를 측정합니다.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">Placebo Test</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Placebo Test는 핵심 인사이트가 아니라 지표 검증 단계입니다. 실제 할인 기간의 반응률과 비할인 랜덤 기간의
              반응률을 비교해 Engagement 반응률 지표가 실제 할인 이벤트를 감지할 수 있는지 확인합니다.
              이는 완전한 인과관계 증명이 아니라 지표 타당성 확인입니다.
            </p>
          </div>

          <Separator />

          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">통계적으로 강한 신호</h2>
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-900">할인율 효과:</span>{" "}
              <span className="font-mono text-blue-700">Spearman ρ=0.18, p=0.004</span>{" "}
              <span className="text-slate-500">— 이번 분석에서 상대적으로 가장 강한 통계적 신호입니다.</span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">탐색적 패턴 (통계적으로 약한 신호)</h2>
            <div className="space-y-2 text-sm text-slate-500 leading-relaxed">
              <p>
                • <strong className="text-slate-900">장르 차이:</strong>{" "}
                <span className="font-mono">p=0.52</span> — 통계적으로 유의하지 않아 탐색적 패턴으로 해석합니다.
              </p>
              <p>
                • <strong className="text-slate-900">시즌성:</strong> p-value가 충분히 낮지 않아 탐색적 패턴으로 해석합니다.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">분석의 한계</h2>
            <ul className="text-sm text-slate-500 space-y-2 leading-relaxed">
              <li>• 리뷰 수는 매출이 아닙니다. 실제 매출·위시리스트·동시접속자 데이터가 있으면 더 정확합니다.</li>
              <li>• 일부 장르는 표본 수가 적어 결과 변동성이 클 수 있습니다.</li>
              <li>• 동일 게임의 반복 할인 효과는 게임 단위 집계 시 희석될 수 있습니다.</li>
              <li>• 플레이타임 필터는 리뷰 작성 시점 기준이므로 실제 플레이 패턴과 다를 수 있습니다.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              긍정/부정 리뷰 필터 이벤트 수 차이 (263건 vs 261건)
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              긍정/부정 리뷰 필터는 긍정·부정 리뷰 수가 모두 계산 가능한 이벤트만 사용했습니다. 따라서 전체
              유효 분석 이벤트 263건 중 일부 이벤트가 제외되어 261건 기준으로 계산될 수 있습니다.
              이 차이는 데이터 결측 또는 리뷰 수 부족에 따른 필터링 결과입니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
