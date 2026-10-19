"use server";

import { revalidatePath } from "next/cache";

import {
  deleteEvent,
  getEvent,
  insertEvent,
  moveEvent,
  updateEvent,
} from "@/lib/calendar/repository";
import { requireUserId } from "@/lib/auth";
import { messages } from "@/i18n";
import { fail, ok, toErrorMessage, type ActionResult } from "@/lib/action-result";
import { eventIdSchema, eventInputSchema } from "@/lib/validation/calendar";

function parseInput(input: unknown) {
  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  return { success: true as const, data: parsed.data };
}

function refresh() {
  revalidatePath("/calendar");
}

export async function saveEventAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = parseInput(input);
    if (!parsed.success) {
      return fail(messages.errors.invalidEventData, parsed.fieldErrors);
    }

    if (id) {
      const parsedId = eventIdSchema.safeParse(id);
      if (!parsedId.success) return fail(messages.errors.eventNotFound);

      const existing = await getEvent(userId, id);
      if (!existing) return fail(messages.errors.eventGone);

      const row = await updateEvent(userId, id, parsed.data);
      if (!row) return fail(messages.errors.eventUpdateFailed);
      refresh();
      return ok({ id: row.id });
    }

    const row = await insertEvent(userId, parsed.data);
    if (!row) return fail(messages.errors.eventCreateFailed);
    refresh();
    return ok({ id: row.id });
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsedId = eventIdSchema.safeParse(id);
    if (!parsedId.success) return fail(messages.errors.invalidEvent);

    const row = await deleteEvent(userId, id);
    if (!row) return fail(messages.errors.eventGone);
    refresh();
    return ok({ id: row.id });
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function moveEventAction(input: {
  id: string;
  startAt: string;
  endAt: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsedId = eventIdSchema.safeParse(input.id);
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (!parsedId.success) return fail(messages.errors.invalidEvent);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      return fail(messages.errors.invalidTime);
    }
    if (endAt.getTime() <= startAt.getTime()) {
      return fail(messages.errors.endBeforeStart);
    }

    const row = await moveEvent(userId, input.id, { startAt, endAt });
    if (!row) return fail(messages.errors.eventGone);
    refresh();
    return ok({ id: row.id });
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
