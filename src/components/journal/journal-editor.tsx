"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CloudUpload,
  Feather,
  Loader2,
  Moon,
  RotateCw,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { deleteJournalAction, saveJournalAction } from "@/actions/journal";
import {
  BentoReflectionCard,
  EnergyBentoCard,
  IntentionBentoCard,
  MoodBentoCard,
  SleepBentoCard,
  TodayCalendarEventsBentoCard,
  ZenCanvasCard,
} from "@/components/journal/journal-fields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { DAILY_JOURNAL_TEMPLATE } from "@/lib/journal/template";
import {
  formValuesToPayload,
  journalToFormValues,
  type JournalFormValues,
  type JournalRecord,
} from "@/lib/journal/form";
import { formatDateKey, formatDateTime, toDateKey } from "@/lib/date";
import { cn } from "cn";
import { messages, t } from "@/i18n";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type JournalViewTab = "all" | "morning" | "evening" | "freeWriting";

const AUTOSAVE_DELAY = 1200;

export function JournalEditor({
  entryDate,
  journal,
  dayEvents = [],
  onBack,
  onSaved,
  onDeleted,
}: {
  entryDate: string;
  journal: JournalRecord | null;
  dayEvents?: CalendarEventDTO[];
  onBack: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [values, setValues] = useState<JournalFormValues>(() => journalToFormValues(journal));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(journal?.updatedAt ?? null);
  const [activeTab, setActiveTab] = useState<JournalViewTab>("all");

  const valuesRef = useRef(values);
  valuesRef.current = values;
  const dirtyRef = useRef(false);

  const isToday = entryDate === toDateKey(new Date());

  const save = useCallback(async () => {
    if (!dirtyRef.current) return true;
    setStatus("saving");
    const result = await saveJournalAction(formValuesToPayload(entryDate, valuesRef.current));
    if (!result.ok) {
      setStatus("error");
      toast.error(result.error);
      return false;
    }
    dirtyRef.current = false;
    setUpdatedAt(new Date(result.data.updatedAt));
    setStatus("saved");
    onSaved();
    return true;
  }, [entryDate, onSaved]);

  useEffect(() => {
    if (!dirtyRef.current) return;
    const timer = window.setTimeout(() => {
      void save();
    }, AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [values, save]);

  useEffect(() => {
    return () => {
      if (dirtyRef.current) {
        void saveJournalAction(formValuesToPayload(entryDate, valuesRef.current));
      }
    };
  }, [entryDate]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  function markDirty(next: JournalFormValues) {
    dirtyRef.current = true;
    setStatus("idle");
    setValues(next);
  }

  async function handleDelete() {
    if (!journal?.id) return;
    const result = await deleteJournalAction(journal.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    dirtyRef.current = false;
    toast.success(messages.journal.toastDeleted);
    onDeleted();
  }

  // Calculate completion percentage
  const { completedCount, totalCount, percentage } = useMemo(() => {
    let completed = 0;
    const total = 14;

    if (values.mood) completed++;
    if (values.energyLevel !== null) completed++;
    if (values.sleepQuality !== null) completed++;
    if (values.title.trim()) completed++;

    const textKeys = [
      "intention",
      "wentWell",
      "accomplishments",
      "learnings",
      "challenges",
      "improvements",
      "gratitude",
      "tomorrowPriority",
      "rememberNote",
      "notes",
      "freeWriting",
    ];

    for (const key of textKeys) {
      if (values.texts[key]?.trim()) completed++;
    }

    return {
      completedCount: completed,
      totalCount: total,
      percentage: Math.min(100, Math.round((completed / total) * 100)),
    };
  }, [values]);

  const weekdayLabel = formatDateKey(entryDate, "EEEE");
  const dateLabel = formatDateKey(entryDate, "dd/MM/yyyy");

  // Lookup fields from template
  const reflectionSection = DAILY_JOURNAL_TEMPLATE.sections.find((s) => s.id === "reflection");
  const tomorrowSection = DAILY_JOURNAL_TEMPLATE.sections.find((s) => s.id === "tomorrow");

  const setTextField = (key: string, val: string) => {
    markDirty({ ...values, texts: { ...values.texts, [key]: val } });
  };

  return (
    <section className="flex min-h-0 flex-col rounded-3xl border border-border/80 bg-card shadow-xs">
      {/* Sticky Header with Date, Title, Progress, and Tabs */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 rounded-t-3xl border-b border-border/80 bg-card/95 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 md:hidden"
              onClick={onBack}
              aria-label={messages.journal.backToList}
            >
              <ArrowLeft className="size-4" />
            </Button>

            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="size-4" />
                </span>
                <p className="font-heading text-sm font-semibold capitalize text-foreground sm:text-base">
                  {weekdayLabel}, {dateLabel}
                </p>
                {isToday && (
                  <Badge className="border-none bg-emerald-500/15 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Hôm nay
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {updatedAt
                  ? t(messages.journal.lastUpdated, {
                      time: formatDateTime(updatedAt, "HH:mm dd/MM"),
                    })
                  : messages.journal.noContentYet}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SaveIndicator status={status} onRetry={() => void save()} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  aria-label={messages.journal.deleteLabel}
                  disabled={!journal?.id}
                >
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t(messages.journal.deleteTitle, { date: dateLabel })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {messages.journal.deleteDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => void handleDelete()}
                  >
                    {messages.journal.deleteConfirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <Input
            value={values.title}
            placeholder={messages.journal.titlePlaceholder}
            aria-label={messages.journal.titleLabel}
            className="h-auto border-none bg-transparent px-0 font-heading text-xl font-semibold tracking-tight shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 sm:text-2xl"
            onChange={(event) => markDirty({ ...values, title: event.target.value })}
          />
        </div>

        {/* Progress Bar & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-muted sm:w-36">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="font-medium text-foreground">
              {completedCount}/{totalCount} mục
            </span>
            <span className="text-[11px] text-muted-foreground">({percentage}%)</span>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                activeTab === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Sparkles className="size-3.5" />
              Tất cả Bento
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("morning")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                activeTab === "morning"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Sun className="size-3.5 text-amber-500" />
              Sáng ☀️
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("evening")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                activeTab === "evening"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Moon className="size-3.5 text-indigo-500" />
              Tối 🌙
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("freeWriting")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                activeTab === "freeWriting"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Feather className="size-3.5 text-primary" />
              Viết tự do
            </button>
          </div>
        </div>
      </header>

      {/* Main Bento Workspace */}
      <div className="min-h-0 flex-1 space-y-8 p-4 sm:p-6">
        {/* ================= SECTION 1: Vitals & Morning Check-in ================= */}
        {(activeTab === "all" || activeTab === "morning") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Sun className="size-3.5" />
                </span>
                <h3 className="font-heading text-sm font-semibold tracking-wide text-foreground">
                  Khởi động ngày & Chỉ số cảm xúc
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Tâm trạng · Năng lượng · Giấc ngủ</span>
            </div>

            {/* Bento Grid: 12 Columns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
              <MoodBentoCard
                value={values.mood}
                onChange={(next) => markDirty({ ...values, mood: next })}
                className="lg:col-span-6"
              />
              <EnergyBentoCard
                value={values.energyLevel}
                onChange={(next) => markDirty({ ...values, energyLevel: next })}
                className="lg:col-span-3"
              />
              <SleepBentoCard
                value={values.sleepQuality}
                onChange={(next) => markDirty({ ...values, sleepQuality: next })}
                className="lg:col-span-3"
              />
              <IntentionBentoCard
                value={values.texts.intention ?? ""}
                onChange={(next) => setTextField("intention", next)}
                className="sm:col-span-2 lg:col-span-12"
              />
            </div>
          </div>
        )}

        {/* ================= SECTION: Today Calendar Events (Bridge) ================= */}
        {(activeTab === "all" || activeTab === "morning" || activeTab === "evening") && (
          <TodayCalendarEventsBentoCard
            entryDate={entryDate}
            events={dayEvents}
          />
        )}

        {/* ================= SECTION 2: Daily Reflection Bento ================= */}
        {(activeTab === "all" || activeTab === "evening") && reflectionSection && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Moon className="size-3.5" />
                </span>
                <h3 className="font-heading text-sm font-semibold tracking-wide text-foreground">
                  Nhìn lại ngày hôm nay
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Biết ơn · Thành tựu · Đúc kết</span>
            </div>

            {/* 2-Column Reflection Bento Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {reflectionSection.fields.map((field) => (
                <BentoReflectionCard
                  key={field.key}
                  field={field}
                  value={values.texts[field.key] ?? ""}
                  onChange={(val) => setTextField(field.key, val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 3: Tomorrow Prep Bento ================= */}
        {(activeTab === "all" || activeTab === "evening" || activeTab === "morning") && tomorrowSection && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  <Sparkles className="size-3.5" />
                </span>
                <h3 className="font-heading text-sm font-semibold tracking-wide text-foreground">
                  Chuẩn bị cho ngày mai
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Ưu tiên & Ghi chú</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tomorrowSection.fields.map((field) => (
                <BentoReflectionCard
                  key={field.key}
                  field={field}
                  value={values.texts[field.key] ?? ""}
                  onChange={(val) => setTextField(field.key, val)}
                  className={field.key === "notes" ? "md:col-span-2" : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 4: Free Writing Canvas ================= */}
        {(activeTab === "all" || activeTab === "freeWriting") && (
          <div className="space-y-4">
            <ZenCanvasCard
              value={values.texts.freeWriting ?? ""}
              onChange={(next) => setTextField("freeWriting", next)}
            />
          </div>
        )}

        {/* Footer Note */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span>{messages.journal.autosaveNote}</span>
          <span className="font-mono text-[11px] opacity-70">{entryDate}</span>
        </div>
      </div>
    </section>
  );
}

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        {messages.journal.statusSaving}
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-2 rounded-full bg-destructive/10 px-2.5 py-1 text-xs text-destructive">
        <AlertCircle className="size-3" />
        {messages.journal.statusError}
        <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[11px]" onClick={onRetry}>
          <RotateCw className="size-2.5" />
          {messages.common.retry}
        </Button>
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <Check className="size-3" />
        {messages.journal.statusSaved}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
      <CloudUpload className="size-3" />
      {messages.journal.statusIdle}
    </span>
  );
}
