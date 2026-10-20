"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  PenSquare,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { messages } from "@/i18n";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_IDS,
  type EventCategoryId,
} from "@/lib/calendar/categories";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { viewRange } from "@/lib/calendar/view";
import {
  formatDateKey,
  startOfMonthKey,
  endOfMonthKey,
  toDateKey,
  addDateKeyDays,
} from "@/lib/date";
import { MOOD_OPTIONS } from "@/lib/journal/template";
import { cn } from "cn";

export type JournalDayEntry = {
  entryDate: string;
  mood: string | null;
  title: string | null;
  preview?: string;
};

const CATEGORY_COLORS: Record<EventCategoryId, { hex: string; bg: string }> = {
  work: { hex: "#6258E8", bg: "bg-indigo-500" },
  learning: { hex: "#91C9F7", bg: "bg-sky-500" },
  personal: { hex: "#FF8274", bg: "bg-rose-500" },
  health: { hex: "#9BD9B5", bg: "bg-emerald-500" },
  exercise: { hex: "#F5D76E", bg: "bg-amber-500" },
  relax: { hex: "#C6B4F5", bg: "bg-purple-500" },
  other: { hex: "#9CA0AE", bg: "bg-slate-500" },
};

export function CalendarSidebar({
  selectedDate,
  events,
  journalEntries = [],
  selectedCategories,
  onToggleCategory,
  onToggleAllCategories,
  onSelectDate,
  className,
}: {
  selectedDate: string;
  events: CalendarEventDTO[];
  journalEntries?: JournalDayEntry[];
  selectedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  onToggleAllCategories: (selectAll: boolean) => void;
  onSelectDate: (dateKey: string) => void;
  className?: string;
}) {
  // Current month displayed in the mini-calendar
  const [miniMonthKey, setMiniMonthKey] = useState<string>(() => selectedDate.slice(0, 7));
  const todayKey = toDateKey(new Date());

  // Generate days for the mini calendar
  const miniCalendarDays = useMemo(() => {
    const startMonth = startOfMonthKey(`${miniMonthKey}-01`);
    const endMonth = endOfMonthKey(`${miniMonthKey}-01`);
    const { from, to } = viewRange("month", startMonth);

    const days: string[] = [];
    let cursor = from;
    while (cursor <= to) {
      days.push(cursor);
      cursor = addDateKeyDays(cursor, 1);
    }
    return { days, startMonth, endMonth };
  }, [miniMonthKey]);

  // Map of days with events and journal moods
  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    for (const event of events) {
      set.add(toDateKey(event.startAt));
    }
    return set;
  }, [events]);

  const journalByDate = useMemo(() => {
    const map = new Map<string, JournalDayEntry>();
    for (const entry of journalEntries) {
      map.set(entry.entryDate, entry);
    }
    return map;
  }, [journalEntries]);

  // Event counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const id of EVENT_CATEGORY_IDS) counts[id] = 0;
    for (const event of events) {
      const cat = (event.category as EventCategoryId) || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [events]);

  const selectedJournal = journalByDate.get(selectedDate);
  const selectedJournalMood = selectedJournal?.mood
    ? MOOD_OPTIONS.find((m) => m.id === selectedJournal.mood)
    : null;

  const allSelected = selectedCategories.size === EVENT_CATEGORY_IDS.length;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 1. MINI CALENDAR */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
        {/* Month Selector */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="size-3.5" />
            </span>
            <span className="font-heading text-xs font-semibold capitalize text-foreground">
              {formatDateKey(`${miniMonthKey}-01`, "MMMM yyyy")}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const prev = addDateKeyDays(`${miniMonthKey}-01`, -15).slice(0, 7);
                setMiniMonthKey(prev);
              }}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const next = addDateKeyDays(endOfMonthKey(`${miniMonthKey}-01`), 15).slice(0, 7);
                setMiniMonthKey(next);
              }}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-1">
          {miniCalendarDays.days.map((key) => {
            const inMonth = key.startsWith(miniMonthKey);
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const hasEvents = daysWithEvents.has(key);
            const journal = journalByDate.get(key);
            const mood = journal?.mood ? MOOD_OPTIONS.find((m) => m.id === journal.mood) : null;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDate(key)}
                className={cn(
                  "group relative flex h-7 flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  !inMonth && "text-muted-foreground/40",
                  inMonth && !isSelected && "text-foreground hover:bg-muted/60",
                  isSelected && "bg-primary font-semibold text-primary-foreground shadow-xs",
                  isToday && !isSelected && "border border-primary/40 text-primary font-semibold",
                )}
              >
                <span>{formatDateKey(key, "d")}</span>

                {/* Event or Journal indicator dot */}
                <div className="flex items-center gap-0.5">
                  {mood && !isSelected && (
                    <span className="text-[9px] leading-none">{mood.emoji}</span>
                  )}
                  {hasEvents && !mood && !isSelected && (
                    <span className="size-1 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CATEGORY FILTER */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Filter className="size-3.5" />
            </span>
            <span className="font-heading text-xs font-semibold text-foreground">
              {messages.calendar.dialog.category}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleAllCategories(!allSelected)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            {allSelected ? "Bỏ chọn" : "Chọn tất cả"}
          </button>
        </div>

        <div className="space-y-1">
          {EVENT_CATEGORIES.map((cat) => {
            const id = cat.id as EventCategoryId;
            const active = selectedCategories.has(id);
            const color = CATEGORY_COLORS[id] ?? { hex: "#6258E8", bg: "bg-primary" };
            const count = categoryCounts[id] || 0;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggleCategory(id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors",
                  active
                    ? "bg-muted/40 font-medium text-foreground"
                    : "text-muted-foreground/60 hover:bg-muted/20 hover:text-muted-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-md text-[10px] text-white transition-opacity",
                      color.bg,
                      !active && "opacity-40",
                    )}
                  >
                    {active && <Check className="size-3 stroke-[3]" />}
                  </span>
                  <span>{cat.name}</span>
                </div>

                {count > 0 && (
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. JOURNAL SPOTLIGHT (CẦU NỐI LỊCH & NHẬT KÝ) */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.04] p-4 shadow-xs">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3.5" />
            </span>
            <span className="font-heading text-xs font-semibold text-foreground">
              Nhật ký ngày {formatDateKey(selectedDate, "dd/MM")}
            </span>
          </div>

          {selectedJournalMood && (
            <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 text-[11px] font-normal">
              <span>{selectedJournalMood.emoji}</span>
              <span>{selectedJournalMood.label}</span>
            </Badge>
          )}
        </div>

        {selectedJournal ? (
          <div className="space-y-2.5">
            <p className="line-clamp-2 text-xs text-foreground/80">
              {selectedJournal.title || selectedJournal.preview || "Đã ghi nhận cảm xúc cho ngày này."}
            </p>
            <Link
              href={`/journal?date=${selectedDate}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <BookOpen className="size-3.5" />
              Mở nhật ký ngày này →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Chưa có nhật ký cho ngày này. Hãy ghi lại cảm xúc của bạn.
            </p>
            <Link
              href={`/journal?date=${selectedDate}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <PenSquare className="size-3.5" />
              + Viết nhật ký ngày {formatDateKey(selectedDate, "dd/MM")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
