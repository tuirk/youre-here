export interface Sentiment {
  color: string;           // hex color derived by AI
  intensity: number;       // 0-1 emotional strength
  categories: string[];    // e.g. ["joy", "anxiety"]
}

export interface JournalEntry {
  id: string;
  text: string;                              // raw user input
  createdAt: string;                         // ISO string — when they wrote it
  anchorDate: string;                        // ISO string — where on the spiral
  endDate?: string;                          // ISO string — if AI detects time range
  sentiment?: Sentiment;                     // AI-derived, null until analyzed
  temporalScope: "point" | "smear" | "forward";
  summary?: string;                          // AI-generated region summary (Phase 3)
}

export interface SpiralConfig {
  startYear: number;
  currentYear: number;
  firstUseDate: string;
  zoom: number;
  centerX: number;
  centerY: number;
}
