import type { SummaryData, GameReport, DashboardEvent, SimulatorRule, GameInfo } from "@/types"

export async function fetchSummary(): Promise<SummaryData> {
  const res = await fetch("/data/summary.json")
  if (!res.ok) throw new Error("데이터 파일을 찾을 수 없습니다. public/data/summary.json 파일이 존재하는지 확인하세요.")
  return res.json()
}

export async function fetchGameReports(): Promise<GameReport[]> {
  const res = await fetch("/data/game_reports.json")
  if (!res.ok) throw new Error("데이터 파일을 찾을 수 없습니다. npm run build-data를 실행하세요.")
  return res.json()
}

export async function fetchDashboardEvents(): Promise<DashboardEvent[]> {
  const res = await fetch("/data/dashboard_events.json")
  if (!res.ok) throw new Error("데이터 파일을 찾을 수 없습니다. npm run build-data를 실행하세요.")
  return res.json()
}

export async function fetchSimulatorRules(): Promise<SimulatorRule[]> {
  const res = await fetch("/data/simulator_rules.json")
  if (!res.ok) throw new Error("데이터 파일을 찾을 수 없습니다. npm run build-data를 실행하세요.")
  return res.json()
}

export async function fetchGames(): Promise<GameInfo[]> {
  const res = await fetch("/data/games.json")
  if (!res.ok) throw new Error("데이터 파일을 찾을 수 없습니다. npm run build-data를 실행하세요.")
  return res.json()
}
