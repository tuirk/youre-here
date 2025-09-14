import React, { useMemo } from "react";
import * as THREE from "three";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { EntryPoint } from "./EventPoint";
import { EntrySmear } from "./EntrySmear";
import { CosmicEventEffect } from "./CosmicEventEffect";
import { getDailySpiralCoords } from "@/utils/daily/generateDailySpiralPoints";

interface EntryVisualizationsProps {
  entries: JournalEntry[];
  config: SpiralConfig;
}

const getEntryPosition = (entry: JournalEntry, firstUseDate: Date, zoom: number): THREE.Vector3 => {
  const start = new Date(firstUseDate);
  start.setHours(0, 0, 0, 0);
  const anchor = new Date(entry.anchorDate);
  anchor.setHours(0, 0, 0, 0);
  const dayIndex = Math.max(0, Math.floor((anchor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const { x, y, z } = getDailySpiralCoords(dayIndex, 2 * zoom, 0.8 * zoom, 1.2 * zoom);
  return new THREE.Vector3(x, y, z);
};

const getToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const EntryVisualizations: React.FC<EntryVisualizationsProps> = ({
  entries,
  config,
}) => {
  const firstUseDate = useMemo(() => new Date(config.firstUseDate), [config.firstUseDate]);
  const today = useMemo(() => getToday(), []);

  return (
    <>
      {entries.map((entry) => {
        const color = entry.sentiment?.color || "#aaaaaa";
        const intensity = entry.sentiment?.intensity ?? 0.5;
        const hasEndDate = !!entry.endDate;
        const isSmear = (entry.temporalScope === "smear" || entry.temporalScope === "forward") && hasEndDate;
        const position = getEntryPosition(entry, firstUseDate, config.zoom);

        // For point entries — just render the point + cosmic effect
        if (!isSmear) {
          const anchorDate = new Date(entry.anchorDate);
          const isFuture = anchorDate > today;
          return (
            <React.Fragment key={entry.id}>
              <CosmicEventEffect
                position={position}
                color={color}
                intensity={isFuture ? intensity * 0.4 : intensity}
              />
              <EntryPoint
                entry={entry}
                firstUseDate={firstUseDate}
                zoom={config.zoom}
              />
            </React.Fragment>
          );
        }

        // For smear entries — split at today if they cross the boundary
        const anchorDate = new Date(entry.anchorDate);
        const endDate = new Date(entry.endDate!);
        const startsInPast = anchorDate <= today;
        const endsInFuture = endDate > today;
        const crossesToday = startsInPast && endsInFuture;

        return (
          <React.Fragment key={entry.id}>
            {/* Cosmic effect at anchor point */}
            <CosmicEventEffect
              position={position}
              color={color}
              intensity={intensity}
              isProcessEvent
            />

            {/* Point marker at anchor */}
            <EntryPoint
              entry={entry}
              firstUseDate={firstUseDate}
              zoom={config.zoom}
            />

            {crossesToday ? (
              <>
                {/* Past portion: full opacity, anchor → today */}
                <EntrySmear
                  entry={{
                    ...entry,
                    endDate: today.toISOString(),
                  }}
                  firstUseDate={firstUseDate}
                  zoom={config.zoom}
                  diffuse={false}
                />
                {/* Future portion: diffuse, today → endDate */}
                <EntrySmear
                  entry={{
                    ...entry,
                    anchorDate: today.toISOString(),
                  }}
                  firstUseDate={firstUseDate}
                  zoom={config.zoom}
                  diffuse={true}
                />
              </>
            ) : (
              /* Entirely past or entirely future */
              <EntrySmear
                entry={entry}
                firstUseDate={firstUseDate}
                zoom={config.zoom}
                diffuse={!startsInPast}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
