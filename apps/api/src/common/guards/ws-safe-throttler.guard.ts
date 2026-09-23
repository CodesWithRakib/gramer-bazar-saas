import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class WsSafeThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Only apply rate limiting to standard HTTP requests.
    // WebSockets (context.getType() === 'ws') do not have Express response objects/headers,
    // which otherwise causes "res.header is not a function" exceptions.
    if (context.getType() !== 'http') {
      return true;
    }
    return super.canActivate(context);
  }
}
