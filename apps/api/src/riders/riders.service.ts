import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { RiderProfile } from './entities/rider-profile.entity.js';
import { RiderEarning } from './entities/rider-earning.entity.js';
import { RiderAvailability } from './enums/rider-availability.enum.js';
import { RiderEarningStatus } from './enums/rider-earning-status.enum.js';
import { User } from '../users/entities/user.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { DeliveryStatus } from '../deliveries/enums/delivery-status.enum.js';
import { PayoutRequest, PayoutStatus } from '../payouts/entities/payout-request.entity.js';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto.js';
import { QueryRiderEarningsDto } from './dto/query-rider-earnings.dto.js';
import {
  RiderProfileResponseDto,
  RiderEarningsSummaryDto,
  RiderEarningsResponseDto,
  RiderEarningResponseDto,
} from './dto/rider-response.dto.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class RidersService {
  constructor(
    @InjectRepository(RiderProfile)
    private readonly profileRepo: Repository<RiderProfile>,
    @InjectRepository(RiderEarning)
    private readonly earningRepo: Repository<RiderEarning>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(PayoutRequest)
    private readonly payoutRepo: Repository<PayoutRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // --- PROFILE ---

  /** Returns the rider profile, lazily creating one from the user account when missing. */
  async getProfile(userId: string): Promise<RiderProfileResponseDto> {
    const profile = await this.ensureProfile(userId);
    return this.toProfileResponse(profile);
  }

  async ensureProfile(userId: string): Promise<RiderProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (profile) return profile;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    profile = this.profileRepo.create({
      userId,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
      availability: RiderAvailability.OFFLINE,
    });
    return this.profileRepo.save(profile);
  }

  async updateProfile(
    userId: string,
    dto: UpdateRiderProfileDto,
  ): Promise<RiderProfileResponseDto> {
    const profile = await this.ensureProfile(userId);

    if (dto.address !== undefined) profile.address = dto.address;
    if (dto.preferredZone !== undefined) profile.preferredZone = dto.preferredZone;
    if (dto.emergencyContact !== undefined) profile.emergencyContact = dto.emergencyContact;
    if (dto.vehicleType !== undefined) profile.vehicleType = dto.vehicleType;
    if (dto.vehiclePlateNumber !== undefined) profile.vehiclePlateNumber = dto.vehiclePlateNumber;

    await this.profileRepo.save(profile);
    return this.toProfileResponse(profile);
  }

  async updateAvailability(
    userId: string,
    availability: RiderAvailability,
  ): Promise<RiderProfileResponseDto> {
    if (availability === RiderAvailability.BUSY) {
      throw new BadRequestException(
        'BUSY is managed automatically while you are delivering an order.',
      );
    }

    const profile = await this.ensureProfile(userId);
    if (profile.availability === availability) {
      return this.toProfileResponse(profile);
    }

    profile.availability = availability;
    if (availability === RiderAvailability.AVAILABLE) {
      profile.lastAvailableAt = new Date();
    }
    await this.profileRepo.save(profile);
    return this.toProfileResponse(profile);
  }

  /**
   * Applies a system-driven availability change (accepting/delivering assigned orders).
   * Never overrides an explicitly OFFLINE rider back to AVAILABLE, so a rider who went
   * offline mid-delivery stays offline once the delivery completes.
   */
  async applySystemAvailability(
    manager: EntityManager,
    userId: string,
    next: RiderAvailability,
  ): Promise<void> {
    const profile = await manager.findOne(RiderProfile, { where: { userId } });
    if (!profile) return;

    if (next === RiderAvailability.BUSY) {
      profile.availability = RiderAvailability.BUSY;
    } else if (profile.availability === RiderAvailability.BUSY) {
      profile.availability = RiderAvailability.AVAILABLE;
      profile.lastAvailableAt = new Date();
    } else {
      return;
    }
    await manager.save(profile);
  }

  /** Recreates/synchronises the operational profile from an approved application dossier. */
  async syncFromApplication(
    userId: string,
    data: {
      fullName: string;
      nidNumber?: string | null;
      vehicleType?: string | null;
      vehiclePlateNumber?: string | null;
      drivingLicenseNumber?: string | null;
      preferredZone?: string | null;
      emergencyContact?: string | null;
    },
  ): Promise<RiderProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId });
    }

    profile.fullName = data.fullName ?? profile.fullName ?? null;
    profile.nidNumber = data.nidNumber ?? profile.nidNumber ?? null;
    profile.vehicleType = data.vehicleType || profile.vehicleType || 'BIKE';
    profile.vehiclePlateNumber = data.vehiclePlateNumber ?? profile.vehiclePlateNumber ?? null;
    profile.drivingLicenseNumber =
      data.drivingLicenseNumber ?? profile.drivingLicenseNumber ?? null;
    profile.preferredZone = data.preferredZone ?? profile.preferredZone ?? null;
    profile.emergencyContact = data.emergencyContact ?? profile.emergencyContact ?? null;
    profile.isVerified = true;

    return this.profileRepo.save(profile);
  }

  private async toProfileResponse(profile: RiderProfile): Promise<RiderProfileResponseDto> {
    const user = await this.userRepo.findOne({ where: { id: profile.userId } });
    return {
      id: profile.id,
      userId: profile.userId,
      fullName:
        profile.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Rider',
      phone: user?.phone || '',
      email: user?.email ?? null,
      avatar: user?.avatar ?? null,
      nidNumber: profile.nidNumber,
      address: profile.address,
      preferredZone: profile.preferredZone,
      emergencyContact: profile.emergencyContact,
      vehicleType: profile.vehicleType,
      vehiclePlateNumber: profile.vehiclePlateNumber,
      drivingLicenseNumber: profile.drivingLicenseNumber,
      availability: profile.availability,
      isVerified: profile.isVerified,
      lastAvailableAt: profile.lastAvailableAt ? profile.lastAvailableAt.toISOString() : null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  // --- EARNINGS ---

  /**
   * Records an immutable earning for a completed delivery. Idempotent: a delivery
   * can only ever produce a single earning row. Returns null when already recorded.
   */
  async recordDeliveryEarning(
    manager: EntityManager,
    params: { riderId: string; deliveryId: string; orderId: string; amount: number },
  ): Promise<RiderEarning | null> {
    const existing = await manager.findOne(RiderEarning, {
      where: { deliveryId: params.deliveryId },
    });
    if (existing) return existing;

    const earning = manager.create(RiderEarning, {
      riderId: params.riderId,
      deliveryId: params.deliveryId,
      orderId: params.orderId,
      amount: Number(params.amount) || 0,
      status: RiderEarningStatus.EARNED,
    });
    return manager.save(RiderEarning, earning);
  }

  async getEarningsSummary(riderId: string): Promise<RiderEarningsSummaryDto> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const monthAgo = new Date(now.getTime() - 30 * DAY_MS);

    const raw = await this.earningRepo
      .createQueryBuilder('e')
      .select('COUNT(e.id)', 'deliveries')
      .addSelect('COALESCE(SUM(e.amount), 0)', 'totalEarned')
      .addSelect(
        'COALESCE(SUM(CASE WHEN e.createdAt >= :startOfToday THEN e.amount ELSE 0 END), 0)',
        'todayEarnings',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN e.createdAt >= :weekAgo THEN e.amount ELSE 0 END), 0)',
        'weekEarnings',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN e.createdAt >= :monthAgo THEN e.amount ELSE 0 END), 0)',
        'monthEarnings',
      )
      .where('e.riderId = :riderId', { riderId })
      .setParameters({ startOfToday, weekAgo, monthAgo })
      .getRawOne<{
        deliveries: string;
        totalEarned: string;
        todayEarnings: string;
        weekEarnings: string;
        monthEarnings: string;
      }>();

    const payouts = await this.getPayoutTotals(riderId);
    const totalEarned = Number(raw?.totalEarned || 0);
    const availableBalance = Math.max(0, totalEarned - payouts.pendingPayout - payouts.paidOut);

    return {
      todayEarnings: Number(raw?.todayEarnings || 0),
      weekEarnings: Number(raw?.weekEarnings || 0),
      monthEarnings: Number(raw?.monthEarnings || 0),
      totalEarned,
      pendingPayout: payouts.pendingPayout,
      paidOut: payouts.paidOut,
      availableBalance: Number(availableBalance.toFixed(2)),
      totalDeliveries: Number(raw?.deliveries || 0),
    };
  }

  async getPayoutTotals(riderId: string): Promise<{ pendingPayout: number; paidOut: number }> {
    const raw = await this.payoutRepo
      .createQueryBuilder('p')
      .select(
        'COALESCE(SUM(CASE WHEN p.status = :pending THEN p.amount ELSE 0 END), 0)',
        'pendingPayout',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN p.status = :approved THEN p.amount ELSE 0 END), 0)',
        'paidOut',
      )
      .where('p.riderId = :riderId', { riderId })
      .setParameters({ pending: PayoutStatus.PENDING, approved: PayoutStatus.APPROVED })
      .getRawOne<{ pendingPayout: string; paidOut: string }>();

    return {
      pendingPayout: Number(raw?.pendingPayout || 0),
      paidOut: Number(raw?.paidOut || 0),
    };
  }

  /** Balance the rider is allowed to withdraw right now. */
  async getEligibleBalance(riderId: string): Promise<number> {
    const summary = await this.getEarningsSummary(riderId);
    return summary.availableBalance;
  }

  /**
   * Marks EARNED rows as PAID (oldest first) for an approved payout, up to the payout amount.
   * Returns the total amount actually settled.
   */
  async settleEarnings(
    manager: EntityManager,
    riderId: string,
    payoutId: string,
    amount: number,
  ): Promise<number> {
    const earnings = await manager.find(RiderEarning, {
      where: { riderId, status: RiderEarningStatus.EARNED },
      order: { createdAt: 'ASC' },
    });

    let remaining = Number(amount);
    let settled = 0;
    for (const earning of earnings) {
      const earningAmount = Number(earning.amount);
      // Never mark an earning as paid beyond the payout amount it funded.
      if (earningAmount > remaining + 0.001) break;

      earning.status = RiderEarningStatus.PAID;
      earning.payoutId = payoutId;
      await manager.save(RiderEarning, earning);
      remaining -= earningAmount;
      settled += earningAmount;
      if (remaining <= 0.001) break;
    }
    return Number(settled.toFixed(2));
  }

  async getEarnings(
    riderId: string,
    query: QueryRiderEarningsDto,
  ): Promise<RiderEarningsResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.earningRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.order', 'order')
      .where('e.riderId = :riderId', { riderId })
      .orderBy('e.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('e.status = :status', { status: query.status });
    }
    if (query.from) {
      qb.andWhere('e.createdAt >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('e.createdAt <= :to', { to: new Date(query.to) });
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const summary = await this.getEarningsSummary(riderId);

    return {
      summary,
      data: rows.map((row) => this.toEarningResponse(row)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private toEarningResponse(earning: RiderEarning): RiderEarningResponseDto {
    const order = earning.order;
    return {
      id: earning.id,
      deliveryId: earning.deliveryId,
      orderId: earning.orderId,
      orderNumber: `GBZ${earning.orderId.slice(0, 8).toUpperCase()}`,
      amount: Number(earning.amount),
      status: earning.status,
      deliveredAt: order?.updatedAt ? order.updatedAt.toISOString() : null,
      createdAt: earning.createdAt.toISOString(),
    };
  }

  // --- DASHBOARD ---

  // Returns raw Delivery entities nested for the rider UI (matches the deliveries API contract).
  async getDashboard(userId: string) {
    const profile = await this.ensureProfile(userId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeStatuses = [
      DeliveryStatus.ACCEPTED,
      DeliveryStatus.PICKED_UP,
      DeliveryStatus.OUT_FOR_DELIVERY,
    ];
    const relations = ['order', 'order.address', 'order.user'];

    // Aggregate counts in the database instead of loading every delivery.
    const counts = await this.deliveryRepo
      .createQueryBuilder('d')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE d.status = :assigned)', 'pending')
      .addSelect('COUNT(*) FILTER (WHERE d.status IN (:...active))', 'active')
      .addSelect('COUNT(*) FILTER (WHERE d.status = :delivered)', 'completed')
      .addSelect(
        'COUNT(*) FILTER (WHERE d.status = :delivered AND d.deliveryTime >= :startOfToday)',
        'todayCompleted',
      )
      .addSelect('COUNT(*) FILTER (WHERE d.createdAt >= :startOfToday)', 'todayDeliveries')
      .where('d.riderId = :riderId', {
        riderId: userId,
        assigned: DeliveryStatus.ASSIGNED,
        active: activeStatuses,
        delivered: DeliveryStatus.DELIVERED,
        startOfToday,
      })
      .getRawOne<{
        pending: string;
        active: string;
        completed: string;
        todayCompleted: string;
        todayDeliveries: string;
      }>();

    const [activeDelivery, newAssignments, recentDeliveries, earnings] = await Promise.all([
      this.deliveryRepo.findOne({
        where: { riderId: userId, status: In(activeStatuses) },
        relations,
        order: { updatedAt: 'DESC' },
      }),
      this.deliveryRepo.find({
        where: { riderId: userId, status: DeliveryStatus.ASSIGNED },
        relations,
        order: { createdAt: 'DESC' },
        take: 20,
      }),
      this.deliveryRepo.find({
        where: { riderId: userId },
        relations,
        order: { updatedAt: 'DESC' },
        take: 5,
      }),
      this.getEarningsSummary(userId),
    ]);

    return {
      availability: profile.availability,
      isVerified: profile.isVerified,
      metrics: {
        todayDeliveries: Number(counts?.todayDeliveries || 0),
        pendingAssignments: Number(counts?.pending || 0),
        activeDeliveries: Number(counts?.active || 0),
        todayCompleted: Number(counts?.todayCompleted || 0),
        totalCompleted: Number(counts?.completed || 0),
      },
      earnings,
      activeDelivery: activeDelivery ?? null,
      newAssignments,
      recentDeliveries,
    };
  }

  /** Availability lookup for a batch of rider user ids (used by dispatch lists). */
  async getAvailabilityMap(userIds: string[]): Promise<Record<string, RiderAvailability>> {
    if (userIds.length === 0) return {};

    const profiles = await this.profileRepo.find({
      where: userIds.map((userId) => ({ userId })),
    });

    return profiles.reduce<Record<string, RiderAvailability>>((acc, profile) => {
      acc[profile.userId] = profile.availability;
      return acc;
    }, {});
  }
}
