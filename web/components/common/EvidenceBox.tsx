import type { EvidenceItem } from "@/types"

interface EvidenceBoxProps {
  item: EvidenceItem
}

interface EvidenceBoxProps {
  item: EvidenceItem
  index?: number
}

export function EvidenceBox({ item, index = 0 }: EvidenceBoxProps) {
  const isStrong = item.confidence === "strong"
  return (
    <div className="flex gap-3 py-3">
      <span className={`shrink-0 mt-0.5 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
        isStrong ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
      }`}>
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            isStrong ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
          }`}>
            {isStrong ? "통계적 신호" : "탐색적 패턴"}
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
        {item.source && <p className="mt-1 text-xs text-slate-400">{item.source}</p>}
      </div>
    </div>
  )
}
