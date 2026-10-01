import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service.js';
import { UserStatus } from '../../users/enums/user-status.enum.js';
import { getRoleNames } from '../../common/utils/permission.js';
import type { ImpersonationPrincipal } from '../../common/utils/impersonation.js';
import { ImpersonationSession } from '../../impersonation/entities/impersonation-session.entity.js';
import { ImpersonationStatus } from '../../impersonation/enums/impersonation.enum.js';

import { Request } from 'express';

type JwtPayload = {
  sub: string;
  phone?: string;
  /** Actor (Super Admin) user id — present only on impersonation tokens. */
  act?: string;
  /** Impersonation session id — present only on impersonation tokens. */
  imp?: string;
};

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  if (!token) {
    token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(ImpersonationSession)
    private readonly impersonationRepository: Repository<ImpersonationSession>,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'super-secret-key-for-dev-only'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Normal session: the effective user IS the authenticated user.
    if (!payload.imp || !payload.act) {
      return user;
    }

    // Impersonation session: verify the server-side record on every request.
    const session = await this.impersonationRepository.findOne({ where: { id: payload.imp } });
    const expired = session ? session.expiresAt.getTime() <= Date.now() : true;

    if (
      !session ||
      session.status !== ImpersonationStatus.ACTIVE ||
      expired ||
      session.actorUserId !== payload.act ||
      session.targetUserId !== user.id
    ) {
      if (session && session.status === ImpersonationStatus.ACTIVE && expired) {
        await this.impersonationRepository.update(session.id, {
          status: ImpersonationStatus.EXPIRED,
        });
      }
      throw new UnauthorizedException('Impersonation session is no longer valid');
    }

    // Account status rules still apply to the impersonated user.
    if (user.status !== UserStatus.ACTIVE) {
      await this.impersonationRepository.update(session.id, {
        status: ImpersonationStatus.ENDED,
        endedAt: new Date(),
        endReason: 'TARGET_NOT_ACTIVE',
      });
      throw new UnauthorizedException('The impersonated account is not active');
    }

    const principal: ImpersonationPrincipal = {
      sessionId: session.id,
      actorUserId: session.actorUserId,
      actorName: session.actorName,
      actorRoles: [],
      targetUserId: session.targetUserId,
      targetName: session.targetName,
      targetRole: session.targetRole,
      reason: session.reason,
      reasonNote: session.reasonNote,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    };

    // Attach the actor context; the effective user remains `req.user` itself.
    (user as unknown as { impersonation?: ImpersonationPrincipal }).impersonation = principal;

    // Keep the actor's role list available for audit attribution.
    try {
      const actor = await this.usersService.findById(payload.act);
      principal.actorRoles = getRoleNames(actor);
    } catch {
      // Actor lookup is best-effort; authorization uses the effective user.
    }

    return user;
  }
}
