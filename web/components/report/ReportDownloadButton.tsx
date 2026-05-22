"use client"

import { Button } from "@/components/ui/button"
import type { GameReport } from "@/types"
import { generateMarkdownReport } from "@/lib/report"

interface ReportDownloadButtonProps {
  game: GameReport
}

export function ReportDownloadButton({ game }: ReportDownloadButtonProps) {
  const handleDownload = () => {
    const md = generateMarkdownReport(game)
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${game.name}_할인분석리포트.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleDownload} variant="outline" size="sm">
      Markdown 다운로드
    </Button>
  )
}
