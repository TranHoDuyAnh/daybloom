import { messages } from "@/i18n";

export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export function fail(error: string, fieldErrors?: FieldErrors): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/** Maps thrown errors to a user-facing message without leaking internals. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return messages.errors.unauthorized;
  }
  console.error(error);
  return messages.errors.saveFailed;
}
