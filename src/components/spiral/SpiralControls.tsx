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
    <div className="absolute top-4 right-4 flex flex-col items-end gap-3 bg-background/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-lg">
      <p className="text-xs text-white/30 max-w-[160px] text-right">
        Click anywhere on the spiral to add an entry
      </p>
      <Button
        variant="outline"
        className="border-white/10 text-white/60 hover:bg-white/5"
        onClick={onViewEntriesClick}
      >
        <ListIcon className="mr-2 h-4 w-4" />
        Entries
      </Button>
      {!hasEntries && (
        <Button
          variant="outline"
          className="border-white/10 text-white/40 hover:bg-white/5 text-xs"
          onClick={onLoadSeedClick}
        >
          Load demo data
        </Button>
      )}
    </div>
  );
};
