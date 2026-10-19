import { getDaysInMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

import { APP_TIMEZONE } from "@/lib/constants";

export type DateKey = string; // yyyy-MM-dd in APP_TIMEZONE

export function toDateKey(value: Date | string): DateKey {
  const date = typeof value === "string" ? new Date(value) : value;
  return formatInTimeZone(date, APP_TIMEZONE, "yyyy-MM-dd");
}

export function fromDateKey(key: DateKey): Date {
  return fromZonedTime(`${key}T00:00:00`, APP_TIMEZONE);
}

/** Wall-clock parts of a Date as seen in APP_TIMEZONE. */
export function zonedParts(value: Date): {
  key: DateKey;
  hours: number;
  minutes: number;
} {
  const zoned = toZonedTime(value, APP_TIMEZONE);
  return {
    key: formatInTimeZone(value, APP_TIMEZONE, "yyyy-MM-dd"),
    hours: zoned.getHours(),
    minutes: zoned.getMinutes(),
  };
}

/** Sends a UTC instant to a wall-clock time on the given day in APP_TIMEZONE. */
export function atZonedTime(key: DateKey, hours: number, minutes: number): Date {
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return fromZonedTime(`${key}T${hh}:${mm}:00`, APP_TIMEZONE);
}

export function minutesSinceMidnight(value: Date): number {
  const { hours, minutes } = zonedParts(value);
  return hours * 60 + minutes;
}

export function startOfDay(value: Date): Date {
  return fromDateKey(toDateKey(value));
}

export function endOfDay(value: Date): Date {
  return new Date(startOfDay(value).getTime() + 86_400_000 - 1);
}

export function addDays(value: Date, amount: number): Date {
  return new Date(value.getTime() + amount * 86_400_000);
}

export function addDateKeyDays(key: DateKey, amount: number): DateKey {
  return toDateKey(addDays(fromDateKey(key), amount));
}

/** Monday-based start of week, as a DateKey. */
export function startOfWeekKey(key: DateKey): DateKey {
  const date = fromDateKey(key);
  const weekday = Number(formatInTimeZone(date, APP_TIMEZONE, "i")); // 1 = Monday
  return addDateKeyDays(key, 1 - weekday);
}

export function startOfMonthKey(key: DateKey): DateKey {
  return `${key.slice(0, 7)}-01`;
}

export function endOfMonthKey(key: DateKey): DateKey {
  const date = toZonedTime(fromDateKey(key), APP_TIMEZONE);
  const lastDay = getDaysInMonth(date);
  return `${key.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
}

export function dateKeyRange(start: DateKey, end: DateKey): DateKey[] {
  const keys: DateKey[] = [];
  let cursor = start;
  while (cursor <= end) {
    keys.push(cursor);
    cursor = addDateKeyDays(cursor, 1);
  }
  return keys;
}

export function formatDateKey(key: DateKey, pattern: string): string {
  return formatInTimeZone(fromDateKey(key), APP_TIMEZONE, pattern, { locale: vi });
}

/** Validates a `yyyy-MM-dd` query param, falling back to today in APP_TIMEZONE. */
export function resolveDateKey(value: string | undefined | null): DateKey {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) return value;
  }
  return toDateKey(new Date());
}

export function formatDateTime(value: Date | string, pattern: string): string {
  return formatInTimeZone(
    typeof value === "string" ? new Date(value) : value,
    APP_TIMEZONE,
    pattern,
    { locale: vi },
  );
}
