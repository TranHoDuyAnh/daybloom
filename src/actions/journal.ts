"use server";

import { revalidatePath } from "next/cache";

import { deleteJournal, upsertJournal } from "@/lib/journal/repository";
import { requireUserId } from "@/lib/auth";
import { fail, ok, toErrorMessage, type ActionResult } from "@/lib/action-result";
import { journalInputSchema } from "@/lib/validation/journal";

export async function saveJournalAction(
  input: unknown,
): Promise<ActionResult<{ id: string; entryDate: string; updatedAt: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = journalInputSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Nội dung nhật ký không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const row = await upsertJournal(userId, parsed.data);
    if (!row) return fail("Không thể lưu nhật ký");

    revalidatePath("/journal");
    return ok({
      id: row.id,
      entryDate: row.entryDate,
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function deleteJournalAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("Nhật ký không hợp lệ");

    const row = await deleteJournal(userId, id);
    if (!row) return fail("Nhật ký không tồn tại hoặc đã bị xóa");

    revalidatePath("/journal");
    return ok({ id: row.id });
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
