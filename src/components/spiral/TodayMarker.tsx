import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDailySpiralCoords } from "@/utils/daily/generateDailySpiralPoints";

interface TodayMarkerProps {
  firstUseDate: Date;
  today: Date;
  baseRadius?: number;
  radiusGrowth?: number;
  heightPerRev?: number;
}

/**
 * Prominent pulsing marker at the tip of the spiral — "You are here."
 */
export const TodayMarker: React.FC<TodayMarkerProps> = ({
  firstUseDate,
  today,
  baseRadius = 2,
  radiusGrowth = 0.8,
  heightPerRev = 1.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const position = useMemo(() => {
    const start = new Date(firstUseDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);
    const dayIndex = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const { x, y, z } = getDailySpiralCoords(dayIndex, baseRadius, radiusGrowth, heightPerRev);
    return new THREE.Vector3(x, y, z);
  }, [firstUseDate, today, baseRadius, radiusGrowth, heightPerRev]);

  const glowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 220, 150, 1)");
      gradient.addColorStop(0.3, "rgba(255, 200, 100, 0.6)");
      gradient.addColorStop(0.6, "rgba(255, 180, 80, 0.2)");
      gradient.addColorStop(1, "rgba(255, 160, 60, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.2;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
    if (glowRef.current) {
      const glow = 1 + Math.sin(t * 1.5 + 0.5) * 0.25;
      glowRef.current.scale.set(glow, glow, 1);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      const ringPulse = 1 + Math.sin(t * 1.2) * 0.1;
      ringRef.current.scale.set(ringPulse, ringPulse, ringPulse);
    }
  });

  return (
    <group position={position}>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#FFD080"
          emissive="#FFB040"
          emissiveIntensity={2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Outer ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.15, 0.012, 16, 32]} />
        <meshBasicMaterial
          color="#FFD080"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glow sprite */}
      <sprite ref={glowRef} scale={[0.8, 0.8, 1]}>
        <spriteMaterial
          map={glowTexture}
          color="#FFD080"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};
