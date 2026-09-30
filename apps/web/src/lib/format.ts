/**
 * Locale-aware display formatting shared by every page.
 *
 * Previously each page inlined `৳{value}` and `new Date(x).toLocaleString()`,
 * which produced English-only dates for Bangla users and inconsistent money
 * formatting. Use these helpers instead of hand-rolled formatting.
 */

export type AppLang = string | undefined | null;

export function isBangla(lang: AppLang): boolean {
  return lang === 'bn';
}

/** `bn-BD` for Bangla, `en-GB` otherwise (day-first, familiar in BD). */
export function dateLocale(lang: AppLang): string {
  return isBangla(lang) ? 'bn-BD' : 'en-GB';
}

function toNumber(value: number | string | null | undefined): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return typeof num === 'number' && Number.isFinite(num) ? num : 0;
}

/**
 * Formats a BDT amount as `৳1,250` (or `৳১,২৫০` if Bangla locale requested).
 * Prices in the catalog are whole taka in practice, so decimals only appear
 * when they actually exist.
 */
export function formatCurrency(value: number | string | null | undefined, lang?: AppLang): string {
  const amount = toNumber(value);
  const locale = isBangla(lang) ? 'bn-BD' : 'en-US';
  return `৳${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/** Grouped plain number, e.g. `1,250` or `১,২৫০`. */
export function formatNumber(value: number | string | null | undefined, lang?: AppLang): string {
  const locale = isBangla(lang) ? 'bn-BD' : 'en-US';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(toNumber(value));
}

export function formatDate(
  value: string | number | Date | null | undefined,
  lang: AppLang,
  style: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(dateLocale(lang), { dateStyle: style }).format(date);
}

export function formatDateTime(
  value: string | number | Date | null | undefined,
  lang: AppLang
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatTime(
  value: string | number | Date | null | undefined,
  lang: AppLang
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(dateLocale(lang), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** `#A1B2C3D4` — short, human-readable order/dispute reference. */
export function formatReference(id?: string | null, length = 8): string {
  if (!id) return '';
  return `#${id.replace(/-/g, '').slice(0, length).toUpperCase()}`;
}
