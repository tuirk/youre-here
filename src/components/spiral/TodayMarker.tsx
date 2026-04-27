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
  onClick?: () => void;
}

const FIGURE_SIZE = 1.6; // world units, longest dimension

export const TodayMarker: React.FC<TodayMarkerProps> = ({
  firstUseDate,
  today,
  baseRadius = 2,
  radiusGrowth = 0.8,
  heightPerRev = 1.2,
  onClick,
}) => {
  const billboardRef = useRef<THREE.Group>(null);
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

  const extrudeSettings = useMemo(() => ({
    depth: 40,
    bevelEnabled: true,
    bevelThickness: 8,
    bevelSize: 5,
    bevelSegments: 3,
  }), []);

  // Build geometries once and compute the actual bounding box of the path
  // content (NOT the SVG viewBox), so we can recenter the figure precisely
  // on today's spiral coordinate regardless of where the artwork sits inside
  // its 600x600 viewBox.
  const { geometries, centerOffset, scale } = useMemo(() => {
    const geos: THREE.ExtrudeGeometry[] = [];
    const merged = new THREE.Box3();
    let first = true;

    svgData.paths.forEach((path) => {
      const pathShapes = SVGLoader.createShapes(path);
      pathShapes.forEach((shape) => {
        const g = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        g.computeBoundingBox();
        if (g.boundingBox) {
          if (first) {
            merged.copy(g.boundingBox);
            first = false;
          } else {
            merged.union(g.boundingBox);
          }
        }
        geos.push(g);
      });
    });

    if (first) {
      // No paths — fall back to safe defaults
      return {
        geometries: geos,
        centerOffset: new THREE.Vector3(0, 0, 0),
        scale: 0.003,
      };
    }

    const size = new THREE.Vector3();
    merged.getSize(size);
    const longest = Math.max(size.x, size.y, 1);
    const s = FIGURE_SIZE / longest;

    const center = new THREE.Vector3();
    merged.getCenter(center);

    return {
      geometries: geos,
      centerOffset: center,
      scale: s,
    };
  }, [svgData, extrudeSettings]);

  // Make the figure always face the camera so the silhouette reads cleanly
  // from any orbit angle — no more "edge-on disappearing" man.
  useFrame((state) => {
    if (billboardRef.current) {
      billboardRef.current.quaternion.copy(state.camera.quaternion);
    }
    if (innerRef.current) {
      const t = state.clock.getElapsedTime();
      innerRef.current.position.y = Math.sin(t * 0.6) * 0.04;
      innerRef.current.rotation.z = Math.sin(t * 0.4) * 0.05;
    }
  });

  const handleClick = (e: any) => {
    if (!onClick) return;
    e.stopPropagation?.();
    onClick();
  };

  return (
    <group position={position}>
      <group ref={billboardRef}>
        <group ref={innerRef}>
          {/* y is flipped because SVG y-down → world y-up.
              The translation undoes the SVG's internal offset so the
              figure's true centroid sits at (0,0,0) — i.e. exactly on
              today's spiral coordinate. */}
          <group
            scale={[scale, -scale, scale]}
            position={[
              -centerOffset.x * scale,
              centerOffset.y * scale,
              -centerOffset.z * scale,
            ]}
          >
            {geometries.map((geo, i) => (
              <mesh key={i} geometry={geo}>
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
        </group>
        <pointLight color="#FFD080" intensity={0.4} distance={2} decay={2} />

        {/* Invisible click target — sized to comfortably cover the figure
            silhouette so the whole man is clickable, not just the path. */}
        {onClick && (
          <mesh
            onClick={handleClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "default";
            }}
          >
            <planeGeometry args={[FIGURE_SIZE, FIGURE_SIZE]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* Tiny bright pin so "today" is visible even when the figure is
          turned away or behind future-smear glow. */}
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#FFE9B0" transparent opacity={0.95} />
      </mesh>
    </group>
  );
};
