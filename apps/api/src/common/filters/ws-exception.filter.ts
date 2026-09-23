import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class AllWsExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(AllWsExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const errorResponse = exception instanceof WsException 
      ? exception.getError() 
      : (exception?.response || exception?.message || 'Internal server error');
      
    const message = typeof errorResponse === 'string' 
      ? errorResponse 
      : (Array.isArray(errorResponse?.message) 
          ? errorResponse.message.join(', ') 
          : errorResponse?.message || exception?.message || 'Internal server error');
    
    this.logger.error(`[WS Exception] ${message}`, exception?.stack);

    client.emit('exception', {
      status: 'error',
      message,
      error: errorResponse,
    });
  }
}

