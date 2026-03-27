import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getDayPositions } from "@/utils/daily/generateDailySpiralPoints";

interface DayMarkersProps {
  firstUseDate: Date;
  today: Date;
  events: TimeEvent[];
  baseRadius?: number;
  radiusGrowth?: number;
  heightPerRev?: number;
}

/**
 * Renders faint ring markers for empty days on the spiral.
 * Uses instanced mesh for performance.
 */
export const DayMarkers: React.FC<DayMarkersProps> = ({
  firstUseDate,
  today,
  events,
  baseRadius = 2,
  radiusGrowth = 0.8,
  heightPerRev = 1.2,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { positions, count } = useMemo(() => {
    const dayPoints = getDayPositions(firstUseDate, today, baseRadius, radiusGrowth, heightPerRev);

    // Build a set of dates that have events (so we skip those)
    const eventDates = new Set<string>();
    events.forEach((ev) => {
      const d = new Date(ev.startDate);
      d.setHours(0, 0, 0, 0);
      eventDates.add(d.toISOString().slice(0, 10));
    });

    // Also skip today (TodayMarker handles it)
    const todayStr = new Date(today).toISOString().slice(0, 10);

    // Filter to only empty days
    const emptyDays = dayPoints.filter((p) => {
      const dateStr = p.date.toISOString().slice(0, 10);
      return dateStr !== todayStr && !eventDates.has(dateStr);
    });

    return { positions: emptyDays, count: emptyDays.length };
  }, [firstUseDate, today, events, baseRadius, radiusGrowth, heightPerRev]);

  // Set instance transforms
  useMemo(() => {
    if (!meshRef.current || count === 0) return;
    const dummy = new THREE.Object3D();
    positions.forEach((point, i) => {
      dummy.position.copy(point.position);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, count]);

  // Gentle breathing animation
  const timeRef = useRef(0);
  useFrame((_, delta) => {
    if (!meshRef.current || count === 0) return;
    timeRef.current += delta;
    const dummy = new THREE.Object3D();
    positions.forEach((point, i) => {
      dummy.position.copy(point.position);
      // Subtle breathing — each marker slightly offset in phase
      const breath = 1 + Math.sin(timeRef.current * 0.8 + i * 0.3) * 0.15;
      dummy.scale.set(breath, breath, breath);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <torusGeometry args={[0.04, 0.008, 8, 16]} />
      <meshBasicMaterial
        color="#667788"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};
