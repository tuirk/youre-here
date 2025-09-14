
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDustParticleTexture } from "./DustParticle";

interface ParticleLayerProps {
  positions: Float32Array;
  sizes: Float32Array;
  colors: Float32Array;
  size: number;
  opacity: number;
  isGlow?: boolean;
  rotationSpeed?: number;
  pulseSpeed?: number;
  pulsePhase?: number;
  pulseAmplitude?: number;
}

export const ParticleLayer: React.FC<ParticleLayerProps> = ({ 
  positions, 
  sizes, 
  colors,
  size,
  opacity,
  isGlow = false,
  rotationSpeed = 0.003,
  pulseSpeed = 0.2,
  pulsePhase = 0,
  pulseAmplitude = 0.01
}) => {
  const particleRef = useRef<THREE.Points>(null);
  const particleTexture = useDustParticleTexture({ isGlow });
  
  // Particle animation
  useFrame((state, delta) => {
    if (particleRef.current) {
      // Time-based animation
      const time = state.clock.getElapsedTime();
      
      // Rotation
      particleRef.current.rotation.y += delta * rotationSpeed;
      
      // Subtle breathing/pulsing effect
      const pulse = Math.sin(time * pulseSpeed + pulsePhase) * pulseAmplitude;
      particleRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      
      // Gentle sway — absolute position so it always returns to anchor
      particleRef.current.position.x = Math.sin(time * 0.3) * 0.03;
      particleRef.current.position.y = Math.cos(time * 0.25) * 0.03;
      particleRef.current.position.z = Math.sin(time * 0.35) * 0.03;
    }
  });
  
  return (
    <points ref={particleRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        map={particleTexture}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
};
