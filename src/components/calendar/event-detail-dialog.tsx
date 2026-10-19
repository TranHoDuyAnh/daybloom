"use client";

import { CalendarClock, MapPin, Pencil, Tag, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryName } from "@/lib/calendar/categories";
import { resolveEventColor } from "@/lib/calendar/colors";
import type { CalendarEventDTO } from "@/lib/calendar/dto";
import { formatDateTime } from "@/lib/date";
import { messages, t } from "@/i18n";

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  event: CalendarEventDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: CalendarEventDTO) => void;
  onDelete: (event: CalendarEventDTO) => void;
}) {
  if (!event) return null;

  const color = resolveEventColor(event.color);
  const timeLabel = event.allDay
    ? t(messages.calendar.detail.allDayAt, { date: formatDateTime(event.startAt, "dd/MM/yyyy") })
    : `${formatDateTime(event.startAt, "dd/MM/yyyy HH:mm")} → ${formatDateTime(
        event.endAt,
        "dd/MM/yyyy HH:mm",
      )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: color.hex }}
              aria-hidden
            />
            <Badge
              variant="secondary"
              className="font-normal"
              style={{ backgroundColor: color.soft, color: color.ink }}
            >
              {categoryName(event.category)}
            </Badge>
          </div>
          <DialogTitle className="font-heading text-xl leading-snug">{event.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <CalendarClock className="size-4" />
            {timeLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {event.location && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {event.location}
            </p>
          )}
          {event.description && (
            <p className="whitespace-pre-wrap rounded-xl bg-muted/60 p-3 leading-relaxed">
              {event.description}
            </p>
          )}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="size-3.5" />
            {t(messages.calendar.detail.colorLine, { name: color.name })}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive">
                <Trash2 className="size-4" />
                {messages.common.delete}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{messages.calendar.detail.deleteTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t(messages.calendar.detail.deleteDescription, { title: event.title })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(event)}
                >
                  {messages.calendar.detail.deleteConfirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {messages.common.close}
            </Button>
            <Button onClick={() => onEdit(event)}>
              <Pencil className="size-4" />
              {messages.common.edit}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
