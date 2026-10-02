import enDict from '../dictionaries/en.json';
import bnDict from '../dictionaries/bn.json';

export type BroadcastDictionary = typeof enDict.broadcast;

/**
 * Resolve the broadcast copy for the active locale, falling back to English for
 * any locale other than Bangla.
 */
export function getBroadcastDictionary(lang: string): BroadcastDictionary {
  const dict = lang === 'bn' ? bnDict.broadcast : enDict.broadcast;
  return dict as BroadcastDictionary;
}
