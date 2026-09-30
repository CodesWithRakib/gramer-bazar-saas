/**
 * Converts an arbitrary display name into a URL-safe slug segment.
 * Non-latin (e.g. Bangla) scripts are stripped, so a fallback is applied when
 * nothing usable remains.
 */
export function slugify(value: string, fallback = 'item', maxLength = 80): string {
  const base = (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, maxLength);

  return base || fallback;
}

/**
 * Appends a short random suffix so generated slugs stay unique without a
 * round-trip to the database.
 */
export function slugifyUnique(value: string, fallback = 'item', maxLength = 80): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugify(value, fallback, maxLength)}-${suffix}`;
}
