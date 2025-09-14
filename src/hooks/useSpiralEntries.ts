import { useState, useEffect, useCallback, useRef } from "react";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { saveEntry, getEntries, updateEntry, saveEntries, saveConfig, getConfig, deleteEntry, setFirstUseDate } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { analyzeEntry, generateRegionSummary } from "@/services/gemini";
import { mapSentimentToColor } from "@/utils/colorMapping";
import { generateSeedData } from "@/utils/seedData";
import { HoverInfo } from "@/components/spiral/TildePlacement";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const DAY_MS = 1000 * 60 * 60 * 24;
const REGION_RADIUS_DAYS = 14;

/**
 * Find the earliest anchorDate across all entries.
 */
const findEarliestDate = (entries: JournalEntry[]): Date => {
  return entries.reduce((min, e) => {
    const d = new Date(e.anchorDate);
    return d < min ? d : min;
  }, new Date());
};

/**
 * Seed demo entries + set firstUseDate to earliest entry.
 * Returns the seeded entries.
 */
const seedAndConfigure = (entries: JournalEntry[]): void => {
  const earliest = findEarliestDate(entries);
  // IMPORTANT: set firstUseDate BEFORE calling getConfig(),
  // because getConfig() reads firstUseDate internally.
  setFirstUseDate(earliest);
  saveEntries(entries);
};

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

  const [anchorDate, setAnchorDate] = useState<Date | null>(null);
  const [showEntryPopup, setShowEntryPopup] = useState(false);
  const [showEntryLog, setShowEntryLog] = useState(false);

  const loadSeedData = useCallback(() => {
    const seed = generateSeedData();
    seedAndConfigure(seed);
    setEntries(seed);
    setConfig(getConfig()); // now reads the correct firstUseDate
    toast({ title: "Demo loaded", description: `${seed.length} entries added to the spiral` });
  }, [toast]);

  useEffect(() => {
    // Clear legacy data formats
    localStorage.removeItem("youAreHere_events");

    let savedEntries = getEntries();

    // Auto-seed on first visit (or if all entries were deleted)
    if (savedEntries.length === 0) {
      const seed = generateSeedData();
      seedAndConfigure(seed);
      savedEntries = seed;
    }

    setEntries(savedEntries);
    // getConfig reads firstUseDate from storage — which is now correct
    setConfig(getConfig());
  }, []);

  const handleTildePlaced = useCallback((date: Date) => {
    setAnchorDate(date);
    setShowEntryPopup(true);
  }, []);

  const runSentimentAnalysis = useCallback(async (entry: JournalEntry) => {
    if (!GEMINI_API_KEY) {
      // No API key — skip analysis
      return;
    }

    const result = await analyzeEntry(entry.text, entry.anchorDate, GEMINI_API_KEY);
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
      endDate: result.endDate,
    };

    updateEntry(updated);
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  const handleSaveEntry = useCallback((entry: JournalEntry) => {
    saveEntry(entry);
    setEntries((prev) => [...prev, entry]);
    toast({
      title: "Saved",
      description: "Your entry has been added to the spiral",
    });
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

  const handleDeleteMultiple = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    const remaining = getEntries().filter((e) => !idSet.has(e.id));
    saveEntries(remaining);
    setEntries(remaining);
    toast({
      title: "Deleted",
      description: `${ids.length} entries removed from your spiral`,
    });
  }, [toast]);

  // --- Hover summary ---
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    dateLabel: string;
    summary: string | null;
    loading: boolean;
    entryCount: number;
  } | null>(null);

  const summaryCache = useRef<Map<string, string>>(new Map());

  const handleHover = useCallback((info: HoverInfo | null) => {
    if (!info) {
      setHoverInfo(null);
      return;
    }

    const hoveredTime = info.date.getTime();
    const nearby = entries.filter((e) => {
      const anchorTime = new Date(e.anchorDate).getTime();
      return Math.abs(anchorTime - hoveredTime) < REGION_RADIUS_DAYS * DAY_MS;
    });

    if (nearby.length === 0) {
      setHoverInfo(null);
      return;
    }

    // Approximate date label — "around early/mid/late Month Year"
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = info.date;
    const dayOfMonth = d.getDate();
    const phase = dayOfMonth <= 10 ? "early" : dayOfMonth <= 20 ? "mid" : "late";
    const dateLabel = `Around ${phase} ${months[d.getMonth()]} ${d.getFullYear()}`;

    // Cache key = sorted entry IDs
    const cacheKey = nearby.map((e) => e.id).sort().join(",");
    const cached = summaryCache.current.get(cacheKey);

    if (cached) {
      setHoverInfo({ x: info.screenX, y: info.screenY, dateLabel, summary: cached, loading: false, entryCount: nearby.length });
      return;
    }

    // Show tooltip immediately with loading state
    setHoverInfo({ x: info.screenX, y: info.screenY, dateLabel, summary: null, loading: true, entryCount: nearby.length });

    // Generate summary in background
    if (GEMINI_API_KEY) {
      generateRegionSummary(nearby, GEMINI_API_KEY).then((summary) => {
        if (summary) {
          summaryCache.current.set(cacheKey, summary);
          setHoverInfo((prev) => prev ? { ...prev, summary, loading: false } : null);
        } else {
          setHoverInfo((prev) => prev ? { ...prev, loading: false } : null);
        }
      });
    } else {
      setHoverInfo((prev) => prev ? { ...prev, loading: false } : null);
    }
  }, [entries]);

  return {
    entries,
    config,
    anchorDate,
    showEntryPopup,
    setShowEntryPopup,
    showEntryLog,
    setShowEntryLog,
    handleTildePlaced,
    handleSaveEntry,
    handleDeleteEntry,
    handleDeleteMultiple,
    handleHover,
    hoverInfo,
    loadSeedData,
    currentYear,
  };
};
