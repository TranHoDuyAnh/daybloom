"use client";

import {
  Activity,
  Briefcase,
  Coffee,
  GraduationCap,
  Heart,
  User,
} from "lucide-react";

import { resolveEventColor } from "@/lib/calendar/colors";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { formatDateTime } from "@/lib/date";
import { cn } from "cn";

function CategoryIcon({ category }: { category?: string | null }) {
  if (!category) return null;
  const sizeClass = "size-3 inline-block mr-1 opacity-75 shrink-0";
  if (category === "work") return <Briefcase className={sizeClass} />;
  if (category === "learning") return <GraduationCap className={sizeClass} />;
  if (category === "personal") return <User className={sizeClass} />;
  if (category === "health") return <Heart className={sizeClass} />;
  if (category === "exercise") return <Activity className={sizeClass} />;
  if (category === "relax") return <Coffee className={sizeClass} />;
  return null;
}

export function EventBlock({
  event,
  onSelect,
  className,
  showTime = false,
  muted = false,
}: {
  event: CalendarEventDTO;
  onSelect: (event: CalendarEventDTO) => void;
  className?: string;
  showTime?: boolean;
  muted?: boolean;
}) {
  const color = resolveEventColor(event.color);

  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onSelect(event);
      }}
      className={cn(
        "group relative flex w-full items-center truncate rounded-lg border-l-[3px] px-2 py-1 text-left text-xs font-medium shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0",
        muted && "opacity-75",
        className,
      )}
      style={{
        backgroundColor: color.soft,
        borderLeftColor: color.hex,
        color: color.ink,
      }}
      title={`${event.title}${event.location ? ` · ${event.location}` : ""}`}
    >
      <CategoryIcon category={event.category} />

      {showTime && !event.allDay && (
        <span className="mr-1 shrink-0 font-mono text-[10px] opacity-75">
          {formatDateTime(event.startAt, "HH:mm")}
        </span>
      )}
      <span className="truncate">{event.title}</span>
    </button>
  );
}
