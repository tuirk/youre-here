
import { TimeEvent, SpiralConfig } from "@/types/event";

const EVENTS_STORAGE_KEY = "youAreHere_events";
const CONFIG_STORAGE_KEY = "youAreHere_config";

export const saveEvents = (events: TimeEvent[]): void => {
  // Clean/sanitize events before saving to ensure data integrity
  const sanitizedEvents = events.map(event => ({
    ...event,
    // Ensure dates are properly serialized
    startDate: event.startDate,
    endDate: event.endDate,
    // Make sure all required properties exist
    id: event.id, // This should always exist
    title: event.title || "Untitled Event",
    intensity: typeof event.intensity === 'number' ? event.intensity : 5,
    color: event.color || "#ffffff",
    eventType: event.eventType || "one-time"
  }));
  
  // Save to localStorage with stringified dates
  localStorage.setItem(
    EVENTS_STORAGE_KEY, 
    JSON.stringify(sanitizedEvents, (key, value) => {
      // Properly handle Date serialization
      return value instanceof Date ? value.toISOString() : value;
    })
  );
  
  // Log for debugging purposes
  console.log(`Saved ${sanitizedEvents.length} events to localStorage`);
};

export const getEvents = (): TimeEvent[] => {
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (!storedEvents) return [];
  
  try {
    const parsed = JSON.parse(storedEvents);
    // Convert string dates back to Date objects
    const events = parsed.map((event: any) => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      dayOfYear: event.dayOfYear || undefined,
      // Ensure event type is always defined
      eventType: event.eventType || (event.endDate ? "process" : "one-time")
    }));
    
    // Log for debugging
    console.log(`Loaded ${events.length} events from localStorage`);
    
    // Filter out any malformed events to prevent errors
    return events.filter((event: TimeEvent) => 
      event && event.id && event.startDate instanceof Date
    );
  } catch (e) {
    console.error("Failed to parse stored events:", e);
    // Clear corrupted data
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
  // Get existing config to merge with new values
  const existingConfig = getConfig();
  // Always ensure startYear is fixed to 5 years before current year
  const currentYear = new Date().getFullYear();
  const updatedConfig = { 
    ...existingConfig, 
    ...config,
    startYear: currentYear - 5 // Always enforce this constraint
  };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
};

export const getConfig = (): SpiralConfig => {
  const currentYear = new Date().getFullYear();
  const defaultConfig: SpiralConfig = {
    startYear: currentYear - 5, // Always 5 years before current year
    currentYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  };
  
  const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!storedConfig) return defaultConfig;
  
  try {
    // Ensure startYear is always enforced
    const parsedConfig = JSON.parse(storedConfig);
    return { 
      ...defaultConfig, 
      ...parsedConfig,
      startYear: currentYear - 5 // Always enforce this constraint
    };
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    return defaultConfig;
  }
};
