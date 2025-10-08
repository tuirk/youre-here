import React from "react";
import { Canvas } from "@react-three/fiber";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { SpiralScene } from "./SpiralScene";
import * as THREE from "three";

interface SpiralVisualizationProps {
  entries: JournalEntry[];
  config: SpiralConfig;
  tildePlacementActive: boolean;
  onTildePlaced: (date: Date, position: THREE.Vector3) => void;
}

const SpiralVisualization: React.FC<SpiralVisualizationProps> = ({
  entries,
  config,
  tildePlacementActive,
  onTildePlaced,
}) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [15, 15, 15],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        linear
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
          }, false);
          canvas.addEventListener("webglcontextrestored", () => {}, false);
        }}
      >
        <fog attach="fog" args={["#000", 15, 50]} />
        <SpiralScene
          entries={entries}
          config={config}
          tildePlacementActive={tildePlacementActive}
          onTildePlaced={onTildePlaced}
        />
      </Canvas>
    </div>
  );
};

export default SpiralVisualization;
