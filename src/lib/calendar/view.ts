import {
  addDateKeyDays,
  endOfMonthKey,
  formatDateKey,
  startOfMonthKey,
  startOfWeekKey,
} from "@/lib/date";

export type CalendarView = "month" | "week" | "day";

export const CALENDAR_VIEWS: CalendarView[] = ["month", "week", "day"];

export function parseView(value: string | undefined): CalendarView {
  return value === "month" || value === "day" || value === "week" ? value : "week";
}

/** Visible day-key range for a view, including the days that bleed into the grid. */
export function viewRange(view: CalendarView, dateKey: string): { from: string; to: string } {
  if (view === "day") return { from: dateKey, to: dateKey };

  if (view === "week") {
    const from = startOfWeekKey(dateKey);
    return { from, to: addDateKeyDays(from, 6) };
  }

  const from = startOfWeekKey(startOfMonthKey(dateKey));
  const lastWeekStart = startOfWeekKey(endOfMonthKey(dateKey));
  return { from, to: addDateKeyDays(lastWeekStart, 6) };
}

export function shiftDateKey(view: CalendarView, dateKey: string, direction: -1 | 1): string {
  if (view === "day") return addDateKeyDays(dateKey, direction);
  if (view === "week") return addDateKeyDays(dateKey, direction * 7);

  const shifted = addDateKeyDays(startOfMonthKey(dateKey), direction * 32);
  return startOfMonthKey(shifted);
}

export function periodLabel(view: CalendarView, dateKey: string): string {
  if (view === "month") {
    const label = formatDateKey(dateKey, "MMMM, yyyy");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  if (view === "day") {
    const label = formatDateKey(dateKey, "EEEE, dd/MM/yyyy");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  const { from, to } = viewRange("week", dateKey);
  return `${formatDateKey(from, "dd/MM")} – ${formatDateKey(to, "dd/MM/yyyy")}`;
}
