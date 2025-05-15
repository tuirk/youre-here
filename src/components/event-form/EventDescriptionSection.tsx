
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EventDescriptionSectionProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

export const EventDescriptionSection: React.FC<EventDescriptionSectionProps> = ({ 
  description, 
  onDescriptionChange 
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="description" className="text-sm font-medium">
        Description
      </Label>
      <Textarea
        id="description"
        placeholder="Tell us more about this memory..."
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="bg-background/50 min-h-[100px]"
      />
    </div>
  );
};
