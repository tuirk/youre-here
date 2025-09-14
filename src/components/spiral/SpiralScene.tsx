import React, { useRef, useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { SpiralLine } from "./SpiralLine";
import { MonthMarkers } from "./MonthMarkers";
import { EntryVisualizations } from "./EventVisualizations";
import { DayMarkers } from "./DayMarkers";
import { TodayMarker } from "./TodayMarker";
import { TildePlacement } from "./TildePlacement";
import * as THREE from "three";

interface SpiralSceneProps {
  entries: JournalEntry[];
  config: SpiralConfig;
  tildePlacementActive: boolean;
  onTildePlaced: (date: Date, position: THREE.Vector3) => void;
}

export const SpiralScene: React.FC<SpiralSceneProps> = ({
  entries,
  config,
  tildePlacementActive,
  onTildePlaced,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const firstUseDate = useMemo(() => new Date(config.firstUseDate), [config.firstUseDate]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

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
      />

      <TildePlacement
        firstUseDate={firstUseDate}
        today={today}
        zoom={config.zoom}
        onPlaced={onTildePlaced}
        active={tildePlacementActive}
      />

      <EntryVisualizations
        entries={entries}
        config={config}
      />
    </>
  );
};
