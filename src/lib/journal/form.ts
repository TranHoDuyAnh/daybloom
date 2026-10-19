import type { z } from "zod";

import type { DailyJournal } from "@/db/schema";
import { messages } from "@/i18n";
import { DAILY_JOURNAL_TEMPLATE, JOURNAL_FIELD_KEYS } from "@/lib/journal/template";
import type { journalInputSchema } from "@/lib/validation/journal";

export type JournalPayload = z.input<typeof journalInputSchema>;

export type JournalRecord = {
  id: string;
  entryDate: string;
  title: string | null;
  mood: string | null;
  energyLevel: number | null;
  sleepQuality: number | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
};

/** Strips internal columns (user id, storage details) before sending to the client. */
export function toJournalRecord(journal: DailyJournal): JournalRecord {
  const record: JournalRecord = {
    id: journal.id,
    entryDate: journal.entryDate,
    title: journal.title,
    mood: journal.mood,
    energyLevel: journal.energyLevel,
    sleepQuality: journal.sleepQuality,
    createdAt: journal.createdAt,
    updatedAt: journal.updatedAt,
  };

  for (const key of TEXT_FIELD_KEYS) {
    record[key] = journal[key as keyof DailyJournal] as string | null;
  }
  return record;
}


export type JournalFormValues = {
  title: string;
  mood: string | null;
  energyLevel: number | null;
  sleepQuality: number | null;
  texts: Record<string, string>;
};

const STRUCTURED_KEYS = new Set(["mood", "energyLevel", "sleepQuality"]);

export const TEXT_FIELD_KEYS = JOURNAL_FIELD_KEYS.filter((key) => !STRUCTURED_KEYS.has(key));

export function emptyFormValues(): JournalFormValues {
  const texts: Record<string, string> = {};
  for (const key of TEXT_FIELD_KEYS) texts[key] = "";
  return { title: "", mood: null, energyLevel: null, sleepQuality: null, texts };
}

export function journalToFormValues(journal: JournalRecord | null): JournalFormValues {
  const values = emptyFormValues();
  if (!journal) return values;

  values.title = journal.title ?? "";
  values.mood = journal.mood;
  values.energyLevel = journal.energyLevel;
  values.sleepQuality = journal.sleepQuality;

  for (const key of TEXT_FIELD_KEYS) {
    const raw = journal[key];
    values.texts[key] = typeof raw === "string" ? raw : "";
  }
  return values;
}

export function formValuesToPayload(
  entryDate: string,
  values: JournalFormValues,
): JournalPayload {
  const payload: JournalPayload = {
    entryDate,
    title: values.title.trim() || null,
    mood: (values.mood ?? null) as JournalPayload["mood"],
    energyLevel: values.energyLevel,
    sleepQuality: values.sleepQuality,
  };

  for (const key of TEXT_FIELD_KEYS) {
    const value = values.texts[key] ?? "";
    (payload as Record<string, unknown>)[key] = value.trim() || null;
  }
  return payload;
}

/** Keeps the editor and the stored payload in sync when fields change. */
export const JOURNAL_TEMPLATE_FIELDS = DAILY_JOURNAL_TEMPLATE.sections.flatMap(
  (section) => section.fields,
);

export function scaleLabel(value: number | null): string {
  if (value === null) return messages.common.none;
  return `${value}/5`;
}
