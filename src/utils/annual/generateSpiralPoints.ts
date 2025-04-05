
import { Vector3 } from "three";
import { SpiralPoint } from "../spiralUtils";

/**
 * Generates points for the spiral visualization based on time range
 * @param startYear The first year to display in the spiral
 * @param currentYear The latest year to display in the spiral
 * @param stepsPerLoop Number of points to use for each year loop (higher = smoother curve)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between each year loop
 * @returns Array of spiral points with position and date information
 */
export const generateSpiralPoints = (
  startYear: number,
  currentYear: number,
  stepsPerLoop: number = 360,
  radius: number = 5,
  heightPerLoop: number = 1.5
): SpiralPoint[] => {
  const points: SpiralPoint[] = [];
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();
  
  // Number of years to render
  const yearSpan = currentYear - startYear + 1;
  // Base radius of the spiral
  const baseRadius = radius;
  
  // Generate points for each year in range
  for (let yearOffset = 0; yearOffset < yearSpan; yearOffset++) {
    const year = startYear + yearOffset;
    
    // For current year, only generate points up to today
    const yearProgress = year === todayYear 
      ? (todayMonth / 12) + (todayDay / 365)
      : 1; // Full year for past years
    
    const stepsThisYear = year === todayYear 
      ? Math.floor(yearProgress * stepsPerLoop) 
      : stepsPerLoop;
    
    // Create points around the loop for this year
    for (let step = 0; step < stepsThisYear; step++) {
      const progress = step / stepsPerLoop;
      const month = Math.floor(progress * 12);
      const day = Math.floor((progress * 12 - month) * 30) + 1;
      
      // Calculate angle in radians with proper offset
      // Negative angle for clockwise rotation, offset for positioning
      const angleRad = -progress * Math.PI * 2 + Math.PI/2;
      
      // Calculate the total progress through all years
      const totalProgress = yearOffset + progress;
      
      // Apply consistent radius expansion formula for smooth spiral
      const currentRadius = baseRadius + totalProgress * 0.5;
      
      // Position calculation with gradual height change
      const x = currentRadius * Math.cos(angleRad);
      const y = -totalProgress * heightPerLoop; // Negative for downward spiral
      const z = currentRadius * Math.sin(angleRad);
      
      points.push({ 
        position: new Vector3(x, y, z),
        year,
        month,
        day
      });
    }
  }

  return points;
}
