import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { JournalEntry } from "@/types/event";
import { calculateDailySegment } from "@/utils/daily/dailyDurationSegments";
import { ParticleLayer } from "./particles/ParticleLayer";
import { useGenerateParticles } from "./particles/ParticleGenerator";

interface EntrySmearProps {
  entry: JournalEntry;
  firstUseDate: Date;
  zoom: number;
  diffuse?: boolean;
}

/**
 * Renders a rich 3-layer particle dust trail along the spiral for entries that span time.
 * Diffuse mode (forward projections) uses lighter opacity.
 */
export const EntrySmear: React.FC<EntrySmearProps> = ({
  entry,
  firstUseDate,
  zoom,
  diffuse = false,
}) => {
  const color = entry.sentiment?.color || "#aaaaaa";
  const intensity = entry.sentiment?.intensity ?? 0.5;

  const anchorDate = new Date(entry.anchorDate);
  const endDate = new Date(entry.endDate || entry.anchorDate);

  const spanLengthInDays = Math.max(1, Math.floor(
    (endDate.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24)
  ));

  const points = calculateDailySegment(
    anchorDate,
    endDate,
    firstUseDate,
    200 + Math.min(300, spanLengthInDays),
    2 * zoom,
    0.8 * zoom,
    1.2 * zoom
  );

  const colorObj = new THREE.Color(color);

  const particleCount = useMemo(() => {
    const intensityFactor = 1.5 + (intensity * 10) * 0.4;
    const lengthFactor = Math.min(1.2, Math.log10(spanLengthInDays) / 3 + 0.6);
    const base = Math.floor(200 * intensityFactor * lengthFactor);
    // Future/diffuse portions get fewer particles — sparser, ghostlier
    return diffuse ? Math.floor(base * 0.5) : base;
  }, [intensity, spanLengthInDays, diffuse]);

  const backgroundCount = Math.floor(particleCount * 0.8);
  const tertiaryCount = Math.floor(particleCount * 0.5);

  const primaryParticles = useGenerateParticles({
    color, intensity, points, particleCount,
    isRoughDate: false, isMinimalDuration: false,
  });

  const backgroundParticles = useGenerateParticles({
    color, intensity, points, particleCount: backgroundCount,
    isBackgroundLayer: true, isRoughDate: false, isMinimalDuration: false,
  });

  const tertiaryParticles = useGenerateParticles({
    color, intensity, points, particleCount: tertiaryCount,
    isTertiaryLayer: true, isRoughDate: false, isMinimalDuration: false,
  });

  const animationSpeed = 0.003 * (0.7 + intensity * 0.5);
  const animationAmplitude = 0.01 * (0.7 + intensity * 0.5);

  // Diffuse (future) — noticeably lighter but still visible
  const opacityMult = diffuse ? 0.35 : 1;

  return (
    <group>
      <Line
        points={points}
        color={colorObj}
        lineWidth={0.6 + intensity * 0.8}
        transparent
        opacity={0.15 * opacityMult}
        blending={THREE.AdditiveBlending}
      />

      <ParticleLayer
        positions={primaryParticles.positions}
        sizes={primaryParticles.sizes}
        colors={primaryParticles.colors}
        size={0.15}
        opacity={0.9 * opacityMult}
        rotationSpeed={animationSpeed}
        pulseSpeed={0.2}
        pulseAmplitude={animationAmplitude}
      />

      <ParticleLayer
        positions={backgroundParticles.positions}
        sizes={backgroundParticles.sizes}
        colors={backgroundParticles.colors}
        size={0.20}
        opacity={0.7 * opacityMult}
        isGlow={true}
        rotationSpeed={animationSpeed * 0.7}
        pulseSpeed={0.15}
        pulsePhase={1}
        pulseAmplitude={animationAmplitude * 1.2}
      />

      <ParticleLayer
        positions={tertiaryParticles.positions}
        sizes={tertiaryParticles.sizes}
        colors={tertiaryParticles.colors}
        size={0.18}
        opacity={0.8 * opacityMult}
        rotationSpeed={-animationSpeed * 0.4}
        pulseSpeed={0.1}
        pulsePhase={2}
        pulseAmplitude={animationAmplitude * 1.5}
      />
    </group>
  );
};
