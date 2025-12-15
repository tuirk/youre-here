import React from "react";
import { SpiralVisualization } from "@/components/spiral";
import EntryPopup from "@/components/journal/EntryPopup";
import EntryLog from "@/components/journal/EntryLog";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
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

      <EntryLog
        entries={entries}
        open={showEntryLog}
        onOpenChange={setShowEntryLog}
        onDeleteEntry={handleDeleteEntry}
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
