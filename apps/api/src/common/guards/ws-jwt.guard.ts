import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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
      let authToken = client.handshake.auth.token?.split(' ')[1] || client.handshake.headers.authorization?.split(' ')[1];
      if (!authToken && client.handshake.headers.cookie) {
        const cookieStr = client.handshake.headers.cookie;
        const match = cookieStr.match(/access_token=([^;]+)/);
        if (match) {
          authToken = match[1];
        }
      }
      
      if (!authToken) {
        throw new WsException('Unauthorized');
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
      throw new WsException('Unauthorized');
    }
  }
}
