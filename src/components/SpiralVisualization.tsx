
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Text, Stars, useTexture, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { generateSpiralPoints, getEventPosition, calculateSpiralSegment } from "@/utils/spiralUtils";

interface SpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

// Enhanced space dust that creates a more immersive galaxy effect
const CosmicDust = () => {
  const particles = useRef<THREE.Points>(null);
  const count = 3000;
  
  // Generate random particles throughout the scene
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Distribute particles in a spherical volume
    const radius = 50 * Math.random() + 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Different colors for cosmic dust
    const colorChoices = [
      [0.9, 0.9, 1.0],  // Blue-white
      [1.0, 0.9, 0.8],  // Yellow-white
      [1.0, 0.8, 0.8],  // Pink-white
      [0.8, 1.0, 0.9],  // Green-white
      [0.9, 0.8, 1.0],  // Purple-white
    ];
    
    const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    colors[i3] = color[0];
    colors[i3 + 1] = color[1];
    colors[i3 + 2] = color[2];
    
    // Vary the size of particles
    sizes[i] = Math.random() * 1.5 + 0.2;
  }
  
  useFrame((state) => {
    if (particles.current) {
      // Slowly rotate the entire dust field
      particles.current.rotation.y += 0.0003;
      particles.current.rotation.x += 0.0001;
    }
  });
  
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        alphaMap={new THREE.TextureLoader().load('/lovable-uploads/ac7515f5-00b3-4d1d-aeb5-91538aa24dd6.png')}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Nebula clouds in the background
const SpaceNebula = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      // Very slow rotation for the nebula
      mesh.current.rotation.z += 0.0001;
    }
  });
  
  return (
    <mesh ref={mesh} position={[0, 0, -80]}>
      <sphereGeometry args={[70, 32, 32]} />
      <meshBasicMaterial
        color={new THREE.Color(0x2a004c)}
        transparent
        opacity={0.2}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

// Spiral component that renders the spiral line
const SpiralLine: React.FC<{ 
  startYear: number, 
  currentYear: number,
  zoom: number
}> = ({ startYear, currentYear, zoom }) => {
  const spiralPoints = generateSpiralPoints(
    startYear, 
    currentYear, 
    360, 
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  return (
    <Line
      points={positions}
      color="white"
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
};

// Month markers along the spiral
const MonthMarkers: React.FC<{
  startYear: number,
  currentYear: number,
  zoom: number
}> = ({ startYear, currentYear, zoom }) => {
  const monthsToShow = ["Jan", "Apr", "Jul", "Oct"];
  const markers = [];
  
  for (let year = startYear; year <= currentYear; year++) {
    for (let month = 0; month < 12; month += 3) {
      if (monthsToShow.includes(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month])) {
        // Calculate position for this month
        const yearIndex = year - startYear;
        const monthFraction = month / 12;
        const angleRad = -monthFraction * Math.PI * 2 + Math.PI/2;
        const radius = 5 * zoom + yearIndex * 0.5;
        
        const x = radius * Math.cos(angleRad);
        const y = -yearIndex * 1.5 * zoom - monthFraction * 1.5 * zoom;
        const z = radius * Math.sin(angleRad);
        
        markers.push(
          <Text
            key={`${year}-${month}`}
            position={[x, y, z]}
            color="white"
            fontSize={0.3}
            anchorX="center"
            anchorY="middle"
          >
            {monthsToShow[month/3]}
          </Text>
        );
      }
    }
  }
  
  return <>{markers}</>;
};

// Individual event marker
const EventPoint: React.FC<{
  event: TimeEvent,
  startYear: number,
  zoom: number,
  onClick: () => void
}> = ({ event, startYear, zoom, onClick }) => {
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Glow effect animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  // Convert color string to THREE.Color
  const colorObj = new THREE.Color(event.color);
  
  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1 + event.intensity * 0.02, 8, 8]} />
        <meshBasicMaterial 
          color={colorObj} 
          transparent 
          opacity={0.7 + event.intensity * 0.03} 
        />
      </mesh>
      {/* Glow effect */}
      <pointLight 
        color={colorObj} 
        intensity={event.intensity * 0.5} 
        distance={1} 
      />
    </group>
  );
};

