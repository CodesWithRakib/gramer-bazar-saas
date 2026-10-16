import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { AgentCashDrawerSession } from './entities/agent-cash-drawer-session.entity.js';
import { AgentCashTransaction } from './entities/agent-cash-transaction.entity.js';
import { FarmerProduceCollection } from './entities/farmer-produce-collection.entity.js';
import { AgentCashSettlement } from './entities/agent-cash-settlement.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Address } from '../addresses/entities/address.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrdersService } from '../orders/orders.service.js';
import {
  AgentCashTxType,
  AgentSessionStatus,
  FarmerCollectionStatus,
  SettlementStatus,
} from './enums/agent-commerce.enum.js';
import {
  OpenDrawerDto,
  CloseDrawerDto,
  RecordCashTxDto,
  CreateFarmerCollectionDto,
  CreateSettlementDto,
  ReviewSettlementDto,
  AgentPosCheckoutDto,
} from './dto/agent-commerce.dto.js';
import { PaymentMethod } from '../orders/enums/order-status.enum.js';
import { UserStatus } from '../users/enums/user-status.enum.js';

@Injectable()
export class AgentCommerceService {
  private readonly logger = new Logger(AgentCommerceService.name);

  constructor(
    @InjectRepository(AgentCashDrawerSession)
    private readonly sessionRepo: Repository<AgentCashDrawerSession>,
    @InjectRepository(AgentCashTransaction)
    private readonly txRepo: Repository<AgentCashTransaction>,
    @InjectRepository(FarmerProduceCollection)
    private readonly collectionRepo: Repository<FarmerProduceCollection>,
    @InjectRepository(AgentCashSettlement)
    private readonly settlementRepo: Repository<AgentCashSettlement>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Get the active open cash drawer session for an agent
   */
  async getActiveSession(agentId: string): Promise<AgentCashDrawerSession | null> {
    const session = await this.sessionRepo.findOne({
      where: {
        agentId,
        status: AgentSessionStatus.OPEN,
      },
      relations: ['transactions'],
      order: { openedAt: 'DESC' },
    });

    if (session && session.transactions) {
      session.transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return session;
  }

  /**
   * Open a new cash drawer session
   */
  async openDrawerSession(agentId: string, dto: OpenDrawerDto): Promise<AgentCashDrawerSession> {
    const existing = await this.getActiveSession(agentId);
    if (existing) {
      throw new BadRequestException(
        'An active cash drawer session is already open. Please close the active session first.',
      );
    }

    const openingFloat = Number(dto.openingFloat || 0);

    const session = this.sessionRepo.create({
      agentId,
      hubId: dto.hubId || null,
      openingFloat,
      cashIn: 0,
      cashOut: 0,
      expectedClosingBalance: openingFloat,
      status: AgentSessionStatus.OPEN,
      openingNotes: dto.openingNotes || null,
      openedAt: new Date(),
    });

    const saved = await this.sessionRepo.save(session);

    if (openingFloat > 0) {
      const tx = this.txRepo.create({
        sessionId: saved.id,
        type: AgentCashTxType.CASH_IN_FLOAT_ADD,
        amount: openingFloat,
        note: 'Opening Cash Float (প্রারম্ভিক ক্যাশ ফ্লোট)',
      });
      await this.txRepo.save(tx);
    }

    return this.getActiveSession(agentId) as Promise<AgentCashDrawerSession>;
  }

  /**
   * Close and reconcile active cash drawer session
   */
  async closeDrawerSession(agentId: string, dto: CloseDrawerDto): Promise<AgentCashDrawerSession> {
    const session = await this.getActiveSession(agentId);
    if (!session) {
      throw new NotFoundException('No active cash drawer session found to close.');
    }

    const expected =
      Number(session.openingFloat) + Number(session.cashIn) - Number(session.cashOut);
    const actual = Number(dto.actualClosingBalance || 0);
    const discrepancy = actual - expected;

    session.closedAt = new Date();
    session.actualClosingBalance = actual;
    session.expectedClosingBalance = Number(expected.toFixed(2));
    session.discrepancy = Number(discrepancy.toFixed(2));
    session.closingNotes = dto.closingNotes || null;
    session.status = AgentSessionStatus.CLOSED;

    await this.sessionRepo.save(session);
    this.logger.log(
      `Agent ${agentId} closed drawer session ${session.id}. Expected: ৳${expected}, Actual: ৳${actual}, Discrepancy: ৳${discrepancy}`,
    );

    return session;
  }

  /**
   * Record a manual or automated cash transaction in the active drawer
   */
  async recordCashTransaction(
    agentId: string,
    dto: RecordCashTxDto,
  ): Promise<AgentCashTransaction> {
    const session = await this.getActiveSession(agentId);
    if (!session) {
      throw new BadRequestException('Cannot record cash transaction without an active drawer session.');
    }

    const amount = Number(dto.amount);
    if (amount <= 0) {
      throw new BadRequestException('Transaction amount must be greater than zero.');
    }

    const isCashIn =
      dto.type === AgentCashTxType.CASH_IN_ORDER ||
      dto.type === AgentCashTxType.CASH_IN_FLOAT_ADD;

    if (isCashIn) {
      session.cashIn = Number((Number(session.cashIn) + amount).toFixed(2));
    } else {
      session.cashOut = Number((Number(session.cashOut) + amount).toFixed(2));
    }

    session.expectedClosingBalance = Number(
      (Number(session.openingFloat) + Number(session.cashIn) - Number(session.cashOut)).toFixed(2),
    );

    await this.sessionRepo.save(session);

    const tx = this.txRepo.create({
      sessionId: session.id,
      type: dto.type,
      amount,
      orderId: dto.orderId || null,
      farmerCollectionId: dto.farmerCollectionId || null,
      note: dto.note || null,
    });

    return this.txRepo.save(tx);
  }

  /**
   * Complete an assisted POS Cash Sale directly inside the Village Digital Center / Hub
   */
  async processAgentPosCheckout(
    agentId: string,
    dto: AgentPosCheckoutDto,
    originUrl: string = 'http://localhost:3000',
  ) {
    const session = await this.getActiveSession(agentId);
    if (!session) {
      throw new BadRequestException(
        'Please open an active cash drawer session before processing POS orders.',
      );
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Cart cannot be empty.');
    }

    // 1. Resolve or create customer user
    const cleanPhone = dto.customerPhone.trim().replace(/[^\d+]/g, '');
    const normalizedPhone = cleanPhone.startsWith('+88')
      ? cleanPhone
      : cleanPhone.startsWith('01')
        ? `+88${cleanPhone}`
        : cleanPhone;

    let customerUser = await this.userRepo.findOne({
      where: [{ phone: normalizedPhone }, { phone: cleanPhone }],
    });

    if (!customerUser) {
      const parts = dto.customerName.trim().split(' ');
      customerUser = this.userRepo.create({
        phone: normalizedPhone,
        firstName: parts[0] || 'Customer',
        lastName: parts.slice(1).join(' ') || '',
        isPhoneVerified: false,
        status: UserStatus.ACTIVE,
      });
      customerUser = await this.userRepo.save(customerUser);
    }

    // 2. Resolve or create delivery address
    const addressRepo = this.dataSource.getRepository(Address);
    let address = await addressRepo.findOne({
      where: { userId: customerUser.id, streetAddress: dto.customerAddress.trim() },
    });
    if (!address) {
      address = addressRepo.create({
        userId: customerUser.id,
        title: 'POS Village Address',
        contactName: dto.customerName.trim(),
        contactPhone: normalizedPhone,
        streetAddress: dto.customerAddress.trim(),
        isDefault: true,
      });
      address = await addressRepo.save(address);
    }

    // 3. Process checkout via OrdersService
    const checkoutResult = await this.ordersService.checkout(
      customerUser.id,
      {
        addressId: address.id,
        paymentMethod: PaymentMethod.COD,
        items: dto.items,
        lang: dto.lang || 'bn',
      },
      originUrl,
    );

    const order = checkoutResult.order;
    const orderTotal = Number(order.total) || 0;
    const subtotal = Number(order.subtotal) || 0;

    if (dto.amountTendered < orderTotal) {
      throw new BadRequestException(
        `Tendered cash (৳${dto.amountTendered}) cannot be less than order total (৳${orderTotal}).`,
      );
    }

    const changeDue = Number((dto.amountTendered - orderTotal).toFixed(2));
    const agentCommission = Number((subtotal * 0.02).toFixed(2)); // 2% agent commission

    // 4. Update order with Agent details
    const orderRepo = this.dataSource.getRepository(Order);
    await orderRepo.update(order.id, {
      isQuickOrder: true,
      agentId,
      agentCommission,
    });
    order.isQuickOrder = true;
    order.agentId = agentId;
    order.agentCommission = agentCommission;

    // 5. Automatically log CASH_IN_ORDER into Agent Drawer
    await this.recordCashTransaction(agentId, {
      type: AgentCashTxType.CASH_IN_ORDER,
      amount: orderTotal,
      orderId: order.id,
      note: `POS Cash Collection for Order #${order.id.slice(0, 8).toUpperCase()}`,
    });

    return {
      order,
      orderTotal,
      amountTendered: dto.amountTendered,
      changeDue,
      agentCommission,
      sessionId: session.id,
    };
  }

  /**
   * Record smallholder farmer produce collection & cash payout in Char/Haor regions
   */
  async recordFarmerCollection(
    agentId: string,
    dto: CreateFarmerCollectionDto,
  ): Promise<FarmerProduceCollection> {
    const isPaidFromDrawer = dto.paidFromDrawer !== false;
    let session: AgentCashDrawerSession | null = null;

    if (isPaidFromDrawer) {
      session = await this.getActiveSession(agentId);
      if (!session) {
        throw new BadRequestException(
          'Please open an active cash drawer session before disbursing cash to farmers.',
        );
      }

      const currentCashInDrawer =
        Number(session.openingFloat) + Number(session.cashIn) - Number(session.cashOut);
      const totalPayout = Number((dto.quantityKg * dto.unitPricePerKg).toFixed(2));

      if (totalPayout > currentCashInDrawer) {
        throw new BadRequestException(
          `Insufficient cash in drawer (৳${currentCashInDrawer.toFixed(2)}) for farmer payout of ৳${totalPayout.toFixed(2)}.`,
        );
      }
    }

    const totalPayout = Number((dto.quantityKg * dto.unitPricePerKg).toFixed(2));
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const collectionCode = `FARM-${dateStr}-${randCode}`;

    const collection = this.collectionRepo.create({
      collectionCode,
      agentId,
      sessionId: session?.id || null,
      farmerName: dto.farmerName.trim(),
      farmerPhone: dto.farmerPhone.trim(),
      villageLocation: dto.villageLocation.trim(),
      cropType: dto.cropType.trim(),
      quantityKg: dto.quantityKg,
      unitPricePerKg: dto.unitPricePerKg,
      totalPayout,
      paidFromDrawer: isPaidFromDrawer,
      destinationHubId: dto.destinationHubId || null,
      batchNumber: dto.batchNumber || null,
      status: FarmerCollectionStatus.COLLECTED,
    });

    const saved = await this.collectionRepo.save(collection);

    if (isPaidFromDrawer && session) {
      await this.recordCashTransaction(agentId, {
        type: AgentCashTxType.CASH_OUT_PRODUCE_PAYOUT,
        amount: totalPayout,
        farmerCollectionId: saved.id,
        note: `Farmer Payout to ${dto.farmerName} (${dto.cropType} ${dto.quantityKg}kg @ ৳${dto.unitPricePerKg})`,
      });
    }

    return saved;
  }

  /**
   * Get all farmer collections for an agent
   */
  async getFarmerCollections(agentId: string): Promise<FarmerProduceCollection[]> {
    return this.collectionRepo.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Progress produce collection status (e.g. CONSIGNED -> IN_TRANSIT -> HUB_RECEIVED)
   */
  async updateCollectionStatus(
    id: string,
    status: FarmerCollectionStatus,
  ): Promise<FarmerProduceCollection> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) {
      throw new NotFoundException(`Farmer produce collection ${id} not found.`);
    }

    collection.status = status;
    return this.collectionRepo.save(collection);
  }

  /**
   * Create daily Upazila Post Office / MFI cash deposit settlement
   */
  async createCashSettlement(
    agentId: string,
    dto: CreateSettlementDto,
  ): Promise<AgentCashSettlement> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const settlementCode = `SETTLE-${dateStr}-${randCode}`;

    const settlement = this.settlementRepo.create({
      settlementCode,
      agentId,
      amount: dto.amount,
      settlementChannel: dto.settlementChannel,
      channelReference: dto.channelReference.trim(),
      slipReceiptUrl: dto.slipReceiptUrl || null,
      status: SettlementStatus.PENDING_REVIEW,
    });

    const saved = await this.settlementRepo.save(settlement);

    // If an active session exists, record CASH_OUT_DEPOSIT to keep drawer reconciled
    const activeSession = await this.getActiveSession(agentId);
    if (activeSession) {
      await this.recordCashTransaction(agentId, {
        type: AgentCashTxType.CASH_OUT_DEPOSIT,
        amount: dto.amount,
        note: `Bank/Post Office Deposit [${dto.settlementChannel}] Ref: ${dto.channelReference}`,
      });
    }

    return saved;
  }

