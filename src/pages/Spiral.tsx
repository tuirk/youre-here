import React from "react";
import { SpiralVisualization } from "@/components/spiral";
import EntryPopup from "@/components/journal/EntryPopup";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { MemoryList } from "@/components/spiral/MemoryList";
import { useSpiralEntries } from "@/hooks/useSpiralEntries";

const Spiral: React.FC = () => {
  const {
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
  } = useSpiralEntries();

  return (
    <div className="w-full h-screen">
      <SpiralVisualization
        entries={entries}
        config={config}
        tildePlacementActive={tildePlacementActive}
        onTildePlaced={handleTildePlaced}
      />

      <SpiralControls
        onNewEntryClick={handleStartPlacement}
        onViewEntriesClick={() => setShowEntryLog(true)}
        placementActive={tildePlacementActive}
      />

      <SpiralHelp viewType="annual" currentYear={currentYear} />

      {/* Reuse MemoryList as entry log for now — replaced in Phase 3 */}
      <MemoryList
        events={entries.map((e) => ({
          id: e.id,
          title: e.text.slice(0, 60) + (e.text.length > 60 ? "..." : ""),
          color: e.sentiment?.color || "#aaaaaa",
          intensity: Math.round((e.sentiment?.intensity ?? 0.5) * 10),
          startDate: new Date(e.anchorDate),
          eventType: "one-time" as const,
        }))}
        open={showEntryLog}
        onOpenChange={setShowEntryLog}
        onDeleteEvent={handleDeleteEntry}
      />

      <EntryPopup
        open={showEntryPopup}
        onClose={() => setShowEntryPopup(false)}
        onSave={handleSaveEntry}
        anchorDate={anchorDate}
      />
    </div>
  );
};

export default Spiral;
