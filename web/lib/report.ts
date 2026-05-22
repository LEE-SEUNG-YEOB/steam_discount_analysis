import type { GameReport } from "@/types"

export function generateReportComment(game: GameReport): string {
  const lines: string[] = []

  lines.push(
    `${game.name}는 총 ${game.valid_event_count}건의 유효 할인 이벤트가 있었고, 평균 반응률은 ${game.avg_response_rate.toFixed(3)}입니다.`
  )

  if (game.avg_response_rate > game.genre_median_response) {
    lines.push(
      `이는 같은 장르(${game.genre}) 중앙값 ${game.genre_median_response.toFixed(3)}보다 높은 편입니다.`
    )
  } else {
    lines.push(
      `이는 같은 장르(${game.genre}) 중앙값 ${game.genre_median_response.toFixed(3)}보다 낮은 편입니다.`
    )
  }

  if (game.season_response !== undefined && game.nonseason_response !== undefined) {
    if (game.season_response > game.nonseason_response) {
      lines.push(
        `시즌 세일의 평균 반응률은 ${game.season_response.toFixed(3)}로, 비시즌 할인 ${game.nonseason_response.toFixed(3)}보다 높게 나타났습니다.`
      )
      lines.push(`따라서 이 게임은 시즌 할인에서 단기 반응이 더 크게 나타나는 패턴을 보입니다.`)
    } else if (game.nonseason_response > game.season_response) {
      lines.push(
        `비시즌 할인의 평균 반응률은 ${game.nonseason_response.toFixed(3)}로, 시즌 세일 ${game.season_response.toFixed(3)}보다 높게 나타났습니다.`
      )
    }
  }

  lines.push(
    `평균 할인율은 ${game.avg_discount_rate.toFixed(1)}%이며, 최고 할인율은 ${game.max_discount_rate.toFixed(1)}%입니다.`
  )

  if (game.avg_retention_rate < 0.1) {
    lines.push(
      `다만 평균 유지율은 ${game.avg_retention_rate.toFixed(3)}으로 낮은 편이며, 단기 유입 이후 장기 유지 전략을 함께 고려할 필요가 있습니다.`
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
- 시즌 세일 반응률: ${game.season_response !== undefined ? game.season_response.toFixed(3) : "데이터 없음"}
- 비시즌 할인 반응률: ${game.nonseason_response !== undefined ? game.nonseason_response.toFixed(3) : "데이터 없음"}

## 자동 해석 코멘트
${comment}

---
*본 리포트는 Steam 할인 전략 분석 도구에서 자동 생성되었습니다.*
`
}
