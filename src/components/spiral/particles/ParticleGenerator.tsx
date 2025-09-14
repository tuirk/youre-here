
import { useMemo } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { getColorVariation } from "./DustParticle";

interface GenerateParticlesProps {
  color: string;
  intensity: number; // 0-1
  points: Vector3[];
  particleCount: number;
  isBackgroundLayer?: boolean;
  isTertiaryLayer?: boolean;
  isRoughDate?: boolean;
  isMinimalDuration?: boolean;
}

export const useGenerateParticles = ({
  color,
  intensity,
  points,
  particleCount,
  isBackgroundLayer = false,
  isTertiaryLayer = false,
  isRoughDate = false,
  isMinimalDuration = false
}: GenerateParticlesProps) => {
  return useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const pathLength = points.length;

    // Scale 0-1 intensity to old 1-10 range for calculations
    const scaledIntensity = intensity * 10;

    const baseSizeFactor = 0.9 + scaledIntensity * 0.15;
    const baseColor = new THREE.Color(color);

    const spreadFactor = isRoughDate
      ? isBackgroundLayer ? 0.9 : isTertiaryLayer ? 0.75 : 0.6
      : isBackgroundLayer ? 0.65 : isTertiaryLayer ? 0.5 : 0.4;

    const baseSize = isBackgroundLayer
      ? 0.45 * baseSizeFactor
      : isTertiaryLayer
        ? 0.40 * baseSizeFactor
        : 0.35 * baseSizeFactor;

    const sizeVariation = isBackgroundLayer ? 0.3 : isTertiaryLayer ? 0.25 : 0.2;

    const baseOpacity = isRoughDate
      ? isBackgroundLayer ? 0.06 : isTertiaryLayer ? 0.07 : 0.08
      : isBackgroundLayer ? 0.06 : isTertiaryLayer ? 0.09 : 0.12;

    const intensityOpacityBoost = (isBackgroundLayer ? 0.04 : isTertiaryLayer ? 0.05 : 0.08) * (scaledIntensity / 10);
    const intensitySpreadScale = 0.8 + scaledIntensity * (isBackgroundLayer ? 0.05 : 0.04);

    for (let i = 0; i < particleCount; i++) {
      let pathIndex: number;

      if (isMinimalDuration) {
        pathIndex = Math.floor(Math.random() * Math.min(30, pathLength - 1));
      } else {
        const rand = Math.random();
        if (rand < 0.1) {
          pathIndex = Math.floor(Math.random() * Math.min(30, pathLength * 0.2));
        } else if (rand > 0.9) {
          pathIndex = Math.floor(Math.max(pathLength * 0.8, pathLength - 30) + Math.random() * Math.min(30, pathLength * 0.2));
        } else {
          pathIndex = Math.floor(Math.random() * (pathLength - 1));
        }
      }

      const point = points[pathIndex];

      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
      );

      const i3 = i * 3;
      positions[i3] = point.x + randomOffset.x;
      positions[i3 + 1] = point.y + randomOffset.y;
      positions[i3 + 2] = point.z + randomOffset.z;

      sizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);

      const pathProgress = pathIndex / pathLength;
      const progressFactor = 4 * (pathProgress * (1 - pathProgress));
      opacities[i] = (baseOpacity + intensityOpacityBoost) *
                   (0.7 + progressFactor * 0.3) *
                   (0.8 + Math.random() * 0.4);

      const variedColor = getColorVariation(baseColor, isBackgroundLayer ? 0.1 : 0.05);
      colors[i3] = variedColor.r;
      colors[i3 + 1] = variedColor.g;
      colors[i3 + 2] = variedColor.b;
    }

    return { positions, sizes, opacities, colors };
  }, [color, intensity, points, particleCount, isBackgroundLayer, isTertiaryLayer, isRoughDate, isMinimalDuration]);
};
