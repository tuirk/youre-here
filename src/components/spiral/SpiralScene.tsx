import React, { useRef, useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { SpiralLine } from "./SpiralLine";
import { MonthMarkers } from "./MonthMarkers";
import { EntryVisualizations } from "./EventVisualizations";
import { DayMarkers } from "./DayMarkers";
import { TodayMarker } from "./TodayMarker";
import { TildePlacement } from "./TildePlacement";

interface SpiralSceneProps {
  entries: JournalEntry[];
  config: SpiralConfig;
  onTildePlaced: (date: Date) => void;
  onHover: (info: import("./TildePlacement").HoverInfo | null) => void;
  onTodayClick?: () => void;
}

export const SpiralScene: React.FC<SpiralSceneProps> = ({
  entries,
  config,
  onTildePlaced,
  onHover,
  onTodayClick,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const firstUseDate = useMemo(() => new Date(config.firstUseDate), [config.firstUseDate]);

  // Refresh "today" every minute so the marker stays at the live present date
  // even if the tab is left open across midnight.
  const [todayTick, setTodayTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTodayTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayTick]);

  useEffect(() => {
    if (camera) {
      const distance = 10 / config.zoom;
      camera.position.set(distance, distance * 0.8, distance);
      camera.lookAt(0, -1, 0);
    }
  }, [config.zoom, camera]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={3}
        maxDistance={40}
      />

      <color attach="background" args={["#010206"]} />
      <Stars radius={100} depth={50} count={8000} factor={4} saturation={0.5} fade speed={1} />

      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />

      <SpiralLine
        firstUseDate={firstUseDate}
        today={today}
        zoom={config.zoom}
      />

      <MonthMarkers
        firstUseDate={firstUseDate}
        today={today}
        zoom={config.zoom}
      />

      <DayMarkers
        firstUseDate={firstUseDate}
        today={today}
        entries={entries}
        baseRadius={2 * config.zoom}
        radiusGrowth={0.8 * config.zoom}
        heightPerRev={1.2 * config.zoom}
      />

      <TodayMarker
        firstUseDate={firstUseDate}
        today={today}
        baseRadius={2 * config.zoom}
        radiusGrowth={0.8 * config.zoom}
        heightPerRev={1.2 * config.zoom}
        onClick={onTodayClick}
      />

      <TildePlacement
        firstUseDate={firstUseDate}
        today={today}
        zoom={config.zoom}
        onPlaced={onTildePlaced}
        onHover={onHover}
      />

      <EntryVisualizations
        entries={entries}
        config={config}
      />
    </>
  );
};
