import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

const Index = () => {
  const [visible, setVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setVisible(true);
      const buttonTimer = setTimeout(() => setShowButton(true), 1500);
      return () => clearTimeout(buttonTimer);
    }, 1000);
    return () => clearTimeout(textTimer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <color attach="background" args={["#010206"]} />
          <Stars radius={100} depth={50} count={6000} factor={4} saturation={0.5} fade speed={0.5} />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className={`text-center transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-5xl font-extralight tracking-[0.2em] text-white/80 mb-3">
            You're Here
          </h1>
          <p className="text-lg font-extralight tracking-[0.15em] text-white/25 mb-16">
            a moment for reflection
          </p>

          <div className={`transition-opacity duration-700 ${showButton ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => navigate('/spiral')}
              className="text-white/40 hover:text-white/70 text-sm tracking-[0.2em] font-extralight border-b border-white/10 hover:border-white/30 pb-1 transition-all duration-300"
            >
              enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
