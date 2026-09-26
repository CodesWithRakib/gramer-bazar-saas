import { applyDecorators, Type, HttpStatus } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiResponseDto,
  PaginationMetaDto,
  ApiErrorResponseDto,
  MessageResponseDto,
} from '../dto/api-response.dto.js';

export interface StandardResponseOptions {
  type?: Type<unknown> | string | [Type<unknown>];
  status?: number;
  description?: string;
  isArray?: boolean;
}

export function ApiStandardResponse(options: StandardResponseOptions = {}) {
  const status = options.status ?? HttpStatus.OK;
  const description = options.description ?? 'Successful operation';
  const isArray = options.isArray ?? Array.isArray(options.type);
  const targetType = Array.isArray(options.type) ? options.type[0] : options.type;

  const extraModels: Type<unknown>[] = [ApiResponseDto];

  let dataPropertySchema: Record<string, unknown> = {
    type: 'object',
    nullable: true,
  };

  if (targetType === String || targetType === 'string') {
    dataPropertySchema = { type: 'string', example: 'success' };
  } else if (targetType === Number || targetType === 'number') {
    dataPropertySchema = { type: 'number', example: 1 };
  } else if (targetType === Boolean || targetType === 'boolean') {
    dataPropertySchema = { type: 'boolean', example: true };
  } else if (typeof targetType === 'function') {
    extraModels.push(targetType as Type<unknown>);
    if (isArray) {
      dataPropertySchema = {
        type: 'array',
        items: { $ref: getSchemaPath(targetType as Type<unknown>) },
      };
    } else {
      dataPropertySchema = {
        $ref: getSchemaPath(targetType as Type<unknown>),
      };
    }
  }

  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            type: 'object',
            properties: {
              data: dataPropertySchema,
            },
          },
        ],
      },
    }),
  );
}

export function ApiStandardPaginatedResponse(
  itemDto: Type<unknown>,
  options: { status?: number; description?: string } = {},
) {
  const status = options.status ?? HttpStatus.OK;
  const description = options.description ?? 'Paginated list retrieved successfully';

  return applyDecorators(
    ApiExtraModels(ApiResponseDto, PaginationMetaDto, itemDto),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(itemDto) },
                  },
                  meta: {
                    $ref: getSchemaPath(PaginationMetaDto),
                  },
                },
                required: ['data', 'meta'],
              },
            },
          },
        ],
      },
    }),
  );
}

export function ApiStandardMessageResponse(options: { status?: number; description?: string } = {}) {
  return ApiStandardResponse({
    type: MessageResponseDto,
    status: options.status ?? HttpStatus.OK,
    description: options.description ?? 'Operation completed with message',
  });
}

export function ApiCommonErrors(statusCodes: number[] = [400, 401, 403, 404, 500]) {
  const decorators: MethodDecorator[] = [
    ApiExtraModels(ApiErrorResponseDto) as MethodDecorator,
  ];

  if (statusCodes.includes(400)) {
    decorators.push(
      ApiBadRequestResponse({
        type: ApiErrorResponseDto,
        description: 'Bad Request / Validation Failure',
      }) as MethodDecorator,
    );
  }
  if (statusCodes.includes(401)) {
    decorators.push(
      ApiUnauthorizedResponse({
        type: ApiErrorResponseDto,
        description: 'Unauthorized / Missing or Invalid Authentication Token',
      }) as MethodDecorator,
    );
  }
  if (statusCodes.includes(403)) {
    decorators.push(
      ApiForbiddenResponse({
        type: ApiErrorResponseDto,
        description: 'Forbidden / User lacks required role or permission',
      }) as MethodDecorator,
    );
  }
  if (statusCodes.includes(404)) {
    decorators.push(
      ApiNotFoundResponse({
        type: ApiErrorResponseDto,
        description: 'Not Found / Requested resource does not exist',
      }) as MethodDecorator,
    );
  }
  if (statusCodes.includes(409)) {
    decorators.push(
      ApiConflictResponse({
        type: ApiErrorResponseDto,
        description: 'Conflict / Resource conflict or duplicate state',
      }) as MethodDecorator,
    );
  }
  if (statusCodes.includes(500)) {
    decorators.push(
      ApiInternalServerErrorResponse({
        type: ApiErrorResponseDto,
        description: 'Internal Server Error / Unexpected server failure',
      }) as MethodDecorator,
    );
  }

  return applyDecorators(...decorators);
}
