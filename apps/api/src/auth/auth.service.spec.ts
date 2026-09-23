import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { OtpService } from '../otp/otp.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { UserStatus } from '../users/enums/user-status.enum.js';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmail: vi.fn(),
    findByPhone: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    normalizeBdPhone: (phone: string) => phone,
  };
  const otpService = {
    generateOtp: vi.fn(),
    verifyOtp: vi.fn(),
  };
  const jwtService = {
    signAsync: vi.fn().mockResolvedValue('signed-token'),
    verifyAsync: vi.fn(),
  };
  const configService = {
    get: vi.fn((_key: string, fallback?: string) => fallback),
  };
  const settingsService = {
    isSellerRegistrationAllowed: vi.fn().mockResolvedValue(true),
  };

  const makeUser = (overrides: Record<string, unknown> = {}) => ({
    id: 'u1',
    phone: '+8801700000001',
    email: 'a@b.com',
    firstName: 'Super',
    lastName: 'Admin',
    status: UserStatus.ACTIVE,
    passwordHash: '$2a$10$abcdefg',
    roles: [{ name: 'ADMIN' }],
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    settingsService.isSellerRegistrationAllowed.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: OtpService, useValue: otpService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: SettingsService, useValue: settingsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loginWithPassword', () => {
    it('logs in with a valid email + password and returns tokens', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      usersService.findByEmail.mockResolvedValue(makeUser({ passwordHash }));
      usersService.update.mockImplementation(async (_id, data) => ({ ...makeUser({ passwordHash }), ...data }));

      const result = await service.loginWithPassword('a@b.com', 'password123');

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(result.user.roles).toEqual(['ADMIN']);
      expect(usersService.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });

    it('rejects an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);

      await expect(service.loginWithPassword('nobody@x.com', 'pw')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a wrong password', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      usersService.findByEmail.mockResolvedValue(makeUser({ passwordHash }));

      await expect(service.loginWithPassword('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a blocked account', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ status: UserStatus.BLOCKED }));

      await expect(service.loginWithPassword('a@b.com', 'x')).rejects.toThrow(/blocked/);
    });

    it('redirects OTP-only accounts to the OTP flow', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ passwordHash: null }));

      await expect(service.loginWithPassword('a@b.com', 'x')).rejects.toThrow(
        /does not have a password/,
      );
    });
  });

  describe('registerStaff', () => {
    it('creates a rider when registrations are open', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser({ roles: [{ name: 'RIDER' }] }));
      usersService.update.mockImplementation(async (_id, data) => ({ ...makeUser(), ...data }));

      const result = await service.registerStaff({
        phone: '+8801700000099',
        email: 'rider@x.com',
        password: 'password123',
        firstName: 'Babul',
        lastName: 'Mia',
        role: 'RIDER',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ roleNames: ['RIDER'] }),
      );
      expect(result.accessToken).toBe('signed-token');
    });

    it('blocks seller registration when the platform setting is off', async () => {
      settingsService.isSellerRegistrationAllowed.mockResolvedValue(false);

      await expect(
        service.registerStaff({
          phone: '+8801700000098',
          email: 'seller@x.com',
          password: 'password123',
          firstName: 'S',
          lastName: 'R',
          role: 'SELLER',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('does not consult the setting for rider registration', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser());
      usersService.update.mockImplementation(async (_id, data) => ({ ...makeUser(), ...data }));

      await service.registerStaff({
        phone: '+8801700000097',
        password: 'password123',
        firstName: 'R',
        lastName: 'R',
        role: 'RIDER',
      });

      expect(settingsService.isSellerRegistrationAllowed).not.toHaveBeenCalled();
    });

    it('rejects duplicate phone/email', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());

      await expect(
        service.registerStaff({
          phone: '+8801700000001',
          email: 'a@b.com',
          password: 'password123',
          firstName: 'X',
          lastName: 'Y',
          role: 'RIDER',
        }),
      ).rejects.toThrow(/already exists/);
    });
  });

  describe('verifyOtp', () => {
    it('creates a customer on first OTP verification', async () => {
      otpService.verifyOtp.mockResolvedValue(undefined);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser({ passwordHash: null, roles: [{ name: 'CUSTOMER' }] }));
      usersService.update.mockImplementation(async (_id, data) => ({ ...makeUser(), ...data }));

      const result = await service.verifyOtp('+8801', '123456');

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+8801',
          isPhoneVerified: true,
          status: UserStatus.ACTIVE,
        }),
      );
      expect(result.accessToken).toBe('signed-token');
    });

    it('refuses a blocked account during OTP login', async () => {
      otpService.verifyOtp.mockResolvedValue(undefined);
      usersService.findByPhone.mockResolvedValue(makeUser({ status: UserStatus.BLOCKED }));

      await expect(service.verifyOtp('+8801', '123456')).rejects.toThrow(/blocked/);
    });
  });
});
