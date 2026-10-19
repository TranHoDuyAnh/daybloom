import { z } from "zod";

import { EVENT_CATEGORY_IDS } from "@/lib/calendar/categories";
import { isHexColor } from "@/lib/calendar/colors";

const optionalText = (max = 4000) =>
  z
    .string()
    .max(max)
    .transform((value) => value.trim())
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional();

const colorSchema = z
  .string()
  .refine((value) => isHexColor(value) || /^[a-z]+$/.test(value), "Màu không hợp lệ");

export const eventInputSchema = z
  .object({
    title: z.string().trim().min(1, "Tên sự kiện không được để trống").max(200),
    description: optionalText(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    allDay: z.boolean().default(false),
    category: z.enum(EVENT_CATEGORY_IDS).default("other"),
    color: colorSchema.default("indigo"),
    location: optionalText(300),
  })
  .refine((value) => value.endAt.getTime() > value.startAt.getTime(), {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endAt"],
  });

export type EventInput = z.infer<typeof eventInputSchema>;

export const eventIdSchema = z.string().uuid();
