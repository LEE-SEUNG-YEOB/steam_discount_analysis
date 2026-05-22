import type { EvidenceItem } from "@/types"
import { Badge } from "@/components/ui/badge"

interface EvidenceBoxProps {
  item: EvidenceItem
}

export function EvidenceBox({ item }: EvidenceBoxProps) {
  return (
    <div className="rounded border p-3 text-sm">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-medium">{item.title}</p>
        <Badge variant={item.confidence === "strong" ? "default" : "secondary"}>
          {item.confidence === "strong" ? "통계적 신호" : "탐색적 패턴"}
        </Badge>
      </div>
      <p className="text-muted-foreground">{item.description}</p>
      <p className="mt-1 text-xs text-muted-foreground">출처: {item.source}</p>
    </div>
  )
}
