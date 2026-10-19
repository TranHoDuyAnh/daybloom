import { messages } from "@/i18n";

export const EVENT_CATEGORY_IDS = [
  "work",
  "learning",
  "personal",
  "health",
  "exercise",
  "relax",
  "other",
] as const;

export type EventCategoryId = (typeof EVENT_CATEGORY_IDS)[number];

export const DEFAULT_CATEGORY: EventCategoryId = "personal";

/** ID dùng cho lưu trữ; `name` chỉ là nhãn hiển thị. */
export const EVENT_CATEGORIES = EVENT_CATEGORY_IDS.map((id) => ({
  id,
  name: messages.calendar.categories[id],
}));

export function categoryName(id: string | null | undefined): string {
  if (id && id in messages.calendar.categories) {
    return messages.calendar.categories[id as EventCategoryId];
  }
  return messages.calendar.categories.other;
}
