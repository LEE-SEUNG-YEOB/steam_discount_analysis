import { WarningBox } from "@/components/common/WarningBox"
import { GENRE_SAMPLE_THRESHOLD } from "@/lib/constants"

interface SampleSizeWarningProps {
  genre: string
  count: number
}

export function SampleSizeWarning({ genre, count }: SampleSizeWarningProps) {
  if (count >= GENRE_SAMPLE_THRESHOLD) return null
  return (
    <WarningBox
      message={`주의: ${genre} 장르의 유효 이벤트 수(${count}건)가 적어 결과 변동성이 클 수 있습니다. 확정 결론이 아니라 탐색적 경향으로 해석하세요.`}
    />
  )
}
