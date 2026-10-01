import enDict from '../dictionaries/en.json';
import bnDict from '../dictionaries/bn.json';

export type UserDetailsDictionary = typeof enDict.userDetails;

/**
 * Resolve the user-details copy for the active locale, falling back to English
 * for any locale other than Bangla.
 */
export function getUserDetailsDictionary(lang: string): UserDetailsDictionary {
  const dict = lang === 'bn' ? bnDict.userDetails : enDict.userDetails;
  return dict as UserDetailsDictionary;
}
