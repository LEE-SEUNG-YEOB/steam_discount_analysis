import type { GameReport } from "@/types"

export function generateReportComment(game: GameReport): string {
  const lines: string[] = []

  if (game.valid_event_count === 1) {
    lines.push(
      `※ 본 게임은 분석 기간 중 유효 할인 이벤트가 1건뿐입니다. 아래 해석은 단일 이벤트 기준이므로 일반화에 주의해주세요.`
    )
  }

  // 반응률 + 장르/전체 비교
  const aboveGenre = game.avg_response_rate > game.genre_median_response
  const aboveOverall = game.avg_response_rate > game.overall_median_response
  lines.push(
    `${game.name}의 평균 반응률은 ${game.avg_response_rate.toFixed(3)}으로, 장르(${game.genre}) 평균 ${game.genre_median_response.toFixed(3)}보다 ${aboveGenre ? "높고" : "낮고"} 전체 평균 ${game.overall_median_response.toFixed(3)}보다 ${aboveOverall ? "높습니다." : "낮습니다."}`
  )

  // 할인 빈도 + 할인율
  const freqText = game.discount_frequency >= 3 ? "자주(연 3회 이상)" : game.discount_frequency === 2 ? "연 2회" : "연 1회 내외"
  lines.push(
    `할인은 ${freqText} 진행되었으며, 평균 ${game.avg_discount_rate.toFixed(1)}% 수준으로 최대 ${game.max_discount_rate.toFixed(1)}%까지 할인한 이력이 있습니다.`
  )

  // 시즌 vs 비시즌
  if (game.season_response != null && game.nonseason_response != null) {
    const diff = Math.abs(game.season_response - game.nonseason_response)
    if (game.nonseason_response > game.season_response) {
      lines.push(
        `시즌 세일(${game.season_response.toFixed(3)})보다 비시즌 할인(${game.nonseason_response.toFixed(3)})에서 반응률이 ${diff.toFixed(3)} 더 높아, 조용한 시기의 할인이 더 효과적이었습니다.`
      )
    } else if (game.season_response > game.nonseason_response) {
      lines.push(
        `시즌 세일(${game.season_response.toFixed(3)})에서 반응률이 비시즌(${game.nonseason_response.toFixed(3)})보다 ${diff.toFixed(3)} 높아, 시즌 이벤트와 연계한 할인 전략이 효과적이었습니다.`
      )
    }
  }

  // 유지율
  if (game.avg_retention_rate >= 0.2) {
    lines.push(
      `유지율은 ${game.avg_retention_rate.toFixed(3)}으로 비교적 높아, 할인을 통해 유입된 유저 중 일부가 장기 플레이로 이어진 것으로 보입니다.`
    )
  } else if (game.avg_retention_rate >= 0.1) {
    lines.push(
      `유지율은 ${game.avg_retention_rate.toFixed(3)}으로 중간 수준이며, 단기 유입은 있었으나 장기 유지로 이어지는 비율은 제한적이었습니다.`
    )
  } else {
    lines.push(
      `유지율은 ${game.avg_retention_rate.toFixed(3)}으로 낮은 편으로, 할인이 단기 유입에는 효과적이었으나 장기 유지 전략을 별도로 고려할 필요가 있습니다.`
    )
  }

  if (
    game.avg_response_rate < 0 ||
    (game.season_response != null && game.season_response < 0) ||
    (game.nonseason_response != null && game.nonseason_response < 0)
  ) {
    lines.push(
      `※ 음수 반응률은 할인 기간의 일평균 리뷰가 직전 30일보다 오히려 줄었음을 의미합니다.`
    )
  }

  if (game.season_response == null || game.nonseason_response == null) {
    lines.push(
      `※ 수집된 할인 이벤트가 시즌 세일 또는 비시즌 한 종류만 존재해 시즌/비시즌 비교 데이터를 산출할 수 없습니다.`
    )
  }

  if (game.valid_event_count === 2) {
    lines.push(
      `※ 본 게임은 유효 할인 이벤트가 2건으로 적은 편이라 결과의 안정성이 제한적일 수 있습니다.`
    )
  }

  return lines.join("\n")
}

export function generateMarkdownReport(game: GameReport): string {
  const comment = generateReportComment(game)
  return `# ${game.name} 할인 분석 리포트

## 기본 정보
- 장르: ${game.genre}
- 유효 할인 이벤트: ${game.valid_event_count}건
- 평균 할인율: ${game.avg_discount_rate.toFixed(1)}%
- 최고 할인율: ${game.max_discount_rate.toFixed(1)}%

## 반응률 분석
- 평균 반응률: ${game.avg_response_rate.toFixed(3)}
- 평균 유지율: ${game.avg_retention_rate.toFixed(3)}
- 장르(${game.genre}) 중앙값: ${game.genre_median_response.toFixed(3)}
- 전체 중앙값: ${game.overall_median_response.toFixed(3)}

## 시즌 비교
- 시즌 세일 반응률: ${game.season_response != null ? game.season_response.toFixed(3) : "데이터 없음"}
- 비시즌 할인 반응률: ${game.nonseason_response != null ? game.nonseason_response.toFixed(3) : "데이터 없음"}

## 자동 해석 코멘트
${comment}

---
*본 리포트는 Steam 할인 전략 분석 도구에서 자동 생성되었습니다.*
`
}
