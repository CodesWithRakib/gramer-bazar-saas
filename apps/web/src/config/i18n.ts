export const locales = ['bn', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'bn';

/** Support dynamic text direction: LTR for Bengali and English, RTL for Arabic/Urdu/Hebrew. */
export const getDirection = (locale?: string): 'ltr' | 'rtl' => {
  if (locale === 'ar' || locale === 'fa' || locale === 'ur' || locale === 'he') {
    return 'rtl';
  }
  return 'ltr';
};
