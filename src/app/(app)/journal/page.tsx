import { JournalWorkspace } from "@/components/journal/journal-workspace";
import { requireUserId } from "@/lib/auth";
import { resolveDateKey } from "@/lib/date";
import { toJournalRecord } from "@/lib/journal/form";
import { getJournalByDate, listJournalSummaries } from "@/lib/journal/repository";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; q?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dateKey = resolveDateKey(params.date);
  const query = {
    search: params.q?.trim() ?? "",
    from: params.from ?? "",
    to: params.to ?? "",
  };

  const userId = await requireUserId();
  const [journal, summaries] = await Promise.all([
    getJournalByDate(userId, dateKey),
    listJournalSummaries(userId, {
      from: query.from || undefined,
      to: query.to || undefined,
      search: query.search || undefined,
    }),
  ]);

  return (
    <JournalWorkspace
      dateKey={dateKey}
      journal={journal ? toJournalRecord(journal) : null}
      entries={summaries.map((entry) => ({
        ...entry,
        updatedAt: entry.updatedAt.toISOString(),
      }))}
      query={query}
      initialPane={params.date ? "editor" : "list"}
    />
  );
}
