import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getDailySpiralCoords } from "./generateDailySpiralPoints";

/**
 * Calculates the position of an event on the daily spiral.
 */
export const getDailyEventPosition = (
  event: TimeEvent,
  firstUseDate: Date,
  baseRadius: number = 2,
  radiusGrowth: number = 0.8,
  heightPerRev: number = 1.2
): Vector3 => {
  const start = new Date(firstUseDate);
  start.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.startDate);
  eventDate.setHours(0, 0, 0, 0);

  const dayIndex = Math.max(0, Math.floor((eventDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const { x, y, z } = getDailySpiralCoords(dayIndex, baseRadius, radiusGrowth, heightPerRev);

  return new Vector3(x, y, z);
};

/**
 * Calculate day index for a given date relative to firstUseDate.
 */
export const getDayIndex = (date: Date, firstUseDate: Date): number => {
  const start = new Date(firstUseDate);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};
