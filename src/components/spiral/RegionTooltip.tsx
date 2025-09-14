import React from "react";

interface RegionTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  dateLabel: string;
  summary: string | null;
  loading: boolean;
  entryCount: number;
}

export const RegionTooltip: React.FC<RegionTooltipProps> = ({
  visible,
  x,
  y,
  dateLabel,
  summary,
  loading,
  entryCount,
}) => {
  if (!visible || entryCount === 0) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none transition-opacity duration-200"
      style={{
        left: x + 16,
        top: y - 8,
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="bg-black/60 backdrop-blur-xl border border-white/[0.06] rounded-xl px-4 py-3 max-w-[280px] shadow-2xl shadow-black/50">
        <p className="text-[10px] text-white/25 tracking-[0.1em] uppercase mb-1.5">
          {dateLabel}
        </p>
        {loading ? (
          <p className="text-xs text-white/30 italic">reflecting...</p>
        ) : summary ? (
          <p className="text-[13px] text-white/55 leading-relaxed font-light">
            {summary}
          </p>
        ) : (
          <p className="text-xs text-white/25">
            {entryCount} {entryCount === 1 ? "entry" : "entries"} here
          </p>
        )}
      </div>
    </div>
  );
};
