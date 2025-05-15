
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventTitleSectionProps {
  title: string;
  onTitleChange: (value: string) => void;
}

export const EventTitleSection: React.FC<EventTitleSectionProps> = ({ title, onTitleChange }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="title" className="text-sm font-medium">
        Title
      </Label>
      <Input
        id="title"
        placeholder="What would you call this moment?"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="bg-background/50"
      />
    </div>
  );
};
