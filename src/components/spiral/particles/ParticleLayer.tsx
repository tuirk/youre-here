
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
      
      // Additional subtle noise movement along all axes
      const noiseX = Math.sin(time * 0.3) * 0.001;
      const noiseY = Math.cos(time * 0.3) * 0.001;
      const noiseZ = Math.sin(time * 0.4) * 0.001;
      
      particleRef.current.position.x += noiseX;
      particleRef.current.position.y += noiseY;
      particleRef.current.position.z += noiseZ;
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
