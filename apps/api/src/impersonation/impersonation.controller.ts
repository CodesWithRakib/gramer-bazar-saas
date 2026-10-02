import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ImpersonationService } from './impersonation.service.js';
import { StartImpersonationDto } from './dto/start-impersonation.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import type { AuthenticatedPrincipal } from '../common/utils/impersonation.js';
import { AuthResponseDto } from '../auth/dto/auth-response.dto.js';
import { ImpersonationSessionDto } from './dto/impersonation-response.dto.js';

@ApiTags('Impersonation (Super Admin)')
@Controller('admin/impersonation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiCommonErrors()
export class ImpersonationController {
  constructor(private readonly impersonationService: ImpersonationService) {}

  private setAccessCookie(res: Response, accessToken: string, maxAgeMs: number) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: maxAgeMs,
    });
  }

  private setSessionCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  /**
   * Start a temporary impersonation session. Restricted to SUPER_ADMIN both by
   * the RolesGuard here and by an explicit check inside the service.
   */
  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Start impersonating a Customer, Seller, or Rider (Super Admin only)',
    description:
      'Creates a temporary, auditable impersonation session. The target user password is never required or modified.',
  })
  @ApiStandardResponse({
    type: AuthResponseDto,
    status: HttpStatus.OK,
    description: 'Impersonation session started; temporary access token issued',
  })
  @ApiCommonErrors([400, 401, 403, 404, 429])
  @HttpCode(HttpStatus.OK)
  async start(
    @Request() req: { user: AuthenticatedPrincipal; ip?: string; headers?: Record<string, unknown> },
    @Body() dto: StartImpersonationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.impersonationService.start(req.user, dto, {
      ipAddress: req.ip ?? null,
      userAgent:
        (req.headers?.['user-agent'] as string | undefined) ??
        (req.headers?.['User-Agent'] as string | undefined) ??
        null,
    });

    const ttlMs = Math.max(
      1000,
      new Date(result.impersonation.expiresAt).getTime() - Date.now(),
    );
    this.setAccessCookie(res, result.accessToken, ttlMs);
    return result;
  }

  /**
   * Exit impersonation and restore the original Super Admin session without
   * requiring credentials again. Only reachable while impersonating.
   */
  @Post('exit')
  @ApiOperation({
    summary: 'Exit impersonation and restore the Super Admin session',
    description:
      'Ends the active impersonation session and issues fresh tokens for the original actor. No re-login required.',
  })
  @ApiStandardResponse({
    type: AuthResponseDto,
    status: HttpStatus.OK,
    description: 'Impersonation ended; Super Admin session restored',
  })
  @ApiCommonErrors([400, 401, 500])
  @HttpCode(HttpStatus.OK)
  async exit(
    @Request() req: { user: AuthenticatedPrincipal },
    @Res({ passthrough: true }) res: Response,
  ) {
    const principal = req.user?.impersonation;
    if (!principal) {
      throw new BadRequestException('You are not currently impersonating a user');
    }

    const result = await this.impersonationService.exit(principal);
    this.setSessionCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  /**
   * Recent impersonation sessions targeting a user (Super Admin only), used by
   * the user details page history panel. Paginated.
   */
  @Get('target/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get paginated impersonation history for a target user (Super Admin only)',
    description:
      'Returns impersonation sessions in which this user was the impersonated (effective) user, newest first, including any sensitive actions that were blocked.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiCommonErrors([401, 403])
  async targetHistory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.impersonationService.getTargetHistory(userId, Number(page), Number(limit));
  }

  /**
   * Platform-wide impersonation session listing (Super Admin only) powering the
   * impersonation audit view.
   */
  @Get('sessions')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'List all impersonation sessions platform-wide (Super Admin only)',
    description:
      'Paginated audit listing of every impersonation session, filterable by status, reason, effective role, and free-text search.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'reason', required: false, type: String })
  @ApiQuery({ name: 'targetRole', required: false, type: String })
  @ApiQuery({ name: 'targetUserId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiCommonErrors([401, 403])
  async sessions(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('reason') reason?: string,
    @Query('targetRole') targetRole?: string,
    @Query('targetUserId') targetUserId?: string,
    @Query('search') search?: string,
  ) {
    return this.impersonationService.getAllSessions({
      page: Number(page),
      limit: Number(limit),
      status,
      reason,
      targetRole,
      targetUserId,
      search,
    });
  }

  /** Inspect the current Super Admin's active impersonation session, if any. */
  @Get('session')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get the active impersonation session for the current Super Admin',
    description: 'Returns the live impersonation context or null when none is active.',
  })
  @ApiStandardResponse({
    type: ImpersonationSessionDto,
    description: 'Active impersonation context, or null',
  })
  @ApiCommonErrors([401, 403])
  async session(@Request() req: { user: AuthenticatedPrincipal }) {
    return this.impersonationService.getActiveSession(req.user.id);
  }
}
