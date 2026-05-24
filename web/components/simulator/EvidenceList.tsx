import type { EvidenceItem } from "@/types"
import { EvidenceBox } from "@/components/common/EvidenceBox"

interface EvidenceListProps {
  items: EvidenceItem[]
}

export function EvidenceList({ items }: EvidenceListProps) {
  if (!items.length) return null
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, i) => (
        <EvidenceBox key={i} item={item} index={i} />
      ))}
    </div>
  )
}
