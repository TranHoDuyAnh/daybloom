"use client";

import { useMemo } from "react";

import { EventBlock } from "@/components/calendar/event-block";
import { messages, t } from "@/i18n";
import { eventsOnDay, visibleDayKeys } from "@/lib/calendar/layout";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { viewRange } from "@/lib/calendar/view";
import { formatDateKey, toDateKey } from "@/lib/date";
import { MOOD_OPTIONS } from "@/lib/journal/template";
import { cn } from "cn";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MAX_VISIBLE = 3;

export function MonthView({
  dateKey,
  events,
  journalEntries = [],
  onSelectEvent,
  onCreateAt,
}: {
  dateKey: string;
  events: CalendarEventDTO[];
  journalEntries?: { entryDate: string; mood: string | null }[];
  onSelectEvent: (event: CalendarEventDTO) => void;
  onCreateAt: (dateKey: string) => void;
}) {
  const { from, to } = viewRange("month", dateKey);
  const dayKeys = visibleDayKeys(from, to);
  const todayKey = toDateKey(new Date());
  const month = dateKey.slice(0, 7);

  const moodMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const j of journalEntries) {
      if (j.mood) {
        const emoji = MOOD_OPTIONS.find((m) => m.id === j.mood)?.emoji;
        if (emoji) map.set(j.entryDate, emoji);
      }
    }
    return map;
  }, [journalEntries]);

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
      <div className="grid grid-cols-7 border-b border-border/80 bg-muted/30">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dayKeys.map((key) => {
          const inMonth = key.startsWith(month);
          const isToday = key === todayKey;
          const emoji = moodMap.get(key);
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
                "group min-h-[7.8rem] cursor-pointer border-b border-r border-border/70 p-1.5 transition-all duration-150 last:border-r-0 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                !inMonth && "bg-muted/15",
                isToday && "bg-primary/[0.03] ring-1 ring-inset ring-primary/20",
              )}
            >
              <div className="mb-1.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      !inMonth && "text-muted-foreground/50",
                      inMonth && "text-foreground",
                      isToday && "bg-primary font-semibold text-primary-foreground shadow-xs",
                    )}
                  >
                    {formatDateKey(key, "d")}
                  </span>
                  {emoji && (
                    <span
                      className="text-xs leading-none transition-transform group-hover:scale-110"
                      title="Có nhật ký"
                      aria-label="Tâm trạng"
                    >
                      {emoji}
                    </span>
                  )}
                </div>
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
                  <p className="px-1 text-[10px] font-medium text-muted-foreground">
                    {t(messages.calendar.hiddenEvents, { count: hiddenCount })}
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
