import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';

export interface GlobalResponse<T> {
  success: boolean;
  statusCode: number;
  path: string;
  timestamp: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, GlobalResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data) => {
        const contentType = response.getHeader('content-type');
        if (
          (typeof contentType === 'string' && contentType.includes('text/html')) ||
          (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE html'))
        ) {
          response.setHeader('content-type', 'text/html; charset=utf-8');
          return data;
        }

        return {
          success: true,
          statusCode: response.statusCode,
          path: request.url,
          timestamp: new Date().toISOString(),
          data,
        };
      }),
    );
  }
}
