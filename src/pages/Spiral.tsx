import React, { useMemo, useState } from "react";
import { SpiralVisualization } from "@/components/spiral";
import EntryPopup from "@/components/journal/EntryPopup";
import EntryLog from "@/components/journal/EntryLog";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { RegionTooltip } from "@/components/spiral/RegionTooltip";
import { useSpiralEntries } from "@/hooks/useSpiralEntries";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

  const [showTodayLog, setShowTodayLog] = useState(false);

  const todayEntries = useMemo(() => {
    const now = new Date();
    return entries.filter((e) => isSameDay(new Date(e.anchorDate), now));
  }, [entries]);

  const handleTodayClick = () => {
    if (todayEntries.length === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      handleTildePlaced(today);
    } else {
      setShowTodayLog(true);
    }
  };

  return (
    <div className="w-full h-screen">
      <SpiralVisualization
        entries={entries}
        config={config}
        onTildePlaced={handleTildePlaced}
        onHover={handleHover}
        onTodayClick={handleTodayClick}
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

      <EntryLog
        entries={todayEntries}
        open={showTodayLog}
        onOpenChange={setShowTodayLog}
        onDeleteEntry={handleDeleteEntry}
        onDeleteMultiple={handleDeleteMultiple}
        title="Today"
        emptyAction={{
          label: "Journal today",
          onClick: () => {
            setShowTodayLog(false);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            handleTildePlaced(today);
          },
        }}
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
