
import React from "react";
import { Label } from "@/components/ui/label";

interface EventMoodSectionProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

// Color palette for emotional tones
const MOOD_COLORS = [
  "#9b87f5", // Primary Purple
  "#D946EF", // Magenta
  "#F97316", // Orange
  "#0EA5E9", // Ocean Blue
  "#ea384c", // Red
  "#16a34a", // Green
];

export const EventMoodSection: React.FC<EventMoodSectionProps> = ({ 
  selectedColor, 
  onColorSelect 
}) => {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">Emotional Tone</Label>
      <div className="flex flex-wrap gap-2 mt-1">
        {MOOD_COLORS.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full transition-all ${
              selectedColor === color
                ? "ring-2 ring-white scale-110"
                : "opacity-80 hover:opacity-100 hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            type="button"
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};
