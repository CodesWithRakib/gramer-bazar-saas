import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';
import { Request } from 'express';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Non-HTTP contexts (e.g. WebSockets) let the specific guards handle auth/blocking
    if (!request || !request.url) return true;
    
    const url = request.url;

    // Always allow auth routes so admins can log in
    if (url.startsWith('/api/v1/auth/')) {
      return true;
    }

    const settings = await this.settingsService.getSettings();
    if (!settings.isMaintenanceMode) {
      return true;
    }

    // Try to extract the user from the token to see if they are an admin
    let token = request.cookies?.['access_token'];
    if (!token && request.headers.authorization) {
      token = request.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>(
            'JWT_ACCESS_SECRET',
            'super-secret-key-for-dev-only',
          ),
        });
        const user = await this.usersService.findById(payload.sub);
        if (user && user.roles) {
          const isStaff = user.roles.some((r) => r.name === 'SUPER_ADMIN' || r.name === 'ADMIN');
          if (isStaff) {
            return true;
          }
        }
      } catch (err) {
        // Ignore token errors here, just block them below
      }
    }

    throw new ServiceUnavailableException('Site is currently under maintenance. Please try again later.');
  }
}
