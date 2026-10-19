import { z } from "zod";

import { messages } from "@/i18n";
import { MOOD_IDS } from "@/lib/journal/template";

const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, messages.errors.invalidDate);

const longText = z
  .string()
  .max(20000)
  .transform((value) => value.trim())
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

const shortText = z
  .string()
  .max(500)
  .transform((value) => value.trim())
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

const scaleSchema = z.coerce.number().int().min(1).max(5).nullable().optional();

export const journalInputSchema = z.object({
  entryDate: dateKeySchema,
  title: shortText,
  mood: z.enum(MOOD_IDS).nullable().optional(),
  energyLevel: scaleSchema,
  sleepQuality: scaleSchema,
  intention: longText,
  wentWell: longText,
  accomplishments: longText,
  learnings: longText,
  challenges: longText,
  improvements: longText,
  gratitude: longText,
  tomorrowPriority: longText,
  rememberNote: longText,
  notes: longText,
  freeWriting: longText,
});

export type JournalInput = z.infer<typeof journalInputSchema>;
