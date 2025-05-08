import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface CosmicEventEffectProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  isProcessEvent?: boolean;
}

export const CosmicEventEffect: React.FC<CosmicEventEffectProps> = ({ 
  event, 
  startYear, 
  zoom,
  isProcessEvent = false
}) => {
  // Get the base position on the spiral
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  
  // References for animation
  const particlesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Create texture for particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Generate particles for nebula effect - different for one-time vs process events
  const { particlePositions, particleColors, particleSizes } = useMemo(() => {
    // One-time events have more concentrated, brighter particles
    // Process events have more spread-out, diffuse particles
    const count = isProcessEvent 
      ? 80 + Math.floor(event.intensity * 20) // Fewer particles for process events
      : 120 + Math.floor(event.intensity * 40); // More particles for one-time events
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    // Convert event color to THREE.Color
    const baseColor = new THREE.Color(event.color);
    // Calculate complementary colors for variety
    const complementaryColor = new THREE.Color(
      1 - baseColor.r,
      1 - baseColor.g,
      1 - baseColor.b
    ).lerp(baseColor, 0.7); // Mix with original for subtlety
    
    // Intensity affects spread and size
    // One-time events: concentrated in a smaller area
    // Process events: more spread out along the spiral
    const spread = isProcessEvent
      ? 0.3 + event.intensity * 0.1 // More contained for process events
      : 0.6 + event.intensity * 0.2; // More expansive for one-time events
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create a spherical distribution with some randomization
      // One-time events: more spherical distribution
      // Process events: more elongated along spiral direction
      const radius = (Math.random() * spread) * (0.1 + Math.random() * 0.9);
      const theta = Math.random() * Math.PI * 2;
      
      // For process events, particles are more stretched along the spiral path
      const phi = isProcessEvent
        ? Math.acos((Math.random() * 1.5) - 1) // More vertical stretch
        : Math.acos((Math.random() * 2) - 1);  // Even distribution
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color varies between base color and complementary color
      const colorMix = Math.random();
      colors[i3] = baseColor.r * (1 - colorMix) + complementaryColor.r * colorMix;
      colors[i3 + 1] = baseColor.g * (1 - colorMix) + complementaryColor.g * colorMix;
      colors[i3 + 2] = baseColor.b * (1 - colorMix) + complementaryColor.b * colorMix;
      
      // Size varies based on distance from center and intensity
      // One-time events: larger particles
      // Process events: smaller particles
      const sizeMultiplier = isProcessEvent ? 0.7 : 1.2;
      sizes[i] = (0.1 + Math.random() * 0.3) * (0.5 + event.intensity * 0.1) * sizeMultiplier;
    }
    
    return { particlePositions: positions, particleColors: colors, particleSizes: sizes };
  }, [event.color, event.intensity, isProcessEvent]);
  
  // Animation for the cosmic effect
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // One-time events: faster rotation, more dynamic
      // Process events: slower, more stable rotation
      const rotationSpeed = isProcessEvent ? 0.05 : 0.15;
      
      // Rotate the particle system
      particlesRef.current.rotation.y += delta * rotationSpeed;
      particlesRef.current.rotation.z += delta * (rotationSpeed * 0.5);
      
      // Pulsate the particles - stronger for one-time events
      const time = state.clock.getElapsedTime();
      const pulseIntensity = isProcessEvent ? 0.03 : 0.08;
      const pulseSpeed = isProcessEvent ? 1.5 : 2.5;
      const pulseScale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity;
      
      particlesRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      // Pulsate the glow - stronger for one-time events
      const time = state.clock.getElapsedTime();
      const pulseIntensity = isProcessEvent ? 0.1 : 0.2;
      const pulseSpeed = isProcessEvent ? 1.2 : 1.8;
      const pulseScale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity;
      
      // One-time events: larger glow
      // Process events: more subdued glow
      const baseScale = isProcessEvent 
        ? 0.6 + event.intensity * 0.08
        : 0.9 + event.intensity * 0.12;
      
      glowRef.current.scale.set(
        baseScale * pulseScale, 
        baseScale * pulseScale, 
        1
      );
    }
    
    if (ringRef.current) {
      // Rotate the ring - faster for one-time events
      const rotationSpeed = isProcessEvent ? 0.2 : 0.4;
      ringRef.current.rotation.z += delta * rotationSpeed;
    }
  });
  
  // Create a tint color for the glow based on event color
  const glowColor = new THREE.Color(event.color);
  
  // Size of core elements - decreased for one-time events by 25%
  const ringSize = isProcessEvent ? 0.25 : 0.26; // Reduced from 0.35 (25% smaller)
  const lightIntensity = isProcessEvent 
    ? 0.4 + event.intensity * 0.15
    : 0.45 + event.intensity * 0.19; // Reduced from 0.6/0.25 (25% smaller)
  
  return (
    <group position={position}>
      {/* Particle cloud for nebula effect */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleColors.length / 3}
            array={particleColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleSizes.length}
            array={particleSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          vertexColors
          transparent
          alphaMap={particleTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Glow sprite for the central core */}
      <sprite ref={glowRef}>
        <spriteMaterial
          map={particleTexture}
          color={glowColor}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      
      {/* Thin glowing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringSize * 0.9, ringSize, 64]} />
        <meshBasicMaterial
          color={event.color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Point light for illumination */}
      <pointLight 
        color={event.color} 
        intensity={lightIntensity}
        distance={3}
        decay={2}
      />
    </group>
  );
};
