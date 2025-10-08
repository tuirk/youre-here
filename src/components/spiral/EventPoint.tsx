import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JournalEntry } from "@/types/event";
import { getDailySpiralCoords } from "@/utils/daily/generateDailySpiralPoints";

interface EntryPointProps {
  entry: JournalEntry;
  firstUseDate: Date;
  zoom: number;
  onClick?: () => void;
}

export const EntryPoint: React.FC<EntryPointProps> = ({
  entry,
  firstUseDate,
  zoom,
  onClick,
}) => {
  const color = entry.sentiment?.color || "#aaaaaa";
  const intensity = entry.sentiment?.intensity ?? 0.5;

  // Calculate position from anchorDate
  const position = useMemo(() => {
    const start = new Date(firstUseDate);
    start.setHours(0, 0, 0, 0);
    const anchor = new Date(entry.anchorDate);
    anchor.setHours(0, 0, 0, 0);
    const dayIndex = Math.max(0, Math.floor((anchor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const { x, y, z } = getDailySpiralCoords(dayIndex, 2 * zoom, 0.8 * zoom, 1.2 * zoom);
    return new THREE.Vector3(x, y, z);
  }, [entry.anchorDate, firstUseDate, zoom]);

  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);

  const glowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.5)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      const pulse = 1 + Math.sin(time * 1.5) * 0.1 * intensity;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
    if (glowRef.current) {
      const glow = 1 + Math.sin(time * 2.2) * 0.15;
      glowRef.current.scale.set(glow, glow, 1);
    }
  });

  const size = 0.04 + intensity * 0.07;
  const glowSize = 0.45 + intensity * 0.5;

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.9}
          emissive={color}
          emissiveIntensity={1.5}
        />
      </mesh>
      <sprite ref={glowRef} scale={[glowSize, glowSize, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={color}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};
