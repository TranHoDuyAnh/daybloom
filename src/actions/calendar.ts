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
      return fail("Dữ liệu sự kiện không hợp lệ", parsed.fieldErrors);
    }

    if (id) {
      const parsedId = eventIdSchema.safeParse(id);
      if (!parsedId.success) return fail("Sự kiện không tồn tại");

      const existing = await getEvent(userId, id);
      if (!existing) return fail("Sự kiện không tồn tại hoặc đã bị xóa");

      const row = await updateEvent(userId, id, parsed.data);
      if (!row) return fail("Không thể cập nhật sự kiện");
      refresh();
      return ok({ id: row.id });
    }

    const row = await insertEvent(userId, parsed.data);
    if (!row) return fail("Không thể tạo sự kiện");
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
    if (!parsedId.success) return fail("Sự kiện không hợp lệ");

    const row = await deleteEvent(userId, id);
    if (!row) return fail("Sự kiện không tồn tại hoặc đã bị xóa");
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

    if (!parsedId.success) return fail("Sự kiện không hợp lệ");
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      return fail("Thời gian không hợp lệ");
    }
    if (endAt.getTime() <= startAt.getTime()) {
      return fail("Thời gian kết thúc phải sau thời gian bắt đầu");
    }

    const row = await moveEvent(userId, input.id, { startAt, endAt });
    if (!row) return fail("Sự kiện không tồn tại hoặc đã bị xóa");
    refresh();
    return ok({ id: row.id });
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
