"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  Feather,
  Flag,
  Heart,
  Lightbulb,
  MapPin,
  Maximize2,
  Minimize2,
  Moon,
  Pin,
  Smile,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/i18n";
import { categoryName } from "@/lib/calendar/categories";
import { resolveEventColor } from "@/lib/calendar/colors";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { formatDateTime } from "@/lib/date";
import {
  MOOD_OPTIONS,
  SCALE_LABELS,
  type JournalField,
  type MoodId,
} from "@/lib/journal/template";
import { cn } from "cn";

/** Colors and styling details for Mood options */
const MOOD_COLOR_STYLES: Record<
  MoodId,
  { bg: string; border: string; text: string; activeBg: string }
> = {
  happy: {
    bg: "hover:bg-amber-500/10 hover:border-amber-400",
    border: "border-border",
    text: "text-amber-700 dark:text-amber-300",
    activeBg: "border-amber-400 bg-amber-500/15 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400/30",
  },
  calm: {
    bg: "hover:bg-emerald-500/10 hover:border-emerald-400",
    border: "border-border",
    text: "text-emerald-700 dark:text-emerald-300",
    activeBg: "border-emerald-400 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-400/30",
  },
  neutral: {
    bg: "hover:bg-slate-500/10 hover:border-slate-400",
    border: "border-border",
    text: "text-slate-700 dark:text-slate-300",
    activeBg: "border-slate-400 bg-slate-500/15 text-slate-800 dark:text-slate-200 ring-2 ring-slate-400/30",
  },
  sad: {
    bg: "hover:bg-blue-500/10 hover:border-blue-400",
    border: "border-border",
    text: "text-blue-700 dark:text-blue-300",
    activeBg: "border-blue-400 bg-blue-500/15 text-blue-800 dark:text-blue-200 ring-2 ring-blue-400/30",
  },
  stressed: {
    bg: "hover:bg-rose-500/10 hover:border-rose-400",
    border: "border-border",
    text: "text-rose-700 dark:text-rose-300",
    activeBg: "border-rose-400 bg-rose-500/15 text-rose-800 dark:text-rose-200 ring-2 ring-rose-400/30",
  },
  tired: {
    bg: "hover:bg-purple-500/10 hover:border-purple-400",
    border: "border-border",
    text: "text-purple-700 dark:text-purple-300",
    activeBg: "border-purple-400 bg-purple-500/15 text-purple-800 dark:text-purple-200 ring-2 ring-purple-400/30",
  },
};

