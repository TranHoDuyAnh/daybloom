import { and, asc, eq, gte, lte } from "drizzle-orm";

import { getDb } from "@/db";
import { calendarEvents } from "@/db/schema";
import type { EventInput } from "@/lib/validation/calendar";
import { endOfDay, fromDateKey, startOfDay } from "@/lib/date";

/** All-day events are stored as the full local day span in APP_TIMEZONE. */
export function normalizeEventDates(input: EventInput): {
  startAt: Date;
  endAt: Date;
} {
  if (!input.allDay) return { startAt: input.startAt, endAt: input.endAt };

  const startAt = startOfDay(input.startAt);
  const endAt = endOfDay(input.endAt < input.startAt ? input.startAt : input.endAt);
  return { startAt, endAt };
}

export function eventRangeBounds(fromKey: string, toKey: string): {
  from: Date;
  to: Date;
} {
  return { from: fromDateKey(fromKey), to: endOfDay(fromDateKey(toKey)) };
}

export async function listEventsInRange(userId: string, from: Date, to: Date) {
  return getDb()
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, userId),
        lte(calendarEvents.startAt, to),
        gte(calendarEvents.endAt, from),
      ),
    )
    .orderBy(asc(calendarEvents.startAt));
}

export async function getEvent(userId: string, id: string) {
  const [row] = await getDb()
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function insertEvent(userId: string, input: EventInput) {
  const { startAt, endAt } = normalizeEventDates(input);
  const [row] = await getDb()
    .insert(calendarEvents)
    .values({
      userId,
      title: input.title,
      description: input.description ?? null,
      startAt,
      endAt,
      allDay: input.allDay,
      category: input.category,
      color: input.color,
      location: input.location ?? null,
    })
    .returning();
  return row;
}

export async function updateEvent(userId: string, id: string, input: EventInput) {
  const { startAt, endAt } = normalizeEventDates(input);
  const [row] = await getDb()
    .update(calendarEvents)
    .set({
      title: input.title,
      description: input.description ?? null,
      startAt,
      endAt,
      allDay: input.allDay,
      category: input.category,
      color: input.color,
      location: input.location ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteEvent(userId: string, id: string) {
  const [row] = await getDb()
    .delete(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .returning({ id: calendarEvents.id });
  return row ?? null;
}

export async function moveEvent(
  userId: string,
  id: string,
  patch: { startAt: Date; endAt: Date },
) {
  const [row] = await getDb()
    .update(calendarEvents)
    .set({ startAt: patch.startAt, endAt: patch.endAt, updatedAt: new Date() })
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .returning();
  return row ?? null;
}
