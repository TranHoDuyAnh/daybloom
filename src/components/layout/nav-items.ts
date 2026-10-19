import { BookHeart, CalendarDays } from "lucide-react";

export const NAV_ITEMS = [
  {
    href: "/calendar",
    label: "Calendar",
    description: "Lịch cá nhân",
    icon: CalendarDays,
  },
  {
    href: "/journal",
    label: "Journal",
    description: "Sổ tay hằng ngày",
    icon: BookHeart,
  },
] as const;
