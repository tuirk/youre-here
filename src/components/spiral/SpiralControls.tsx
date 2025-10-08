import React from "react";
import { Button } from "@/components/ui/button";
import { ListIcon, Plus } from "lucide-react";

interface SpiralControlsProps {
  onNewEntryClick: () => void;
  onViewEntriesClick: () => void;
  placementActive: boolean;
}

export const SpiralControls: React.FC<SpiralControlsProps> = ({
  onNewEntryClick,
  onViewEntriesClick,
  placementActive,
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-3 bg-background/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-lg">
      <Button
        onClick={onNewEntryClick}
        className={`text-white border border-white/10 ${
          placementActive
            ? "bg-white/20 hover:bg-white/30"
            : "bg-white/10 hover:bg-white/20"
        }`}
      >
        <Plus className="mr-2 h-4 w-4" />
        {placementActive ? "Tap the spiral..." : "New Entry"}
      </Button>
      <Button
        variant="outline"
        className="border-white/10 text-white/60 hover:bg-white/5"
        onClick={onViewEntriesClick}
      >
        <ListIcon className="mr-2 h-4 w-4" />
        Entries
      </Button>
    </div>
  );
};
