import { vi, type Messages } from "./messages/vi";

export const LOCALES = ["vi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

const catalogs: Record<Locale, Messages> = { vi };

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return catalogs[locale];
}

/** Bộ chuỗi đang dùng. Đổi `DEFAULT_LOCALE` để chuyển ngôn ngữ mặc định. */
export const messages = getMessages();

/** Thay `{key}` trong chuỗi mẫu bằng giá trị tương ứng. */
export function t(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Messages };
