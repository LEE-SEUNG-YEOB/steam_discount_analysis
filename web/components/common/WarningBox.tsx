import { Alert, AlertDescription } from "@/components/ui/alert"

interface WarningBoxProps {
  message: string
}

export function WarningBox({ message }: WarningBoxProps) {
  return (
    <Alert variant="destructive" className="text-sm">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
