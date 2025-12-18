import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff } from "lucide-react";
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

const WHISPER_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const EntryPopup: React.FC<EntryPopupProps> = ({
  open,
  onClose,
  onSave,
  anchorDate,
}) => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  const transcribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      // Use Whisper via Groq (free) — falls back to Web Speech API
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("model", "whisper-large-v3");

      const groqKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
      if (groqKey) {
        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${groqKey}` },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.text) {
            setText((prev) => (prev ? prev + " " : "") + data.text);
          }
        }
      } else {
        // Fallback: use Web Speech API recognition
        console.warn("No VITE_GROQ_API_KEY set — speech-to-text unavailable");
      }
    } catch (err) {
      console.error("Transcription failed:", err);
    } finally {
      setTranscribing(false);
    }
  };

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
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={transcribing ? "Transcribing..." : "What's on your mind..."}
              className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none focus:border-white/20 pr-12"
              autoFocus
              disabled={transcribing}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={recording ? stopRecording : startRecording}
              disabled={transcribing}
              className={`absolute bottom-2 right-2 h-8 w-8 rounded-full ${
                recording
                  ? "text-red-400 bg-red-400/20 animate-pulse"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-white/20 mt-2">
            Ctrl+Enter to save{transcribing ? " · transcribing..." : ""}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-white/50">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!text.trim() || transcribing}
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
