import React, { useState, useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { getDailySpiralCoords, getDayPositions, DAYS_PER_REV } from "@/utils/daily/generateDailySpiralPoints";

interface TildePlacementProps {
  firstUseDate: Date;
  today: Date;
  zoom: number;
  onPlaced: (date: Date, position: THREE.Vector3) => void;
  active: boolean;
}

/**
 * Handles click-on-spiral → tilde marker placement.
 * Raycasts against an invisible tube around the spiral to find the nearest point,
 * then shows a ~ marker with a date label.
 */
export const TildePlacement: React.FC<TildePlacementProps> = ({
  firstUseDate,
  today,
  zoom,
  onPlaced,
  active,
}) => {
  const [tildePos, setTildePos] = useState<THREE.Vector3 | null>(null);
  const [tildeDate, setTildeDate] = useState<Date | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Build a tube geometry around the spiral for raycasting
  const tubeGeometry = React.useMemo(() => {
    const start = new Date(firstUseDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);
    const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Create curve points along the spiral
    const curvePoints: THREE.Vector3[] = [];
    const steps = Math.max(10, totalDays * 2);
    for (let i = 0; i <= steps; i++) {
      const dayIndex = (i / steps) * totalDays;
      const { x, y, z } = getDailySpiralCoords(dayIndex, 2 * zoom, 0.8 * zoom, 1.2 * zoom);
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    return new THREE.TubeGeometry(curve, steps, 0.3, 8, false);
  }, [firstUseDate, today, zoom]);

  const handleClick = useCallback(
    (e: THREE.Event & { point?: THREE.Vector3 }) => {
      if (!active || !e.point) return;
      e.stopPropagation?.();

      const clickPoint = e.point as THREE.Vector3;

      // Find nearest day on the spiral
      const start = new Date(firstUseDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(0, 0, 0, 0);
      const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      let bestDist = Infinity;
      let bestDay = 0;

      for (let d = 0; d <= totalDays; d++) {
        const { x, y, z } = getDailySpiralCoords(d, 2 * zoom, 0.8 * zoom, 1.2 * zoom);
        const dist = clickPoint.distanceTo(new THREE.Vector3(x, y, z));
        if (dist < bestDist) {
          bestDist = dist;
          bestDay = d;
        }
      }

      const { x, y, z } = getDailySpiralCoords(bestDay, 2 * zoom, 0.8 * zoom, 1.2 * zoom);
      const pos = new THREE.Vector3(x, y, z);

      const date = new Date(start);
      date.setDate(date.getDate() + bestDay);

      setTildePos(pos);
      setTildeDate(date);
      onPlaced(date, pos);
    },
    [active, firstUseDate, today, zoom, onPlaced]
  );

  const formatDate = (d: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `~ ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <>
      {/* Invisible clickable tube around the spiral */}
      <mesh
        ref={meshRef}
        geometry={tubeGeometry}
        onClick={handleClick}
      >
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} colorWrite={false} />
      </mesh>

      {/* Tilde marker */}
      {tildePos && tildeDate && (
        <group position={tildePos}>
          <Text
            position={[0, 0.25, 0]}
            color="#FFD080"
            fontSize={0.4}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            ~
          </Text>
          <Text
            position={[0, 0.08, 0]}
            color="#aaaaaa"
            fontSize={0.12}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {formatDate(tildeDate)}
          </Text>
        </group>
      )}
    </>
  );
};
