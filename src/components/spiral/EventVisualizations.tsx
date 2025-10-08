import React from "react";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { EntryPoint } from "./EventPoint";

interface EntryVisualizationsProps {
  entries: JournalEntry[];
  config: SpiralConfig;
}

export const EntryVisualizations: React.FC<EntryVisualizationsProps> = ({
  entries,
  config,
}) => {
  const firstUseDate = new Date(config.firstUseDate);

  return (
    <>
      {entries.map((entry) => {
        // For now, all entries render as points (smear/forward handled in Phase 2)
        return (
          <EntryPoint
            key={entry.id}
            entry={entry}
            firstUseDate={firstUseDate}
            zoom={config.zoom}
          />
        );
      })}
    </>
  );
};
