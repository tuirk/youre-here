
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface EventIntensitySectionProps {
  intensity: number;
  onIntensityChange: (value: number) => void;
}

export const EventIntensitySection: React.FC<EventIntensitySectionProps> = ({
  intensity,
  onIntensityChange
}) => {
  return (
    <div className="grid gap-3">
      <div className="flex justify-between">
        <Label htmlFor="intensity" className="text-sm font-medium">
          Intensity
        </Label>
        <span className="text-sm text-muted-foreground">{intensity}/10</span>
      </div>
      <Slider
        id="intensity"
        min={1}
        max={10}
        step={1}
        value={[intensity]}
        onValueChange={(values) => onIntensityChange(values[0])}
        className="py-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Subtle</span>
        <span>Significant</span>
      </div>
    </div>
  );
};
