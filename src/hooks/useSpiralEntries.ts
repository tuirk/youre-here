import { useState, useEffect, useCallback } from "react";
import { JournalEntry, SpiralConfig } from "@/types/event";
import { saveEntry, getEntries, saveConfig, getConfig, deleteEntry, getFirstUseDate } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

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

  // Tilde placement state
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

  const handleSaveEntry = useCallback((entry: JournalEntry) => {
    saveEntry(entry);
    setEntries((prev) => [...prev, entry]);
    toast({
      title: "Saved",
      description: "Your entry has been added to the spiral",
    });
  }, [toast]);

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
