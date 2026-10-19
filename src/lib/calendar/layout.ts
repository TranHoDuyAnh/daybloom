import { dateKeyRange, minutesSinceMidnight, toDateKey } from "@/lib/date";
import type { CalendarEventDTO } from "@/lib/calendar/dto";

export type DayEvent = {
  event: CalendarEventDTO;
  dateKey: string;
  startMinutes: number;
  endMinutes: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

export function eventsOnDay(events: CalendarEventDTO[], dateKey: string): DayEvent[] {
  const result: DayEvent[] = [];

  for (const event of events) {
    const startKey = toDateKey(event.startAt);
    const endKey = toDateKey(event.endAt);
    if (dateKey < startKey || dateKey > endKey) continue;

    const isStartDay = dateKey === startKey;
    const isEndDay = dateKey === endKey;
    const rawStart = isStartDay ? minutesSinceMidnight(new Date(event.startAt)) : 0;
    const rawEnd = isEndDay ? minutesSinceMidnight(new Date(event.endAt)) : 1440;
    const endMinutes = rawEnd <= rawStart ? 1440 : rawEnd;

    result.push({
      event,
      dateKey,
      startMinutes: rawStart,
      endMinutes,
      continuesBefore: !isStartDay,
      continuesAfter: !isEndDay,
    });
  }

  return result;
}

export function splitByAllDay(dayEvents: DayEvent[]): {
  allDay: DayEvent[];
  timed: DayEvent[];
} {
  const allDay: DayEvent[] = [];
  const timed: DayEvent[] = [];
  for (const dayEvent of dayEvents) {
    (dayEvent.event.allDay ? allDay : timed).push(dayEvent);
  }
  return { allDay, timed };
}

export type LaidOutEvent = DayEvent & {
  /** 0-based column index inside its overlap cluster. */
  column: number;
  /** Total columns in the overlap cluster. */
  columnCount: number;
};

/** Greedy column packing so overlapping events never cover each other. */
export function layoutTimedEvents(dayEvents: DayEvent[]): LaidOutEvent[] {
  const sorted = [...dayEvents].sort(
    (a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
  );

  const laidOut: LaidOutEvent[] = [];
  let cluster: LaidOutEvent[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    for (const item of cluster) item.columnCount = columnEnds.length;
    laidOut.push(...cluster);
    cluster = [];
    columnEnds = [];
    clusterEnd = -1;
  };

  for (const dayEvent of sorted) {
    if (cluster.length > 0 && dayEvent.startMinutes >= clusterEnd) flush();

    let column = columnEnds.findIndex((end) => end <= dayEvent.startMinutes);
    if (column === -1) {
      columnEnds.push(dayEvent.endMinutes);
      column = columnEnds.length - 1;
    } else {
      columnEnds[column] = dayEvent.endMinutes;
    }

    clusterEnd = Math.max(clusterEnd, dayEvent.endMinutes);
    cluster.push({ ...dayEvent, column, columnCount: 1 });
  }

  flush();
  return laidOut;
}

export function visibleDayKeys(from: string, to: string): string[] {
  return dateKeyRange(from, to);
}
