import 'server-only';
import type { Locale } from '@/config/i18n';

const dictionaries = {
  bn: () => import('./../dictionaries/bn.json').then((module) => module.default),
  en: () => import('./../dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.bn();
};
