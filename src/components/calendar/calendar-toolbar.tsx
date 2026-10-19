"use client";

import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CalendarView } from "@/lib/calendar/view";
import { periodLabel } from "@/lib/calendar/view";
import { cn } from "cn";

const VIEW_LABELS: Record<CalendarView, string> = {
  month: "Tháng",
  week: "Tuần",
  day: "Ngày",
};

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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Trước"
            onClick={() => onNavigate(-1)}
            className="rounded-r-none"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none border-x border-border px-3"
            onClick={() => onChangeView(view)}
          >
            Hôm nay
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sau"
            onClick={() => onNavigate(1)}
            className="rounded-l-none"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base font-semibold sm:text-lg">
            {periodLabel(view, dateKey)}
          </h2>
          {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center rounded-xl border border-border bg-card p-0.5"
          role="group"
          aria-label="Chế độ xem"
        >
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => onChangeView(item)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                view === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {VIEW_LABELS[item]}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={onCreate}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Sự kiện mới</span>
        </Button>
      </div>
    </div>
  );
}
