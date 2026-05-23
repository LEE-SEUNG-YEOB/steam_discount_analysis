interface SectionTitleProps {
  children: React.ReactNode
  className?: string
}

export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h2 className={`text-base font-semibold text-foreground mb-4 ${className}`}>{children}</h2>
  )
}
