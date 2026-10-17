import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThan } from 'typeorm';
import { GroupBuyCampaign } from './entities/group-buy-campaign.entity.js';
import { GroupBuyPool } from './entities/group-buy-pool.entity.js';
import { GroupBuyMember } from './entities/group-buy-member.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { User } from '../users/entities/user.entity.js';
import {
  GroupBuyCampaignStatus,
  GroupBuyPaymentMode,
  GroupBuyPoolStatus,
} from './enums/group-buying.enum.js';
import {
  CreateGroupBuyCampaignDto,
  UpdateGroupBuyCampaignDto,
  StartPoolDto,
  JoinPoolDto,
  QueryCampaignDto,
} from './dto/group-buying.dto.js';

@Injectable()
export class GroupBuyingService {
  private readonly logger = new Logger(GroupBuyingService.name);

  constructor(
    @InjectRepository(GroupBuyCampaign)
    private readonly campaignRepo: Repository<GroupBuyCampaign>,
    @InjectRepository(GroupBuyPool)
    private readonly poolRepo: Repository<GroupBuyPool>,
    @InjectRepository(GroupBuyMember)
    private readonly memberRepo: Repository<GroupBuyMember>,
    @InjectRepository(SellerProduct)
    private readonly productRepo: Repository<SellerProduct>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new Community Group Buy Campaign (Seller or Admin)
   */
  async createCampaign(
    sellerId: string,
    dto: CreateGroupBuyCampaignDto,
  ): Promise<GroupBuyCampaign> {
    const regularPrice = Number(dto.regularPrice);
    const groupPrice = Number(dto.groupPrice);

    if (groupPrice >= regularPrice) {
      throw new BadRequestException(
        `Group discounted price (৳${groupPrice}) must be lower than standard regular price (৳${regularPrice}).`,
      );
    }

    const campaign = this.campaignRepo.create({
      titleEn: dto.titleEn.trim(),
      titleBn: dto.titleBn.trim(),
      sellerProductId: dto.sellerProductId,
      sellerId,
      regularPrice,
      groupPrice,
      minParticipants: dto.minParticipants || 5,
      maxParticipants: dto.maxParticipants || null,
      durationHours: dto.durationHours || 48,
      tieredPricing: dto.tieredPricing || null,
      targetDistrict: dto.targetDistrict?.trim() || null,
      targetUpazila: dto.targetUpazila?.trim() || null,
      dropPointName: dto.dropPointName.trim(),
      status: GroupBuyCampaignStatus.ACTIVE,
      startDate: new Date(),
    });

    return this.campaignRepo.save(campaign);
  }

  /**
   * Get active campaigns with optional district/upazila filtering
   */
  async getActiveCampaigns(query: QueryCampaignDto): Promise<GroupBuyCampaign[]> {
    const qb = this.campaignRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.sellerProduct', 'sp')
      .leftJoinAndSelect('sp.product', 'p')
      .where('c.status = :status', { status: query.status || GroupBuyCampaignStatus.ACTIVE });

    if (query.district) {
      qb.andWhere('(c.targetDistrict IS NULL OR LOWER(c.targetDistrict) = LOWER(:district))', {
        district: query.district.trim(),
      });
    }

    if (query.upazila) {
      qb.andWhere('(c.targetUpazila IS NULL OR LOWER(c.targetUpazila) = LOWER(:upazila))', {
        upazila: query.upazila.trim(),
      });
    }

    qb.orderBy('c.createdAt', 'DESC');
    return qb.getMany();
  }

  /**
   * Get single campaign details by ID
   */
  async getCampaignById(id: string): Promise<GroupBuyCampaign> {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
      relations: ['sellerProduct', 'sellerProduct.product', 'pools', 'pools.members'],
    });

    if (!campaign) {
      throw new NotFoundException(`Group buy campaign ${id} not found.`);
    }

