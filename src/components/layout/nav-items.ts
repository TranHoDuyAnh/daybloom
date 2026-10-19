import { BookHeart, CalendarDays } from "lucide-react";

import { messages } from "@/i18n";

export const NAV_ITEMS = [
  {
    href: "/calendar",
    label: messages.nav.calendar.label,
    description: messages.nav.calendar.description,
    icon: CalendarDays,
  },
  {
    href: "/journal",
    label: messages.nav.journal.label,
    description: messages.nav.journal.description,
    icon: BookHeart,
  },
];
