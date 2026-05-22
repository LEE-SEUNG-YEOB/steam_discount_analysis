interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className = "" }: ChartCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-4 ${className}`}>
      <div className="mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}
