import type { BroadcastTemplateVariable } from '../entities/broadcast-template.entity.js';

/** Matches {{ variable_name }} placeholders (letters, digits, underscore, dot). */
const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

/** Extract unique variable keys referenced in a template body, in first-seen order. */
export function extractVariableKeys(body: string): string[] {
  const keys: string[] = [];
  for (const match of body.matchAll(VARIABLE_PATTERN)) {
    const key = match[1];
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}

/** Render a body for a recipient. Unknown placeholders are left untouched. */
export function renderTemplate(body: string, values: Record<string, string | number | null | undefined>): string {
  return body.replace(VARIABLE_PATTERN, (full, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? full : String(value);
  });
}

/** Placeholders referenced by the body but not supplied in `values`. */
export function findMissingVariables(
  body: string,
  values: Record<string, string | number | null | undefined>,
): string[] {
  return extractVariableKeys(body).filter(
    (key) => values[key] === undefined || values[key] === null || values[key] === '',
  );
}

/**
 * Structured (not raw-string) variable definitions derived from a template body.
 * Existing definitions keep their label/example metadata.
 */
export function buildVariableDefinitions(
  body: string,
  existing: BroadcastTemplateVariable[] = [],
): BroadcastTemplateVariable[] {
  const keys = extractVariableKeys(body);
  const byKey = new Map(existing.map((item) => [item.key, item]));
  return keys.map(
    (key) =>
      byKey.get(key) ?? {
        key,
        label: null,
        example: null,
        required: true,
      },
  );
}

/** True when any `{{...}}`-style value contains illegal characters. */
export function hasInvalidVariableSyntax(body: string): boolean {
  // Detect stray, malformed mustaches that would render unpredictably.
  const stripped = body.replace(VARIABLE_PATTERN, '');
  return stripped.includes('{{') || stripped.includes('}}');
}
