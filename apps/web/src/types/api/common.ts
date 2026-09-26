import type { components } from './generated.js';

export type Schema<T extends keyof components['schemas']> = components['schemas'][T];

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  path?: string;
  timestamp?: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type ApiErrorResponse = Schema<'ApiErrorResponseDto'>;
export type MessageResponse = Schema<'MessageResponseDto'>;
