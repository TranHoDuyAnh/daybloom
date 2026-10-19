"use client";

import { resolveEventColor } from "@/lib/calendar/colors";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { formatDateTime } from "@/lib/date";
import { cn } from "cn";

export function EventBlock({
  event,
  onSelect,
  className,
  showTime = false,
  muted = false,
}: {
  event: CalendarEventDTO;
  onSelect: (event: CalendarEventDTO) => void;
  className?: string;
  showTime?: boolean;
  muted?: boolean;
}) {
  const color = resolveEventColor(event.color);

  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onSelect(event);
      }}
      className={cn(
        "w-full truncate rounded-md border-l-2 px-2 py-1 text-left text-xs font-medium transition-colors hover:brightness-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        muted && "opacity-80",
        className,
      )}
      style={{
        backgroundColor: color.soft,
        borderLeftColor: color.hex,
        color: color.ink,
      }}
      title={`${event.title}${event.location ? ` · ${event.location}` : ""}`}
    >
      {showTime && !event.allDay && (
        <span className="mr-1 font-mono text-[10px] opacity-80">
          {formatDateTime(event.startAt, "HH:mm")}
        </span>
      )}
      <span className="align-middle">{event.title}</span>
    </button>
  );
}
