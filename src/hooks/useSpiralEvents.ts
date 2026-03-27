import { useState, useEffect } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig, deleteEvent, getFirstUseDate } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

interface UseSpiralEventsProps {
  initialConfig?: Partial<SpiralConfig>;
}

export const useSpiralEvents = ({
  initialConfig = {},
}: UseSpiralEventsProps = {}) => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const now = new Date();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear,
    currentYear: currentYear,
    firstUseDate: new Date().toISOString(),
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    ...initialConfig,
  });

  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(now.getMonth());
  const [showMemoryList, setShowMemoryList] = useState(false);

  useEffect(() => {
    const savedEvents = getEvents();
    setEvents(savedEvents);

    // Ensure firstUseDate is set (creates it on first visit)
    getFirstUseDate();

    const savedConfig = getConfig();
    const finalConfig = {
      ...savedConfig,
      ...initialConfig,
    };

    setConfig(finalConfig);

    if (Object.keys(initialConfig).length > 0) {
      saveConfig(finalConfig);
    }
  }, []);

  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowEventForm(true);
  };

  // Open journal form defaulting to today
  const handleJournalToday = () => {
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setShowEventForm(true);
  };

  const handleSaveEvent = (newEvent: TimeEvent) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    toast({
      title: "Memory Saved",
      description: `"${newEvent.title}" has been added to your spiral`,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);

    toast({
      title: "Memory Deleted",
      description: "The memory has been removed from your spiral",
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
    handleJournalToday,
    handleSaveEvent,
    handleDeleteEvent,
    currentYear,
  };
};
