import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JournalEntry } from "@/types/event";
import { v4 as uuidv4 } from "uuid";

interface EntryPopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  anchorDate: Date | null;
}

const formatDateLabel = (d: Date) => {
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const EntryPopup: React.FC<EntryPopupProps> = ({
  open,
  onClose,
  onSave,
  anchorDate,
}) => {
  const [text, setText] = useState("");

  const handleSave = () => {
    if (!text.trim() || !anchorDate) return;

    const entry: JournalEntry = {
      id: uuidv4(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      anchorDate: anchorDate.toISOString(),
      temporalScope: "point",
    };

    onSave(entry);
    setText("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-md border-white/10 max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-light tracking-wider text-white/80">
            {anchorDate ? formatDateLabel(anchorDate) : "New Entry"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind..."
            className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none focus:border-white/20"
            autoFocus
          />
          <p className="text-xs text-white/20 mt-2">
            Ctrl+Enter to save
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-white/50">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!text.trim()}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntryPopup;
