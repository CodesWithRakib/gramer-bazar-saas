import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      if (!client?.handshake) {
        return false;
      }

      const rawToken: unknown =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization;

      let authToken: string | null = null;
      if (typeof rawToken === 'string') {
        if (rawToken.startsWith('Bearer ')) {
          authToken = rawToken.slice(7).trim();
        } else {
          authToken = rawToken.trim();
        }
      }

      if (authToken === 'undefined' || authToken === 'null') {
        authToken = null;
      }

      if (!authToken && client.handshake.headers?.cookie) {
        const cookieStr = client.handshake.headers.cookie;
        const match = cookieStr.match(/access_token=([^;]+)/);
        if (match) {
          authToken = match[1];
        }
      }
      
      if (!authToken) {
        return false;
      }

      const payload = await this.jwtService.verifyAsync(authToken, {
        secret: this.configService.get<string>(
          'JWT_ACCESS_SECRET',
          'super-secret-key-for-dev-only',
        ),
      });
      
      client.user = payload;
      return true;
    } catch (err) {
      return false;
    }
  }
}
