interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  description?: string
}

export function MetricCard({ title, value, unit, description }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-xl font-bold">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
