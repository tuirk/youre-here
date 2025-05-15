
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TimeEvent } from "@/types/event";
import { BaseEventForm } from "./event-form/BaseEventForm";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: TimeEvent) => void;
  preselectedYear?: number;
  preselectedMonth?: number;
  startYear: number;
  currentYear: number;
}

const EventForm: React.FC<EventFormProps> = ({
  open,
  onClose,
  onSave,
  preselectedYear,
  preselectedMonth,
  startYear,
  currentYear,
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-cosmic-nebula-purple/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-wider">New Memory</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Capture a moment in your spiral
          </DialogDescription>
        </DialogHeader>

        <BaseEventForm 
          onSave={onSave}
          onClose={onClose}
          preselectedYear={preselectedYear}
          preselectedMonth={preselectedMonth}
          startYear={startYear}
          currentYear={currentYear}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
