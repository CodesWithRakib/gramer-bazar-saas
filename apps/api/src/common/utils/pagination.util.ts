import { BadRequestException } from '@nestjs/common';
import { OffsetPaginationMeta, CursorPaginationMeta } from '@gramer-bazar/types';
import { PAGINATION_CONFIG } from '../dto/pagination.dto.js';

export class PaginationUtils {
  /**
   * Safely encode any payload into a base64 string cursor.
   */
  static encodeCursor<T>(payload: T): string {
    try {
      const json = JSON.stringify(payload);
      return Buffer.from(json).toString('base64');
    } catch (error) {
      throw new BadRequestException('Failed to encode cursor payload');
    }
  }

  /**
   * Safely decode a base64 string cursor back into the typed payload.
   */
  static decodeCursor<T>(cursor: string): T {
    try {
      const json = Buffer.from(cursor, 'base64').toString('utf-8');
      const payload = JSON.parse(json);
      
      if (!payload || typeof payload !== 'object') {
        throw new Error('Cursor must be an object');
      }

      return payload as T;
    } catch (error) {
      throw new BadRequestException('Invalid or malformed cursor');
    }
  }

  /**
   * Build Offset Pagination metadata.
   */
  static buildOffsetMeta(
    total: number,
    page: number = PAGINATION_CONFIG.DEFAULT_PAGE,
    limit: number = PAGINATION_CONFIG.DEFAULT_LIMIT,
  ): OffsetPaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      type: 'offset',
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Build Cursor Pagination metadata.
   * Typically items array contains limit + 1 items to check if there is a next page.
   * This function does NOT slice the array for you, ensure you slice the array before returning data.
   */
  static buildCursorMeta<T>(
    items: T[],
    requestedLimit: number,
    nextCursorPayload: unknown | null = null,
  ): CursorPaginationMeta {
    const hasNextPage = items.length > requestedLimit;
    
    return {
      type: 'cursor',
      limit: requestedLimit,
      hasNextPage,
      nextCursor: hasNextPage && nextCursorPayload ? this.encodeCursor(nextCursorPayload) : null,
    };
  }
}
