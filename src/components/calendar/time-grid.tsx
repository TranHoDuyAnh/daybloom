"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { EventBlock } from "@/components/calendar/event-block";
import { Button } from "@/components/ui/button";
import { messages, t } from "@/i18n";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { eventsOnDay, layoutTimedEvents, splitByAllDay } from "@/lib/calendar/layout";
import { formatDateKey, toDateKey, zonedParts } from "@/lib/date";
import { MOOD_OPTIONS } from "@/lib/journal/template";
import { cn } from "cn";

const HOUR_HEIGHT = 60;
const HOURS = Array.from({ length: 24 }, (_, index) => index);

export function TimeGrid({
  dayKeys,
  events,
  journalEntries = [],
  onSelectEvent,
  onCreateAt,
  className,
}: {
  dayKeys: string[];
  events: CalendarEventDTO[];
  journalEntries?: { entryDate: string; mood: string | null }[];
  onSelectEvent: (event: CalendarEventDTO) => void;
  onCreateAt: (dateKey: string, startMinutes?: number, allDay?: boolean) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);
  const todayKey = toDateKey(new Date());

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

  useEffect(() => {
    const update = () => {
      const { hours, minutes } = zonedParts(new Date());
      setNowMinutes(hours * 60 + minutes);
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7.5 * HOUR_HEIGHT;
  }, []);

  const nowTop = nowMinutes !== null ? (nowMinutes / 60) * HOUR_HEIGHT : null;
  const nowTimeString = nowMinutes !== null
    ? `${String(Math.floor(nowMinutes / 60)).padStart(2, "0")}:${String(nowMinutes % 60).padStart(2, "0")}`
    : null;

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs", className)}>
      <div className="overflow-x-auto">
        <div className={cn("flex flex-col", dayKeys.length > 1 ? "min-w-[620px] sm:min-w-full" : "w-full")}>
          {/* Day Columns Header */}
          <div className="flex border-b border-border/80 bg-muted/30">
            <div className="w-16 shrink-0 border-r border-border/60" />
            <div
              className="grid flex-1"
              style={{ gridTemplateColumns: `repeat(${dayKeys.length}, minmax(0, 1fr))` }}
            >
              {dayKeys.map((key) => {
                const isToday = key === todayKey;
                const emoji = moodMap.get(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onCreateAt(key, undefined, true)}
                    className="group flex flex-col items-center gap-0.5 border-r border-border/60 px-2 py-2.5 transition-colors last:border-r-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    title={messages.calendar.createAllDay}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {formatDateKey(key, "EEE")}
                      </span>
                      {emoji && (
                        <span className="text-xs leading-none" title="Tâm trạng">
                          {emoji}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                        isToday
                          ? "bg-primary font-bold text-primary-foreground shadow-xs"
                          : "text-foreground group-hover:bg-muted",
                      )}
                    >
                      {formatDateKey(key, "d")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Day Events Row */}
          <div className="flex border-b border-border/80 bg-muted/15">
            <div className="w-16 shrink-0 border-r border-border/60 py-2 pr-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {messages.calendar.allDayShort}
            </div>
            <div
              className="grid flex-1 gap-1 py-1.5"
              style={{ gridTemplateColumns: `repeat(${dayKeys.length}, minmax(0, 1fr))` }}
            >
              {dayKeys.map((key) => {
                const { allDay } = splitByAllDay(eventsOnDay(events, key));
                return (
                  <div key={key} className="min-h-6 space-y-1 border-r border-border/40 px-1.5 last:border-r-0">
                    {allDay.map((dayEvent) => (
                      <EventBlock
                        key={dayEvent.event.id}
                        event={dayEvent.event}
                        onSelect={onSelectEvent}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timed Grid Scroll Container */}
          <div ref={scrollRef} className="max-h-[64dvh] overflow-y-auto">
        <div className="flex">
          {/* Hour Labels Column */}
          <div className="relative w-16 shrink-0 border-r border-border/60 select-none">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative text-right text-[11px] text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-2.5 font-mono text-[10px] text-muted-foreground/80">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}

            {/* Time label badge on current time */}
            {nowTop !== null && dayKeys.includes(todayKey) && (
              <div
                className="pointer-events-none absolute right-1 z-30 -translate-y-1/2 rounded-md bg-rose-500 px-1 py-0.5 text-[10px] font-bold text-white shadow-xs"
                style={{ top: nowTop }}
              >
                {nowTimeString}
              </div>
            )}
          </div>

          {/* Day Columns */}
          <div
            className="grid flex-1"
            style={{ gridTemplateColumns: `repeat(${dayKeys.length}, minmax(0, 1fr))` }}
          >
            {dayKeys.map((key) => {
              const { timed } = splitByAllDay(eventsOnDay(events, key));
              const laidOut = layoutTimedEvents(timed);
              const isToday = key === todayKey;

              return (
                <div
                  key={key}
                  className={cn(
                    "relative border-r border-border/60 last:border-r-0",
                    isToday && "bg-primary/[0.015]",
                  )}
                  style={{ height: HOUR_HEIGHT * 24 }}
                  onClick={(clickEvent) => {
                    const rect = clickEvent.currentTarget.getBoundingClientRect();
                    const offset = clickEvent.clientY - rect.top;
                    const rawMinutes = (offset / HOUR_HEIGHT) * 60;
                    const snapped = Math.max(0, Math.min(23 * 60 + 30, Math.floor(rawMinutes / 30) * 30));
                    onCreateAt(key, snapped);
                  }}
                  role="button"
                  tabIndex={-1}
                  aria-label={t(messages.calendar.createOnDay, {
                    date: formatDateKey(key, "dd/MM/yyyy"),
                  })}
                >
                  {/* Hour horizontal grid lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-border/50"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* CURRENT TIME INDICATOR (Vạch đỏ thời gian thực) */}
                  {isToday && nowTop !== null && (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                      style={{ top: nowTop }}
                    >
                      <div className="absolute -left-1.5 size-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shadow-xs animate-pulse" />
                      <div className="h-0.5 w-full bg-rose-500 shadow-xs" />
                    </div>
                  )}

                  {/* Timed Event Blocks */}
                  {laidOut.map((dayEvent) => (
                    <div
                      key={dayEvent.event.id}
                      className="absolute z-10 px-1"
                      style={{
                        top: (dayEvent.startMinutes / 60) * HOUR_HEIGHT,
                        height: Math.max(
                          ((dayEvent.endMinutes - dayEvent.startMinutes) / 60) * HOUR_HEIGHT - 3,
                          24,
                        ),
                        left: `${(dayEvent.column / dayEvent.columnCount) * 100}%`,
                        width: `${100 / dayEvent.columnCount}%`,
                      }}
                    >
                      <EventBlock
                        event={dayEvent.event}
                        onSelect={onSelectEvent}
                        className={cn(
                          "h-full overflow-hidden whitespace-normal",
                          dayEvent.continuesBefore && "rounded-t-none border-t border-dashed",
                          dayEvent.continuesAfter && "rounded-b-none border-b border-dashed",
                        )}
                        showTime
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}

export function DayAgenda({
  dayKeys,
  events,
  journalEntries = [],
  onSelectEvent,
  onCreateAt,
  className,
}: {
  dayKeys: string[];
  events: CalendarEventDTO[];
  journalEntries?: { entryDate: string; mood: string | null }[];
  onSelectEvent: (event: CalendarEventDTO) => void;
  onCreateAt: (dateKey: string, startMinutes?: number, allDay?: boolean) => void;
  className?: string;
}) {
  const todayKey = toDateKey(new Date());

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
    <div className={cn("space-y-3", className)}>
      {dayKeys.map((key) => {
        const isToday = key === todayKey;
        const emoji = moodMap.get(key);
        const dayEvents = eventsOnDay(events, key).sort(
          (a, b) => Number(b.event.allDay) - Number(a.event.allDay) || a.startMinutes - b.startMinutes,
        );

        return (
          <section
            key={key}
            className={cn(
              "overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-xs transition-all",
              isToday && "border-primary/40 ring-1 ring-primary/20",
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                    isToday ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-foreground",
                  )}
                >
                  {formatDateKey(key, "d")}
                </span>
                <h3 className="font-heading text-sm font-semibold capitalize text-foreground">
                  {formatDateKey(key, "EEEE, dd/MM")}
                </h3>
                {emoji && (
                  <span className="text-sm leading-none" title="Tâm trạng">
                    {emoji}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCreateAt(key, 9 * 60)}
                className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10"
              >
                {messages.calendar.add}
              </Button>
            </div>

            {dayEvents.length === 0 ? (
              <p className="rounded-2xl bg-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">
                {messages.calendar.noEventsForDay}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {dayEvents.map((dayEvent) => (
                  <li key={`${dayEvent.event.id}-${key}`}>
                    <EventBlock
                      event={dayEvent.event}
                      onSelect={onSelectEvent}
                      showTime
                      className="py-2"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
