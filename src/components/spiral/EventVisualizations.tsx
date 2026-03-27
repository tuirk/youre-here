import React from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";

interface EventVisualizationsProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

const isOneTimeEvent = (event: TimeEvent): boolean => {
  if (event.eventType === "one-time" || event.eventType === "journal") return true;
  if (event.endDate) return false;
  if (event.isRoughDate) return false;
  const startDate = event.startDate;
  const hasSpecificDay = startDate && startDate.getDate() > 0;
  return hasSpecificDay;
}

const getClippedEvent = (event: TimeEvent, firstUseDate: Date): TimeEvent => {
  if (event.startDate.getTime() < firstUseDate.getTime()) {
    return {
      ...event,
      startDate: new Date(firstUseDate),
    };
  }
  return event;
}

export const EventVisualizations: React.FC<EventVisualizationsProps> = ({
  events,
  config,
  onEventClick
}) => {
  const firstUseDate = new Date(config.firstUseDate);

  return (
    <>
      {events.map((event) => {
        // Skip events before firstUseDate entirely (or clip them)
        const needsClipping = event.startDate.getTime() < firstUseDate.getTime();
        const visibleEvent = needsClipping ? getClippedEvent(event, firstUseDate) : event;

        const actuallyOneTimeEvent = isOneTimeEvent(visibleEvent);

        return (
          <React.Fragment key={event.id}>
            {actuallyOneTimeEvent && (
              <CosmicEventEffect
                event={visibleEvent}
                firstUseDate={firstUseDate}
                zoom={config.zoom}
                isProcessEvent={false}
              />
            )}

            {actuallyOneTimeEvent && (
              <EventPoint
                event={visibleEvent}
                firstUseDate={firstUseDate}
                zoom={config.zoom}
                onClick={() => {
                  const year = visibleEvent.startDate.getFullYear();
                  const month = visibleEvent.startDate.getMonth();
                  onEventClick(year, month, 0, 0);
                }}
              />
            )}

            {!actuallyOneTimeEvent && visibleEvent.endDate && (
              <EventDuration
                startEvent={visibleEvent}
                endEvent={{...visibleEvent, startDate: visibleEvent.endDate}}
                firstUseDate={firstUseDate}
                zoom={config.zoom}
              />
            )}

            {!actuallyOneTimeEvent && !visibleEvent.endDate && (
              <EventDuration
                startEvent={visibleEvent}
                endEvent={visibleEvent}
                firstUseDate={firstUseDate}
                zoom={config.zoom}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
