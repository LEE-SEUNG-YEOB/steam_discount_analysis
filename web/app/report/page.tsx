"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { GameReport } from "@/types"
import { GameSelector } from "@/components/report/GameSelector"
import { ReportPanel } from "@/components/report/ReportPanel"
import { ReportDownloadButton } from "@/components/report/ReportDownloadButton"
import { FadeUp } from "@/components/ui/motion"

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
    <div>
      {/* ── 페이지 헤더 ── */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-10">
          <FadeUp>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">게임별 리포트</h1>
            <p className="text-slate-500">
              게임을 선택하면 과거 할인 이력, 반응률, 장르 평균 비교를 자동으로 정리합니다.
            </p>
          </FadeUp>
        </div>
      </section>

      {loading && (
        <section className="bg-white">
          <div className="container mx-auto px-4 py-16 text-center text-sm text-slate-400">
            데이터 로딩 중...
          </div>
        </section>
      )}

      {loadError && (
        <section className="bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              데이터 파일을 찾을 수 없습니다.{" "}
              <code className="font-mono">python scripts/build_app_data.py</code>를 실행한 뒤 새로고침하세요.
            </div>
          </div>
        </section>
      )}

      {!loading && !loadError && (
        <>
          {/* ── 게임 선택 바 ── */}
          <section className="border-b bg-slate-50 sticky top-14 z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-500 shrink-0">
                  게임 선택 ({reports.length}개)
                </span>
                <GameSelector games={reports} selectedId={selectedId} onSelect={setSelectedId} />
                {selectedGame && <ReportDownloadButton game={selectedGame} />}
              </div>
            </div>
          </section>

          {/* ── 미선택 안내 ── */}
          {!selectedGame && (
            <section className="bg-white">
              <div className="container mx-auto px-4 py-16">
                <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-sm text-slate-400 text-center leading-relaxed">
                    위 드롭다운에서 게임을 선택하면<br />
                    할인 이력, 반응률, 장르 비교, 자동 코멘트가 표시됩니다.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── 유효 이벤트 없음 ── */}
          {selectedGame && selectedGame.valid_event_count === 0 && (
            <section className="bg-white">
              <div className="container mx-auto px-4 py-8">
                <div className="flex h-32 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-sm text-slate-400">
                    이 게임은 유효 할인 이벤트가 없어 리포트를 생성할 수 없습니다.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── 리포트 ── */}
          <AnimatePresence mode="wait">
            {selectedGame && selectedGame.valid_event_count > 0 && (
              <motion.section
                key={selectedId}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white"
              >
                <div className="container mx-auto px-4 py-8">
                  <ReportPanel game={selectedGame} />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