export function MoodBentoCard({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}) {
  const selectedMood = MOOD_OPTIONS.find((m) => m.id === value);

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:p-5",
        selectedMood && "border-primary/30 bg-primary/[0.02]",
        className,
      )}
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Smile className="size-4" />
            </span>
            <div>
              <h4 className="font-heading text-sm font-semibold tracking-tight text-foreground">
                {messages.journal.template.fields.mood.label}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {messages.journal.template.fields.mood.hint}
              </p>
            </div>
          </div>

          {selectedMood && (
            <Badge
              variant="secondary"
              className="gap-1 border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
            >
              <span className="text-sm">{selectedMood.emoji}</span>
              {selectedMood.label}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {MOOD_OPTIONS.map((mood) => {
            const active = value === mood.id;
            const style = MOOD_COLOR_STYLES[mood.id];
            return (
              <button
                key={mood.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? null : mood.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                  active
                    ? style.activeBg
                    : cn("border-border bg-card/60 text-muted-foreground", style.bg),
                )}
              >
                <span className="text-2xl transition-transform group-hover:scale-105">
                  {mood.emoji}
                </span>
                <span className="truncate text-[11px] font-medium leading-none">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function EnergyBentoCard({
  value,
  onChange,
  className,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}) {
  const energyColors = [
    "bg-rose-500 text-white",
    "bg-orange-500 text-white",
    "bg-amber-500 text-white",
    "bg-emerald-500 text-white",
    "bg-teal-500 text-white",
  ];

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:p-5",
        value !== null && "border-amber-500/30 bg-amber-500/[0.02]",
        className,
      )}
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
              <Zap className="size-4" />
            </span>
            <div>
              <h4 className="font-heading text-sm font-semibold tracking-tight text-foreground">
                {messages.journal.template.fields.energyLevel.label}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {value !== null ? SCALE_LABELS[value] : messages.journal.template.fields.energyLevel.hint}
              </p>
            </div>
          </div>

          {value !== null && (
            <Badge
              variant="secondary"
              className={cn("px-2 py-0.5 text-xs font-semibold", energyColors[value - 1])}
            >
              {value}/5 · {SCALE_LABELS[value]}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((score) => {
            const active = value === score;
            const filled = value !== null && score <= value;
            return (
              <button
                key={score}
                type="button"
                aria-pressed={active}
                title={`${score}/5: ${SCALE_LABELS[score]}`}
                onClick={() => onChange(active ? null : score)}
                className={cn(
                  "flex h-11 flex-col items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                  active
                    ? cn("border-amber-500 ring-2 ring-amber-500/30", energyColors[score - 1])
                    : filled
                      ? "border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-200"
                      : "border-border bg-card text-muted-foreground hover:border-amber-400/40 hover:bg-amber-500/5",
                )}
              >
                <span className="text-sm">{score}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SleepBentoCard({
  value,
  onChange,
  className,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:p-5",
        value !== null && "border-indigo-500/30 bg-indigo-500/[0.02]",
        className,
      )}
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Moon className="size-4" />
            </span>
            <div>
              <h4 className="font-heading text-sm font-semibold tracking-tight text-foreground">
                {messages.journal.template.fields.sleepQuality.label}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {value !== null ? SCALE_LABELS[value] : messages.journal.template.fields.sleepQuality.hint}
              </p>
            </div>
          </div>

          {value !== null && (
            <Badge
              variant="secondary"
              className="border-indigo-400/30 bg-indigo-500/15 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
            >
              {value}/5 · {SCALE_LABELS[value]}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((score) => {
            const active = value === score;
            const filled = value !== null && score <= value;
            return (
              <button
                key={score}
                type="button"
                aria-pressed={active}
                title={`${score}/5: ${SCALE_LABELS[score]}`}
                onClick={() => onChange(active ? null : score)}
                className={cn(
                  "flex h-11 flex-col items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                  active
                    ? "border-indigo-500 bg-indigo-600 text-white ring-2 ring-indigo-500/30"
                    : filled
                      ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-800 dark:text-indigo-200"
                      : "border-border bg-card text-muted-foreground hover:border-indigo-400/40 hover:bg-indigo-500/5",
                )}
              >
                <span className="text-sm">{score}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function IntentionBentoCard({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();
  const filled = Boolean(value.trim());

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:p-5",
        filled && "border-primary/40 shadow-xs",
        className,
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <Label htmlFor={id} className="font-heading text-sm font-semibold tracking-tight text-foreground">
                {messages.journal.template.fields.intention.label}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {messages.journal.template.fields.intention.hint}
              </p>
            </div>
          </div>

          {filled && (
            <Badge variant="outline" className="border-primary/30 text-[11px] font-normal text-primary">
              Đã đặt tâm niệm
            </Badge>
          )}
        </div>

        <div className="relative">
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={messages.journal.template.fields.intention.placeholder}
            className="border-primary/20 bg-primary/[0.02] py-2 text-sm font-medium transition-all focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}

/** Configuration details for each reflection card type */
const REFLECTION_CONFIGS: Record<
  string,
  {
    icon: typeof Heart;
    iconBg: string;
    iconColor: string;
    borderActive: string;
    bgAccent: string;
    badgeLabel?: string;
  }
> = {
  gratitude: {
    icon: Heart,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderActive: "border-rose-400/50 focus-within:border-rose-500 focus-within:ring-rose-500/20",
    bgAccent: "from-rose-500/[0.04]",
    badgeLabel: "Biết ơn",
  },
  wentWell: {
    icon: Sun,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderActive: "border-amber-400/50 focus-within:border-amber-500 focus-within:ring-amber-500/20",
    bgAccent: "from-amber-500/[0.04]",
    badgeLabel: "Tốt đẹp",
  },
  accomplishments: {
    icon: Trophy,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderActive: "border-emerald-400/50 focus-within:border-emerald-500 focus-within:ring-emerald-500/20",
    bgAccent: "from-emerald-500/[0.04]",
    badgeLabel: "Thành tựu",
  },
  learnings: {
    icon: Lightbulb,
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderActive: "border-indigo-400/50 focus-within:border-indigo-500 focus-within:ring-indigo-500/20",
    bgAccent: "from-indigo-500/[0.04]",
    badgeLabel: "Bài học",
  },
  challenges: {
    icon: Compass,
    iconBg: "bg-slate-500/15",
    iconColor: "text-slate-600 dark:text-slate-400",
    borderActive: "border-slate-400/50 focus-within:border-slate-500 focus-within:ring-slate-500/20",
    bgAccent: "from-slate-500/[0.04]",
    badgeLabel: "Thử thách",
  },
  improvements: {
    icon: Target,
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-600 dark:text-sky-400",
    borderActive: "border-sky-400/50 focus-within:border-sky-500 focus-within:ring-sky-500/20",
    bgAccent: "from-sky-500/[0.04]",
    badgeLabel: "Cải thiện",
  },
  tomorrowPriority: {
    icon: Flag,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderActive: "border-amber-400/50 focus-within:border-amber-500 focus-within:ring-amber-500/20",
    bgAccent: "from-amber-500/[0.04]",
    badgeLabel: "Ưu tiên",
  },
  rememberNote: {
    icon: Pin,
    iconBg: "bg-teal-500/15",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderActive: "border-teal-400/50 focus-within:border-teal-500 focus-within:ring-teal-500/20",
    bgAccent: "from-teal-500/[0.04]",
    badgeLabel: "Ghi nhớ",
  },
  notes: {
    icon: Feather,
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderActive: "border-purple-400/50 focus-within:border-purple-500 focus-within:ring-purple-500/20",
    bgAccent: "from-purple-500/[0.04]",
    badgeLabel: "Ghi chú",
  },
};

export function BentoReflectionCard({
  field,
  value,
  onChange,
  className,
}: {
  field: JournalField;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();
  const config = REFLECTION_CONFIGS[field.key] ?? {
    icon: Sparkles,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    borderActive: "border-primary/40 focus-within:border-primary focus-within:ring-primary/20",
    bgAccent: "from-primary/[0.02]",
    badgeLabel: field.label,
  };
  const Icon = config.icon;
  const filled = Boolean(value.trim());

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br via-card to-card p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:p-5",
        config.bgAccent,
        config.borderActive,
        filled && "border-border shadow-xs",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", config.iconBg, config.iconColor)}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <Label htmlFor={id} className="font-heading text-sm font-semibold tracking-tight text-foreground">
                {field.label}
              </Label>
              {field.hint && (
                <p className="truncate text-[11px] text-muted-foreground">{field.hint}</p>
              )}
            </div>
          </div>

          {filled && (
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
              {value.trim().split(/\s+/).filter(Boolean).length} từ
            </span>
          )}
        </div>

        {field.type === "text" ? (
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="border-border/70 bg-card/60 text-sm transition-all focus:border-primary focus:bg-card"
          />
        ) : (
          <Textarea
            id={id}
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="min-h-20 resize-y border-border/70 bg-card/60 text-sm leading-relaxed transition-all focus:border-primary focus:bg-card"
          />
        )}
      </div>
    </div>
  );
}

export function ZenCanvasCard({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);

  const wordCount = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:p-6",
        expanded && "min-h-[500px]",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Feather className="size-4" />
            </span>
            <div>
              <Label htmlFor={id} className="font-heading text-base font-semibold tracking-tight text-foreground">
                {messages.journal.template.sections["free-writing"].title}
              </Label>
              <p className="text-xs text-muted-foreground">
                {messages.journal.template.sections["free-writing"].description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {wordCount} {messages.journal.wordCount ? "" : "từ"} · ~{readingTime} phút đọc
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
              title={expanded ? "Thu gọn" : "Mở rộng"}
            >
              {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
          </div>
        </div>

        <Textarea
          id={id}
          rows={expanded ? 18 : 8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={messages.journal.template.fields.freeWriting.placeholder}
          className="border-none bg-transparent p-1 font-serif text-base leading-relaxed tracking-normal shadow-none placeholder:font-sans placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:text-lg"
        />
      </div>
    </div>
  );
}

export function TodayCalendarEventsBentoCard({
  entryDate,
  events = [],
  className,
}: {
  entryDate: string;
  events?: CalendarEventDTO[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-4 transition-all duration-200 hover:border-border hover:shadow-xs sm:p-5",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4" />
            </span>
            <div>
              <h4 className="font-heading text-sm font-semibold tracking-tight text-foreground">
                Lịch trình ngày này
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Các sự kiện và hoạt động đã lên lịch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold">
              {events.length} sự kiện
            </Badge>
            <Link
              href={`/calendar?date=${entryDate}&view=day`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              title="Xem trên Lịch"
            >
              <span>Xem Lịch</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <span>Chưa có sự kiện nào trong lịch cho ngày này.</span>
            <Link
              href={`/calendar?date=${entryDate}&view=day`}
              className="font-medium text-primary hover:underline"
            >
              + Lên lịch ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {events.map((event) => {
              const color = resolveEventColor(event.color);
              const timeString = event.allDay
                ? "Cả ngày"
                : `${formatDateTime(event.startAt, "HH:mm")} - ${formatDateTime(event.endAt, "HH:mm")}`;

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card p-2.5 shadow-2xs transition-all hover:border-border"
                >
                  <div
                    className="mt-0.5 size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {event.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground/70" />
                        {timeString}
                      </span>
                      {event.category && (
                        <span className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                          {categoryName(event.category)}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-0.5 truncate text-[10px]">
                          <MapPin className="size-2.5 text-muted-foreground/70" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Fallback adapter for standard TemplateField */
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
  if (field.type === "mood") {
    return (
      <MoodBentoCard
        value={typeof value === "string" ? value : null}
        onChange={(next) => onValueChange(field.key, next)}
      />
    );
  }

  if (field.key === "energyLevel") {
    return (
      <EnergyBentoCard
        value={typeof value === "number" ? value : null}
        onChange={(next) => onValueChange(field.key, next)}
      />
    );
  }

  if (field.key === "sleepQuality") {
    return (
      <SleepBentoCard
        value={typeof value === "number" ? value : null}
        onChange={(next) => onValueChange(field.key, next)}
      />
    );
  }

  if (field.key === "intention") {
    return (
      <IntentionBentoCard
        value={typeof value === "string" ? value : ""}
        onChange={(next) => onTextChange(field.key, next)}
      />
    );
  }

  if (field.key === "freeWriting") {
    return (
      <ZenCanvasCard
        value={typeof value === "string" ? value : ""}
        onChange={(next) => onTextChange(field.key, next)}
      />
    );
  }

  return (
    <BentoReflectionCard
      field={field}
      value={typeof value === "string" ? value : ""}
      onChange={(next) => onTextChange(field.key, next)}
    />
  );
}
