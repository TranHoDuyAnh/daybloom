"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { loginSchema } from "@/lib/validation/auth";

export async function loginAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Vui lòng nhập email và mật khẩu", parsed.error.flatten().fieldErrors);
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
      return fail("Email hoặc mật khẩu không đúng");
    }
    console.error(error);
    return fail("Không thể đăng nhập. Vui lòng thử lại.");
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
