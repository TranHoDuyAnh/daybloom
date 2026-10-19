"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOOD_OPTIONS } from "@/lib/journal/template";
import { formatDateKey, formatDateTime } from "@/lib/date";
import { cn } from "cn";
import { messages, t } from "@/i18n";

export type JournalSummaryDTO = {
  id: string;
  entryDate: string;
  title: string | null;
  mood: string | null;
  energyLevel: number | null;
  updatedAt: string;
  preview: string;
};

export type JournalQuery = {
  search: string;
  from: string;
  to: string;
};

const SEARCH_DEBOUNCE = 400;

function moodEmoji(mood: string | null): string | null {
  return MOOD_OPTIONS.find((option) => option.id === mood)?.emoji ?? null;
}

export function JournalList({
  entries,
  selectedDate,
  todayKey,
  query,
  hasSelectedEntry,
  onSelectDate,
  onQueryChange,
}: {
  entries: JournalSummaryDTO[];
  selectedDate: string;
  todayKey: string;
  query: JournalQuery;
  hasSelectedEntry: boolean;
  onSelectDate: (dateKey: string) => void;
  onQueryChange: (query: JournalQuery) => void;
}) {
  const [search, setSearch] = useState(query.search);
  const [from, setFrom] = useState(query.from);
  const [to, setTo] = useState(query.to);

  useEffect(() => {
    if (search === query.search && from === query.from && to === query.to) return;
    const timer = window.setTimeout(() => {
      onQueryChange({ search, from, to });
    }, SEARCH_DEBOUNCE);
    return () => window.clearTimeout(timer);
  }, [search, from, to, query, onQueryChange]);

  const filtersActive = Boolean(search || from || to);

  return (
    <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
      <div className="space-y-3 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">{messages.journal.title}</h2>
          <span className="text-xs text-muted-foreground">
            {t(messages.journal.dayCount, { count: entries.length })}
          </span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={messages.journal.searchPlaceholder}
            aria-label={messages.journal.searchLabel}
            className="pl-8"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="journal-from" className="text-[11px] text-muted-foreground">
              {messages.journal.fromDate}
            </Label>
            <Input
              id="journal-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="journal-to" className="text-[11px] text-muted-foreground">
              {messages.journal.toDate}
            </Label>
            <Input
              id="journal-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {hasSelectedEntry
              ? t(messages.journal.selectedHasContent, {
                  date: formatDateKey(selectedDate, "dd/MM/yyyy"),
                })
              : t(messages.journal.selectedEmpty, {
                  date: formatDateKey(selectedDate, "dd/MM/yyyy"),
                })}
          </p>
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] text-muted-foreground"
              onClick={() => {
                setSearch("");
                setFrom("");
                setTo("");
                onQueryChange({ search: "", from: "", to: "" });
              }}
            >
              <X className="size-3" />
              {messages.journal.clearFilters}
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="max-h-[62dvh] flex-1">
        <ul className="divide-y divide-border">
          {entries.length === 0 && (
            <li className="px-4 py-8 text-center">
              <BookOpen className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {filtersActive
                  ? messages.journal.listEmptyFiltered
                  : messages.journal.listEmpty}
              </p>
            </li>
          )}

          {entries.map((entry) => {
            const active = entry.entryDate === selectedDate;
            const emoji = moodEmoji(entry.mood);
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelectDate(entry.entryDate)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    active && "bg-accent/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <span className="capitalize">
                          {formatDateKey(entry.entryDate, "EEE, dd/MM/yyyy")}
                        </span>
                        {emoji && <span aria-hidden>{emoji}</span>}
                      </p>
                      <p className="truncate text-sm text-foreground/80">
                        {entry.title || messages.journal.untitled}
                      </p>
                      {entry.preview && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {entry.preview}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {entry.entryDate === todayKey && (
                        <Badge variant="secondary" className="font-normal text-[10px]">
                          {messages.journal.todayBadge}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(entry.updatedAt, "HH:mm")}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </section>
  );
}
