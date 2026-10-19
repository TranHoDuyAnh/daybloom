import { z } from "zod";

import { messages } from "@/i18n";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, messages.auth.emailRequired),
  password: z.string().min(1, messages.auth.passwordRequired),
});

export type LoginValues = z.infer<typeof loginSchema>;
