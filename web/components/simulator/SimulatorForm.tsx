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
      <h3 className="font-semibold text-slate-900">입력 조건</h3>

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

      <Field label={`할인율: ${rate}%`}>
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
        <Select value={season} onValueChange={(v) => setSeason(v as Season)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="season">시즌 세일</SelectItem>
            <SelectItem value="nonseason">비시즌 할인</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="연간 할인 빈도">
        <Select value={freq} onValueChange={(v) => setFreq(v as Freq)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {FREQS.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="전략 목표">
        <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {GOALS.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Button type="submit" className="w-full">진단 실행</Button>
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
