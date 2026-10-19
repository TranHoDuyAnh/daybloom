"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOOD_OPTIONS, SCALE_LABELS, type JournalField } from "@/lib/journal/template";
import { cn } from "cn";

export function MoodPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_OPTIONS.map((mood) => {
        const active = value === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : mood.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <span aria-hidden>{mood.emoji}</span>
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}

export function ScalePicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[1, 2, 3, 4, 5].map((score) => {
        const active = value === score;
        return (
          <button
            key={score}
            type="button"
            aria-pressed={active}
            title={SCALE_LABELS[score]}
            onClick={() => onChange(active ? null : score)}
            className={cn(
              "size-9 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {score}
          </button>
        );
      })}
      {value !== null && (
        <span className="text-xs text-muted-foreground">{SCALE_LABELS[value]}</span>
      )}
    </div>
  );
}

export function TemplateField({
  field,
  value,
  onTextChange,
  onValueChange,
}: {
  field: JournalField;
  value: string | number | null;
  onTextChange: (key: string, value: string) => void;
  onValueChange: (key: string, value: string | number | null) => void;
}) {
  const fieldId = `journal-${field.key}`;

  if (field.type === "mood") {
    return (
      <div className="space-y-2">
        <FieldLabel field={field} htmlFor={fieldId} />
        <MoodPicker
          value={typeof value === "string" ? value : null}
          onChange={(next) => onValueChange(field.key, next)}
        />
      </div>
    );
  }

  if (field.type === "scale") {
    return (
      <div className="space-y-2">
        <FieldLabel field={field} htmlFor={fieldId} />
        <ScalePicker
          value={typeof value === "number" ? value : null}
          onChange={(next) => onValueChange(field.key, next)}
        />
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="space-y-2">
        <FieldLabel field={field} htmlFor={fieldId} />
        <Input
          id={fieldId}
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(event) => onTextChange(field.key, event.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel field={field} htmlFor={fieldId} />
      <Textarea
        id={fieldId}
        rows={field.type === "markdown" ? 8 : 3}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        className={field.type === "markdown" ? "min-h-40 leading-relaxed" : undefined}
        onChange={(event) => onTextChange(field.key, event.target.value)}
      />
    </div>
  );
}

function FieldLabel({ field, htmlFor }: { field: JournalField; htmlFor: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {field.label}
      </Label>
      {field.hint && <span className="text-xs text-muted-foreground">{field.hint}</span>}
    </div>
  );
}
