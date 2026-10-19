"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CloudUpload,
  Loader2,
  RotateCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { deleteJournalAction, saveJournalAction } from "@/actions/journal";
import { TemplateField } from "@/components/journal/journal-fields";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAILY_JOURNAL_TEMPLATE } from "@/lib/journal/template";
import {
  formValuesToPayload,
  journalToFormValues,
  type JournalFormValues,
  type JournalRecord,
} from "@/lib/journal/form";
import { formatDateKey, formatDateTime } from "@/lib/date";
import { cn } from "cn";
import { messages, t } from "@/i18n";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY = 1200;

function fieldValue(values: JournalFormValues, key: string): string | number | null {
  if (key === "mood") return values.mood;
  if (key === "energyLevel") return values.energyLevel;
  if (key === "sleepQuality") return values.sleepQuality;
  return values.texts[key] ?? "";
}

function withFieldValue(
  values: JournalFormValues,
  key: string,
  value: string | number | null,
): JournalFormValues {
  if (key === "mood") return { ...values, mood: typeof value === "string" ? value : null };
  if (key === "energyLevel") {
    return { ...values, energyLevel: typeof value === "number" ? value : null };
  }
  if (key === "sleepQuality") {
    return { ...values, sleepQuality: typeof value === "number" ? value : null };
  }
  return {
    ...values,
    texts: { ...values.texts, [key]: typeof value === "string" ? value : "" },
  };
}

export function JournalEditor({
  entryDate,
  journal,
  onBack,
  onSaved,
  onDeleted,
}: {
  entryDate: string;
  journal: JournalRecord | null;
  onBack: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [values, setValues] = useState<JournalFormValues>(() => journalToFormValues(journal));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(journal?.updatedAt ?? null);

  const valuesRef = useRef(values);
  valuesRef.current = values;
  const dirtyRef = useRef(false);

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

  const weekdayLabel = formatDateKey(entryDate, "EEEE");
  const dateLabel = formatDateKey(entryDate, "dd/MM/yyyy");

  return (
    <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBack}
            aria-label={messages.journal.backToList}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="font-heading text-sm font-semibold capitalize">
              {weekdayLabel}, {dateLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {updatedAt
                ? t(messages.journal.lastUpdated, {
                    time: formatDateTime(updatedAt, "HH:mm dd/MM"),
                  })
                : messages.journal.noContentYet}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SaveIndicator status={status} onRetry={() => void save()} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
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
      </header>

      <div className="min-h-0 flex-1 space-y-8 px-4 py-5 sm:px-6">
        <Input
          value={values.title}
          placeholder={messages.journal.titlePlaceholder}
          aria-label={messages.journal.titleLabel}
          className="font-heading h-auto border-none bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0 sm:text-2xl"
          onChange={(event) => markDirty({ ...values, title: event.target.value })}
        />

        {DAILY_JOURNAL_TEMPLATE.sections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="space-y-1 border-b border-border/70 pb-2">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-primary/90">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-xs text-muted-foreground">{section.description}</p>
              )}
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <TemplateField
                  key={field.key}
                  field={field}
                  value={fieldValue(values, field.key)}
                  onTextChange={(key, value) =>
                    markDirty({ ...values, texts: { ...values.texts, [key]: value } })
                  }
                  onValueChange={(key, value) => markDirty(withFieldValue(values, key, value))}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="pb-4 text-[11px] text-muted-foreground">
          {messages.journal.autosaveNote}
        </div>
      </div>
    </section>
  );
}

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        {messages.journal.statusSaving}
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-2 text-xs text-destructive">
        <AlertCircle className="size-3.5" />
        {messages.journal.statusError}
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onRetry}>
          <RotateCw className="size-3" />
          {messages.common.retry}
        </Button>
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className={cn("flex items-center gap-1.5 text-xs text-emerald-600")}>
        <Check className="size-3.5" />
        {messages.journal.statusSaved}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <CloudUpload className="size-3.5" />
      {messages.journal.statusIdle}
    </span>
  );
}
