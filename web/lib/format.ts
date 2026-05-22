export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatRate(value: number): string {
  return value.toFixed(3)
}

export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR")
}

export function formatRateLabel(value: number): string {
  return `반응률 ${value.toFixed(3)}`
}
