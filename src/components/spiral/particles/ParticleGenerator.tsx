
import { useMemo } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { getColorVariation } from "./DustParticle";
import { isSeasonalEvent } from "@/utils/seasonalUtils";
import { TimeEvent } from "@/types/event";

interface GenerateParticlesProps {
  startEvent: TimeEvent;
  points: Vector3[];
  particleCount: number;
  isBackgroundLayer?: boolean;
  isTertiaryLayer?: boolean;
  isRoughDate: boolean;
  isMinimalDuration: boolean;
}

// Function to generate particles for different layers
export const useGenerateParticles = ({
  startEvent,
  points,
  particleCount,
  isBackgroundLayer = false,
  isTertiaryLayer = false,
  isRoughDate,
  isMinimalDuration
}: GenerateParticlesProps) => {
  return useMemo(() => {
    // Create arrays for particle properties
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    // Path length for distribution calculation
    const pathLength = points.length;
    
    // Base size calculation - scales with intensity
    // Intensity 1 → 0.9x, Intensity 5 → 1.5x, Intensity 10 → 2.4x
    const baseSizeFactor = 0.9 + startEvent.intensity * 0.15;
    
    // Base color
    const baseColor = new THREE.Color(startEvent.color);
    
    // Layer-specific settings
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
      
    const intensityOpacityBoost = (isBackgroundLayer ? 0.04 : isTertiaryLayer ? 0.05 : 0.08) * (startEvent.intensity / 10);
    
    // Intensity affects spread
    const intensitySpreadScale = 0.8 + startEvent.intensity * (isBackgroundLayer ? 0.05 : 0.04);
    
    // Generate particles
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles along the path with slight weighting toward ends
      let pathIndex: number;
      
      // For very short events, cluster particles at the start position
      if (isMinimalDuration) {
        pathIndex = Math.floor(Math.random() * Math.min(30, pathLength - 1));
      } else {
        // Distribution weighting logic - emphasize start and end points a bit
        const rand = Math.random();
        if (rand < 0.1) {
          // Near start point
          pathIndex = Math.floor(Math.random() * Math.min(30, pathLength * 0.2));
        } else if (rand > 0.9) {
          // Near end point
          pathIndex = Math.floor(Math.max(pathLength * 0.8, pathLength - 30) + Math.random() * Math.min(30, pathLength * 0.2));
        } else {
          // Distributed throughout middle
          pathIndex = Math.floor(Math.random() * (pathLength - 1));
        }
      }
      
      const point = points[pathIndex];
      
      // Add random offset to create volume around the line
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
      );
      
      const i3 = i * 3;
      positions[i3] = point.x + randomOffset.x;
      positions[i3 + 1] = point.y + randomOffset.y;
      positions[i3 + 2] = point.z + randomOffset.z;
      
      // Vary the size of particles
      sizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
      
      // Vary opacity based on position and intensity
      const pathProgress = pathIndex / pathLength;
      
      // Opacity curve - slightly stronger in the middle of the path
      const progressFactor = 4 * (pathProgress * (1 - pathProgress));
      opacities[i] = (baseOpacity + intensityOpacityBoost) * 
                   (0.7 + progressFactor * 0.3) * 
                   (0.8 + Math.random() * 0.4); // Add some random variation
      
      // Add color variations
      const variedColor = getColorVariation(baseColor, isBackgroundLayer ? 0.1 : 0.05);
      colors[i3] = variedColor.r;
      colors[i3 + 1] = variedColor.g;
      colors[i3 + 2] = variedColor.b;
    }
    
    return { positions, sizes, opacities, colors };
  }, [startEvent, points, particleCount, isBackgroundLayer, isTertiaryLayer, isRoughDate, isMinimalDuration]);
};
