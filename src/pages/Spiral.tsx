import React from "react";
import { SpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { MemoryList } from "@/components/spiral/MemoryList";
import { useSpiralEvents } from "@/hooks/useSpiralEvents";

const Spiral: React.FC = () => {
  const {
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
    currentYear
  } = useSpiralEvents();

  const firstUseYear = new Date(config.firstUseDate).getFullYear();

  return (
    <div className="w-full h-screen">
      <SpiralVisualization
        events={events}
        config={config}
        onSpiralClick={handleSpiralClick}
      />

      <SpiralControls
        onJournalTodayClick={handleJournalToday}
        onAddMemoryClick={() => setShowEventForm(true)}
        onViewMemoriesClick={() => setShowMemoryList(true)}
      />

      <SpiralHelp viewType="annual" currentYear={currentYear} />

      <MemoryList
        events={events}
        open={showMemoryList}
        onOpenChange={setShowMemoryList}
        onDeleteEvent={handleDeleteEvent}
      />

      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={handleSaveEvent}
        preselectedYear={selectedYear}
        preselectedMonth={selectedMonth}
        startYear={firstUseYear}
        currentYear={currentYear}
      />
    </div>
  );
};

export default Spiral;
