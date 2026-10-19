import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { dailyJournals } from "@/db/schema";
import { journalPreview } from "@/lib/journal/template";
import type { JournalInput } from "@/lib/validation/journal";

const SEARCHABLE_COLUMNS = [
  dailyJournals.title,
  dailyJournals.intention,
  dailyJournals.wentWell,
  dailyJournals.accomplishments,
  dailyJournals.learnings,
  dailyJournals.challenges,
  dailyJournals.improvements,
  dailyJournals.gratitude,
  dailyJournals.tomorrowPriority,
  dailyJournals.rememberNote,
  dailyJournals.notes,
  dailyJournals.freeWriting,
] as const;

export type JournalSummary = {
  id: string;
  entryDate: string;
  title: string | null;
  mood: string | null;
  energyLevel: number | null;
  updatedAt: Date;
  preview: string;
};

export async function listJournalSummaries(
  userId: string,
  options: { from?: string; to?: string; search?: string; limit?: number } = {},
): Promise<JournalSummary[]> {
  const filters = [eq(dailyJournals.userId, userId)];

  if (options.from) filters.push(gte(dailyJournals.entryDate, options.from));
  if (options.to) filters.push(lte(dailyJournals.entryDate, options.to));

  const term = options.search?.trim();
  if (term) {
    const pattern = `%${term}%`;
    const searchFilter = or(...SEARCHABLE_COLUMNS.map((column) => ilike(column, pattern)));
    if (searchFilter) filters.push(searchFilter);
  }

  const rows = await getDb()
    .select({
      id: dailyJournals.id,
      entryDate: dailyJournals.entryDate,
      title: dailyJournals.title,
      mood: dailyJournals.mood,
      energyLevel: dailyJournals.energyLevel,
      updatedAt: dailyJournals.updatedAt,
      intention: dailyJournals.intention,
      wentWell: dailyJournals.wentWell,
      gratitude: dailyJournals.gratitude,
      notes: dailyJournals.notes,
      freeWriting: dailyJournals.freeWriting,
    })
    .from(dailyJournals)
    .where(and(...filters))
    .orderBy(desc(dailyJournals.entryDate))
    .limit(options.limit ?? 200);

  return rows.map((row) => ({
    id: row.id,
    entryDate: row.entryDate,
    title: row.title,
    mood: row.mood,
    energyLevel: row.energyLevel,
    updatedAt: row.updatedAt,
    preview: journalPreview(row),
  }));
}

export async function getJournalByDate(userId: string, entryDate: string) {
  const [row] = await getDb()
    .select()
    .from(dailyJournals)
    .where(and(eq(dailyJournals.userId, userId), eq(dailyJournals.entryDate, entryDate)))
    .limit(1);
  return row ?? null;
}

export async function upsertJournal(userId: string, input: JournalInput) {
  const values = { ...input, userId, updatedAt: new Date() };
  const [row] = await getDb()
    .insert(dailyJournals)
    .values(values)
    .onConflictDoUpdate({
      target: [dailyJournals.userId, dailyJournals.entryDate],
      set: { ...input, updatedAt: sql`now()` },
    })
    .returning();
  return row;
}

export async function deleteJournal(userId: string, id: string) {
  const [row] = await getDb()
    .delete(dailyJournals)
    .where(and(eq(dailyJournals.id, id), eq(dailyJournals.userId, userId)))
    .returning({ id: dailyJournals.id });
  return row ?? null;
}
