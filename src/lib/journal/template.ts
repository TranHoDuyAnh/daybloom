import { messages } from "@/i18n";

export const MOOD_IDS = ["happy", "calm", "neutral", "sad", "stressed", "tired"] as const;

export type MoodId = (typeof MOOD_IDS)[number];

export const MOOD_EMOJI: Record<MoodId, string> = {
  happy: "😊",
  calm: "😌",
  neutral: "😐",
  sad: "😔",
  stressed: "😣",
  tired: "😴",
};

/** ID dùng cho lưu trữ; `label` chỉ là nhãn hiển thị (lấy từ i18n). */
export const MOOD_OPTIONS = MOOD_IDS.map((id) => ({
  id,
  label: messages.journal.moods[id],
  emoji: MOOD_EMOJI[id],
}));

export const SCALE_LABELS: Record<number, string> = messages.journal.scale;

export type JournalFieldType = "text" | "textarea" | "markdown" | "mood" | "scale";

export type JournalField = {
  key: string;
  label: string;
  hint?: string;
  type: JournalFieldType;
  placeholder?: string;
};

export type JournalSection = {
  id: string;
  title: string;
  description?: string;
  fields: JournalField[];
};

export type JournalTemplate = {
  id: string;
  name: string;
  sections: JournalSection[];
};

const TEMPLATE = messages.journal.template;
const FIELDS = TEMPLATE.fields;

export const DAILY_JOURNAL_TEMPLATE: JournalTemplate = {
  id: "daily-journal",
  name: TEMPLATE.name,
  sections: [
    {
      id: "check-in",
      title: TEMPLATE.sections["check-in"].title,
      description: TEMPLATE.sections["check-in"].description,
      fields: [
        { key: "mood", type: "mood", label: FIELDS.mood.label, hint: FIELDS.mood.hint },
        {
          key: "energyLevel",
          type: "scale",
          label: FIELDS.energyLevel.label,
          hint: FIELDS.energyLevel.hint,
        },
        {
          key: "sleepQuality",
          type: "scale",
          label: FIELDS.sleepQuality.label,
          hint: FIELDS.sleepQuality.hint,
        },
        {
          key: "intention",
          type: "text",
          label: FIELDS.intention.label,
          hint: FIELDS.intention.hint,
          placeholder: FIELDS.intention.placeholder,
        },
      ],
    },
    {
      id: "reflection",
      title: TEMPLATE.sections.reflection.title,
      description: TEMPLATE.sections.reflection.description,
      fields: [
        {
          key: "wentWell",
          type: "textarea",
          label: FIELDS.wentWell.label,
          hint: FIELDS.wentWell.hint,
          placeholder: FIELDS.wentWell.placeholder,
        },
        {
          key: "accomplishments",
          type: "textarea",
          label: FIELDS.accomplishments.label,
          hint: FIELDS.accomplishments.hint,
          placeholder: FIELDS.accomplishments.placeholder,
        },
        {
          key: "learnings",
          type: "textarea",
          label: FIELDS.learnings.label,
          hint: FIELDS.learnings.hint,
          placeholder: FIELDS.learnings.placeholder,
        },
        {
          key: "challenges",
          type: "textarea",
          label: FIELDS.challenges.label,
          hint: FIELDS.challenges.hint,
          placeholder: FIELDS.challenges.placeholder,
        },
        {
          key: "improvements",
          type: "textarea",
          label: FIELDS.improvements.label,
          hint: FIELDS.improvements.hint,
          placeholder: FIELDS.improvements.placeholder,
        },
        {
          key: "gratitude",
          type: "textarea",
          label: FIELDS.gratitude.label,
          hint: FIELDS.gratitude.hint,
          placeholder: FIELDS.gratitude.placeholder,
        },
      ],
    },
    {
      id: "tomorrow",
      title: TEMPLATE.sections.tomorrow.title,
      fields: [
        {
          key: "tomorrowPriority",
          type: "text",
          label: FIELDS.tomorrowPriority.label,
          hint: FIELDS.tomorrowPriority.hint,
          placeholder: FIELDS.tomorrowPriority.placeholder,
        },
        {
          key: "rememberNote",
          type: "text",
          label: FIELDS.rememberNote.label,
          hint: FIELDS.rememberNote.hint,
          placeholder: FIELDS.rememberNote.placeholder,
        },
        {
          key: "notes",
          type: "textarea",
          label: FIELDS.notes.label,
          hint: FIELDS.notes.hint,
          placeholder: FIELDS.notes.placeholder,
        },
      ],
    },
    {
      id: "free-writing",
      title: TEMPLATE.sections["free-writing"].title,
      description: TEMPLATE.sections["free-writing"].description,
      fields: [
        {
          key: "freeWriting",
          type: "markdown",
          label: FIELDS.freeWriting.label,
          hint: FIELDS.freeWriting.hint,
          placeholder: FIELDS.freeWriting.placeholder,
        },
      ],
    },
  ],
};

export const TEMPLATES: Record<string, JournalTemplate> = {
  [DAILY_JOURNAL_TEMPLATE.id]: DAILY_JOURNAL_TEMPLATE,
};

export const JOURNAL_FIELD_KEYS = DAILY_JOURNAL_TEMPLATE.sections.flatMap((section) =>
  section.fields.map((field) => field.key),
);

/** Quick preview text used in the journal list. */
export function journalPreview(journal: Record<string, unknown>): string {
  const candidates = [
    journal.intention,
    journal.wentWell,
    journal.gratitude,
    journal.notes,
    journal.freeWriting,
  ];
  const hit = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  return typeof hit === "string" ? hit.trim().replace(/\s+/g, " ").slice(0, 120) : "";
}
