
import React from "react";
import { Canvas } from "@react-three/fiber";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { SpiralScene } from "./SpiralScene";

interface SpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

const SpiralVisualization: React.FC<SpiralVisualizationProps> = ({
  events,
  config,
  onSpiralClick,
}) => {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ 
          position: [15, 15, 15], 
          fov: 50,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
        linear
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          // Handle WebGL context loss and restoration gracefully
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (event) => {
            console.log('WebGL context lost. You can try refreshing the page.');
            event.preventDefault();
          }, false);
          
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored.');
          }, false);
        }}
      >
        <fog attach="fog" args={['#000', 15, 50]} />
        <SpiralScene 
          events={events} 
          config={config} 
          onEventClick={onSpiralClick} 
        />
      </Canvas>
    </div>
  );
};

export default SpiralVisualization;
