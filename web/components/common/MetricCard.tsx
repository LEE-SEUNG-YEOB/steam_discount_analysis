interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  description?: string
}

export function MetricCard({ title, value, unit, description }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
      {description && <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
