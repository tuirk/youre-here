
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

/**
 * Calculates the position for a single event on the spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between year loops
 * @returns 3D vector position for the event
 */
export const getEventPosition = (
  event: TimeEvent,
  startYear: number,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3 => {
  const year = event.startDate.getFullYear();
  const month = event.startDate.getMonth();
  const day = event.startDate.getDate();
  
  // Calculate yearOffset and progress within year for consistent positioning
  const yearOffset = year - startYear;
  const yearProgress = month / 12 + day / 365;
  const totalProgress = yearOffset + yearProgress;
  
  // Calculate angle consistently with generateSpiralPoints
  const angleRad = -yearProgress * Math.PI * 2 + Math.PI/2;
  
  // Use the same radius formula as in generateSpiralPoints
  const currentRadius = radius + totalProgress * 0.5;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
