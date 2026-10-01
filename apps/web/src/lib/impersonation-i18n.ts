import enDict from '../dictionaries/en.json';
import bnDict from '../dictionaries/bn.json';

export type ImpersonationDictionary = typeof enDict.impersonation;

/**
 * Resolve the impersonation copy for the active locale. Falls back to English
 * for any locale other than Bangla so user-facing text is never hardcoded.
 */
export function getImpersonationDictionary(lang: string): ImpersonationDictionary {
  const dict = lang === 'bn' ? bnDict.impersonation : enDict.impersonation;
  return dict as ImpersonationDictionary;
}
