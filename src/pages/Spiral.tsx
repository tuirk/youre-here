
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
    handleSaveEvent,
    handleDeleteEvent,
    currentYear
  } = useSpiralEvents();
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <SpiralVisualization 
        events={events} 
        config={config} 
        onSpiralClick={handleSpiralClick} 
      />
      
      {/* Controls */}
      <SpiralControls 
        onAddMemoryClick={() => setShowEventForm(true)}
        onViewMemoriesClick={() => setShowMemoryList(true)}
        viewType="annual"
      />
      
      {/* Help button */}
      <SpiralHelp viewType="annual" currentYear={currentYear} />
      
      {/* Memory List Dialog */}
      <MemoryList 
        events={events}
        open={showMemoryList}
        onOpenChange={setShowMemoryList}
        onDeleteEvent={handleDeleteEvent}
      />
      
      {/* Add event form */}
      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={handleSaveEvent}
        preselectedYear={selectedYear}
        preselectedMonth={selectedMonth}
        startYear={currentYear - 5}
        currentYear={currentYear}
      />
    </div>
  );
};

export default Spiral;
