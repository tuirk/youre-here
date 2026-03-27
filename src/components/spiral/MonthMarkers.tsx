import React, { useMemo } from "react";
import { Text } from "@react-three/drei";
import { getDailySpiralCoords, DAYS_PER_REV } from "@/utils/daily/generateDailySpiralPoints";

interface MonthMarkersProps {
  firstUseDate: Date;
  today: Date;
  zoom: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Renders month labels at the start of each monthly revolution on the daily spiral.
 */
export const MonthMarkers: React.FC<MonthMarkersProps> = ({
  firstUseDate,
  today,
  zoom,
}) => {
  const markers = useMemo(() => {
    const result: { key: string; position: [number, number, number]; label: string }[] = [];

    const start = new Date(firstUseDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);

    // Find the first day of each month between firstUseDate and today
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    // If firstUseDate is not the 1st, the first label is the next month
    if (cursor.getTime() < start.getTime()) {
      cursor.setMonth(cursor.getMonth() + 1);
    }

    while (cursor.getTime() <= end.getTime()) {
      const dayIndex = Math.max(0, Math.floor((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const { x, y, z } = getDailySpiralCoords(
        dayIndex,
        2 * zoom,
        0.8 * zoom,
        1.2 * zoom
      );

      const monthName = MONTH_NAMES[cursor.getMonth()];
      const year = cursor.getFullYear();
      // Show year on Jan or on the very first label
      const showYear = cursor.getMonth() === 0 || result.length === 0;
      const label = showYear ? `${monthName} ${year}` : monthName;

      result.push({
        key: `${year}-${cursor.getMonth()}`,
        position: [x, y, z],
        label,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return result;
  }, [firstUseDate, today, zoom]);

  return (
    <>
      {markers.map((m) => (
        <Text
          key={m.key}
          position={m.position}
          color="#ffffff"
          fontSize={0.35}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {m.label}
        </Text>
      ))}
    </>
  );
};
