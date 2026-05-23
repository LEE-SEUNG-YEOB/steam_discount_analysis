import type { EvidenceItem } from "@/types"

interface EvidenceBoxProps {
  item: EvidenceItem
}

export function EvidenceBox({ item }: EvidenceBoxProps) {
  const isStrong = item.confidence === "strong"
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-sm">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-medium text-slate-900">{item.title}</p>
        <span
          className={`shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            isStrong
              ? "bg-blue-50 text-blue-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isStrong ? "통계적 신호" : "탐색적 패턴"}
        </span>
      </div>
      <p className="text-slate-500 leading-relaxed">{item.description}</p>
      <p className="mt-1.5 text-xs text-slate-400">출처: {item.source}</p>
    </div>
  )
}
