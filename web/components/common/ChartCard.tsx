interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  headerRight?: React.ReactNode
}

export function ChartCard({ title, description, children, className = "", headerRight }: ChartCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
        {headerRight && <div className="shrink-0 ml-3">{headerRight}</div>}
      </div>
      {children}
    </div>
  )
}
