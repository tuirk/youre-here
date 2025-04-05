import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

/**
 * Generates points for visualizing event durations (line segments between dates)
 * @param startEvent The event marking the start of the duration
 * @param endEvent The event marking the end of the duration
 * @param startYear First year of the spiral (for reference)
 * @param segmentPoints Requested number of points
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between year loops
 * @returns Array of 3D points forming a smooth line between events
 */
export const calculateSpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  segmentPoints: number = 100,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  // Calculate a good number of points based on the segment length
  // Use at least the requested number, but potentially more for longer segments
  const startDate = new Date(startEvent.startDate);
  const endDate = new Date(endEvent.startDate || endEvent.endDate || startEvent.startDate);
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Scale points with duration, but keep a reasonable maximum
  const actualSegmentPoints = Math.min(500, segmentPoints);
  
  const points: Vector3[] = [];
  
  // Create points at regular intervals between the two dates
  for (let i = 0; i <= actualSegmentPoints; i++) {
    const progress = i / actualSegmentPoints;
    const currentDate = new Date(startDate.getTime() + progress * totalDays * 24 * 60 * 60 * 1000);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    // Calculate position consistently with other functions
    const yearOffset = year - startYear;
    const yearProgress = month / 12 + day / 365;
    const totalProgress = yearOffset + yearProgress;
    
    const angleRad = -yearProgress * Math.PI * 2 + Math.PI/2;
    const currentRadius = radius + totalProgress * 0.5;
    
    const x = currentRadius * Math.cos(angleRad);
    const y = -totalProgress * heightPerLoop;
    const z = currentRadius * Math.sin(angleRad);
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
