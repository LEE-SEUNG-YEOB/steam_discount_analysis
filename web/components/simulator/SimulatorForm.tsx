"use client"

import type { SimulatorInput } from "@/types"

interface SimulatorFormProps {
  onSubmit: (input: SimulatorInput) => void
}

export function SimulatorForm({ onSubmit }: SimulatorFormProps) {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-sm text-muted-foreground">
        SimulatorForm — 팀원 담당 컴포넌트입니다. SimulatorInput 타입에 맞춰 구현 예정.
      </p>
    </div>
  )
}
