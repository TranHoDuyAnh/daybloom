"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Filter, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { deleteEventAction } from "@/actions/calendar";
import { CalendarSidebar, type JournalDayEntry } from "@/components/calendar/calendar-sidebar";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { EventDetailDialog } from "@/components/calendar/event-detail-dialog";
import { EventDialog } from "@/components/calendar/event-dialog";
import { MonthView } from "@/components/calendar/month-view";
import { DayAgenda, TimeGrid } from "@/components/calendar/time-grid";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EVENT_CATEGORY_IDS } from "@/lib/calendar/categories";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import {
  defaultFormValues,
  eventToFormValues,
  type EventFormValues,
} from "@/lib/calendar/form";
import type { CalendarView } from "@/lib/calendar/view";
import { shiftDateKey, viewRange } from "@/lib/calendar/view";
import { toDateKey } from "@/lib/date";
import { cn } from "cn";
import { messages } from "@/i18n";

type EditorState =
  | { open: false }
  | { open: true; eventId: string | null; values: EventFormValues };

export function CalendarBoard({
  view,
  dateKey,
  events,
  journalEntries = [],
}: {
  view: CalendarView;
  dateKey: string;
  events: CalendarEventDTO[];
  journalEntries?: JournalDayEntry[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const [selected, setSelected] = useState<CalendarEventDTO | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Category filter state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(EVENT_CATEGORY_IDS),
  );

  const handleToggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleToggleAllCategories = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedCategories(new Set(EVENT_CATEGORY_IDS));
    } else {
      setSelectedCategories(new Set());
    }
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => !e.category || selectedCategories.has(e.category));
  }, [events, selectedCategories]);

  const goTo = useCallback(
    (nextView: CalendarView, nextDateKey: string) => {
      startTransition(() => {
        router.push(`/calendar?view=${nextView}&date=${nextDateKey}`);
      });
    },
    [router],
  );

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const handleNavigate = useCallback(
    (direction: -1 | 1) => {
      goTo(view, shiftDateKey(view, dateKey, direction));
    },
    [dateKey, goTo, view],
  );

  const handleToday = useCallback(() => {
    goTo(view, toDateKey(new Date()));
  }, [goTo, view]);

  const openCreate = useCallback(
    (key: string, startMinutes?: number, allDay?: boolean) => {
      setEditor({
        open: true,
        eventId: null,
        values: defaultFormValues({ dateKey: key, startMinutes, allDay }),
      });
    },
    [],
  );

  const handleSelectEvent = useCallback((event: CalendarEventDTO) => {
    setSelected(event);
    setDetailOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (event: CalendarEventDTO) => {
      setDetailOpen(false);
      const result = await deleteEventAction(event.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(messages.calendar.toastDeleted);
      refresh();
    },
    [refresh],
  );

  useEffect(() => {
    function onKeyDown(keyboardEvent: KeyboardEvent) {
      if (editor.open || detailOpen) return;
      const target = keyboardEvent.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if (keyboardEvent.key === "ArrowLeft") handleNavigate(-1);
      if (keyboardEvent.key === "ArrowRight") handleNavigate(1);
      if (keyboardEvent.key.toLowerCase() === "t") handleToday();
      if (keyboardEvent.key.toLowerCase() === "n") openCreate(dateKey);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dateKey, detailOpen, editor.open, handleNavigate, handleToday, openCreate]);

  const dayKeys = useMemo(() => {
    const { from, to } = viewRange(view, dateKey);
    const keys: string[] = [];
    let cursor = from;
    while (cursor <= to) {
      keys.push(cursor);
      cursor = shiftDateKey("day", cursor, 1);
    }
    return keys;
  }, [dateKey, view]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row" data-loading={isPending}>
      {/* 1. DESKTOP SIDEBAR: Mini Calendar, Categories Filter, Journal Spotlight */}
      <aside className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
        <CalendarSidebar
          selectedDate={dateKey}
          events={events}
          journalEntries={journalEntries}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onToggleAllCategories={handleToggleAllCategories}
          onSelectDate={(key) => goTo(view, key)}
        />
      </aside>

      {/* 2. MAIN CALENDAR BOARD */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <CalendarToolbar
            view={view}
            dateKey={dateKey}
            isPending={isPending}
            onNavigate={handleNavigate}
            onChangeView={(nextView) => goTo(nextView, dateKey)}
            onCreate={() => openCreate(dateKey)}
          />

          {/* Mobile Filter / Sidebar Trigger */}
          <div className="lg:hidden">
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-xs">
                  <Filter className="size-3.5" />
                  <span>Bộ lọc</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-4">
                <SheetHeader className="mb-3 text-left">
                  <SheetTitle className="flex items-center gap-2 font-heading text-base font-semibold">
                    <Sparkles className="size-4 text-primary" />
                    Lịch & Bộ lọc
                  </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto max-h-[calc(100dvh-5rem)]">
                  <CalendarSidebar
                    selectedDate={dateKey}
                    events={events}
                    journalEntries={journalEntries}
                    selectedCategories={selectedCategories}
                    onToggleCategory={handleToggleCategory}
                    onToggleAllCategories={handleToggleAllCategories}
                    onSelectDate={(key) => {
                      setMobileFilterOpen(false);
                      goTo(view, key);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Views Rendering with Filtered Events */}
        <div className={cn("relative transition-opacity", isPending && "opacity-60")}>
          {view === "month" && (
            <MonthView
              dateKey={dateKey}
              events={filteredEvents}
              journalEntries={journalEntries}
              onSelectEvent={handleSelectEvent}
              onCreateAt={(key) => openCreate(key)}
            />
          )}

          {view === "week" && (
            <>
              <TimeGrid
                dayKeys={dayKeys}
                events={filteredEvents}
                journalEntries={journalEntries}
                onSelectEvent={handleSelectEvent}
                onCreateAt={openCreate}
                className="hidden md:block"
              />
              <DayAgenda
                dayKeys={dayKeys}
                events={filteredEvents}
                journalEntries={journalEntries}
                onSelectEvent={handleSelectEvent}
                onCreateAt={openCreate}
                className="md:hidden"
              />
            </>
          )}

          {view === "day" && (
            <TimeGrid
              dayKeys={dayKeys}
              events={filteredEvents}
              journalEntries={journalEntries}
              onSelectEvent={handleSelectEvent}
              onCreateAt={openCreate}
            />
          )}

          {isPending && (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-16">
              <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <Loader2 className="size-3.5 animate-spin" />
                {messages.calendar.loading}
              </span>
            </div>
          )}
        </div>

        {filteredEvents.length === 0 && !isPending && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border/80 bg-card/60 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
              <CalendarPlus className="size-6" />
            </div>
            <div>
              <p className="font-heading text-base font-semibold">
                {messages.calendar.emptyTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                {messages.calendar.emptyDescription}
              </p>
            </div>
            <Button size="sm" onClick={() => openCreate(dateKey)}>
              {messages.calendar.createEvent}
            </Button>
          </div>
        )}

        <EventDialog
          open={editor.open}
          onOpenChange={(open) => {
            if (!open) setEditor({ open: false });
          }}
          eventId={editor.open ? editor.eventId : null}
          initialValues={editor.open ? editor.values : defaultFormValues({ dateKey })}
          onSaved={refresh}
          onDelete={
            editor.open && editor.eventId && selected
              ? () => {
                  setEditor({ open: false });
                  void handleDelete(selected);
                }
              : undefined
          }
        />

        <EventDetailDialog
          event={selected}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={(event) => {
            setDetailOpen(false);
            setEditor({ open: true, eventId: event.id, values: eventToFormValues(event) });
          }}
          onDelete={(event) => void handleDelete(event)}
        />
      </div>
    </div>
  );
}
