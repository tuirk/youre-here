import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface CosmicEventEffectProps {
  position: THREE.Vector3;
  color: string;
  intensity: number; // 0-1
  isProcessEvent?: boolean;
}

export const CosmicEventEffect: React.FC<CosmicEventEffectProps> = ({
  position,
  color,
  intensity,
  isProcessEvent = false
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);

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

  // Scale intensity from 0-1 to the old 1-10 range for particle counts
  const scaledIntensity = intensity * 10;

  const { particlePositions, particleColors, particleSizes } = useMemo(() => {
    // Reduced counts — one-time events should feel subtle, not explosive
    const count = isProcessEvent
      ? 60 + Math.floor(scaledIntensity * 12)
      : 40 + Math.floor(scaledIntensity * 15);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const baseColor = new THREE.Color(color);
    const complementaryColor = new THREE.Color(
      1 - baseColor.r, 1 - baseColor.g, 1 - baseColor.b
    ).lerp(baseColor, 0.7);

    // Tighter spread — less pop
    const spread = isProcessEvent
      ? 0.2 + scaledIntensity * 0.06
      : 0.25 + scaledIntensity * 0.08;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = (Math.random() * spread) * (0.1 + Math.random() * 0.9);
      const theta = Math.random() * Math.PI * 2;
      const phi = isProcessEvent
        ? Math.acos((Math.random() * 1.5) - 1)
        : Math.acos((Math.random() * 2) - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const colorMix = Math.random();
      colors[i3] = baseColor.r * (1 - colorMix) + complementaryColor.r * colorMix;
      colors[i3 + 1] = baseColor.g * (1 - colorMix) + complementaryColor.g * colorMix;
      colors[i3 + 2] = baseColor.b * (1 - colorMix) + complementaryColor.b * colorMix;

      const sizeMultiplier = isProcessEvent ? 0.7 : 1.2;
      sizes[i] = (0.1 + Math.random() * 0.3) * (0.5 + scaledIntensity * 0.1) * sizeMultiplier;
    }

    return { particlePositions: positions, particleColors: colors, particleSizes: sizes };
  }, [color, scaledIntensity, isProcessEvent]);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      const rotationSpeed = isProcessEvent ? 0.05 : 0.15;
      particlesRef.current.rotation.y += delta * rotationSpeed;
      particlesRef.current.rotation.z += delta * (rotationSpeed * 0.5);
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * (isProcessEvent ? 1.5 : 2.5)) * (isProcessEvent ? 0.03 : 0.08);
      particlesRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * (isProcessEvent ? 1.2 : 1.8)) * (isProcessEvent ? 0.1 : 0.2);
      const baseScale = isProcessEvent ? 0.4 + scaledIntensity * 0.05 : 0.35 + scaledIntensity * 0.04;
      glowRef.current.scale.set(baseScale * pulseScale, baseScale * pulseScale, 1);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isProcessEvent ? 0.2 : 0.4);
    }
  });

  const glowColor = new THREE.Color(color);
  const ringSize = isProcessEvent ? 0.18 : 0.14;
  const lightIntensity = isProcessEvent
    ? 0.2 + scaledIntensity * 0.08
    : 0.15 + scaledIntensity * 0.06;

  return (
    <group position={position}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particlePositions.length / 3} array={particlePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleColors.length / 3} array={particleColors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={particleSizes.length} array={particleSizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.12} vertexColors transparent alphaMap={particleTexture} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      <sprite ref={glowRef}>
        <spriteMaterial map={particleTexture} color={glowColor} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringSize * 0.9, ringSize, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <pointLight color={color} intensity={lightIntensity} distance={3} decay={2} />
    </group>
  );
};
