import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true, description: 'Whether the operation was successful' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'HTTP response status code' })
  statusCode: number;

  @ApiProperty({ example: '/api/v1/resource', description: 'Request endpoint path' })
  path: string;

  @ApiProperty({
    example: '2026-09-26T10:00:00.000Z',
    description: 'Timestamp of the response in ISO-8601 format',
  })
  timestamp: string;
}

export class PaginationMetaDto {
  @ApiPropertyOptional({ example: 'offset', description: 'Pagination type (offset or cursor)' })
  type?: string;

  @ApiPropertyOptional({ example: 100, description: 'Total number of items found (Offset only)' })
  total?: number;

  @ApiPropertyOptional({ example: 1, description: 'Current page number (Offset only)' })
  page?: number;

  @ApiProperty({ example: 20, description: 'Items per page limit' })
  limit: number;

  @ApiPropertyOptional({ example: 5, description: 'Total number of pages (Offset only)' })
  totalPages?: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page available' })
  hasNextPage: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether there is a previous page available',
  })
  hasPreviousPage?: boolean;

  @ApiPropertyOptional({ example: 'eyJpZCI6IjEyMyJ9', description: 'Next page cursor (Cursor only)' })
  nextCursor?: string | null;

  @ApiPropertyOptional({ example: 'eyJpZCI6IjQ1NiJ9', description: 'Previous page cursor (Cursor only)' })
  previousCursor?: string | null;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false, description: 'Indicates failure' })
  success: boolean;

  @ApiProperty({ example: 400, description: 'HTTP error status code' })
  statusCode: number;

  @ApiProperty({
    example: '2026-09-26T10:00:00.000Z',
    description: 'Timestamp of the error in ISO-8601 format',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/resource', description: 'Request endpoint path' })
  path: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Validation failed or entity not found',
    description: 'Error message or list of validation error messages',
  })
  message: string | string[];

  @ApiPropertyOptional({ example: 'BAD_REQUEST', description: 'Machine-readable error code' })
  errorCode?: string;
}

export class MessageResponseDto {
  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Human-readable result message',
  })
  message: string;
}
