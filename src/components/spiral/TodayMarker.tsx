import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three-stdlib";
import { getDailySpiralCoords } from "@/utils/daily/generateDailySpiralPoints";

interface TodayMarkerProps {
  firstUseDate: Date;
  today: Date;
  baseRadius?: number;
  radiusGrowth?: number;
  heightPerRev?: number;
}

export const TodayMarker: React.FC<TodayMarkerProps> = ({
  firstUseDate,
  today,
  baseRadius = 2,
  radiusGrowth = 0.8,
  heightPerRev = 1.2,
}) => {
  const innerRef = useRef<THREE.Group>(null);

  const position = useMemo(() => {
    const start = new Date(firstUseDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);
    const dayIndex = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const { x, y, z } = getDailySpiralCoords(dayIndex, baseRadius, radiusGrowth, heightPerRev);
    return new THREE.Vector3(x, y, z);
  }, [firstUseDate, today, baseRadius, radiusGrowth, heightPerRev]);

  const svgData = useLoader(SVGLoader, "/floating-person.svg");

  // Extrude shapes for 3D depth
  const extrudeSettings = useMemo(() => ({
    depth: 40,
    bevelEnabled: true,
    bevelThickness: 8,
    bevelSize: 5,
    bevelSegments: 3,
  }), []);

  const shapes = useMemo(() => {
    const allShapes: THREE.Shape[] = [];
    svgData.paths.forEach((path) => {
      const pathShapes = SVGLoader.createShapes(path);
      allShapes.push(...pathShapes);
    });
    return allShapes;
  }, [svgData]);

  // Gentle float — tightly constrained to stay near today's position
  useFrame((state) => {
    if (innerRef.current) {
      const t = state.clock.getElapsedTime();
      // Small vertical bob only — no wandering
      innerRef.current.position.y = Math.sin(t * 0.6) * 0.04;
      // Very subtle tilt, not rotation — stays facing camera
      innerRef.current.rotation.z = Math.sin(t * 0.4) * 0.05;
    }
  });

  return (
    <group position={position}>
      <group ref={innerRef}>
        {/* 3D extruded SVG figure */}
        <group scale={[0.003, -0.003, 0.003]} position={[-0.9, 0.9, -0.06]}>
          {shapes.map((shape, i) => (
            <mesh key={i}>
              <extrudeGeometry args={[shape, extrudeSettings]} />
              <meshStandardMaterial
                color="#FFD080"
                emissive="#FFD080"
                emissiveIntensity={2.5}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>

        {/* Soft glow */}
        <pointLight color="#FFD080" intensity={0.4} distance={2} decay={2} />
      </group>
    </group>
  );
};
