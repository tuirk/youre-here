
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
          {viewType === "annual" ? (
            <>
              <h3 className="font-medium text-lg">About "You Are Here"</h3>
              <p className="text-sm text-gray-300">
                This 3D spiral represents your personal timeline. Each loop is a year,
                divided into 12 months.
              </p>
              <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                <li>Click anywhere on the spiral to add a memory at that time.</li>
                <li>Colored trails represent events in your life.</li>
                <li>You can add memories from {currentYear - 5} to {currentYear + 1}.</li>
                <li>Drag to rotate the view and scroll to zoom in/out.</li>
              </ul>
            </>
          ) : (
            <>
              <h3 className="font-medium text-lg">Quarterly Timeline View</h3>
              <p className="text-sm text-gray-300">
                This 3D spiral represents the current year, divided into quarters.
              </p>
              <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                <li>Each coil represents 3 months (one quarter).</li>
                <li>The visualization starts from January 1st of the current year.</li>
                <li>Click anywhere on the spiral to add a memory at that time.</li>
                <li>Colored trails represent events in your life.</li>
                <li>Drag to rotate the view and scroll to zoom in/out.</li>
              </ul>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
