"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { messages } from "@/i18n";
import { signOut } from "@/lib/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { registerSchema } from "@/lib/validation/auth";

export async function registerAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return fail(messages.auth.registerFailed, parsed.error.flatten().fieldErrors);
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const db = getDb();
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return fail(messages.auth.emailTaken, { email: [messages.auth.emailTaken] });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await db.insert(users).values({
      email,
      name: parsed.data.name || null,
      passwordHash,
    });

    return ok(null);
  } catch (error) {
    console.error(error);
    return fail(messages.auth.registerFailed);
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
