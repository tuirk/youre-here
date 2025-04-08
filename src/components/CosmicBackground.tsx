
import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
}

interface Nebula {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  hue: number;
}

const CosmicBackground: React.FC = () => {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const nebulasContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate random stars
  const generateStars = (count: number): Star[] => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      animationDuration: Math.random() * 10 + 5,
      animationDelay: Math.random() * 5,
    }));
  };
  
  // Generate nebula clouds
  const generateNebulas = (count: number): Nebula[] => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 400 + 200,
      opacity: Math.random() * 0.3 + 0.1,
      animationDuration: Math.random() * 60 + 30,
      hue: Math.floor(Math.random() * 360),
    }));
  };
  
  useEffect(() => {
    const stars = generateStars(150);
    const nebulas = generateNebulas(7);
    
    if (starsContainerRef.current) {
      // Clear any existing stars
      starsContainerRef.current.innerHTML = '';
      
      // Create star elements
      stars.forEach((star) => {
        const starElement = document.createElement('div');
        starElement.className = 'star';
        starElement.style.left = `${star.x}%`;
        starElement.style.top = `${star.y}%`;
        starElement.style.width = `${star.size}px`;
        starElement.style.height = `${star.size}px`;
        starElement.style.opacity = `${star.opacity}`;
        starElement.style.animation = `twinkle ${star.animationDuration}s ease-in-out infinite`;
        starElement.style.animationDelay = `${star.animationDelay}s`;
        
        starsContainerRef.current.appendChild(starElement);
      });
    }
    
    if (nebulasContainerRef.current) {
      // Clear any existing nebulas
      nebulasContainerRef.current.innerHTML = '';
      
      // Create nebula elements
      nebulas.forEach((nebula) => {
        const nebulaElement = document.createElement('div');
        nebulaElement.className = 'nebula';
        nebulaElement.style.left = `${nebula.x}%`;
        nebulaElement.style.top = `${nebula.y}%`;
        nebulaElement.style.width = `${nebula.size}px`;
        nebulaElement.style.height = `${nebula.size}px`;
        nebulaElement.style.opacity = `${nebula.opacity}`;
        nebulaElement.style.animation = `drift ${nebula.animationDuration}s ease-in-out infinite`;
        
        // Randomize the nebula colors slightly
        const hueRotate = nebula.hue;
        nebulaElement.style.filter = `hue-rotate(${hueRotate}deg)`;
        
        nebulasContainerRef.current.appendChild(nebulaElement);
      });
    }
  }, []);
  
  return (
    <div className="cosmic-bg">
      <div ref={nebulasContainerRef} className="absolute inset-0 overflow-hidden"></div>
      <div ref={starsContainerRef} className="absolute inset-0 overflow-hidden"></div>
    </div>
  );
};

export default CosmicBackground;
