interface ApiErrorBody {
  data?: { message?: string | string[] };
  message?: string;
}

/**
 * Extract a human-readable message from an unknown error thrown by RTK Query
 * (`{ data: { message } }`) or a plain `Error`.
 */
export function getApiErrorMessage(error: unknown): string | undefined {
  const err = error as ApiErrorBody;
  const message = err?.data?.message ?? err?.message;
  if (Array.isArray(message)) return message[0];
  return message;
}
