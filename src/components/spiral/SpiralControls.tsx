
import React from "react";
import { Button } from "@/components/ui/button";
import { ListIcon } from "lucide-react";

interface SpiralControlsProps {
  onJournalTodayClick: () => void;
  onAddMemoryClick: () => void;
  onViewMemoriesClick: () => void;
}

export const SpiralControls: React.FC<SpiralControlsProps> = ({
  onJournalTodayClick,
  onAddMemoryClick,
  onViewMemoriesClick,
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-4 bg-background/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-lg">
      <Button
        onClick={onJournalTodayClick}
        className="bg-cosmic-nebula-purple text-white hover:bg-cosmic-nebula-purple/90"
      >
        Journal Today
      </Button>
      <Button
        onClick={onAddMemoryClick}
        variant="outline"
        className="border-cosmic-nebula-purple/50 text-cosmic-nebula-purple hover:bg-cosmic-nebula-purple/10"
      >
        Add Memory
      </Button>
      <Button 
        variant="outline" 
        className="border-cosmic-nebula-teal text-cosmic-nebula-teal hover:bg-cosmic-nebula-teal/10"
        onClick={onViewMemoriesClick}
      >
        <ListIcon className="mr-2 h-4 w-4" />
        View Memories
      </Button>
    </div>
  );
};
