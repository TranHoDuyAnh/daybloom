export const MOOD_OPTIONS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "neutral", label: "Neutral", emoji: "😐" },
  { id: "sad", label: "Sad", emoji: "😔" },
  { id: "stressed", label: "Stressed", emoji: "😣" },
  { id: "tired", label: "Tired", emoji: "😴" },
] as const;

export type MoodId = (typeof MOOD_OPTIONS)[number]["id"];

export const MOOD_IDS = MOOD_OPTIONS.map((m) => m.id) as [MoodId, ...MoodId[]];

export const SCALE_LABELS: Record<number, string> = {
  1: "Rất thấp",
  2: "Thấp",
  3: "Bình thường",
  4: "Tốt",
  5: "Rất tốt",
};

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

export const DAILY_JOURNAL_TEMPLATE: JournalTemplate = {
  id: "daily-journal",
  name: "Daily Journal",
  sections: [
    {
      id: "check-in",
      title: "A · Daily Check-in",
      description: "Ghi nhanh cảm giác của bạn trong ngày hôm nay.",
      fields: [
        { key: "mood", label: "Today's mood", hint: "Tâm trạng hôm nay", type: "mood" },
        {
          key: "energyLevel",
          label: "Energy level",
          hint: "Mức năng lượng (1–5)",
          type: "scale",
        },
        {
          key: "sleepQuality",
          label: "Sleep quality",
          hint: "Chất lượng giấc ngủ (1–5)",
          type: "scale",
        },
        {
          key: "intention",
          label: "Today's intention",
          hint: "Điều mình muốn tập trung hôm nay",
          type: "text",
          placeholder: "Hôm nay mình muốn dành năng lượng cho...",
        },
      ],
    },
    {
      id: "reflection",
      title: "B · Daily Reflection",
      description: "Không cần trả lời hết — chỉ viết những gì bạn muốn.",
      fields: [
        {
          key: "wentWell",
          label: "What went well today?",
          hint: "Hôm nay điều gì đã diễn ra tốt đẹp?",
          type: "textarea",
          placeholder: "Một khoảnh khắc khiến mình thấy nhẹ nhõm là...",
        },
        {
          key: "accomplishments",
          label: "What did I accomplish?",
          hint: "Hôm nay mình đã hoàn thành được những gì?",
          type: "textarea",
          placeholder: "Mình đã hoàn thành...",
        },
        {
          key: "learnings",
          label: "What did I learn?",
          hint: "Hôm nay mình học được điều gì mới?",
          type: "textarea",
          placeholder: "Mình nhận ra rằng...",
        },
        {
          key: "challenges",
          label: "What challenged me?",
          hint: "Điều gì khiến mình gặp khó khăn?",
          type: "textarea",
          placeholder: "Điều khó nhất hôm nay là...",
        },
        {
          key: "improvements",
          label: "What could I improve?",
          hint: "Ngày mai mình có thể cải thiện điều gì?",
          type: "textarea",
          placeholder: "Ngày mai mình sẽ thử...",
        },
        {
          key: "gratitude",
          label: "What am I grateful for?",
          hint: "Hôm nay mình biết ơn điều gì?",
          type: "textarea",
          placeholder: "Mình biết ơn vì...",
        },
      ],
    },
    {
      id: "tomorrow",
      title: "C · Tomorrow",
      fields: [
        {
          key: "tomorrowPriority",
          label: "My priority for tomorrow",
          hint: "Ưu tiên lớn nhất cho ngày mai",
          type: "text",
          placeholder: "Việc quan trọng nhất ngày mai là...",
        },
        {
          key: "rememberNote",
          label: "Something I want to remember",
          hint: "Một điều mình muốn ghi nhớ",
          type: "text",
          placeholder: "Mình muốn nhớ rằng...",
        },
        {
          key: "notes",
          label: "Notes",
          hint: "Ghi chú bổ sung",
          type: "textarea",
          placeholder: "Ghi chú thêm...",
        },
      ],
    },
    {
      id: "free-writing",
      title: "D · Free Writing",
      description: "Viết tự do, không theo format. Hỗ trợ Markdown đơn giản.",
      fields: [
        {
          key: "freeWriting",
          label: "Free journal",
          hint: "Vùng viết tự do",
          type: "markdown",
          placeholder: "Hôm nay mình nghĩ về...",
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
