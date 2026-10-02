import enDict from '../dictionaries/en.json';
import bnDict from '../dictionaries/bn.json';

export type ImpersonationAuditDictionary = typeof enDict.impersonationAudit;

/**
 * Resolve the impersonation-audit copy for the active locale, falling back to
 * English for any locale other than Bangla.
 */
export function getImpersonationAuditDictionary(lang: string): ImpersonationAuditDictionary {
  const dict = lang === 'bn' ? bnDict.impersonationAudit : enDict.impersonationAudit;
  return dict as ImpersonationAuditDictionary;
}
