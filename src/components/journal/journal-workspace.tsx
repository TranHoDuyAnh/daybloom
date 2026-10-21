"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, PenLine } from "lucide-react";

import { JournalEditor } from "@/components/journal/journal-editor";
import {
  JournalList,
  type JournalQuery,
  type JournalSummaryDTO,
} from "@/components/journal/journal-list";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import type { JournalRecord } from "@/lib/journal/form";
import { toDateKey } from "@/lib/date";
import { cn } from "cn";

export function JournalWorkspace({
  dateKey,
  journal,
  entries,
  dayEvents = [],
  query,
  initialPane,
}: {
  dateKey: string;
  journal: JournalRecord | null;
  entries: JournalSummaryDTO[];
  dayEvents?: CalendarEventDTO[];
  query: JournalQuery;
  initialPane: "list" | "editor";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pane, setPane] = useState<"list" | "editor">(initialPane);
  const todayKey = toDateKey(new Date());

  const buildUrl = useCallback(
    (nextDate: string, nextQuery: JournalQuery) => {
      const params = new URLSearchParams();
      params.set("date", nextDate);
      if (nextQuery.search) params.set("q", nextQuery.search);
      if (nextQuery.from) params.set("from", nextQuery.from);
      if (nextQuery.to) params.set("to", nextQuery.to);
      return `/journal?${params.toString()}`;
    },
    [],
  );

  const navigate = useCallback(
    (nextDate: string, nextQuery: JournalQuery) => {
      startTransition(() => {
        router.push(buildUrl(nextDate, nextQuery));
      });
    },
    [buildUrl, router],
  );

  const handleSelectDate = useCallback(
    (nextDate: string) => {
      setPane("editor");
      navigate(nextDate, query);
    },
    [navigate, query],
  );

  const handleQueryChange = useCallback(
    (nextQuery: JournalQuery) => {
      navigate(dateKey, nextQuery);
    },
    [dateKey, navigate],
  );

  return (
    <div className="space-y-3">
      {/* Mobile Top Segmented Switcher (Visible on iPhone/mobile screens) */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border/80 bg-muted/50 p-1 md:hidden">
        <button
          type="button"
          onClick={() => setPane("editor")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all active:scale-98",
            pane === "editor"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <PenLine className="size-3.5" />
          <span>Viết nhật ký</span>
        </button>
        <button
          type="button"
          onClick={() => setPane("list")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all active:scale-98",
            pane === "list"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="size-3.5" />
          <span>Lịch sử ({entries.length})</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[21rem_minmax(0,1fr)]">
        <div className={cn("md:block", pane === "editor" && "hidden")}>
          <JournalList
            entries={entries}
            selectedDate={dateKey}
            todayKey={todayKey}
            query={query}
            hasSelectedEntry={Boolean(journal)}
            onSelectDate={handleSelectDate}
            onQueryChange={handleQueryChange}
          />
        </div>

        <div className={cn("min-w-0 md:block", pane === "list" && "hidden")}>
          <div className={cn("transition-opacity", isPending && "opacity-70")}>
            <JournalEditor
              key={dateKey}
              entryDate={dateKey}
              journal={journal}
              dayEvents={dayEvents}
              onBack={() => setPane("list")}
              onSaved={() => startTransition(() => router.refresh())}
              onDeleted={() => {
                setPane("list");
                startTransition(() => router.refresh());
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
