"use client"

import { useState, type ReactNode, type FormEvent } from "react"
import type { Genre, SimulatorInput } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SimulatorFormProps {
  onSubmit: (input: SimulatorInput) => void
}

type Freq = SimulatorInput["annual_discount_frequency"]
type Goal = SimulatorInput["strategy_goal"]
type Season = "season" | "nonseason"

const GENRES: Genre[] = ["Action", "RPG", "Adventure", "Casual/Lightweight", "Strategy/Simulation"]
const FREQS: Freq[] = ["1회", "2회", "3회 이상"]
const GOALS: Goal[] = ["단기 유입", "장기 유지", "만족도 관리"]

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-all ${
            value === opt.value
              ? "bg-white text-slate-900 font-semibold shadow"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function SimulatorForm({ onSubmit }: SimulatorFormProps) {
  const [genre, setGenre] = useState<Genre>("Action")
  const [rate, setRate] = useState<number>(40)
  const [season, setSeason] = useState<Season>("season")
  const [freq, setFreq] = useState<Freq>("2회")
  const [goal, setGoal] = useState<Goal>("단기 유입")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      genre,
      discount_rate: rate,
      is_season_sale: season === "season",
      annual_discount_frequency: freq,
      strategy_goal: goal,
    })
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Step 1</p>
        <h3 className="font-bold text-slate-900">입력 조건 설정</h3>
      </div>

      <Field label="장르">
        <Select value={genre} onValueChange={(v) => setGenre(v as Genre)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="할인율">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">슬라이더로 조정하세요</span>
          <span className="text-2xl font-bold text-blue-600 tabular-nums leading-none">{rate}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={90}
          step={5}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>10%</span>
          <span>50%</span>
          <span>90%</span>
        </div>
      </Field>

      <Field label="할인 시점">
        <PillGroup
          options={[
            { value: "season" as Season, label: "시즌 세일" },
            { value: "nonseason" as Season, label: "비시즌 할인" },
          ]}
          value={season}
          onChange={setSeason}
        />
      </Field>

      <Field label="연간 할인 빈도">
        <PillGroup
          options={FREQS.map((f) => ({ value: f, label: f }))}
          value={freq}
          onChange={setFreq}
        />
      </Field>

      <Field label="전략 목표">
        <PillGroup
          options={GOALS.map((g) => ({ value: g, label: g }))}
          value={goal}
          onChange={setGoal}
        />
      </Field>

      <Button type="submit" className="w-full h-11 text-sm font-semibold">진단 실행 →</Button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}
