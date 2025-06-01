
import React from "react";
import { TimeEvent } from "@/types/event";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MemoryListProps {
  events: TimeEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const MemoryList: React.FC<MemoryListProps> = ({
  events,
  open,
  onOpenChange,
  onDeleteEvent,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/90 backdrop-blur-md text-white border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Your Memories</DialogTitle>
          <DialogDescription className="text-gray-400">
            View, manage, and delete your timeline memories.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto p-1">
          {events.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No memories yet. Click anywhere on the spiral to add one.</p>
          ) : (
            <div className="space-y-4">
              {events
                .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
                .map(event => (
                  <div 
                    key={event.id} 
                    className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: event.color }}
                        />
                        <h3 className="font-medium">{event.title}</h3>
                      </div>
                      <div className="text-sm text-gray-400">
                        {event.isRoughDate 
                          ? `${event.roughDateSeason} ${event.roughDateYear}`
                          : event.startDate.toLocaleDateString() + (event.endDate ? ` - ${event.endDate.toLocaleDateString()}` : "")
                        }
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                          Intensity: {event.intensity}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteEvent(event.id)}
                        className="h-8 bg-red-900/50 hover:bg-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
