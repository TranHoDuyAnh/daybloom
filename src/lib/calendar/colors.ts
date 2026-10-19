export type EventColor = {
  id: string;
  name: string;
  hex: string;
  /** Darker ink used for text on top of `soft`. */
  ink: string;
  /** Tinted background used for chips and blocks. */
  soft: string;
};

export const EVENT_COLORS: EventColor[] = [
  { id: "lavender", name: "Lavender", hex: "#C6B4F5", ink: "#4B3A85", soft: "#EDE8FC" },
  { id: "coral", name: "Coral", hex: "#FF8274", ink: "#8C3529", soft: "#FFE4E0" },
  { id: "peach", name: "Peach", hex: "#FFB38A", ink: "#8A4A25", soft: "#FFEADF" },
  { id: "butter", name: "Butter Yellow", hex: "#F5D76E", ink: "#7A5D0E", soft: "#FCF2D3" },
  { id: "mint", name: "Mint", hex: "#9BD9B5", ink: "#276B45", soft: "#E2F5EA" },
  { id: "sky", name: "Sky Blue", hex: "#91C9F7", ink: "#1F5C8C", soft: "#E1F1FE" },
  { id: "rose", name: "Rose Pink", hex: "#F7A8C4", ink: "#8F3358", soft: "#FCE7EF" },
  { id: "sage", name: "Sage Green", hex: "#A8C6A1", ink: "#3D6437", soft: "#E9F1E7" },
  { id: "indigo", name: "Indigo", hex: "#6258E8", ink: "#3A31A8", soft: "#E4E1FB" },
  { id: "neutral", name: "Neutral Gray", hex: "#9CA0AE", ink: "#454A58", soft: "#EDEEF1" },
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
