import { Badge } from "@/components/ui/badge"

type RiskLevel = "low" | "medium" | "high"

interface RiskBadgeProps {
  level: RiskLevel
  label: string
}

const variantMap: Record<RiskLevel, "secondary" | "default" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  return <Badge variant={variantMap[level]}>{label}</Badge>
}