// Event duration segment
const EventDuration: React.FC<{
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  zoom: number
}> = ({ startEvent, endEvent, startYear, zoom }) => {
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    30,
    5 * zoom, 
    1.5 * zoom
  );
  
  const colorObj = new THREE.Color(startEvent.color);
  
  return (
    <Line
      points={points}
      color={colorObj}
      lineWidth={2 + startEvent.intensity * 0.5}
      transparent
      opacity={0.6 + startEvent.intensity * 0.04}
    />
  );
};

// Main scene component
const SpiralScene: React.FC<{
  events: TimeEvent[],
  config: SpiralConfig,
  onEventClick: (year: number, month: number, x: number, y: number) => void
}> = ({ events, config, onEventClick }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera position based on zoom
  useEffect(() => {
    if (camera) {
      // Adjust camera position based on zoom
      const distance = 15 / config.zoom;
      camera.position.set(distance, distance, distance);
      camera.lookAt(0, -3, 0);
    }
  }, [config.zoom, camera]);
  
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
      />
      
      {/* Enhanced space background */}
      <color attach="background" args={["#010203"]} />
      <fogExp2 attach="fog" args={[0x000000, 0.001]} />
      
      {/* Create more detailed 3D space environment */}
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0.5} fade speed={1} />
      <SpaceNebula />
      <CosmicDust />
      
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Render the main spiral */}
      <SpiralLine 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render month markers */}
      <MonthMarkers 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render all events */}
      {events.map((event) => {
        // Future events render as scattered objects
        if (event.startDate.getFullYear() > config.currentYear) {
          // Create a more interesting future event visualization as floating debris
          const randomDistance = 15 + Math.random() * 20;
          const randomAngle = Math.random() * Math.PI * 2;
          const randomHeight = (Math.random() - 0.5) * 20;
          
          const x = randomDistance * Math.cos(randomAngle);
          const y = randomHeight;
          const z = randomDistance * Math.sin(randomAngle);
          
          // Create different geometry based on intensity
          return (
            <mesh 
              key={event.id} 
              position={[x, y, z]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            >
              {event.intensity > 7 ? (
                <octahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />
              ) : event.intensity > 4 ? (
                <tetrahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />
              ) : (
                <dodecahedronGeometry args={[0.15 + event.intensity * 0.02, 0]} />
              )}
              <meshStandardMaterial 
                color={event.color} 
                transparent 
                opacity={0.7} 
                emissive={event.color}
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        }
        
        // Regular event with or without end date
        if (!event.endDate) {
          return (
            <EventPoint
              key={event.id}
              event={event}
              startYear={config.startYear}
              zoom={config.zoom}
              onClick={() => {
                const year = event.startDate.getFullYear();
                const month = event.startDate.getMonth();
                onEventClick(year, month, 0, 0);
              }}
            />
          );
        } else {
          return (
            <EventDuration
              key={event.id}
              startEvent={event}
              endEvent={{...event, startDate: event.endDate}}
              startYear={config.startYear}
              zoom={config.zoom}
            />
          );
        }
      })}
    </>
  );
};

// Main component that wraps the 3D canvas
const SpiralVisualization: React.FC<SpiralVisualizationProps> = ({
  events,
  config,
  onSpiralClick,
}) => {
  const handleCanvasClick = (event: any) => {
    // Only process clicks on the background, not on events
    if (!event.object) {
      const { point } = event;
      
      // Convert 3D point to year and month
      // We need to reverse engineer the spiral formula
      const radius = Math.sqrt(point.x * point.x + point.z * point.z);
      const yearIndex = Math.floor((radius - (5 * config.zoom)) / 0.5 + point.y / (-1.5 * config.zoom));
      const year = config.startYear + yearIndex;
      
      // Calculate angle from center (0,0)
      let angle = Math.atan2(point.z, point.x);
      if (angle < 0) angle += 2 * Math.PI;
      
      // Adjust to have January at 12 o'clock
      angle = (angle + Math.PI/2) % (2 * Math.PI);
      
      // Convert angle to month (0-11)
      const month = Math.floor((angle / (2 * Math.PI)) * 12);
      
      onSpiralClick(year, month, point.x, point.z);
    }
  };
  
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ 
          position: [15, 15, 15], 
          fov: 50,
          near: 0.1,
          far: 1000 
        }}
        gl={{ antialias: true }}
        linear
      >
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
