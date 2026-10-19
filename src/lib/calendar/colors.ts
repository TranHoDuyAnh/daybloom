import { messages } from "@/i18n";

export type EventColor = {
  id: string;
  name: string;
  hex: string;
  /** Darker ink used for text on top of `soft`. */
  ink: string;
  /** Tinted background used for chips and blocks. */
  soft: string;
};

/** ID dùng cho lưu trữ; `name` chỉ là nhãn hiển thị (lấy từ i18n). */
export const EVENT_COLORS: EventColor[] = [
  { id: "lavender", name: messages.calendar.colors.lavender, hex: "#C6B4F5", ink: "#4B3A85", soft: "#EDE8FC" },
  { id: "coral", name: messages.calendar.colors.coral, hex: "#FF8274", ink: "#8C3529", soft: "#FFE4E0" },
  { id: "peach", name: messages.calendar.colors.peach, hex: "#FFB38A", ink: "#8A4A25", soft: "#FFEADF" },
  { id: "butter", name: messages.calendar.colors.butter, hex: "#F5D76E", ink: "#7A5D0E", soft: "#FCF2D3" },
  { id: "mint", name: messages.calendar.colors.mint, hex: "#9BD9B5", ink: "#276B45", soft: "#E2F5EA" },
  { id: "sky", name: messages.calendar.colors.sky, hex: "#91C9F7", ink: "#1F5C8C", soft: "#E1F1FE" },
  { id: "rose", name: messages.calendar.colors.rose, hex: "#F7A8C4", ink: "#8F3358", soft: "#FCE7EF" },
  { id: "sage", name: messages.calendar.colors.sage, hex: "#A8C6A1", ink: "#3D6437", soft: "#E9F1E7" },
  { id: "indigo", name: messages.calendar.colors.indigo, hex: "#6258E8", ink: "#3A31A8", soft: "#E4E1FB" },
  { id: "neutral", name: messages.calendar.colors.neutral, hex: "#9CA0AE", ink: "#454A58", soft: "#EDEEF1" },
];

export const DEFAULT_EVENT_COLOR = "indigo";

const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX_PATTERN.test(value);
}

/** Resolves a stored color value (palette id or #hex) into renderable styles. */
export function resolveEventColor(value: string | null | undefined): EventColor {
  if (!value) return EVENT_COLORS.find((c) => c.id === DEFAULT_EVENT_COLOR)!;

  const palette = EVENT_COLORS.find((c) => c.id === value);
  if (palette) return palette;

  if (isHexColor(value)) {
    return { id: value, name: value, hex: value, ink: "#282735", soft: `${value}33` };
  }

  return EVENT_COLORS.find((c) => c.id === DEFAULT_EVENT_COLOR)!;
}
