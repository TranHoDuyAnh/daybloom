"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { messages } from "@/i18n";
import { signIn, signOut } from "@/lib/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export async function loginAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail(messages.auth.missingFields, parsed.error.flatten().fieldErrors);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return ok(null);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(messages.auth.invalidCredentials);
    }
    console.error(error);
    return fail(messages.auth.failed);
  }
}

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

    await signIn("credentials", { email, password: parsed.data.password, redirect: false });
    return ok(null);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(messages.auth.invalidCredentials);
    }
    console.error(error);
    return fail(messages.auth.registerFailed);
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
