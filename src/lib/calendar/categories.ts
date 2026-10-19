export const EVENT_CATEGORIES = [
  { id: "work", name: "Work" },
  { id: "learning", name: "Learning" },
  { id: "personal", name: "Personal" },
  { id: "health", name: "Health" },
  { id: "exercise", name: "Exercise" },
  { id: "relax", name: "Relax" },
  { id: "other", name: "Other" },
] as const;

export type EventCategoryId = (typeof EVENT_CATEGORIES)[number]["id"];

export const DEFAULT_CATEGORY: EventCategoryId = "personal";

export const EVENT_CATEGORY_IDS = EVENT_CATEGORIES.map((c) => c.id) as [
  EventCategoryId,
  ...EventCategoryId[],
];

export function categoryName(id: string | null | undefined): string {
  return EVENT_CATEGORIES.find((c) => c.id === id)?.name ?? "Other";
}
