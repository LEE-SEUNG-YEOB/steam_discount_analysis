import type { DashboardEvent } from "@/types"

export interface GenreSentimentData {
  genre: string
  up: number
  neutral: number
  down: number
  total: number
}

export function aggregateGenreSentiment(
  events: DashboardEvent[]
): GenreSentimentData[] {
  const seen = new Set<string>()
  const unique = events.filter((e) => {
    const key = `${e.appid}_${e.discount_start}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const groups = new Map<string, { up: number; neutral: number; down: number }>()

  for (const e of unique) {
    const genre = e.genre
    if (!genre) continue

    if (!groups.has(genre)) {
      groups.set(genre, { up: 0, neutral: 0, down: 0 })
    }
    const group = groups.get(genre)!

    const sg = e.sentiment_group
    if (!sg) continue

    if (sg === "up" || sg === "positive_rate_up") {
      group.up++
    } else if (sg === "down" || sg === "positive_rate_down") {
      group.down++
    } else if (sg === "neutral" || sg === "positive_rate_flat") {
      group.neutral++
    }
  }

  const result: GenreSentimentData[] = []
  groups.forEach((counts, genre) => {
    const total = counts.up + counts.neutral + counts.down
    if (total === 0) return
    result.push({
      genre,
      up: (counts.up / total) * 100,
      neutral: (counts.neutral / total) * 100,
      down: (counts.down / total) * 100,
      total,
    })
  })

  return result.sort((a, b) => b.down - a.down)
}
