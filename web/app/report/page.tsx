"use client"

import { useState, useEffect } from "react"
import type { GameReport } from "@/types"
import { PageHeader } from "@/components/layout/PageHeader"
import { GameSelector } from "@/components/report/GameSelector"
import { ReportPanel } from "@/components/report/ReportPanel"
import { ReportDownloadButton } from "@/components/report/ReportDownloadButton"

export default function ReportPage() {
  const [reports, setReports] = useState<GameReport[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    fetch("/data/game_reports.json")
      .then((r) => {
        if (!r.ok) throw new Error("fetch 실패")
        return r.json()
      })
      .then((data: GameReport[]) => {
        setReports(data)
        setLoading(false)
      })
      .catch(() => {
        setLoadError(true)
        setLoading(false)
      })
  }, [])

  const selectedGame = reports.find((r) => r.appid === selectedId) ?? null

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="게임별 리포트 생성기"
        description="게임을 선택하면 과거 할인 이력, 반응률, 장르 평균 비교를 자동으로 정리합니다."
      />

      {/* 로딩 / 에러 */}
      {loading && (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          데이터 로딩 중...
        </div>
      )}

      {loadError && (
        <div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
          데이터 파일을 찾을 수 없습니다.{" "}
          <code className="font-mono">python scripts/build_app_data.py</code>를 실행한 뒤 새로고침하세요.
        </div>
      )}

      {/* 게임 선택 */}
      {!loading && !loadError && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              게임 선택 ({reports.length}개):
            </span>
            <GameSelector
              games={reports}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {selectedGame && (
              <ReportDownloadButton game={selectedGame} />
            )}
          </div>

          {/* 게임 미선택 안내 */}
          {!selectedGame && (
            <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/20">
              <p className="text-sm text-muted-foreground text-center px-4">
                위 드롭다운에서 게임을 선택하면
                <br />
                할인 이력, 반응률, 장르 비교, 자동 코멘트가 표시됩니다.
              </p>
            </div>
          )}

          {/* 유효 이벤트 0건 안내 */}
          {selectedGame && selectedGame.valid_event_count === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg border bg-muted/20">
              <p className="text-sm text-muted-foreground">
                이 게임은 유효 할인 이벤트가 없어 리포트를 생성할 수 없습니다. 다른 게임을 선택해 주세요.
              </p>
            </div>
          )}

          {/* 리포트 */}
          {selectedGame && selectedGame.valid_event_count > 0 && (
            <ReportPanel game={selectedGame} />
          )}
        </>
      )}
    </div>
  )
}
