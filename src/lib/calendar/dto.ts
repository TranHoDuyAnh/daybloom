import type { CalendarEvent } from "@/db/schema";

export type CalendarEventDTO = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  category: string;
  color: string;
  location: string | null;
};

export function toEventDTO(event: CalendarEvent): CalendarEventDTO {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    allDay: event.allDay,
    category: event.category,
    color: event.color,
    location: event.location,
  };
}
