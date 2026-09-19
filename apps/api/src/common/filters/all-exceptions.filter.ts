import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `HTTP Status: ${status} Error Message: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || message,
      errorCode: typeof message === 'object' && (message as any).error ? (message as any).error : undefined,
      // Provide detailed error in development for debugging
      debug: status === HttpStatus.INTERNAL_SERVER_ERROR ? {
        message: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      } : undefined,
    };

    response.status(status).json(errorResponse);
  }
}
