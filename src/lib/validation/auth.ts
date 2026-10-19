import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export type LoginValues = z.infer<typeof loginSchema>;
