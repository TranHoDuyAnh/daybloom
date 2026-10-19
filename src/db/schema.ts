import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").notNull().default(false),
    category: text("category").notNull().default("other"),
    color: text("color").notNull().default("indigo"),
    location: text("location"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("calendar_events_user_start_idx").on(table.userId, table.startAt),
    index("calendar_events_user_end_idx").on(table.userId, table.endAt),
  ],
);

export const dailyJournals = pgTable(
  "daily_journals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entryDate: date("entry_date").notNull(),
    title: text("title"),
    mood: text("mood"),
    energyLevel: integer("energy_level"),
    sleepQuality: integer("sleep_quality"),
    intention: text("intention"),
    wentWell: text("went_well"),
    accomplishments: text("accomplishments"),
    learnings: text("learnings"),
    challenges: text("challenges"),
    improvements: text("improvements"),
    gratitude: text("gratitude"),
    tomorrowPriority: text("tomorrow_priority"),
    rememberNote: text("remember_note"),
    notes: text("notes"),
    freeWriting: text("free_writing"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_journals_user_date_unique").on(table.userId, table.entryDate),
    index("daily_journals_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
export type DailyJournal = typeof dailyJournals.$inferSelect;
export type User = typeof users.$inferSelect;
