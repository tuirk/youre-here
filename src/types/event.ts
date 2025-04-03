export interface TimeEvent {
  id: string;
  title: string;
  description?: string; // Optional description field
  tags?: string[]; // Optional array of tags
  color: string;
  intensity: number; // 1-10
  startDate: Date;
  endDate?: Date; // Optional end date for process events
  dayOfYear?: number; // Optional day of year for more precise positioning
  isRoughDate?: boolean; // Indicates if this is a seasonal rough date
  roughDateSeason?: string; // The season (Spring, Summer, Fall, Winter)
  roughDateYear?: number; // The year for the rough date
  eventType: "one-time" | "process"; // Explicit event type to differentiate visualization
}

export interface SpiralConfig {
  startYear: number;
  currentYear: number;
  zoom: number;
  centerX: number;
  centerY: number;
}
