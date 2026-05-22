import type { EvidenceItem } from "@/types"
import { EvidenceBox } from "@/components/common/EvidenceBox"

interface EvidenceListProps {
  items: EvidenceItem[]
}

export function EvidenceList({ items }: EvidenceListProps) {
  if (!items.length) return null
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <EvidenceBox key={i} item={item} />
      ))}
    </div>
  )
}
