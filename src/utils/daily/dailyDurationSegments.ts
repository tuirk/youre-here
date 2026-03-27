import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getDailySpiralCoords } from "./generateDailySpiralPoints";

/**
 * Generates points for visualizing event durations on the daily spiral.
 */
export const calculateDailySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  firstUseDate: Date,
  segmentPoints: number = 100,
  baseRadius: number = 2,
  radiusGrowth: number = 0.8,
  heightPerRev: number = 1.2
): Vector3[] => {
  const start = new Date(firstUseDate);
  start.setHours(0, 0, 0, 0);

  const startDate = new Date(startEvent.startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endEvent.startDate || endEvent.endDate || startEvent.startDate);
  endDate.setHours(0, 0, 0, 0);

  const startDayIndex = Math.max(0, (startDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const endDayIndex = Math.max(startDayIndex, (endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const actualPoints = Math.min(500, segmentPoints);
  const points: Vector3[] = [];

  for (let i = 0; i <= actualPoints; i++) {
    const progress = i / actualPoints;
    const dayIndex = startDayIndex + progress * (endDayIndex - startDayIndex);
    const { x, y, z } = getDailySpiralCoords(dayIndex, baseRadius, radiusGrowth, heightPerRev);
    points.push(new Vector3(x, y, z));
  }

  return points;
};
