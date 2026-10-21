"use client";

import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { messages } from "@/i18n";
import type { CalendarView } from "@/lib/calendar/view";
import { periodLabel } from "@/lib/calendar/view";
import { cn } from "cn";

const VIEW_LABELS: Record<CalendarView, string> = messages.calendar.views;

export function CalendarToolbar({
  view,
  dateKey,
  isPending,
  onNavigate,
  onChangeView,
  onCreate,
}: {
  view: CalendarView;
  dateKey: string;
  isPending: boolean;
  onNavigate: (direction: -1 | 1) => void;
  onChangeView: (view: CalendarView) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Row 1: Navigation, Date Title, and Action button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Prev / Today / Next */}
          <div className="flex items-center rounded-xl border border-border/80 bg-card shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              aria-label={messages.calendar.previous}
              onClick={() => onNavigate(-1)}
              className="size-8 rounded-r-none text-muted-foreground hover:text-foreground active:scale-95"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-none border-x border-border/80 px-2.5 text-xs font-semibold"
              onClick={() => onChangeView(view)}
            >
              {messages.calendar.today}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={messages.calendar.next}
              onClick={() => onNavigate(1)}
              className="size-8 rounded-l-none text-muted-foreground hover:text-foreground active:scale-95"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Period Title */}
          <div className="flex items-center gap-1.5">
            <h2 className="font-heading text-sm font-semibold capitalize text-foreground sm:text-base">
              {periodLabel(view, dateKey)}
            </h2>
            {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          </div>
        </div>

        {/* Mobile New Event Button */}
        <div className="sm:hidden">
          <Button size="sm" onClick={onCreate} className="h-8 gap-1 rounded-xl px-2.5 text-xs active:scale-95">
            <Plus className="size-3.5" />
            <span>Thêm</span>
          </Button>
        </div>
      </div>

      {/* Row 2: View Switcher (Full-width segmented control on mobile, compact on desktop) */}
      <div className="flex items-center gap-2">
        <div
          className="flex w-full items-center rounded-xl border border-border/80 bg-muted/40 p-1 sm:w-auto"
          role="group"
          aria-label={messages.calendar.viewMode}
        >
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => onChangeView(item)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-medium transition-all sm:flex-initial sm:px-3 active:scale-98",
                view === item
                  ? "bg-card text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {VIEW_LABELS[item]}
            </button>
          ))}
        </div>

        {/* Desktop New Event Button */}
        <Button size="sm" onClick={onCreate} className="hidden h-9 gap-1.5 rounded-xl px-3 sm:flex">
          <Plus className="size-4" />
          <span>{messages.calendar.newEvent}</span>
        </Button>
      </div>
    </div>
  );
}
