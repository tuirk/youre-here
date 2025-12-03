import React, { useMemo } from "react";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { EntryPoint } from "./EventPoint";
import { EntrySmear } from "./EntrySmear";

interface EntryVisualizationsProps {
  entries: JournalEntry[];
  config: SpiralConfig;
}

export const EntryVisualizations: React.FC<EntryVisualizationsProps> = ({
  entries,
  config,
}) => {
  const firstUseDate = useMemo(() => new Date(config.firstUseDate), [config.firstUseDate]);

  return (
    <>
      {entries.map((entry) => {
        const isSmear = entry.temporalScope === "smear" && entry.endDate;
        const isForward = entry.temporalScope === "forward" && entry.endDate;

        if (isSmear || isForward) {
          return (
            <EntrySmear
              key={entry.id}
              entry={entry}
              firstUseDate={firstUseDate}
              zoom={config.zoom}
              diffuse={isForward}
            />
          );
        }

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
