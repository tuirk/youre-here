import React from "react";
import { Button } from "@/components/ui/button";
import { ListIcon } from "lucide-react";

interface SpiralControlsProps {
  onViewEntriesClick: () => void;
  onLoadSeedClick: () => void;
  hasEntries: boolean;
}

export const SpiralControls: React.FC<SpiralControlsProps> = ({
  onViewEntriesClick,
  onLoadSeedClick,
  hasEntries,
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
      <Button
        variant="ghost"
        className="text-white/85 hover:text-white bg-[rgba(12,12,20,0.7)] hover:bg-[rgba(20,20,32,0.9)] border border-white/[0.12] backdrop-blur-md text-xs px-3 py-1.5 h-auto rounded-lg"
        onClick={onViewEntriesClick}
      >
        <ListIcon className="mr-1.5 h-3.5 w-3.5" />
        Entries
      </Button>
      {!hasEntries && (
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 text-[10px] px-2 py-1 h-auto rounded-lg"
          onClick={onLoadSeedClick}
        >
          Load demo
        </Button>
      )}
    </div>
  );
};
