"use client";

import { Check } from "lucide-react";

import { EVENT_COLORS, isHexColor, resolveEventColor } from "@/lib/calendar/colors";
import { messages } from "@/i18n";
import { cn } from "cn";
import { Input } from "@/components/ui/input";

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const resolved = resolveEventColor(value);
  const customValue = isHexColor(value) ? value : "";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {EVENT_COLORS.map((color) => {
          const active = resolved.id === color.id;
          return (
            <button
              key={color.id}
              type="button"
              title={color.name}
              aria-label={color.name}
              aria-pressed={active}
              onClick={() => onChange(color.id)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "ring-2 ring-foreground/40",
              )}
              style={{ backgroundColor: color.hex }}
            >
              {active && <Check className="size-4" style={{ color: color.ink }} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label
          className="text-xs text-muted-foreground"
          htmlFor="custom-event-color"
        >
          {messages.calendar.colorPicker.custom}
        </label>
        <Input
          id="custom-event-color"
          type="color"
          className="size-8 cursor-pointer p-1"
          value={isHexColor(value) ? value : resolved.hex}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <span className="font-mono text-xs text-muted-foreground">
          {customValue || resolved.name}
        </span>
      </div>
    </div>
  );
}
