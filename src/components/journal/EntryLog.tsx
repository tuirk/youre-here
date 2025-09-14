import React from "react";
import { JournalEntry } from "@/types/event";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EntryLogProps {
  entries: JournalEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteEntry: (id: string) => void;
  onEntryClick?: (entry: JournalEntry) => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const EntryLog: React.FC<EntryLogProps> = ({
  entries,
  open,
  onOpenChange,
  onDeleteEntry,
  onEntryClick,
}) => {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.anchorDate).getTime() - new Date(a.anchorDate).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-black/40 backdrop-blur-xl text-white border-white/10 max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extralight tracking-[0.15em] text-white/70">Your Entries</DialogTitle>
          <DialogDescription className="text-white/30">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} on your spiral
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 p-1">
          {sorted.length === 0 ? (
            <p className="text-center py-8 text-white/30">
              No entries yet. Tap the spiral to add one.
            </p>
          ) : (
            sorted.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/8 transition-colors cursor-pointer"
                onClick={() => onEntryClick?.(entry)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.sentiment?.color || "#aaaaaa" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/70 truncate">
                        {entry.text.slice(0, 80)}{entry.text.length > 80 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/30">
                          {formatDate(entry.anchorDate)}
                        </span>
                        {entry.sentiment?.categories && (
                          <span className="text-xs text-white/20">
                            {entry.sentiment.categories.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                    }}
                    className="text-white/20 hover:text-red-400 h-8 px-2"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntryLog;
