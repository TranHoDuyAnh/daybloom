"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteEventAction } from "@/actions/calendar";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { EventDetailDialog } from "@/components/calendar/event-detail-dialog";
import { EventDialog } from "@/components/calendar/event-dialog";
import { MonthView } from "@/components/calendar/month-view";
import { DayAgenda, TimeGrid } from "@/components/calendar/time-grid";
import { Button } from "@/components/ui/button";
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

type EditorState =
  | { open: false }
  | { open: true; eventId: string | null; values: EventFormValues };

export function CalendarBoard({
  view,
  dateKey,
  events,
}: {
  view: CalendarView;
  dateKey: string;
  events: CalendarEventDTO[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const [selected, setSelected] = useState<CalendarEventDTO | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
      toast.success("Đã xóa sự kiện");
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
    <div className="space-y-4" data-loading={isPending}>
      <CalendarToolbar
        view={view}
        dateKey={dateKey}
        isPending={isPending}
        onNavigate={handleNavigate}
        onChangeView={(nextView) => goTo(nextView, dateKey)}
        onCreate={() => openCreate(dateKey)}
      />

      <div className={cn("relative transition-opacity", isPending && "opacity-60")}>
        {view === "month" && (
          <MonthView
            dateKey={dateKey}
            events={events}
            onSelectEvent={handleSelectEvent}
            onCreateAt={(key) => openCreate(key)}
          />
        )}

        {view === "week" && (
          <>
            <TimeGrid
              dayKeys={dayKeys}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateAt={openCreate}
              className="hidden md:block"
            />
            <DayAgenda
              dayKeys={dayKeys}
              events={events}
              onSelectEvent={handleSelectEvent}
              onCreateAt={openCreate}
              className="md:hidden"
            />
          </>
        )}

        {view === "day" && (
          <TimeGrid
            dayKeys={dayKeys}
            events={events}
            onSelectEvent={handleSelectEvent}
            onCreateAt={openCreate}
          />
        )}

        {isPending && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-16">
            <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
              <Loader2 className="size-3.5 animate-spin" />
              Đang tải lịch...
            </span>
          </div>
        )}
      </div>

      {events.length === 0 && !isPending && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
          <CalendarPlus className="size-6 text-muted-foreground" />
          <div>
            <p className="font-heading text-base font-semibold">Chưa có sự kiện nào</p>
            <p className="text-sm text-muted-foreground">
              Nhấn vào một ô ngày hoặc khung giờ để tạo sự kiện đầu tiên.
            </p>
          </div>
          <Button size="sm" onClick={() => openCreate(dateKey)}>
            Tạo sự kiện
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
  );
}
