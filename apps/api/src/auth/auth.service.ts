import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service.js';
import { OtpService } from '../otp/otp.service.js';
import { UserStatus } from '../users/enums/user-status.enum.js';
import { User } from '../users/entities/user.entity.js';
import { SettingsService } from '../settings/settings.service.js';
import { Role } from '../roles/enums/role.enum.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
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
        phone: this.usersService.normalizeBdPhone(phone),
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

  async resetPassword(phone: string, otp: string, newPassword: string) {
    await this.otpService.verifyOtp(phone, otp);

    const normalizedPhone = this.usersService.normalizeBdPhone(phone);
    const user = await this.usersService.findByPhone(normalizedPhone);
    if (!user) {
      throw new BadRequestException('User with this phone number not found');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.usersService.update(user.id, { passwordHash });
    return { message: 'Password reset successfully' };
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
    if (registerDto.role === Role.SELLER) {
      const allowed = await this.settingsService.isSellerRegistrationAllowed();
      if (!allowed) {
        throw new BadRequestException('New seller registrations are currently disabled');
      }
    }

    // Check if user already exists
    const normalizedPhone = this.usersService.normalizeBdPhone(registerDto.phone);
    let user = await this.usersService.findByPhone(normalizedPhone);
    if (!user && registerDto.email) {
      user = await this.usersService.findByEmail(registerDto.email);
    }
    if (user) {
      throw new BadRequestException('User with this phone or email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    user = await this.usersService.create({
      phone: normalizedPhone,
      email: registerDto.email || null,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      passwordHash,
      isPhoneVerified: false,
      status: UserStatus.ACTIVE,
      roleNames: [registerDto.role || Role.CUSTOMER],
    });

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_ACCESS_SECRET',
          'super-secret-key-for-dev-only',
        ),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '1h',
        ) as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super-secret-refresh-key'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
    ]);

    const salt = await bcrypt.genSalt();
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

    // update() internally calls findById which loads relations: ['roles']
    const updatedUser = await this.usersService.update(user.id, {
      refreshTokenHash,
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles?.map((r) => r.name) || [],
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
  async updateProfile(userId: string, updateProfileDto: any) {
    const updatedUser = await this.usersService.update(userId, updateProfileDto);
    return {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        roles: updatedUser.roles?.map((r: any) => (typeof r === 'string' ? r : r.name)) || [],
      }
    };
  }

  async updatePassword(userId: string, updatePasswordDto: any) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(updatePasswordDto.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestException('Incorrect current password');
      }
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(updatePasswordDto.newPassword, salt);

    await this.usersService.update(userId, { passwordHash });
    return { message: 'Password updated successfully' };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const updatedUser = await this.usersService.update(userId, { avatar: avatarUrl });
    return {
      message: 'Avatar uploaded successfully',
      avatarUrl: updatedUser.avatar,
    };
  }

  async deleteAccount(userId: string) {
    await this.usersService.update(userId, { status: UserStatus.INACTIVE });
    // Soft delete or request deletion flow. For MVP, just soft delete the user
    return { message: 'Account scheduled for deletion' };
  }
}

