import { z } from "zod";

import { messages } from "@/i18n";
import { DEFAULT_CATEGORY, EVENT_CATEGORY_IDS } from "@/lib/calendar/categories";
import { DEFAULT_EVENT_COLOR } from "@/lib/calendar/colors";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import {
  atZonedTime,
  endOfDay,
  formatDateTime,
  fromDateKey,
  minutesSinceMidnight,
  toDateKey,
} from "@/lib/date";
import type { EventInput } from "@/lib/validation/calendar";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, messages.errors.invalidDate);
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, messages.errors.invalidClock);

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, messages.errors.titleRequired).max(200),
    description: z.string().max(4000),
    location: z.string().max(300),
    allDay: z.boolean(),
    startDate: dateKeySchema,
    startTime: timeSchema,
    endDate: dateKeySchema,
    endTime: timeSchema,
    category: z.enum(EVENT_CATEGORY_IDS),
    color: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    const start = `${value.startDate} ${value.startTime}`;
    const end = `${value.endDate} ${value.endTime}`;
    if (value.allDay) {
      if (value.endDate < value.startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: messages.errors.endDateBeforeStart,
        });
      }
      return;
    }
    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: messages.errors.endBeforeStart,
      });
    }
  });

export type EventFormValues = z.input<typeof eventFormSchema>;

function parseTime(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(":").map(Number);
  return { hours, minutes };
}

export function formValuesToPayload(values: EventFormValues): EventInput {
  if (values.allDay) {
    const startAt = fromDateKey(values.startDate);
    const endDate =
      values.endDate && values.endDate >= values.startDate ? values.endDate : values.startDate;
    return {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      startAt,
      endAt: endOfDay(fromDateKey(endDate)),
      allDay: true,
      category: values.category,
      color: values.color,
      location: values.location?.trim() || null,
    };
  }

  const start = parseTime(values.startTime);
  const end = parseTime(values.endTime);
  return {
    title: values.title.trim(),
    description: values.description?.trim() || null,
    startAt: atZonedTime(values.startDate, start.hours, start.minutes),
    endAt: atZonedTime(values.endDate, end.hours, end.minutes),
    allDay: false,
    category: values.category,
    color: values.color,
    location: values.location?.trim() || null,
  };
}

export function eventToFormValues(event: CalendarEventDTO): EventFormValues {
  const startKey = toDateKey(event.startAt);
  const endKey = toDateKey(event.endAt);
  return {
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    allDay: event.allDay,
    startDate: startKey,
    startTime: formatDateTime(event.startAt, "HH:mm"),
    endDate: endKey,
    endTime: event.allDay ? "23:59" : formatDateTime(event.endAt, "HH:mm"),
    category: event.category as (typeof EVENT_CATEGORY_IDS)[number],
    color: event.color,
  };
}

/** Defaults used when creating an event from a click on the calendar grid. */
export function defaultFormValues(options: {
  dateKey: string;
  startMinutes?: number;
  allDay?: boolean;
}): EventFormValues {
  const { dateKey } = options;
  const allDay = options.allDay ?? false;
  const startMinutes = options.startMinutes ?? 9 * 60;
  const endMinutes = Math.min(startMinutes + 60, 23 * 60 + 59);
  const pad = (n: number) => String(n).padStart(2, "0");
  const toTime = (minutes: number) =>
    `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

  return {
    title: "",
    description: "",
    location: "",
    allDay,
    startDate: dateKey,
    startTime: toTime(startMinutes),
    endDate: dateKey,
    endTime: toTime(endMinutes),
    category: DEFAULT_CATEGORY,
    color: DEFAULT_EVENT_COLOR,
  };
}

export function formValuesFromEventStart(event: CalendarEventDTO): number {
  return minutesSinceMidnight(new Date(event.startAt));
}
