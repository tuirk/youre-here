import React from "react";
import { JournalEntry } from "@/types/event";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DetailPanelProps {
  entries: JournalEntry[];
  open: boolean;
  onClose: () => void;
  onDeleteEntry: (id: string) => void;
  regionSummary?: string | null;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const DetailPanel: React.FC<DetailPanelProps> = ({
  entries,
  open,
  onClose,
  onDeleteEntry,
  regionSummary,
}) => {
  if (!open) return null;

  return (
    <div className={`fixed right-0 top-0 h-full w-96 max-w-[85vw] bg-background/95 backdrop-blur-md border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-light text-white/80 tracking-wider">This period</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white/80">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {regionSummary && (
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm text-white/50 italic leading-relaxed">{regionSummary}</p>
        </div>
      )}

      <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-4">
        {entries.length === 0 ? (
          <p className="text-white/30 text-center py-8">No entries in this region.</p>
        ) : (
          entries
            .sort((a, b) => new Date(a.anchorDate).getTime() - new Date(b.anchorDate).getTime())
            .map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.sentiment?.color || "#aaaaaa" }}
                    />
                    <span className="text-xs text-white/30">{formatDate(entry.anchorDate)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-white/20 hover:text-red-400 h-6 px-2 text-xs"
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-sm text-white/70 mt-2 leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
