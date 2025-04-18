
import React from "react";
import { Text } from "@react-three/drei";

interface MonthMarkersProps {
  startYear: number;     // First year to display in the spiral
  currentYear: number;   // Latest year to display in the spiral
  zoom: number;          // Current zoom level (affects visual scale)
}

/**
 * Renders month labels at regular intervals along the spiral
 * Only shows quarters (Jan, Apr, Jul, Oct) to avoid cluttering the spiral
 */
export const MonthMarkers: React.FC<MonthMarkersProps> = ({ 
  startYear, 
  currentYear, 
  zoom 
}) => {
  // Only show these months to reduce clutter
  const monthsToShow = ["Jan", "Apr", "Jul", "Oct"];
  const markers = [];
  
  // Create markers for each quarter month in each year
  for (let year = startYear; year <= currentYear; year++) {
    for (let month = 0; month < 12; month += 3) {
      // Only render the specific months we want to show
      const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month];
      if (monthsToShow.includes(monthName)) {
        // Calculate position consistently with spiral generation
        const yearIndex = year - startYear;
        const monthFraction = month / 12;
        const angleRad = -monthFraction * Math.PI * 2 + Math.PI/2;
        const radius = 5 * zoom + yearIndex * 0.5;
        
        // Position calculation
        const x = radius * Math.cos(angleRad);
        const y = -yearIndex * 1.5 * zoom - monthFraction * 1.5 * zoom;
        const z = radius * Math.sin(angleRad);
        
        // Create text marker with improved visibility to match quarterly view
        markers.push(
          <Text
            key={`${year}-${month}`}
            position={[x, y, z]}
            color="#ffffff" // Pure white for better visibility
            fontSize={0.4} // Increased from 0.3 to match quarterly view
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.06} // Add outline for better visibility
            outlineColor="#000000" // Pure black outline for maximum contrast
          >
            {monthName}
          </Text>
        );
      }
    }
  }
  
  return <>{markers}</>;
};
