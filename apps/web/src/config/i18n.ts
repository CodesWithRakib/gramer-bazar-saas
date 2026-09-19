/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export const locales = ['bn', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'bn';

export function getDirection(_locale: string) {
  // Both Bangla and English are LTR. If Arabic is added later, return 'rtl' for 'ar'.
  return 'ltr';
}
