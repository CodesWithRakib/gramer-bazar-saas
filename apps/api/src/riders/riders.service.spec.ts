import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { RidersService } from './riders.service.js';
import { RiderProfile } from './entities/rider-profile.entity.js';
import { RiderEarning } from './entities/rider-earning.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { PayoutRequest } from '../payouts/entities/payout-request.entity.js';
import { RiderAvailability } from './enums/rider-availability.enum.js';
import { RiderEarningStatus } from './enums/rider-earning-status.enum.js';

const makeQueryBuilder = (raw: Record<string, unknown>) => {
  const qb: Record<string, unknown> = {};
  const chain = ['select', 'addSelect', 'where', 'setParameters', 'leftJoinAndSelect', 'orderBy'];
  for (const method of chain) {
    qb[method] = vi.fn(() => qb);
  }
  qb.getRawOne = vi.fn().mockResolvedValue(raw);
  return qb;
};

const makeProfile = (overrides: Partial<RiderProfile> = {}): RiderProfile =>
  ({
    id: 'profile-1',
    userId: 'rider-1',
    fullName: 'Karim Mia',
    nidNumber: '19901234567890123',
    address: null,
    preferredZone: null,
    emergencyContact: null,
    vehicleType: 'BIKE',
    vehiclePlateNumber: null,
    drivingLicenseNumber: null,
    availability: RiderAvailability.OFFLINE,
    isVerified: true,
    lastAvailableAt: null,
    createdAt: new Date('2026-09-20T00:00:00.000Z'),
    updatedAt: new Date('2026-09-20T00:00:00.000Z'),
    ...overrides,
  }) as RiderProfile;

describe('RidersService', () => {
  let service: RidersService;

  const profileRepo = {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn((value: unknown) => value),
    save: vi.fn(async (value: unknown) => value),
  };
  const earningRepo = {
    createQueryBuilder: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
  };
  const deliveryRepo = { findOne: vi.fn(), find: vi.fn(), createQueryBuilder: vi.fn() };
  const payoutRepo = { find: vi.fn(), createQueryBuilder: vi.fn() };
  const userRepo = { findOne: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    userRepo.findOne.mockResolvedValue({ id: 'rider-1', phone: '01712345678' });
    payoutRepo.createQueryBuilder.mockReturnValue(
      makeQueryBuilder({ pendingPayout: '0', paidOut: '0' })
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidersService,
        { provide: getRepositoryToken(RiderProfile), useValue: profileRepo },
        { provide: getRepositoryToken(RiderEarning), useValue: earningRepo },
        { provide: getRepositoryToken(Delivery), useValue: deliveryRepo },
        { provide: getRepositoryToken(PayoutRequest), useValue: payoutRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<RidersService>(RidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateAvailability', () => {
    it('rejects the system-managed BUSY state', async () => {
      await expect(service.updateAvailability('rider-1', RiderAvailability.BUSY)).rejects.toThrow(
        BadRequestException
      );
    });

    it('marks an existing rider available', async () => {
      const profile = makeProfile();
      profileRepo.findOne.mockResolvedValue(profile);

      const result = await service.updateAvailability('rider-1', RiderAvailability.AVAILABLE);

      expect(profile.availability).toBe(RiderAvailability.AVAILABLE);
      expect(profile.lastAvailableAt).toBeInstanceOf(Date);
      expect(profileRepo.save).toHaveBeenCalledWith(profile);
      expect(result.availability).toBe(RiderAvailability.AVAILABLE);
    });
  });

  describe('applySystemAvailability', () => {
    it('does not force an offline rider back online after a delivery', async () => {
      const manager = {
        findOne: vi.fn().mockResolvedValue(makeProfile({ availability: RiderAvailability.OFFLINE })),
        save: vi.fn(),
      };

      await service.applySystemAvailability(
        manager as never,
        'rider-1',
        RiderAvailability.AVAILABLE
      );

      expect(manager.save).not.toHaveBeenCalled();
    });

    it('releases a busy rider back to available', async () => {
      const profile = makeProfile({ availability: RiderAvailability.BUSY });
      const manager = { findOne: vi.fn().mockResolvedValue(profile), save: vi.fn() };

      await service.applySystemAvailability(
        manager as never,
        'rider-1',
        RiderAvailability.AVAILABLE
      );

      expect(profile.availability).toBe(RiderAvailability.AVAILABLE);
      expect(manager.save).toHaveBeenCalledWith(profile);
    });
  });

  describe('recordDeliveryEarning', () => {
    it('is idempotent per delivery', async () => {
      const existing = { id: 'earning-1' };
      const manager = { findOne: vi.fn().mockResolvedValue(existing), create: vi.fn(), save: vi.fn() };

      const result = await service.recordDeliveryEarning(manager as never, {
        riderId: 'rider-1',
        deliveryId: 'delivery-1',
        orderId: 'order-1',
        amount: 60,
      });

      expect(result).toBe(existing);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('creates an earning when none exists', async () => {
      const manager = {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn((entity: unknown, value: unknown) => value),
        save: vi.fn(async (_entity: unknown, value: Record<string, unknown>) => ({
          id: 'earning-1',
          ...value,
        })),
      };

      const result = await service.recordDeliveryEarning(manager as never, {
        riderId: 'rider-1',
        deliveryId: 'delivery-1',
        orderId: 'order-1',
        amount: 60,
      });

      expect(manager.save).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ amount: 60, status: RiderEarningStatus.EARNED });
    });
  });

  describe('getEarningsSummary', () => {
    it('computes withdrawable balance as earnings minus pending and paid payouts', async () => {
      earningRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder({
          deliveries: '5',
          totalEarned: '300',
          todayEarnings: '60',
          weekEarnings: '180',
          monthEarnings: '300',
        })
      );
      payoutRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder({ pendingPayout: '60', paidOut: '100' })
      );

      const summary = await service.getEarningsSummary('rider-1');

      expect(summary.totalEarned).toBe(300);
      expect(summary.availableBalance).toBe(140);
      expect(summary.totalDeliveries).toBe(5);
      expect(summary.pendingPayout).toBe(60);
      expect(summary.paidOut).toBe(100);
    });

    it('never returns a negative withdrawable balance', async () => {
      earningRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder({
          deliveries: '1',
          totalEarned: '60',
          todayEarnings: '0',
          weekEarnings: '0',
          monthEarnings: '0',
        })
      );
      payoutRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder({ pendingPayout: '200', paidOut: '100' })
      );

      const summary = await service.getEarningsSummary('rider-1');

      expect(summary.availableBalance).toBe(0);
    });
  });
});
