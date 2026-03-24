"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export type BackgroundOption = {
  id: string
  name: string
  style: string
  preview: string
}

export const backgrounds: BackgroundOption[] = [
  {
    id: "midnight",
    name: "Midnight",
    style: "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]",
    preview: "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]",
  },
  {
    id: "sunset",
    name: "Sunset",
    style: "bg-gradient-to-br from-[#f12711] via-[#f5af19] to-[#f12711]",
    preview: "bg-gradient-to-br from-[#f12711] via-[#f5af19] to-[#f12711]",
  },
  {
    id: "ocean",
    name: "Ocean",
    style: "bg-gradient-to-br from-[#2193b0] to-[#6dd5ed]",
    preview: "bg-gradient-to-br from-[#2193b0] to-[#6dd5ed]",
  },
  {
    id: "forest",
    name: "Forest",
    style: "bg-gradient-to-br from-[#134e5e] to-[#71b280]",
    preview: "bg-gradient-to-br from-[#134e5e] to-[#71b280]",
  },
  {
    id: "noir",
    name: "Noir",
    style: "bg-gradient-to-br from-[#232526] to-[#414345]",
    preview: "bg-gradient-to-br from-[#232526] to-[#414345]",
  },
  {
    id: "aurora",
    name: "Aurora",
    style: "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
    preview: "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
  },
  {
    id: "candy",
    name: "Candy",
    style: "bg-gradient-to-br from-[#ee9ca7] to-[#ffdde1]",
    preview: "bg-gradient-to-br from-[#ee9ca7] to-[#ffdde1]",
  },
  {
    id: "lavender",
    name: "Lavender",
    style: "bg-gradient-to-br from-[#667eea] to-[#764ba2]",
    preview: "bg-gradient-to-br from-[#667eea] to-[#764ba2]",
  },
]

interface BackgroundPickerProps {
  selected: string
  onSelect: (id: string) => void
}

export function BackgroundPicker({ selected, onSelect }: BackgroundPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {backgrounds.map((bg) => (
        <button
          key={bg.id}
          onClick={() => onSelect(bg.id)}
          className={cn(
            "relative size-10 rounded-lg transition-all duration-200 hover:scale-110",
            bg.preview,
            selected === bg.id && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
          )}
          title={bg.name}
        >
          {selected === bg.id && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="size-4 text-white drop-shadow-lg" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