    return campaign;
  }

  /**
   * Start a new Community Group Buy Pool as Pool Leader
   */
  async startPool(userId: string, dto: StartPoolDto): Promise<GroupBuyPool> {
    const campaign = await this.campaignRepo.findOne({
      where: { id: dto.campaignId, status: GroupBuyCampaignStatus.ACTIVE },
    });

    if (!campaign) {
      throw new BadRequestException('Selected group buy campaign is not active or does not exist.');
    }

    const durationMs = (campaign.durationHours || 48) * 3600 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

    // Generate readable share code (e.g. GB-BOGRA-4819)
    const distCode = (campaign.targetDistrict || 'GRAM').slice(0, 4).toUpperCase();
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const shareCode = `GB-${distCode}-${randCode}`;

    const unitPrice = Number(campaign.groupPrice);
    const quantity = Number(dto.quantity || 1);
    const totalAmount = Number((unitPrice * quantity).toFixed(2));

    const pool = this.poolRepo.create({
      campaignId: campaign.id,
      shareCode,
      leaderUserId: userId,
      currentParticipants: 1,
      currentCommittedQty: quantity,
      status:
        campaign.minParticipants <= 1
          ? GroupBuyPoolStatus.SUCCESS
          : GroupBuyPoolStatus.FORMING,
      expiresAt,
      lockedAt: campaign.minParticipants <= 1 ? new Date() : null,
    });

    const savedPool = await this.poolRepo.save(pool);

    const leaderMember = this.memberRepo.create({
      poolId: savedPool.id,
      userId,
      quantity,
      unitPrice,
      totalAmount,
      paymentMode: dto.paymentMode || GroupBuyPaymentMode.COD_PLEDGE,
      isLeader: true,
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone.trim(),
      deliveryAddress: dto.deliveryAddress.trim(),
    });

    await this.memberRepo.save(leaderMember);

    this.logger.log(
      `User ${userId} started Group Buy Pool ${savedPool.id} (ShareCode: ${shareCode}) for Campaign ${campaign.id}`,
    );

    return this.getPoolById(savedPool.id);
  }

  /**
   * Join an existing Community Group Buy Pool
   */
  async joinPool(userId: string, poolId: string, dto: JoinPoolDto): Promise<GroupBuyPool> {
    const pool = await this.poolRepo.findOne({
      where: { id: poolId },
      relations: ['campaign', 'members'],
    });

    if (!pool) {
      throw new NotFoundException(`Group buy pool ${poolId} not found.`);
    }

    if (pool.status !== GroupBuyPoolStatus.FORMING) {
      throw new BadRequestException(
        `This pool is no longer accepting new members. Current status: ${pool.status}`,
      );
    }

    if (new Date() > new Date(pool.expiresAt)) {
      pool.status = GroupBuyPoolStatus.EXPIRED;
      await this.poolRepo.save(pool);
      throw new BadRequestException('This group buy pool has expired.');
    }

    // Check if user already joined this pool
    const alreadyJoined = pool.members.some((m) => m.userId === userId);
    if (alreadyJoined) {
      throw new BadRequestException('You have already committed an order in this group buy pool.');
    }

    if (pool.campaign.maxParticipants && pool.currentParticipants >= pool.campaign.maxParticipants) {
      throw new BadRequestException('This group buy pool has reached maximum capacity.');
    }

    const quantity = Number(dto.quantity || 1);
    const unitPrice = Number(pool.campaign.groupPrice);
    const totalAmount = Number((unitPrice * quantity).toFixed(2));

    const member = this.memberRepo.create({
      poolId: pool.id,
      userId,
      quantity,
      unitPrice,
      totalAmount,
      paymentMode: dto.paymentMode || GroupBuyPaymentMode.COD_PLEDGE,
      isLeader: false,
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone.trim(),
      deliveryAddress: dto.deliveryAddress.trim(),
    });

    await this.memberRepo.save(member);

    pool.currentParticipants += 1;
    pool.currentCommittedQty = Number(
      (Number(pool.currentCommittedQty) + quantity).toFixed(2),
    );

    // If minimum threshold reached, unlock wholesale bulk discount!
    if (pool.currentParticipants >= pool.campaign.minParticipants) {
      pool.status = GroupBuyPoolStatus.SUCCESS;
      pool.lockedAt = new Date();
      this.logger.log(
        `Group Buy Pool ${pool.id} (${pool.shareCode}) reached threshold! (${pool.currentParticipants}/${pool.campaign.minParticipants} buyers). Unlocked SUCCESS state.`,
      );
    }

    await this.poolRepo.save(pool);
    return this.getPoolById(pool.id);
  }

  /**
   * Get pool by ID
   */
  async getPoolById(id: string): Promise<GroupBuyPool> {
    const pool = await this.poolRepo.findOne({
      where: { id },
      relations: ['campaign', 'campaign.sellerProduct', 'campaign.sellerProduct.product', 'leader', 'members'],
    });

    if (!pool) {
      throw new NotFoundException(`Group buy pool ${id} not found.`);
    }

    // Auto-expire check
    if (pool.status === GroupBuyPoolStatus.FORMING && new Date() > new Date(pool.expiresAt)) {
      pool.status = GroupBuyPoolStatus.EXPIRED;
      await this.poolRepo.save(pool);
    }

    return pool;
  }

  /**
   * Lookup pool by share code for 1-click social invite links
   */
  async getPoolByShareCode(shareCode: string): Promise<GroupBuyPool> {
    const pool = await this.poolRepo.findOne({
      where: { shareCode: shareCode.trim().toUpperCase() },
      relations: ['campaign', 'campaign.sellerProduct', 'campaign.sellerProduct.product', 'leader', 'members'],
    });

    if (!pool) {
      throw new NotFoundException(`Group buy pool with code ${shareCode} not found.`);
    }

    if (pool.status === GroupBuyPoolStatus.FORMING && new Date() > new Date(pool.expiresAt)) {
      pool.status = GroupBuyPoolStatus.EXPIRED;
      await this.poolRepo.save(pool);
    }

    return pool;
  }

  /**
   * Get all pools joined or created by a user
   */
  async getMyPools(userId: string): Promise<GroupBuyPool[]> {
    const memberRows = await this.memberRepo.find({
      where: { userId },
      select: ['poolId'],
    });

    const poolIds = Array.from(new Set(memberRows.map((m) => m.poolId)));
    if (poolIds.length === 0) return [];

    return this.poolRepo.find({
      where: poolIds.map((id) => ({ id })),
      relations: ['campaign', 'campaign.sellerProduct', 'campaign.sellerProduct.product', 'leader', 'members'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin / Seller: List all campaigns
   */
  async adminGetCampaigns(sellerId?: string): Promise<GroupBuyCampaign[]> {
    const whereClause: any = {};
    if (sellerId) {
      whereClause.sellerId = sellerId;
    }

    return this.campaignRepo.find({
      where: whereClause,
      relations: ['sellerProduct', 'sellerProduct.product', 'pools'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin / Seller: List all pools
   */
  async adminGetPools(status?: GroupBuyPoolStatus): Promise<GroupBuyPool[]> {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    return this.poolRepo.find({
      where: whereClause,
      relations: ['campaign', 'campaign.sellerProduct', 'leader', 'members'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin / Seller: Update campaign status
   */
  async updateCampaign(
    id: string,
    dto: UpdateGroupBuyCampaignDto,
  ): Promise<GroupBuyCampaign> {
    const campaign = await this.getCampaignById(id);

    if (dto.titleEn) campaign.titleEn = dto.titleEn.trim();
    if (dto.titleBn) campaign.titleBn = dto.titleBn.trim();
    if (dto.regularPrice) campaign.regularPrice = Number(dto.regularPrice);
    if (dto.groupPrice) campaign.groupPrice = Number(dto.groupPrice);
    if (dto.minParticipants) campaign.minParticipants = Number(dto.minParticipants);
    if (dto.status) campaign.status = dto.status;
    if (dto.dropPointName) campaign.dropPointName = dto.dropPointName.trim();

    return this.campaignRepo.save(campaign);
  }
}
