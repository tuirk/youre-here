
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventTagsSectionProps {
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
}

export const EventTagsSection: React.FC<EventTagsSectionProps> = ({ 
  tagsInput, 
  onTagsInputChange 
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="tags" className="text-sm font-medium">
        Tags <span className="text-muted-foreground text-xs">(comma-separated)</span>
      </Label>
      <Input
        id="tags"
        placeholder="happiness, achievement, family..."
        value={tagsInput}
        onChange={(e) => onTagsInputChange(e.target.value)}
        className="bg-background/50"
      />
    </div>
  );
};
