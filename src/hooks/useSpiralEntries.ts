import { useState, useEffect, useCallback } from "react";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { saveEntry, getEntries, updateEntry, saveConfig, getConfig, deleteEntry, getFirstUseDate } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { analyzeEntry } from "@/services/gemini";
import { mapSentimentToColor } from "@/utils/colorMapping";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export const useSpiralEntries = () => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear,
    currentYear,
    firstUseDate: new Date().toISOString(),
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  });

  const [tildePlacementActive, setTildePlacementActive] = useState(false);
  const [anchorDate, setAnchorDate] = useState<Date | null>(null);
  const [showEntryPopup, setShowEntryPopup] = useState(false);
  const [showEntryLog, setShowEntryLog] = useState(false);

  useEffect(() => {
    const savedEntries = getEntries();
    setEntries(savedEntries);
    getFirstUseDate();
    const savedConfig = getConfig();
    setConfig(savedConfig);
  }, []);

  const handleTildePlaced = useCallback((date: Date) => {
    setAnchorDate(date);
    setShowEntryPopup(true);
    setTildePlacementActive(false);
  }, []);

  const handleStartPlacement = useCallback(() => {
    setTildePlacementActive(true);
  }, []);

  // Analyze entry with Gemini in background, then update
  const runSentimentAnalysis = useCallback(async (entry: JournalEntry) => {
    if (!GEMINI_API_KEY) {
      console.warn("No VITE_GEMINI_API_KEY set — skipping sentiment analysis");
      return;
    }

    const result = await analyzeEntry(entry.text, GEMINI_API_KEY);
    if (!result) return;

    const color = mapSentimentToColor(result.categories, result.intensity);

    const updated: JournalEntry = {
      ...entry,
      sentiment: {
        color,
        intensity: result.intensity,
        categories: result.categories,
      },
      temporalScope: result.temporalScope,
    };

    // If there's an endDateOffset, calculate the endDate
    if (result.endDateOffset && result.temporalScope !== "point") {
      const anchor = new Date(entry.anchorDate);
      const end = new Date(anchor);
      end.setDate(end.getDate() + result.endDateOffset);
      updated.endDate = end.toISOString();
    }

    updateEntry(updated);
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  const handleSaveEntry = useCallback((entry: JournalEntry) => {
    // Save immediately with no sentiment (renders as neutral gray)
    saveEntry(entry);
    setEntries((prev) => [...prev, entry]);

    toast({
      title: "Saved",
      description: "Your entry has been added to the spiral",
    });

    // Fire sentiment analysis in background — color fades in when ready
    runSentimentAnalysis(entry);
  }, [toast, runSentimentAnalysis]);

  const handleDeleteEntry = useCallback((entryId: string) => {
    deleteEntry(entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    toast({
      title: "Deleted",
      description: "Entry removed from your spiral",
    });
  }, [toast]);

  return {
    entries,
    config,
    tildePlacementActive,
    anchorDate,
    showEntryPopup,
    setShowEntryPopup,
    showEntryLog,
    setShowEntryLog,
    handleTildePlaced,
    handleStartPlacement,
    handleSaveEntry,
    handleDeleteEntry,
    currentYear,
  };
};
