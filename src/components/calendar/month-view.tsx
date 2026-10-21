"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { EventBlock } from "@/components/calendar/event-block";
import { Button } from "@/components/ui/button";
import { messages, t } from "@/i18n";
import { resolveEventColor } from "@/lib/calendar/colors";
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

  // State for the tapped date on mobile
  const [mobileSelectedDate, setMobileSelectedDate] = useState<string>(dateKey);

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

  // Events of the date selected on mobile
  const mobileSelectedEvents = useMemo(() => {
    return eventsOnDay(events, mobileSelectedDate).sort(
      (a, b) => Number(b.event.allDay) - Number(a.event.allDay) || a.startMinutes - b.startMinutes,
    );
  }, [events, mobileSelectedDate]);

  const mobileSelectedMood = moodMap.get(mobileSelectedDate);

  return (
    <div className="space-y-4">
      {/* 7-Column Month Grid */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        {/* Weekday Labels Header */}
        <div className="grid grid-cols-7 border-b border-border/80 bg-muted/30">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-2 sm:py-2.5 sm:text-xs"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {dayKeys.map((key) => {
            const inMonth = key.startsWith(month);
            const isToday = key === todayKey;
            const isMobileSelected = key === mobileSelectedDate;
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
                onClick={() => {
                  setMobileSelectedDate(key);
                  // On desktop, clicking creates at dateKey; on mobile it selects to view agenda below
                  if (typeof window !== "undefined" && window.innerWidth >= 640) {
                    onCreateAt(key);
                  }
                }}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    setMobileSelectedDate(key);
                    onCreateAt(key);
                  }
                }}
                className={cn(
                  "group min-h-[3.8rem] cursor-pointer border-b border-r border-border/70 p-1 transition-all duration-150 last:border-r-0 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-[7.8rem] sm:p-1.5",
                  !inMonth && "bg-muted/15",
                  isToday && "bg-primary/[0.03] ring-1 ring-inset ring-primary/20",
                  isMobileSelected && "bg-primary/5 sm:bg-transparent",
                )}
              >
                <div className="mb-1 flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium transition-colors sm:size-6",
                        !inMonth && "text-muted-foreground/50",
                        inMonth && "text-foreground",
                        isToday && "bg-primary font-semibold text-primary-foreground shadow-xs",
                        isMobileSelected && !isToday && "border border-primary text-primary font-semibold sm:border-transparent",
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

                {/* Mobile: Colored dots instead of squished text */}
                <div className="flex flex-wrap items-center justify-center gap-1 sm:hidden">
                  {dayEvents.slice(0, 4).map((dayEvent) => {
                    const color = resolveEventColor(dayEvent.event.color);
                    return (
                      <span
                        key={dayEvent.event.id}
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                  {dayEvents.length > 4 && (
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      +{dayEvents.length - 4}
                    </span>
                  )}
                </div>

                {/* Desktop: Full event blocks */}
                <div className="hidden space-y-1 sm:block">
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

      {/* ================= MOBILE DAY AGENDA (Hiển thị chi tiết ngày được chạm trên iPhone) ================= */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs sm:hidden">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-sm font-semibold capitalize text-foreground">
              {formatDateKey(mobileSelectedDate, "EEEE, dd/MM")}
            </h3>
            {mobileSelectedMood && (
              <span className="text-sm leading-none" title="Tâm trạng">
                {mobileSelectedMood}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 rounded-xl px-2.5 text-xs active:scale-95"
            onClick={() => onCreateAt(mobileSelectedDate)}
          >
            <Plus className="size-3" />
            <span>Thêm</span>
          </Button>
        </div>

        {mobileSelectedEvents.length === 0 ? (
          <p className="rounded-2xl bg-muted/40 py-4 text-center text-xs text-muted-foreground">
            Chưa có sự kiện nào cho ngày này. Chạm &quot;+ Thêm&quot; để tạo.
          </p>
        ) : (
          <div className="space-y-1.5">
            {mobileSelectedEvents.map((dayEvent) => (
              <EventBlock
                key={dayEvent.event.id}
                event={dayEvent.event}
                onSelect={onSelectEvent}
                showTime
                className="py-2 text-xs"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
