
import React, { useRef, useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { isSeasonalEvent } from "@/utils/seasonalUtils";
import { ParticleLayer } from "./particles/ParticleLayer";
import { useGenerateParticles } from "./particles/ParticleGenerator";

interface EventDurationProps {
  startEvent: TimeEvent;   // Event that marks the start of the duration
  endEvent: TimeEvent;     // Event that marks the end of the duration
  startYear: number;       // First year of the spiral (used for positioning)
  zoom: number;            // Current zoom level (affects visual scale)
}

/**
 * Renders a cosmic dust trail between two events on the spiral, representing a duration
 * Inspired by deep space nebula imagery
 */
export const EventDuration: React.FC<EventDurationProps> = ({ 
  startEvent, 
  endEvent, 
  startYear, 
  zoom 
}) => {
  // Calculate if this is a minimal duration (no end date or same as start date)
  const isMinimalDuration = !startEvent.endDate || 
    startEvent.startDate.getTime() === (startEvent.endDate?.getTime() || 0);
  
  // Calculate the span length in days for density calculations
  const spanLengthInDays = isMinimalDuration ? 1 : 
    Math.max(1, Math.floor((endEvent.startDate.getTime() - startEvent.startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Generate points for a smooth curve between the two events
  // More points for longer spans to ensure smooth curves
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    // Ensure we have more points for longer spans
    isMinimalDuration ? 100 : 200 + Math.min(300, spanLengthInDays),
    5 * zoom, 
    1.5 * zoom
  );
  
  // Use the color of the start event for the particles
  const colorObj = new THREE.Color(startEvent.color);
  
  // Check if this is a seasonal rough date
  const isRoughDate = isSeasonalEvent(startEvent);

  // Number of particles based on event intensity and span length
  const particleCount = useMemo(() => {
    // Base count depends on intensity (1-10 scale)
    const intensityFactor = 1.5 + startEvent.intensity * 0.4;
    const baseMultiplier = 200;
    
    // For minimal duration, use a fixed count to ensure visibility
    if (isMinimalDuration) {
      return Math.floor(baseMultiplier * intensityFactor);
    }
    
    // For actual spans, scale by length but cap for performance
    const lengthFactor = Math.min(1.2, Math.log10(spanLengthInDays) / 3 + 0.6);
    return Math.floor(baseMultiplier * intensityFactor * lengthFactor);
  }, [startEvent.intensity, isMinimalDuration, spanLengthInDays]);
  
  // Additional background particles for more volume
  const backgroundParticleCount = Math.floor(particleCount * 0.8);
  const tertiaryParticleCount = Math.floor(particleCount * 0.5);
  
  // Generate particles distributed along the path
  const primaryParticles = useGenerateParticles({
    startEvent,
    points,
    particleCount,
    isRoughDate,
    isMinimalDuration
  });
  
  const backgroundParticles = useGenerateParticles({
    startEvent,
    points,
    particleCount: backgroundParticleCount,
    isBackgroundLayer: true,
    isRoughDate,
    isMinimalDuration
  });
  
  const tertiaryParticles = useGenerateParticles({
    startEvent,
    points,
    particleCount: tertiaryParticleCount,
    isTertiaryLayer: true,
    isRoughDate,
    isMinimalDuration
  });
  
  // Animation factors linked to intensity - more intense events animate more dramatically
  const animationSpeed = useMemo(() => {
    return 0.003 * (0.7 + startEvent.intensity * 0.05);
  }, [startEvent.intensity]);
  
  const animationAmplitude = useMemo(() => {
    return 0.01 * (0.7 + startEvent.intensity * 0.05);
  }, [startEvent.intensity]);
  
  // For all durations, show layered particle systems
  return (
    <group>
      {/* Base path line - very subtle guide, only visible for non-minimal durations */}
      {!isMinimalDuration && (
        <Line
          points={points}
          color={colorObj}
          lineWidth={0.6 + startEvent.intensity * 0.08}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          dashed={isRoughDate}
          dashSize={isRoughDate ? 0.1 : 0}
          dashOffset={isRoughDate ? 0.1 : 0}
          dashScale={isRoughDate ? 10 : 0}
        />
      )}
      
      {/* Primary particle dust - sharper, more defined */}
      <ParticleLayer
        positions={primaryParticles.positions}
        sizes={primaryParticles.sizes}
        colors={primaryParticles.colors}
        size={0.35}
        opacity={0.9}
        rotationSpeed={animationSpeed}
        pulseSpeed={0.2}
        pulseAmplitude={animationAmplitude}
      />
      
      {/* Secondary particle layer - more diffuse background glow */}
      <ParticleLayer
        positions={backgroundParticles.positions}
        sizes={backgroundParticles.sizes}
        colors={backgroundParticles.colors}
        size={0.45}
        opacity={0.7}
        isGlow={true}
        rotationSpeed={animationSpeed * 0.7}
        pulseSpeed={0.15}
        pulsePhase={1}
        pulseAmplitude={animationAmplitude * 1.2}
      />
      
      {/* Tertiary particle layer - intermediate size and opacity */}
      <ParticleLayer
        positions={tertiaryParticles.positions}
        sizes={tertiaryParticles.sizes}
        colors={tertiaryParticles.colors}
        size={0.40}
        opacity={0.8}
        rotationSpeed={-animationSpeed * 0.4}
        pulseSpeed={0.1}
        pulsePhase={2}
        pulseAmplitude={animationAmplitude * 1.5}
      />
    </group>
  );
};
