import React from "react";
import { SpiralVisualization } from "@/components/spiral";
import EntryPopup from "@/components/journal/EntryPopup";
import EntryLog from "@/components/journal/EntryLog";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { RegionTooltip } from "@/components/spiral/RegionTooltip";
import { useSpiralEntries } from "@/hooks/useSpiralEntries";

const Spiral: React.FC = () => {
  const {
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
  } = useSpiralEntries();

  return (
    <div className="w-full h-screen">
      <SpiralVisualization
        entries={entries}
        config={config}
        onTildePlaced={handleTildePlaced}
        onHover={handleHover}
      />

      <SpiralControls
        onViewEntriesClick={() => setShowEntryLog(true)}
        onLoadSeedClick={loadSeedData}
        hasEntries={entries.length > 0}
      />

      <SpiralHelp viewType="annual" currentYear={currentYear} />

      {hoverInfo && (
        <RegionTooltip
          visible={true}
          x={hoverInfo.x}
          y={hoverInfo.y}
          dateLabel={hoverInfo.dateLabel}
          summary={hoverInfo.summary}
          loading={hoverInfo.loading}
          entryCount={hoverInfo.entryCount}
        />
      )}

      <EntryLog
        entries={entries}
        open={showEntryLog}
        onOpenChange={setShowEntryLog}
        onDeleteEntry={handleDeleteEntry}
        onDeleteMultiple={handleDeleteMultiple}
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
