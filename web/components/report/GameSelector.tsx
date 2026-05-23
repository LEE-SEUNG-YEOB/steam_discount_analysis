"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GameReport } from "@/types"

interface GameSelectorProps {
  games: GameReport[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function GameSelector({ games, selectedId, onSelect }: GameSelectorProps) {
  return (
    <Select
      value={selectedId !== null ? selectedId.toString() : ""}
      onValueChange={(val) => onSelect(parseInt(val))}
    >
      <SelectTrigger className="w-full md:w-96">
        <SelectValue placeholder="게임을 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {games.map((game) => (
          <SelectItem key={game.appid} value={game.appid.toString()}>
            {game.name} ({game.genre})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
