
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [visible, setVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple animation sequence
    const textTimer = setTimeout(() => {
      setVisible(true);
      
      const buttonTimer = setTimeout(() => {
        setShowButton(true);
      }, 1500);
      
      return () => clearTimeout(buttonTimer);
    }, 1000);

    return () => clearTimeout(textTimer);
  }, []);

  const handleBeginMapping = () => {
    navigate('/spiral');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className={`text-center text-white transition-opacity duration-700 ${visible ? 'opacity-90' : 'opacity-0'}`}>
        <h1 className="text-4xl font-light tracking-wider mb-2">You Are Here</h1>
        <p className="text-xl font-thin tracking-wide opacity-70 mb-8">a moment for reflection</p>
        
        <div className={`mt-12 transition-opacity duration-700 ${showButton ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleBeginMapping}
              className="bg-cosmic-nebula-purple/60 hover:bg-cosmic-nebula-purple/80 text-white border border-cosmic-nebula-purple/30 backdrop-blur-sm px-6 py-2"
            >
              Begin Mapping
            </Button>
            <Button 
              onClick={() => window.open('https://medium.com/@tuirkey/youre-here-a-mood-focused-memory-map-0c7bde098c88', '_blank')}
              className="bg-cosmic-nebula-purple/60 hover:bg-cosmic-nebula-purple/80 text-white border border-cosmic-nebula-purple/30 backdrop-blur-sm px-6 py-2"
            >
              What's You're Here?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