  /**
   * Get settlements submitted by the agent
   */
  async getAgentSettlements(agentId: string): Promise<AgentCashSettlement[]> {
    return this.settlementRepo.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin/Super Admin: Get all settlements across Bangladesh
   */
  async getAllSettlementsAdmin(status?: SettlementStatus): Promise<AgentCashSettlement[]> {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    return this.settlementRepo.find({
      where: whereClause,
      relations: ['agent'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin/Super Admin: Verify or reject an agent's cash deposit
   */
  async reviewSettlementAdmin(
    settlementId: string,
    adminId: string,
    dto: ReviewSettlementDto,
  ): Promise<AgentCashSettlement> {
    const settlement = await this.settlementRepo.findOne({
      where: { id: settlementId },
      relations: ['agent'],
    });

    if (!settlement) {
      throw new NotFoundException(`Cash settlement ${settlementId} not found.`);
    }

    settlement.status = dto.status;
    settlement.verifiedByAdminId = adminId;
    settlement.verifiedAt = new Date();
    settlement.rejectionReason = dto.rejectionReason || null;

    return this.settlementRepo.save(settlement);
  }

  /**
   * Get high-level overview metrics for the agent
   */
  async getAgentPerformanceSummary(agentId: string) {
    const activeSession = await this.getActiveSession(agentId);

    // Compute orders assisted by this agent
    const orderRepo = this.dataSource.getRepository(Order);
    const assistedOrders = await orderRepo.find({
      where: { agentId },
      select: ['id', 'total', 'agentCommission', 'status', 'createdAt'],
    });

    const totalOrdersCount = assistedOrders.length;
    const totalSalesVolume = assistedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalCommissionEarned = assistedOrders.reduce(
      (sum, o) => sum + (Number(o.agentCommission) || 0),
      0,
    );

    // Compute collections
    const collections = await this.collectionRepo.find({ where: { agentId } });
    const totalCollectedKg = collections.reduce((sum, c) => sum + (Number(c.quantityKg) || 0), 0);
    const totalFarmerPayout = collections.reduce((sum, c) => sum + (Number(c.totalPayout) || 0), 0);

    // Compute settlements
    const settlements = await this.settlementRepo.find({ where: { agentId } });
    const verifiedSettlementsAmount = settlements
      .filter((s) => s.status === SettlementStatus.VERIFIED)
      .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const pendingSettlementsAmount = settlements
      .filter((s) => s.status === SettlementStatus.PENDING_REVIEW)
      .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const currentDrawerCash = activeSession
      ? Number(activeSession.openingFloat) +
        Number(activeSession.cashIn) -
        Number(activeSession.cashOut)
      : 0;

    return {
      activeSession,
      currentDrawerCash: Number(currentDrawerCash.toFixed(2)),
      totalOrdersCount,
      totalSalesVolume: Number(totalSalesVolume.toFixed(2)),
      totalCommissionEarned: Number(totalCommissionEarned.toFixed(2)),
      totalCollectionsCount: collections.length,
      totalCollectedKg: Number(totalCollectedKg.toFixed(2)),
      totalFarmerPayout: Number(totalFarmerPayout.toFixed(2)),
      verifiedSettlementsAmount: Number(verifiedSettlementsAmount.toFixed(2)),
      pendingSettlementsAmount: Number(pendingSettlementsAmount.toFixed(2)),
    };
  }

  /**
   * Admin: List all currently active drawer sessions
   */
  async getAdminActiveSessions(): Promise<AgentCashDrawerSession[]> {
    return this.sessionRepo.find({
      where: { status: AgentSessionStatus.OPEN },
      relations: ['agent', 'transactions'],
      order: { openedAt: 'DESC' },
    });
  }
}
