import React, { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JournalEntry } from "@/types/event";
import { getDailySpiralCoords } from "@/utils/daily/generateDailySpiralPoints";

interface EntrySmearProps {
  entry: JournalEntry;
  firstUseDate: Date;
  zoom: number;
  diffuse?: boolean; // true for forward projections (lighter, more transparent)
}

/**
 * Renders a colored trail along the spiral for entries that span time.
 * Diffuse mode (forward projections) renders lighter and more transparent.
 */
export const EntrySmear: React.FC<EntrySmearProps> = ({
  entry,
  firstUseDate,
  zoom,
  diffuse = false,
}) => {
  const color = entry.sentiment?.color || "#aaaaaa";
  const intensity = entry.sentiment?.intensity ?? 0.5;
  const groupRef = useRef<THREE.Group>(null);

  const { points, particlePositions, particleSizes } = useMemo(() => {
    const start = new Date(firstUseDate);
    start.setHours(0, 0, 0, 0);

    const anchorDate = new Date(entry.anchorDate);
    anchorDate.setHours(0, 0, 0, 0);
    const endDate = new Date(entry.endDate || entry.anchorDate);
    endDate.setHours(0, 0, 0, 0);

    const startDay = Math.max(0, Math.floor((anchorDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const endDay = Math.max(startDay, Math.floor((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const span = Math.max(1, endDay - startDay);

    // Generate smooth line points
    const linePoints: THREE.Vector3[] = [];
    const steps = Math.min(200, span * 4);
    for (let i = 0; i <= steps; i++) {
      const dayIndex = startDay + (i / steps) * span;
      const { x, y, z } = getDailySpiralCoords(dayIndex, 2 * zoom, 0.8 * zoom, 1.2 * zoom);
      linePoints.push(new THREE.Vector3(x, y, z));
    }

    // Generate particle cloud around the line
    const particleCount = Math.min(300, 50 + span * 5);
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      const dayIndex = startDay + t * span;
      const { x, y, z } = getDailySpiralCoords(dayIndex, 2 * zoom, 0.8 * zoom, 1.2 * zoom);

      // Scatter around the line
      const spread = diffuse ? 0.3 : 0.15;
      positions[i * 3] = x + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = y + (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * spread;

      sizes[i] = (0.02 + Math.random() * 0.04) * (diffuse ? 1.5 : 1);
    }

    return { points: linePoints, particlePositions: positions, particleSizes: sizes };
  }, [entry.anchorDate, entry.endDate, firstUseDate, zoom, diffuse]);

  // Subtle shimmer animation
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Points) {
          child.rotation.y = Math.sin(t * 0.3 + i) * 0.02;
        }
      });
    }
  });

  const threeColor = new THREE.Color(color);
  const opacity = diffuse ? 0.3 : 0.6;
  const lineOpacity = diffuse ? 0.1 : 0.25;

  return (
    <group ref={groupRef}>
      {/* Subtle guide line */}
      {points.length >= 2 && (
        <Line
          points={points}
          color={threeColor}
          lineWidth={0.8 + intensity * 0.5}
          transparent
          opacity={lineOpacity}
          blending={THREE.AdditiveBlending}
        />
      )}

      {/* Particle cloud */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={threeColor}
          size={0.08 + intensity * 0.05}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
};
