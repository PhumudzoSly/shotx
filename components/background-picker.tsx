"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { backgrounds } from "@/lib/backgrounds";

interface BackgroundPickerProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function BackgroundPicker({
  selected,
  onSelect,
}: BackgroundPickerProps) {
  return (
    <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-6 gap-2">
      {backgrounds.map((bg) => (
        <button
          key={bg.id}
          onClick={() => onSelect(bg.id)}
          className={cn(
            "relative w-full aspect-square rounded-md transition-all duration-300 hover:scale-110 active:scale-95 group overflow-hidden",
            bg.preview,
            selected === bg.id &&
              "ring-2 ring-foreground ring-offset-2 ring-offset-background",
          )}
          title={bg.name}
        >
          {selected === bg.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
              <Check className="size-3 text-white drop-shadow-md" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </button>
      ))}
    </div>
  );
}
