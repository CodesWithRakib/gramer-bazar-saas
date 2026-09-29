/**
 * Extract a human-readable message from an unknown error thrown by RTK Query
 * (`{ data: { message } }`), a plain `Error`, or anything else — without
 * resorting to `any`.
 *
 * Handles NestJS payloads (`{ message, error }`), validation message arrays,
 * and `FetchBaseQueryError` string bodies.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' && error.trim() ? error : fallback;
  }

  const record = error as Record<string, unknown>;

  if ('status' in record) {
    const { data } = record as { data?: unknown };
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; error?: unknown };
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }
      if (Array.isArray(payload.message) && typeof payload.message[0] === 'string') {
        return payload.message[0];
      }
      if (typeof payload.error === 'string' && payload.error.trim()) {
        return payload.error;
      }
    }
    return fallback;
  }

  const data = record.data as { message?: unknown } | undefined;
  if (data && typeof data === 'object') {
    const message = data.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  }

  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }

  return fallback;
}
