"use client";

import { EventBlock } from "@/components/calendar/event-block";
import { eventsOnDay, visibleDayKeys } from "@/lib/calendar/layout";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { viewRange } from "@/lib/calendar/view";
import { formatDateKey, toDateKey } from "@/lib/date";
import { cn } from "cn";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MAX_VISIBLE = 3;

export function MonthView({
  dateKey,
  events,
  onSelectEvent,
  onCreateAt,
}: {
  dateKey: string;
  events: CalendarEventDTO[];
  onSelectEvent: (event: CalendarEventDTO) => void;
  onCreateAt: (dateKey: string) => void;
}) {
  const { from, to } = viewRange("month", dateKey);
  const dayKeys = visibleDayKeys(from, to);
  const todayKey = toDateKey(new Date());
  const month = dateKey.slice(0, 7);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dayKeys.map((key) => {
          const inMonth = key.startsWith(month);
          const isToday = key === todayKey;
          const dayEvents = eventsOnDay(events, key).sort(
            (a, b) => Number(b.event.allDay) - Number(a.event.allDay) || a.startMinutes - b.startMinutes,
          );
          const visible = dayEvents.slice(0, MAX_VISIBLE);
          const hiddenCount = dayEvents.length - visible.length;

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => onCreateAt(key)}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                  keyboardEvent.preventDefault();
                  onCreateAt(key);
                }
              }}
              className={cn(
                "min-h-[7.5rem] cursor-pointer border-b border-r border-border p-1.5 transition-colors last:border-r-0 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                !inMonth && "bg-muted/20",
              )}
            >
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    !inMonth && "text-muted-foreground/60",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {formatDateKey(key, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {visible.map((dayEvent) => (
                  <EventBlock
                    key={`${dayEvent.event.id}-${key}`}
                    event={dayEvent.event}
                    onSelect={onSelectEvent}
                    muted={!inMonth}
                    showTime
                  />
                ))}
                {hiddenCount > 0 && (
                  <p className="px-2 text-[11px] text-muted-foreground">
                    +{hiddenCount} sự kiện khác
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
