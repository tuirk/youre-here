
import { TimeEvent, SpiralConfig } from "@/types/event";

const EVENTS_STORAGE_KEY = "youAreHere_events";
const CONFIG_STORAGE_KEY = "youAreHere_config";
const FIRST_USE_DATE_KEY = "youAreHere_firstUseDate";

export const getFirstUseDate = (): Date => {
  const stored = localStorage.getItem(FIRST_USE_DATE_KEY);
  if (stored) {
    return new Date(stored);
  }
  // First time opening — record today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  localStorage.setItem(FIRST_USE_DATE_KEY, today.toISOString());
  return today;
};

export const setFirstUseDate = (date: Date): void => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  localStorage.setItem(FIRST_USE_DATE_KEY, d.toISOString());
};

export const saveEvents = (events: TimeEvent[]): void => {
  const sanitizedEvents = events.map(event => ({
    ...event,
    startDate: event.startDate,
    endDate: event.endDate,
    id: event.id,
    title: event.title || "Untitled Event",
    intensity: typeof event.intensity === 'number' ? event.intensity : 5,
    color: event.color || "#ffffff",
    eventType: event.eventType || "one-time"
  }));

  localStorage.setItem(
    EVENTS_STORAGE_KEY,
    JSON.stringify(sanitizedEvents, (key, value) => {
      return value instanceof Date ? value.toISOString() : value;
    })
  );

  console.log(`Saved ${sanitizedEvents.length} events to localStorage`);
};

export const getEvents = (): TimeEvent[] => {
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (!storedEvents) return [];

  try {
    const parsed = JSON.parse(storedEvents);
    const events = parsed.map((event: any) => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      dayOfYear: event.dayOfYear || undefined,
      eventType: event.eventType || (event.endDate ? "process" : "one-time")
    }));

    console.log(`Loaded ${events.length} events from localStorage`);

    return events.filter((event: TimeEvent) =>
      event && event.id && event.startDate instanceof Date
    );
  } catch (e) {
    console.error("Failed to parse stored events:", e);
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    return [];
  }
};

export const deleteEvent = (eventId: string): void => {
  const events = getEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  saveEvents(filteredEvents);
  console.log(`Deleted event ${eventId}, ${filteredEvents.length} events remaining`);
};

export const saveConfig = (config: Partial<SpiralConfig>): void => {
  const existingConfig = getConfig();
  const updatedConfig = {
    ...existingConfig,
    ...config,
  };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
};

export const getConfig = (): SpiralConfig => {
  const currentYear = new Date().getFullYear();
  const firstUseDate = getFirstUseDate();
  const defaultConfig: SpiralConfig = {
    startYear: firstUseDate.getFullYear(),
    currentYear,
    firstUseDate: firstUseDate.toISOString(),
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  };

  const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!storedConfig) return defaultConfig;

  try {
    const parsedConfig = JSON.parse(storedConfig);
    return {
      ...defaultConfig,
      ...parsedConfig,
      firstUseDate: firstUseDate.toISOString(),
    };
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    return defaultConfig;
  }
};
