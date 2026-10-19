import { z } from "zod";

import { messages } from "@/i18n";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, messages.auth.emailRequired),
  password: z.string().min(1, messages.auth.passwordRequired),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().max(80),
    email: z.email(messages.auth.emailInvalid),
    password: z.string().min(8, messages.auth.passwordTooShort),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: messages.auth.passwordMismatch,
  });

export type RegisterValues = z.infer<typeof registerSchema>;
