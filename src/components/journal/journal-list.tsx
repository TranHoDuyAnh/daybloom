"use client";

import { useEffect, useState } from "react";
import { BookOpen, Calendar, Search, Sparkles, X, Zap } from "lucide-react";

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
    <section className="flex min-h-0 flex-col rounded-3xl border border-border/80 bg-card shadow-xs">
      {/* Header & Search */}
      <div className="space-y-3.5 border-b border-border/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-4" />
            </span>
            <h2 className="font-heading text-sm font-semibold text-foreground">
              {messages.journal.title}
            </h2>
          </div>
          <Badge variant="secondary" className="px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t(messages.journal.dayCount, { count: entries.length })}
          </Badge>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={messages.journal.searchPlaceholder}
            aria-label={messages.journal.searchLabel}
            className="h-9 rounded-xl border-border/70 bg-muted/40 pl-8 text-xs transition-colors focus:bg-card"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="journal-from" className="text-[11px] font-medium text-muted-foreground">
              {messages.journal.fromDate}
            </Label>
            <Input
              id="journal-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-8 rounded-lg border-border/70 bg-muted/30 px-2 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="journal-to" className="text-[11px] font-medium text-muted-foreground">
              {messages.journal.toDate}
            </Label>
            <Input
              id="journal-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-8 rounded-lg border-border/70 bg-muted/30 px-2 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
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
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
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

      {/* Entries List */}
      <ScrollArea className="max-h-[calc(100dvh-17rem)] flex-1 p-2">
        {entries.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
              <Sparkles className="size-5" />
            </div>
            <p className="text-xs text-muted-foreground">
              {filtersActive ? messages.journal.listEmptyFiltered : messages.journal.listEmpty}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          {entries.map((entry) => {
            const active = entry.entryDate === selectedDate;
            const emoji = moodEmoji(entry.mood);
            const isToday = entry.entryDate === todayKey;

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectDate(entry.entryDate)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "group relative flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border border-primary/30 bg-primary/10 shadow-xs"
                    : "border border-transparent hover:border-border/60 hover:bg-muted/40",
                )}
              >
                {/* Mood or Calendar icon badge */}
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                    active
                      ? "border-primary/30 bg-card text-foreground shadow-xs"
                      : "border-border/60 bg-muted/60 text-muted-foreground group-hover:bg-card",
                  )}
                >
                  {emoji ? (
                    <span className="text-lg leading-none" aria-hidden>{emoji}</span>
                  ) : (
                    <Calendar className="size-4" />
                  )}
                </div>

                {/* Entry snippet and title */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-semibold capitalize text-foreground">
                      {formatDateKey(entry.entryDate, "EEE, dd/MM")}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {isToday && (
                        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                          {messages.journal.todayBadge}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(entry.updatedAt, "HH:mm")}
                      </span>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "mt-0.5 truncate text-xs",
                      entry.title ? "font-medium text-foreground" : "italic text-muted-foreground/80",
                    )}
                  >
                    {entry.title || messages.journal.untitled}
                  </p>

                  {entry.preview && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {entry.preview}
                    </p>
                  )}

                  {entry.energyLevel !== null && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                      <Zap className="size-3" />
                      <span>Năng lượng {entry.energyLevel}/5</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
}
