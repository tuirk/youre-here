
import { Vector3 } from "three";

/**
 * Core spiral utilities
 * 
 * This file has been refactored to re-export all utilities related to the annual spiral view
 * for better organization and maintainability, similar to the quarterly spiral utilities.
 */

// Define the SpiralPoint interface that's used across both annual and quarterly functions
export interface SpiralPoint {
  position: Vector3;
  year: number;
  month: number;
  day: number;
}

// Re-export all functions from their separate modules
export { generateSpiralPoints } from './annual/generateSpiralPoints';
export { getEventPosition } from './annual/eventPositioning';
export { calculateSpiralSegment } from './annual/durationSegments';
