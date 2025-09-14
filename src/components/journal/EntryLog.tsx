import React, { useState } from "react";
import { JournalEntry } from "@/types/event";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EntryLogProps {
  entries: JournalEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteEntry: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
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
  onDeleteMultiple,
  onEntryClick,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = [...entries].sort(
    (a, b) => new Date(b.anchorDate).getTime() - new Date(a.anchorDate).getTime()
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === entries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(entries.map((e) => e.id)));
    }
  };

  const handleDelete = () => {
    onDeleteMultiple(Array.from(selected));
    setSelected(new Set());
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) setSelected(new Set());
    onOpenChange(o);
  };

  const allSelected = entries.length > 0 && selected.size === entries.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!bg-black/50 backdrop-blur-2xl text-white border-white/[0.06] max-w-2xl rounded-2xl shadow-2xl shadow-black/60">
        <DialogHeader>
          <DialogTitle className="text-xl font-extralight tracking-[0.15em] text-white/60">
            Entries
          </DialogTitle>
          <DialogDescription className="text-white/25 text-xs">
            {entries.length} on your spiral
          </DialogDescription>
        </DialogHeader>

        {/* Select all + delete bar */}
        {entries.length > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={toggleAll}
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                  allSelected
                    ? "border-white/40 bg-white/15"
                    : "border-white/15 hover:border-white/30"
                }`}
              >
                {allSelected && <div className="w-1.5 h-1.5 rounded-sm bg-white/60" />}
              </div>
              <span className="text-[11px] text-white/25 group-hover:text-white/40">
                {allSelected ? "Deselect all" : "Select all"}
              </span>
            </label>
            {selected.size > 0 && (
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="sm"
                className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10 text-xs h-7 px-3"
              >
                <Trash2 className="mr-1.5 h-3 w-3" />
                Delete {selected.size}
              </Button>
            )}
          </div>
        )}

        <div className="max-h-[55vh] overflow-y-auto space-y-1.5 py-1 -mx-1 px-1">
          {sorted.length === 0 ? (
            <p className="text-center py-12 text-white/20 text-sm">
              No entries yet. Click the spiral to add one.
            </p>
          ) : (
            sorted.map((entry) => {
              const isSelected = selected.has(entry.id);
              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-red-400/[0.06] border border-red-400/10"
                      : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
                  }`}
                  onClick={() => onEntryClick?.(entry)}
                >
                  {/* Checkbox */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(entry.id);
                    }}
                    className={`w-3.5 h-3.5 rounded border flex-shrink-0 mt-1 flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected
                        ? "border-red-400/50 bg-red-400/20"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-sm bg-red-400/80" />}
                  </div>

                  {/* Color dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ backgroundColor: entry.sentiment?.color || "#555" }}
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap break-words">
                      {entry.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-white/20">
                        {formatDate(entry.anchorDate)}
                      </span>
                      {entry.sentiment?.categories && (
                        <span className="text-[10px] text-white/15">
                          {entry.sentiment.categories.join(" · ")}
                        </span>
                      )}
                      {entry.temporalScope !== "point" && (
                        <span className="text-[10px] text-white/10 italic">
                          {entry.temporalScope}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntryLog;
