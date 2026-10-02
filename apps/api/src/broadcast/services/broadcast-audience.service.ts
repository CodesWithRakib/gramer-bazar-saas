import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { User } from '../../users/entities/user.entity.js';
import { CustomerMarketingPreference } from '../entities/customer-marketing-preference.entity.js';
import type { BroadcastAudienceConfig } from '../entities/broadcast.entity.js';
import { BroadcastAudienceType } from '../enums/broadcast.enums.js';
import type {
  AudiencePreviewResponseDto,
  CustomerSummaryDto,
} from '../dto/audience.dto.js';

export interface ResolvedRecipient {
  id: string;
  name: string | null;
  phone: string;
  marketingOptIn: boolean;
}

const CUSTOMER_ROLE = 'CUSTOMER';
const DEFAULT_INACTIVE_DAYS = 30;

@Injectable()
export class BroadcastAudienceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CustomerMarketingPreference)
    private readonly preferenceRepo: Repository<CustomerMarketingPreference>,
  ) {}

  private applyOptInFilter(
    qb: SelectQueryBuilder<User>,
    requireOptIn: boolean,
  ): SelectQueryBuilder<User> {
    if (!requireOptIn) return qb;
    return qb.andWhere(
      `NOT EXISTS (
         SELECT 1 FROM customer_marketing_preferences pref
         WHERE pref.user_id = u.id AND pref.whatsapp_marketing_opt_in = false
       )`,
    );
  }

  /**
   * Build the base audience query. Only ACTIVE users holding the CUSTOMER role
   * are considered. Additional audience-type conditions are applied on top.
   */
  private buildAudienceQuery(
    audienceType: BroadcastAudienceType,
    config: BroadcastAudienceConfig = {},
    options: { requireOptIn: boolean },
  ): SelectQueryBuilder<User> {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .innerJoin('u.roles', 'role', 'role.name = :customerRole', { customerRole: CUSTOMER_ROLE })
      .where('u.status = :active', { active: 'ACTIVE' });

    const inactiveDays =
      Number(config.inactiveDays) > 0 ? Number(config.inactiveDays) : DEFAULT_INACTIVE_DAYS;
    const cutoff = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);

    switch (audienceType) {
      case BroadcastAudienceType.ALL_CUSTOMERS:
        break;
      case BroadcastAudienceType.SELECTED_CUSTOMERS: {
        const ids = config.customerIds ?? [];
        if (ids.length === 0) {
          // Empty selection intentionally matches no one.
          qb.andWhere('1 = 0');
        } else {
          qb.andWhere('u.id IN (:...ids)', { ids });
        }
        break;
      }
      case BroadcastAudienceType.ACTIVE_CUSTOMERS:
        qb.andWhere('u.lastLoginAt IS NOT NULL AND u.lastLoginAt >= :cutoff', { cutoff });
        break;
      case BroadcastAudienceType.INACTIVE_CUSTOMERS:
        qb.andWhere('(u.lastLoginAt IS NULL OR u.lastLoginAt < :cutoff)', { cutoff });
        break;
      case BroadcastAudienceType.ORDERED_BEFORE:
        qb.andWhere(
          'EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)',
        );
        break;
      case BroadcastAudienceType.NO_RECENT_ORDER:
        qb.andWhere(
          'NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.created_at >= :cutoff)',
          { cutoff },
        );
        break;
      case BroadcastAudienceType.AREA_BASED: {
        if (config.districtId) {
          qb.andWhere(
            'EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND a.district_id = :districtId)',
            { districtId: config.districtId },
          );
        }
        if (config.areaId) {
          qb.andWhere(
            'EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND a.area_id = :areaId)',
            { areaId: config.areaId },
          );
        }
        if (!config.districtId && !config.areaId) {
          qb.andWhere('1 = 0');
        }
        break;
      }
      default:
        break;
    }

    return this.applyOptInFilter(qb, options.requireOptIn);
  }

  private displayName(user: Pick<User, 'firstName' | 'lastName'>): string | null {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || null;
  }

  private async countBase(
    audienceType: BroadcastAudienceType,
    config: BroadcastAudienceConfig,
  ): Promise<number> {
    const withOptIn = this.buildAudienceQuery(audienceType, config, { requireOptIn: true });
    return withOptIn.getCount();
  }

  private async countIgnoringOptIn(
    audienceType: BroadcastAudienceType,
    config: BroadcastAudienceConfig,
  ): Promise<number> {
    const all = this.buildAudienceQuery(audienceType, config, { requireOptIn: false });
    return all.getCount();
  }

  /** Resolve the final recipient list. Only opted-in customers are returned. */
  async resolveRecipients(
    audienceType: BroadcastAudienceType,
    config: BroadcastAudienceConfig = {},
  ): Promise<ResolvedRecipient[]> {
    const requireOptIn = config.isOptInRequired !== false;
    const qb = this.buildAudienceQuery(audienceType, config, { requireOptIn })
      .select(['u.id', 'u.firstName', 'u.lastName', 'u.phone'])
      .orderBy('u.createdAt', 'ASC');

    const users = await qb.getMany();
    return users.map((user) => ({
      id: user.id,
      name: this.displayName(user),
      phone: user.phone,
      marketingOptIn: true,
    }));
  }

  /** Summaries for the audience picker UI. */
  async preview(
    audienceType: BroadcastAudienceType,
    config: BroadcastAudienceConfig = {},
  ): Promise<AudiencePreviewResponseDto> {
    const requireOptIn = config.isOptInRequired !== false;
    const recipientCount = await this.countBase(audienceType, config);
    const withoutOptIn = requireOptIn
      ? await this.countIgnoringOptIn(audienceType, config)
      : recipientCount;

    const sampleUsers = await this.buildAudienceQuery(audienceType, config, { requireOptIn })
      .select(['u.id', 'u.firstName', 'u.lastName', 'u.phone', 'u.email', 'u.lastLoginAt'])
      .orderBy('u.createdAt', 'ASC')
      .take(5)
      .getMany();

    const totalCustomers = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin('u.roles', 'role', 'role.name = :customerRole', { customerRole: CUSTOMER_ROLE })
      .where('u.status = :active', { active: 'ACTIVE' })
      .getCount();

    const optedOutCustomers = await this.preferenceRepo.count({
      where: { whatsappMarketingOptIn: false },
    });

    const sample: CustomerSummaryDto[] = sampleUsers.map((user) => ({
      id: user.id,
      name: this.displayName(user),
      phone: user.phone,
      email: user.email,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      marketingOptIn: true,
    }));

    return {
      audienceType,
      recipientCount,
      excludedOptOutCount: Math.max(0, withoutOptIn - recipientCount),
      sample,
      segments: {
        totalCustomers,
        optedInCustomers: Math.max(0, totalCustomers - optedOutCustomers),
        optedOutCustomers,
      },
    };
  }

  /** Segment counts for the audience picker. Counts ignore opt-in by default so the
   * admin can see the full size of each segment; preview applies the opt-in filter. */
  async getSegmentCounts(): Promise<{
    segments: AudiencePreviewResponseDto['segments'];
    byAudienceType: Record<string, number>;
  }> {
    const totalCustomers = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin('u.roles', 'role', 'role.name = :customerRole', { customerRole: CUSTOMER_ROLE })
      .where('u.status = :active', { active: 'ACTIVE' })
      .getCount();

    const optedOutCustomers = await this.preferenceRepo.count({
      where: { whatsappMarketingOptIn: false },
    });

    const types: BroadcastAudienceType[] = [
      BroadcastAudienceType.ALL_CUSTOMERS,
      BroadcastAudienceType.ACTIVE_CUSTOMERS,
      BroadcastAudienceType.INACTIVE_CUSTOMERS,
      BroadcastAudienceType.ORDERED_BEFORE,
      BroadcastAudienceType.NO_RECENT_ORDER,
    ];

    const byAudienceType: Record<string, number> = {};
    for (const type of types) {
      byAudienceType[type] = await this.countIgnoringOptIn(type, {});
    }

    return {
      segments: {
        totalCustomers,
        optedInCustomers: Math.max(0, totalCustomers - optedOutCustomers),
        optedOutCustomers,
      },
      byAudienceType,
    };
  }

  /** Free-text customer search for SELECTED_CUSTOMERS. */
  async searchCustomers(search?: string, limit = 10): Promise<CustomerSummaryDto[]> {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .innerJoin('u.roles', 'role', 'role.name = :customerRole', { customerRole: CUSTOMER_ROLE })
      .where('u.status = :active', { active: 'ACTIVE' })
      .select(['u.id', 'u.firstName', 'u.lastName', 'u.phone', 'u.email', 'u.lastLoginAt'])
      .orderBy('u.createdAt', 'DESC')
      .take(limit);

    if (search) {
      qb.andWhere('(u.firstName ILIKE :search OR u.lastName ILIKE :search OR u.phone ILIKE :search OR u.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const users = await qb.getMany();
    const optedOutIds = new Set(
      (await this.preferenceRepo.find({ where: { whatsappMarketingOptIn: false } })).map(
        (preference) => preference.userId,
      ),
    );

    return users.map((user) => ({
      id: user.id,
      name: this.displayName(user),
      phone: user.phone,
      email: user.email,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      marketingOptIn: !optedOutIds.has(user.id),
    }));
  }
}
