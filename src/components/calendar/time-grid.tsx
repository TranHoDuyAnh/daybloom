"use client";

import { useEffect, useRef, useState } from "react";

import { EventBlock } from "@/components/calendar/event-block";
import { Button } from "@/components/ui/button";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { eventsOnDay, layoutTimedEvents, splitByAllDay } from "@/lib/calendar/layout";
import { formatDateKey, toDateKey, zonedParts } from "@/lib/date";
import { cn } from "cn";

const HOUR_HEIGHT = 56;
const HOURS = Array.from({ length: 24 }, (_, index) => index);

export function TimeGrid({
  dayKeys,
  events,
  onSelectEvent,
  onCreateAt,
  className,
}: {
  dayKeys: string[];
  events: CalendarEventDTO[];
  onSelectEvent: (event: CalendarEventDTO) => void;
  onCreateAt: (dateKey: string, startMinutes?: number, allDay?: boolean) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);
  const todayKey = toDateKey(new Date());

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
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
  }, []);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)}>
      <div className="flex border-b border-border bg-muted/40">
        <div className="w-14 shrink-0" />
        <div
          className="grid flex-1"
          style={{ gridTemplateColumns: `repeat(${dayKeys.length}, minmax(0, 1fr))` }}
        >
          {dayKeys.map((key) => {
            const isToday = key === todayKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onCreateAt(key, undefined, true)}
                className="flex flex-col items-center gap-0.5 px-2 py-2 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                title="Tạo sự kiện cả ngày"
              >
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {formatDateKey(key, "EEE")}
                </span>
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {formatDateKey(key, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex border-b border-border bg-muted/20">
        <div className="w-14 shrink-0 py-1 pr-2 text-right text-[10px] uppercase text-muted-foreground">
          All day
        </div>
        <div
          className="grid flex-1 gap-1 py-1"
          style={{ gridTemplateColumns: `repeat(${dayKeys.length}, minmax(0, 1fr))` }}
        >
          {dayKeys.map((key) => {
            const { allDay } = splitByAllDay(eventsOnDay(events, key));
            return (
              <div key={key} className="min-h-6 space-y-1 pr-1">
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

      <div ref={scrollRef} className="max-h-[64dvh] overflow-y-auto">
        <div className="flex">
          <div className="w-14 shrink-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative text-right text-[11px] text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-1.5 right-2 font-mono">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

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
                  className="relative border-l border-border"
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
                  aria-label={`Tạo sự kiện ngày ${formatDateKey(key, "dd/MM/yyyy")}`}
                >
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-border/60"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {isToday && nowMinutes !== null && (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-20 border-t border-destructive"
                      style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }}
                    >
                      <span className="absolute -left-0.5 -top-1 size-2 rounded-full bg-destructive" />
                    </div>
                  )}

                  {laidOut.map((dayEvent) => (
                    <div
                      key={dayEvent.event.id}
                      className="absolute z-10 px-0.5"
                      style={{
                        top: (dayEvent.startMinutes / 60) * HOUR_HEIGHT,
                        height: Math.max(
                          ((dayEvent.endMinutes - dayEvent.startMinutes) / 60) * HOUR_HEIGHT - 2,
                          22,
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
  );
}

export function DayAgenda({
  dayKeys,
  events,
  onSelectEvent,
  onCreateAt,
  className,
}: {
  dayKeys: string[];
  events: CalendarEventDTO[];
  onSelectEvent: (event: CalendarEventDTO) => void;
  onCreateAt: (dateKey: string, startMinutes?: number, allDay?: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {dayKeys.map((key) => {
        const dayEvents = eventsOnDay(events, key).sort(
          (a, b) => Number(b.event.allDay) - Number(a.event.allDay) || a.startMinutes - b.startMinutes,
        );

        return (
          <section key={key} className="rounded-2xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold">
                {formatDateKey(key, "EEEE, dd/MM")}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCreateAt(key, 9 * 60)}
                className="text-xs text-muted-foreground"
              >
                + Thêm
              </Button>
            </div>

            {dayEvents.length === 0 ? (
              <p className="rounded-xl bg-muted/50 px-3 py-4 text-center text-xs text-muted-foreground">
                Chưa có sự kiện nào cho ngày này.
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
