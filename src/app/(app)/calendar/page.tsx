import { CalendarBoard } from "@/components/calendar/calendar-board";
import { requireUserId } from "@/lib/auth";
import { eventRangeBounds, listEventsInRange } from "@/lib/calendar/repository";
import { toEventDTO } from "@/lib/calendar/dto";
import { parseView, viewRange } from "@/lib/calendar/view";
import { resolveDateKey } from "@/lib/date";
import { listJournalSummaries } from "@/lib/journal/repository";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const params = await searchParams;
  const view = parseView(params.view);
  const dateKey = resolveDateKey(params.date);
  const userId = await requireUserId();

  const { from, to } = viewRange(view, dateKey);
  const bounds = eventRangeBounds(from, to);

  const [rows, journals] = await Promise.all([
    listEventsInRange(userId, bounds.from, bounds.to),
    listJournalSummaries(userId, { from, to }),
  ]);

  return (
    <CalendarBoard
      view={view}
      dateKey={dateKey}
      events={rows.map(toEventDTO)}
      journalEntries={journals.map((j) => ({
        entryDate: j.entryDate,
        mood: j.mood,
        title: j.title,
      }))}
    />
  );
}
