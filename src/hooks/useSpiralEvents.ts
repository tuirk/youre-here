
import { useState, useEffect } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig, deleteEvent } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

interface UseSpiralEventsProps {
  initialConfig?: Partial<SpiralConfig>;
  enforceYearConstraints?: boolean;
}

export const useSpiralEvents = ({ 
  initialConfig = {},
  enforceYearConstraints = true
}: UseSpiralEventsProps = {}) => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear - 5,
    currentYear: currentYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    ...initialConfig,
  });
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [showMemoryList, setShowMemoryList] = useState(false);

  // Load events and config from localStorage
  useEffect(() => {
    const savedEvents = getEvents();
    setEvents(savedEvents);
    
    const savedConfig = getConfig();
    
    // Apply initial config with possible overrides
    const finalConfig = {
      ...savedConfig,
      ...initialConfig,
    };
    
    setConfig(finalConfig);
    
    // Save the config back if needed
    if (Object.keys(initialConfig).length > 0) {
      saveConfig(finalConfig);
    }
  }, []);
  
  // Function to handle spiral clicks
  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    // Check if year is within allowed range if enforceYearConstraints is true
    if (enforceYearConstraints) {
      const maxYear = currentYear + 1;
      const minYear = currentYear - 5; // Limited to 5 years before current year
      
      if (year < minYear || year > maxYear) {
        toast({
          title: "Outside Allowed Time Range",
          description: `You can only add memories between ${minYear} and ${maxYear}`,
          variant: "destructive"
        });
        return;
      }
    }
    
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowEventForm(true);
  };
  
  // Function to save a new event
  const handleSaveEvent = (newEvent: TimeEvent) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    
    toast({
      title: "Memory Saved",
      description: `"${newEvent.title}" has been added to your timeline`,
    });
  };

  // Function to delete an event
  const handleDeleteEvent = (eventId: string) => {
    // Use the enhanced deleteEvent function
    deleteEvent(eventId);
    
    // Update local state to reflect the deletion
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    
    toast({
      title: "Memory Deleted",
      description: "The memory has been removed from your timeline",
    });
  };
  
  return {
    events,
    config,
    showEventForm,
    setShowEventForm,
    selectedYear,
    selectedMonth,
    showMemoryList,
    setShowMemoryList,
    handleSpiralClick,
    handleSaveEvent,
    handleDeleteEvent,
    currentYear
  };
};
