export const locales = ['bn', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'bn';

/** Both Bangla and English are LTR. If Arabic is added later, branch on a locale param. */
export const getDirection = (): 'ltr' => 'ltr';
