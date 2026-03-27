import { Vector3 } from "three";

export interface DailySpiralPoint {
  position: Vector3;
  date: Date;
  dayIndex: number;
}

/**
 * Core math: given a dayIndex (days since firstUseDate), return angle + radius.
 * 1 revolution = ~30.44 days (average month length).
 * Radius grows per revolution (Archimedean spiral).
 */
export const DAYS_PER_REV = 30.44;

export const getDailySpiralCoords = (
  dayIndex: number,
  baseRadius: number = 2,
  radiusGrowth: number = 0.8,
  heightPerRev: number = 1.2
) => {
  const revolutions = dayIndex / DAYS_PER_REV;
  // Angle: one full revolution per month, clockwise, starting at top
  const angleRad = -revolutions * Math.PI * 2 + Math.PI / 2;
  // Radius grows with each revolution
  const currentRadius = baseRadius + revolutions * radiusGrowth;
  // Position
  const x = currentRadius * Math.cos(angleRad);
  const y = -revolutions * heightPerRev; // downward spiral
  const z = currentRadius * Math.sin(angleRad);

  return { x, y, z, angleRad, currentRadius };
};

/**
 * Generates smooth spiral line points from firstUseDate to today.
 * Uses multiple sub-steps per day for a smooth curve.
 */
export const generateDailySpiralPoints = (
  firstUseDate: Date,
  today: Date,
  stepsPerDay: number = 4,
  baseRadius: number = 2,
  radiusGrowth: number = 0.8,
  heightPerRev: number = 1.2
): DailySpiralPoint[] => {
  const points: DailySpiralPoint[] = [];

  const start = new Date(firstUseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);

  const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  // Always have at least a small spiral even on day 0
  const totalSteps = Math.max(1, totalDays * stepsPerDay);

  for (let step = 0; step <= totalSteps; step++) {
    const dayIndex = (step / stepsPerDay);
    const { x, y, z } = getDailySpiralCoords(dayIndex, baseRadius, radiusGrowth, heightPerRev);

    // Calculate the date for this point
    const date = new Date(start);
    date.setDate(date.getDate() + Math.floor(dayIndex));

    points.push({
      position: new Vector3(x, y, z),
      date,
      dayIndex,
    });
  }

  return points;
};

/**
 * Returns positions for each individual day (one per day, for markers).
 */
export const getDayPositions = (
  firstUseDate: Date,
  today: Date,
  baseRadius: number = 2,
  radiusGrowth: number = 0.8,
  heightPerRev: number = 1.2
): DailySpiralPoint[] => {
  const points: DailySpiralPoint[] = [];

  const start = new Date(firstUseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);

  const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  for (let dayIndex = 0; dayIndex <= totalDays; dayIndex++) {
    const { x, y, z } = getDailySpiralCoords(dayIndex, baseRadius, radiusGrowth, heightPerRev);

    const date = new Date(start);
    date.setDate(date.getDate() + dayIndex);

    points.push({
      position: new Vector3(x, y, z),
      date,
      dayIndex,
    });
  }

  return points;
};
