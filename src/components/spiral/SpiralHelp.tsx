
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface SpiralHelpProps {
  viewType: "annual" | "quarterly";
  currentYear: number;
}

export const SpiralHelp: React.FC<SpiralHelpProps> = ({ viewType, currentYear }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 border border-white/10"
        >
          <Info className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background/80 backdrop-blur-md text-white border-cosmic-nebula-purple/30">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">About "You Are Here"</h3>
          <p className="text-sm text-gray-300">
            Your spiral grows each day. Each loop is one month. The golden
            marker is today.
          </p>
          <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
            <li>Hit "Journal Today" to capture a moment.</li>
            <li>Faint rings mark days you haven't journaled.</li>
            <li>Colored glows are your memories.</li>
            <li>Drag to rotate, scroll to zoom.</li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};
