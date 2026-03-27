import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateDailySpiralPoints } from "@/utils/daily/generateDailySpiralPoints";

interface SpiralLineProps {
  firstUseDate: Date;
  today: Date;
  zoom: number;
}

export const SpiralLine: React.FC<SpiralLineProps> = ({
  firstUseDate,
  today,
  zoom,
}) => {
  const spiralPoints = generateDailySpiralPoints(
    firstUseDate,
    today,
    4,           // stepsPerDay
    2 * zoom,    // baseRadius
    0.8 * zoom,  // radiusGrowth
    1.2 * zoom   // heightPerRev
  );

  const positions = spiralPoints.map((p) => p.position);
  const totalPoints = spiralPoints.length;

  // Gradient: dim at start → bright at today
  const colors = spiralPoints.map((_, i) => {
    const t = totalPoints > 1 ? i / (totalPoints - 1) : 1;
    const dimColor = new THREE.Color(0x334466);
    const brightColor = new THREE.Color(0xffffff);
    return dimColor.clone().lerp(brightColor, t * t);
  });

  if (positions.length < 2) return null;

  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={1}
      transparent
      opacity={0.35}
    />
  );
};
