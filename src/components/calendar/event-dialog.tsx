"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ColorPicker } from "@/components/calendar/color-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveEventAction } from "@/actions/calendar";
import { messages } from "@/i18n";
import { EVENT_CATEGORIES } from "@/lib/calendar/categories";
import { eventFormSchema, formValuesToPayload, type EventFormValues } from "@/lib/calendar/form";

export function EventDialog({
  open,
  onOpenChange,
  eventId,
  initialValues,
  onSaved,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
  initialValues: EventFormValues;
  onSaved: () => void;
  onDelete?: () => void;
}) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  const valuesRef = useRef(initialValues);
  valuesRef.current = initialValues;

  useEffect(() => {
    if (open) form.reset(valuesRef.current);
  }, [open, form]);

  const allDay = form.watch("allDay");

  async function onSubmit(values: EventFormValues) {
    const result = await saveEventAction(formValuesToPayload(values), eventId ?? undefined);
    if (!result.ok) {
      toast.error(result.error);
      const fieldErrors = result.fieldErrors ?? {};
      for (const [field, fieldMessages] of Object.entries(fieldErrors)) {
        if (field in values && fieldMessages?.length) {
          form.setError(field as keyof EventFormValues, { message: fieldMessages[0] });
        }
      }
      return;
    }
    toast.success(eventId ? messages.calendar.toastUpdated : messages.calendar.toastCreated);
    onOpenChange(false);
    onSaved();
  }

  const { errors, isSubmitting } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {eventId ? messages.calendar.dialog.titleEdit : messages.calendar.dialog.titleCreate}
          </DialogTitle>
          <DialogDescription>{messages.calendar.dialog.timezoneNote}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="event-title">{messages.calendar.dialog.titleLabel}</Label>
            <Input
              id="event-title"
              placeholder={messages.calendar.dialog.titlePlaceholder}
              autoFocus
              {...form.register("title")}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="event-allday" className="text-sm">
                {messages.calendar.dialog.allDayLabel}
              </Label>
              <p className="text-xs text-muted-foreground">{messages.calendar.dialog.allDayHint}</p>
            </div>
            <Switch
              id="event-allday"
              checked={allDay}
              onCheckedChange={(checked) => form.setValue("allDay", checked)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-start-date">{messages.calendar.dialog.startDate}</Label>
              <Input id="event-start-date" type="date" {...form.register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-start-time">{messages.calendar.dialog.startTime}</Label>
              <Input
                id="event-start-time"
                type="time"
                disabled={allDay}
                {...form.register("startTime")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end-date">{messages.calendar.dialog.endDate}</Label>
              <Input id="event-end-date" type="date" {...form.register("endDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end-time">{messages.calendar.dialog.endTime}</Label>
              <Input
                id="event-end-time"
                type="time"
                disabled={allDay}
                {...form.register("endTime")}
              />
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-category">{messages.calendar.dialog.category}</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) =>
                  form.setValue("category", value as EventFormValues["category"])
                }
              >
                <SelectTrigger id="event-category" className="w-full">
                  <SelectValue placeholder={messages.calendar.dialog.categoryPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">{messages.calendar.dialog.location}</Label>
              <Input
                id="event-location"
                placeholder={messages.common.optional}
                {...form.register("location")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{messages.calendar.dialog.color}</Label>
            <ColorPicker
              value={form.watch("color")}
              onChange={(color) => form.setValue("color", color)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">{messages.calendar.dialog.description}</Label>
            <Textarea
              id="event-description"
              rows={3}
              placeholder={messages.common.optional}
              {...form.register("description")}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {onDelete ? (
              <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                {messages.common.delete}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {messages.common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {eventId ? messages.calendar.dialog.save : messages.calendar.dialog.submit}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
