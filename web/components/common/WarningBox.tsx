interface WarningBoxProps {
  message: string
}

export function WarningBox({ message }: WarningBoxProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {message}
    </div>
  )
}
