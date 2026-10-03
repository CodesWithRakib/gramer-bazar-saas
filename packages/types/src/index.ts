export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OffsetPaginationMeta {
  type: 'offset';
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPaginationMeta {
  type: 'cursor';
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  previousCursor?: string | null;
}

export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta;

export interface BaseListParams {
  /** Standardized text search parameter */
  q?: string;
  /** @deprecated Legacy search term. Use q instead. */
  search?: string;
  sort?: string;
}

export interface OffsetPaginationParams extends BaseListParams {
  page?: number;
  limit?: number;
}

export interface CursorPaginationParams extends BaseListParams {
  cursor?: string;
  limit?: number;
}

export type PaginatedResponse<T, M extends PaginationMeta = OffsetPaginationMeta> = {
  data: T[];
  meta: M & { pagination: M };
};
