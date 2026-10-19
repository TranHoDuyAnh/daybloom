"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { JournalEditor } from "@/components/journal/journal-editor";
import {
  JournalList,
  type JournalQuery,
  type JournalSummaryDTO,
} from "@/components/journal/journal-list";
import type { JournalRecord } from "@/lib/journal/form";
import { toDateKey } from "@/lib/date";
import { cn } from "cn";

export function JournalWorkspace({
  dateKey,
  journal,
  entries,
  query,
  initialPane,
}: {
  dateKey: string;
  journal: JournalRecord | null;
  entries: JournalSummaryDTO[];
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
    <div className="grid gap-4 md:grid-cols-[20rem_minmax(0,1fr)]">
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
  );
}
