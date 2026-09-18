import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service.js';
import { OtpService } from '../otp/otp.service.js';
import { UserStatus } from '../users/enums/user-status.enum.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(phone: string): Promise<{ message: string }> {
    const otp = await this.otpService.generateOtp(phone);
    // In a real application, send this OTP via SMS
    // For MVP/Dev, we'll log it or assume it's sent.
    console.log(`[DEV ONLY] OTP for ${phone}: ${otp}`);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, otp: string) {
    await this.otpService.verifyOtp(phone, otp);

    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      // Create a new customer user automatically upon first OTP verification
      user = await this.usersService.create({
        phone,
        isPhoneVerified: true,
        status: UserStatus.ACTIVE,
      });
    } else {
      if (user.status === UserStatus.BLOCKED) {
        throw new UnauthorizedException('User is blocked');
      }
      user = await this.usersService.update(user.id, { isPhoneVerified: true });
    }

    return this.generateTokens(user);
  }

  async loginWithPassword(emailOrPhone: string, pass: string) {
    let user = await this.usersService.findByEmail(emailOrPhone);
    if (!user) {
      user = await this.usersService.findByPhone(emailOrPhone);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account does not have a password set. Please use OTP.');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async registerStaff(registerDto: any) {
    // Check if user already exists
    let user = await this.usersService.findByPhone(registerDto.phone);
    if (!user && registerDto.email) {
      user = await this.usersService.findByEmail(registerDto.email);
    }
    if (user) {
      throw new BadRequestException('User with this phone or email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    user = await this.usersService.create({
      phone: registerDto.phone,
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      passwordHash,
      isPhoneVerified: false,
      status: UserStatus.ACTIVE, // Assuming they are active upon registration for MVP
      roleNames: [registerDto.role],
    });

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET', 'super-secret-key-for-dev-only'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super-secret-refresh-key'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
    ]);

    const salt = await bcrypt.genSalt();
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

    await this.usersService.update(user.id, {
      refreshTokenHash,
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles?.map((r) => r.name) || [],
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super-secret-refresh-key'),
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access Denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('Access Denied');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.update(userId, {
      refreshTokenHash: null,
    });
    return { message: 'Logged out successfully' };
  }
}
