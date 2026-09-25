import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, Like, EntityManager } from 'typeorm';
import axios from 'axios';
import { Order } from '../orders/entities/order.entity.js';
import { Payment } from './entities/payment.entity.js';
import { PaymentStatus, PaymentProvider } from './enums/payment-status.enum.js';
import { OrderStatus, PaymentMethod } from '../orders/enums/order-status.enum.js';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SettingsService } from '../settings/settings.service.js';

export interface InitiatePaymentResult {
  paymentUrl: string;
  transactionId: string;
  paymentId: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectDataSource()
    private dataSource: DataSource,
    private auditLogsService: AuditLogsService,
    private notificationsService: NotificationsService,
    @Optional()
    private settingsService?: SettingsService,
  ) {}

  /**
   * Generates a unique, traceable, SSLCOMMERZ-compliant transaction ID (<= 30 chars).
   * Format: GBZ_<orderShort8>_<timeBase36>_<rand4>
   */
  public generateTransactionId(orderId: string): string {
    const cleanId = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const orderPrefix = cleanId.slice(0, 8);
    const timestampPart = Date.now().toString(36).toUpperCase().slice(-6);
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const tranId = `GBZ_${orderPrefix}_${timestampPart}_${randomPart}`;
    return tranId.slice(0, 30);
  }

  /**
   * Resolves the public callback URLs using dynamic settings or SSLCOMMERZ_PUBLIC_URL.
   */
  private async getCallbackUrls(): Promise<{
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
  }> {
    const dynamicConfig = await this.settingsService?.getSslcommerzConfig();
    const rawPublicUrl =
      dynamicConfig?.publicUrl ||
      this.configService.get<string>('SSLCOMMERZ_PUBLIC_URL') ||
      this.configService.get<string>('API_URL') ||
      'https://undone-unsure-twisting.ngrok-free.dev';
    const baseUrl = rawPublicUrl.replace(/\/+$/, '');
    return {
      successUrl: `${baseUrl}/api/v1/payments/sslcommerz/success`,
      failUrl: `${baseUrl}/api/v1/payments/sslcommerz/fail`,
      cancelUrl: `${baseUrl}/api/v1/payments/sslcommerz/cancel`,
      ipnUrl: `${baseUrl}/api/v1/payments/sslcommerz/ipn`,
    };
  }

  /**
   * Unified payment initiation called either during checkout or on explicit payment initiation.
   */
  async initPayment(
    order: Order,
    customerInfo: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
    },
    redirectUrl?: string,
    lang = 'en',
    entityManager?: EntityManager,
  ): Promise<string> {
    const res = await this.createPaymentAttempt(order, customerInfo, lang, redirectUrl, entityManager);
    return res.paymentUrl;
  }

  /**
   * Creates a Payment record in DB and initiates an SSLCOMMERZ V4 session.
   */
  async createPaymentAttempt(
    order: Order,
    customerInfo: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
    },
    lang = 'en',
    frontendRedirectUrl?: string,
    entityManager?: EntityManager,
  ): Promise<InitiatePaymentResult> {
    if (order.paymentStatus === (PaymentStatus.PAID as any)) {
      throw new BadRequestException('Order is already marked as PAID.');
    }

    const totalAmount = Number(order.total);
    if (!totalAmount || totalAmount <= 0) {
      throw new BadRequestException('Invalid order total amount.');
    }

    // 1. Create a Payment attempt record in INITIATED status
    const paymentRepo = entityManager
      ? entityManager.getRepository(Payment)
      : this.paymentRepository;

    const transactionId = this.generateTransactionId(order.id);
    const payment = paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      provider: PaymentProvider.SSLCOMMERZ,
      transactionId,
      amount: totalAmount,
      currency: 'BDT',
      status: PaymentStatus.INITIATED,
    });
    await paymentRepo.save(payment);

    // 2. SSLCOMMERZ Configuration (dynamic with .env fallback)
    const dynamicConfig = await this.settingsService?.getSslcommerzConfig();
    const storeId = dynamicConfig?.storeId || this.configService.get<string>('SSLCOMMERZ_STORE_ID');
    const storePassword = dynamicConfig?.storePassword || this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD');
    const isLive =
      dynamicConfig?.isLive ??
      (this.configService.get<string>('SSLCOMMERZ_IS_LIVE') === 'true' ||
        this.configService.get<boolean>('SSLCOMMERZ_IS_LIVE') === true);
    const defaultPaymentUrl = isLive
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox-gw.sslcommerz.com/gwprocess/v4/api.php';
    const paymentUrl =
      this.configService.get<string>('SSLCOMMERZ_PAYMENT_URL') || defaultPaymentUrl;

    if (!storeId || !storePassword) {
      this.logger.warn(
        'SSLCOMMERZ credentials (STORE_ID / STORE_PASSWORD) not found. Returning mock payment URL.',
      );
      const frontendBase =
        this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      return {
        paymentUrl: `${frontendBase}/${lang}/checkout/success?mock_payment=true&tran_id=${transactionId}&orderId=${order.id}`,
        transactionId,
        paymentId: payment.id,
      };
    }

    // 3. Build SSLCOMMERZ V4 request payload
    const { successUrl, failUrl, cancelUrl, ipnUrl } = await this.getCallbackUrls();

    const postData: Record<string, string> = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: totalAmount.toFixed(2),
      currency: 'BDT',
      tran_id: transactionId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: ipnUrl,
      shipping_method: 'Courier',
      num_of_item: String(order.items?.length || 1),
      product_name: 'Gramer Bazar Hyperlocal Order',
      product_category: 'E-commerce',
      product_profile: 'general',
      // Customer Info
      cus_name: customerInfo.name || 'Valued Customer',
      cus_email: customerInfo.email || 'customer@gramerbazar.com',
      cus_phone: customerInfo.phone || '+8801700000000',
      cus_add1: customerInfo.address || 'Dhaka',
      cus_city: customerInfo.city || 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      // Shipping Info
      ship_name: customerInfo.name || 'Valued Customer',
      ship_add1: customerInfo.address || 'Dhaka',
      ship_city: customerInfo.city || 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      // Custom params passed through gateway callbacks
      value_a: order.id,
      value_b: order.userId,
      value_c: lang,
      value_d: frontendRedirectUrl || '',
    };

    try {
      this.logger.log(`Initiating SSLCOMMERZ V4 session for TranID: ${transactionId} via ${paymentUrl}`);
      const params = new URLSearchParams(postData);
      const response = await axios.post(paymentUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 20000,
      });

      const data = response.data;
      if (data && data.status === 'SUCCESS' && data.GatewayPageURL) {
        payment.gatewayResponse = {
          sessionkey: data.sessionkey,
          GatewayPageURL: data.GatewayPageURL,
          status: data.status,
        };
        await this.paymentRepository.save(payment);

        return {
          paymentUrl: data.GatewayPageURL,
          transactionId,
          paymentId: payment.id,
        };
      }

      this.logger.error(`SSLCOMMERZ init rejected: ${JSON.stringify(data)}`);
      payment.status = PaymentStatus.FAILED;
      payment.gatewayResponse = data;
      await this.paymentRepository.save(payment);

      throw new BadRequestException(
        data?.failedreason || 'SSLCOMMERZ gateway failed to generate session.',
      );
    } catch (err: any) {
      this.logger.error(`SSLCOMMERZ init error: ${err.message}`, err.stack);
      payment.status = PaymentStatus.FAILED;
      payment.gatewayResponse = { error: err.message };
      await this.paymentRepository.save(payment);
      throw err;
    }
  }

  /**
   * Performs Server-Side Validation via SSLCOMMERZ Validator API.
   */
  async validateServerSide(valId: string): Promise<any> {
    const dynamicConfig = await this.settingsService?.getSslcommerzConfig();
    const storeId =
      dynamicConfig?.storeId || this.configService.get<string>('SSLCOMMERZ_STORE_ID');
    const storePassword =
      dynamicConfig?.storePassword ||
      this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD');
    const isLive =
      dynamicConfig?.isLive ??
      (this.configService.get<string>('SSLCOMMERZ_IS_LIVE') === 'true' ||
        this.configService.get<boolean>('SSLCOMMERZ_IS_LIVE') === true);
    const defaultValUrl = isLive
      ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
    const validationUrl =
      this.configService.get<string>('SSLCOMMERZ_VALIDATION_URL') || defaultValUrl;

    if (!storeId || !storePassword) {
      this.logger.warn('SSLCOMMERZ credentials missing during server-side validation.');
      return { status: 'VALID', mock: true };
    }

    try {
      this.logger.log(`Validating payment with SSLCOMMERZ: val_id=${valId}`);
      const response = await axios.get(validationUrl, {
        params: {
          val_id: valId,
          store_id: storeId,
          store_passwd: storePassword,
          format: 'json',
          v: '1',
        },
        timeout: 20000,
      });

      return response.data;
    } catch (error: any) {
      this.logger.error(`SSLCOMMERZ validator API error: ${error.message}`);
      throw new BadRequestException('Failed to communicate with SSLCOMMERZ validator API.');
    }
  }

  /**
   * Finalizes payment idempotently inside a database transaction.
   * Compares transaction ID, amount, and currency.
   */
  async validateAndFinalizePayment(
    payload: any,
    isIpn = false,
  ): Promise<{
    success: boolean;
    alreadyProcessed?: boolean;
    payment?: Payment;
    order?: Order;
    message?: string;
  }> {
    const tranId = payload.tran_id;
    const valId = payload.val_id;

    if (!tranId) {
      this.logger.warn('Callback received without tran_id.');
      return { success: false, message: 'Missing transaction ID' };
    }

    return this.dataSource.transaction(async (manager) => {
      // 1. Locate payment record with pessimistic write lock to prevent race conditions
      // Note: Lock the root table without outer join relations to avoid Postgres "FOR UPDATE cannot be applied to nullable side of outer join"
      let payment = await manager.findOne(Payment, {
        where: { transactionId: tranId },
        lock: { mode: 'pessimistic_write' },
      });

      // Backward compatibility: If tranId was order ID in legacy records
      if (!payment) {
        payment = await manager.findOne(Payment, {
          where: { orderId: tranId },
          lock: { mode: 'pessimistic_write' },
        });
      }

      if (!payment) {
        // Fallback: Check if Order exists directly
        const directOrder = await manager.findOne(Order, {
          where: { id: tranId },
          lock: { mode: 'pessimistic_write' },
        });
        if (directOrder) {
          directOrder.user = (await manager.findOne(User, {
            where: { id: directOrder.userId },
          })) as any;

          payment = manager.create(Payment, {
            orderId: directOrder.id,
            userId: directOrder.userId,
            provider: PaymentProvider.SSLCOMMERZ,
            transactionId: tranId,
            amount: Number(directOrder.total),
            currency: 'BDT',
            status: PaymentStatus.INITIATED,
          });
          payment = await manager.save(Payment, payment);
          payment.order = directOrder;
        } else {
          this.logger.error(`Payment and Order not found for tran_id: ${tranId}`);
          return { success: false, message: 'Payment record not found' };
        }
      } else if (payment.orderId) {
        const linkedOrder = await manager.findOne(Order, {
          where: { id: payment.orderId },
          relations: ['user'],
        });
        if (linkedOrder) {
          payment.order = linkedOrder;
        }
      }

      // 2. Idempotency Check: If already PAID, do not re-run financial or notification logic
      if (payment.status === PaymentStatus.PAID) {
        this.logger.log(`Payment ${tranId} is already finalized as PAID. Idempotent return.`);
        return {
          success: true,
          alreadyProcessed: true,
          payment,
          order: payment.order,
        };
      }

      // 3. Server-Side Validation against SSLCOMMERZ Validator API
      let validationData: any = null;
      if (valId) {
        validationData = await this.validateServerSide(valId);
      } else if (payload.status === 'VALID' || payload.status === 'VALIDATED') {
        validationData = payload;
      }

      const valStatus = (validationData?.status || payload.status || '').toUpperCase();
      const isValid = valStatus === 'VALID' || valStatus === 'VALIDATED';

      if (!isValid) {
        this.logger.warn(`SSLCOMMERZ validation returned invalid status: ${valStatus}`);
        payment.status = PaymentStatus.FAILED;
        payment.gatewayStatus = valStatus;
        payment.failedAt = new Date();
        payment.gatewayResponse = { payload, validationData };
        await manager.save(Payment, payment);

        if (payment.order) {
          payment.order.paymentStatus = PaymentStatus.FAILED as any;
          await manager.save(Order, payment.order);
        }
        return { success: false, message: 'Gateway validation failed' };
      }

      // 4. Strict Security Verification: Check Amount Tampering
      const gatewayAmount = Number(validationData?.amount || payload.amount || 0);
      const expectedAmount = Number(payment.amount);
      const amountDiff = Math.abs(gatewayAmount - expectedAmount);

      if (gatewayAmount <= 0 || amountDiff > 0.05) {
        this.logger.error(
          `SECURITY ALERT: Amount mismatch on TranID: ${tranId}. Expected: ${expectedAmount}, Gateway: ${gatewayAmount}`,
        );
        payment.status = PaymentStatus.FAILED;
        payment.gatewayStatus = 'AMOUNT_MISMATCH';
        payment.riskLevel = 'DANGER';
        payment.riskTitle = 'Potential amount tampering';
        payment.failedAt = new Date();
        payment.gatewayResponse = { payload, validationData, expectedAmount, gatewayAmount };
        await manager.save(Payment, payment);

        if (payment.order) {
          payment.order.paymentStatus = PaymentStatus.FAILED as any;
          await manager.save(Order, payment.order);
        }
        return { success: false, message: 'Amount tampering detected' };
      }

      // 5. Strict Security Verification: Currency Check
      const gatewayCurrency = (validationData?.currency || payload.currency || 'BDT').toUpperCase();
      if (gatewayCurrency !== payment.currency.toUpperCase()) {
        this.logger.error(
          `SECURITY ALERT: Currency mismatch on TranID: ${tranId}. Expected: ${payment.currency}, Gateway: ${gatewayCurrency}`,
        );
        payment.status = PaymentStatus.FAILED;
        payment.gatewayStatus = 'CURRENCY_MISMATCH';
        payment.failedAt = new Date();
        await manager.save(Payment, payment);
        return { success: false, message: 'Currency mismatch' };
      }

      // 6. Transition to PAID & Update Order
      payment.status = PaymentStatus.PAID;
      payment.gatewayStatus = valStatus;
      payment.validationId = valId || validationData?.val_id || payload.val_id || null;
      payment.bankTransactionId = validationData?.bank_tran_id || payload.bank_tran_id || null;
      payment.riskLevel = validationData?.risk_level || payload.risk_level || null;
      payment.riskTitle = validationData?.risk_title || payload.risk_title || null;
      payment.cardType = validationData?.card_type || payload.card_type || null;
      payment.cardBrand = validationData?.card_brand || payload.card_brand || null;
      payment.cardIssuer = validationData?.card_issuer || payload.card_issuer || null;
      payment.gatewayResponse = { payload, validation: validationData };
      payment.paidAt = new Date();
      await manager.save(Payment, payment);

      const order = payment.order;
      if (order) {
        order.paymentStatus = PaymentStatus.PAID as any;
        order.transactionId = payment.transactionId;
        if (order.status === OrderStatus.PENDING) {
          order.status = OrderStatus.CONFIRMED;
        }
        await manager.save(Order, order);

        // Record status history
        const history = new OrderStatusHistory();
        history.orderId = order.id;
        history.status = order.status;
        history.remark = `Payment confirmed via SSLCOMMERZ (Tran: ${payment.transactionId}, Bank: ${payment.bankTransactionId || 'N/A'})`;
        await manager.save(OrderStatusHistory, history);

        // Best effort confirmation email
        if (order.user?.email) {
          try {
            await this.notificationsService.sendOrderConfirmationEmail(order.user.email, order);
          } catch (e) {
            this.logger.warn(`Failed to send order email for order ${order.id}: ${e}`);
          }
        }
      }

      await this.auditLogsService.record({
        actorId: payment.userId,
        actorName: 'SSLCOMMERZ Gateway',
        action: 'PAYMENT_SUCCESS',
        targetType: 'Payment',
        targetId: payment.id,
        details: `Paid ৳${payment.amount} (Tran: ${payment.transactionId}, Source: ${isIpn ? 'IPN' : 'Callback'})`,
      });

      return { success: true, payment, order };
    });
  }

  /**
   * Handles payment failure from SSLCOMMERZ gateway.
   */
  async handleFail(payload: any): Promise<{ success: boolean; payment?: Payment }> {
    const tranId = payload.tran_id;
    if (!tranId) return { success: false };

    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { transactionId: tranId },
        relations: ['order'],
      });
      if (!payment) return { success: false };

      if (payment.status === PaymentStatus.PAID) {
        return { success: true, payment };
      }

      payment.status = PaymentStatus.FAILED;
      payment.gatewayStatus = payload.status || 'FAILED';
      payment.failedAt = new Date();
      payment.gatewayResponse = payload;
      await manager.save(Payment, payment);

      if (payment.order && payment.order.paymentStatus !== (PaymentStatus.PAID as any)) {
        payment.order.paymentStatus = PaymentStatus.FAILED as any;
        await manager.save(Order, payment.order);
      }

      return { success: false, payment };
    });
  }

  /**
   * Handles payment cancellation from SSLCOMMERZ gateway.
   */
  async handleCancel(payload: any): Promise<{ success: boolean; payment?: Payment }> {
    const tranId = payload.tran_id;
    if (!tranId) return { success: false };

    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { transactionId: tranId },
        relations: ['order'],
      });
      if (!payment) return { success: false };

      if (payment.status === PaymentStatus.PAID) {
        return { success: true, payment };
      }

      payment.status = PaymentStatus.CANCELLED;
      payment.gatewayStatus = payload.status || 'CANCELLED';
      payment.gatewayResponse = payload;
      await manager.save(Payment, payment);

      if (payment.order && payment.order.paymentStatus !== (PaymentStatus.PAID as any)) {
        payment.order.paymentStatus = PaymentStatus.FAILED as any;
        await manager.save(Order, payment.order);
      }

      return { success: false, payment };
    });
  }

  /**
   * Retries an unpaid or previously failed payment by creating a brand-new attempt
   * with a fresh unique transaction ID.
   */
  async retryPayment(
    orderId: string,
    userId: string,
    userRoles: string[] = [],
    lang = 'en',
    originUrl?: string,
  ): Promise<InitiatePaymentResult> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'address', 'items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isAdmin =
      userRoles.includes(Role.ADMIN) || userRoles.includes(Role.SUPER_ADMIN);
    if (order.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to retry payment for this order.');
    }

    if (order.paymentStatus === (PaymentStatus.PAID as any)) {
      throw new BadRequestException('Order is already paid.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot retry payment for a cancelled order.');
    }

    return this.createPaymentAttempt(
      order,
      {
        name: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Customer',
        email: order.user?.email || undefined,
        phone: order.user?.phone || undefined,
        address: order.address?.streetAddress,
      },
      lang,
      originUrl,
    );
  }

  /**
   * Retrieves payment details by transaction ID.
   * Enforces customer authorization (only own payments) or admin/super-admin access.
   */
  async getPaymentByTransactionId(
    tranId: string,
    userId: string,
    userRoles: string[] = [],
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: [{ transactionId: tranId }, { orderId: tranId }],
      relations: ['order', 'order.address', 'order.items'],
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    const isAdmin =
      userRoles.includes(Role.ADMIN) || userRoles.includes(Role.SUPER_ADMIN);
    if (payment.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this payment.');
    }

    return payment;
  }

  /**
   * Retrieves payments associated with a specific order.
   */
  async getPaymentsByOrderId(
    orderId: string,
    userId: string,
    userRoles: string[] = [],
  ): Promise<Payment[]> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const isAdmin =
      userRoles.includes(Role.ADMIN) || userRoles.includes(Role.SUPER_ADMIN);
    if (order.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this order payment.');
    }

    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves customer payments with pagination.
   */
  async getMyPayments(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.paymentRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['order'],
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: List all payments with search and filtering.
   */
  async findAllAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PaymentStatus;
    provider?: string;
  }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.max(1, Math.min(100, Number(params.limit || 20)));

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('payment.user', 'user')
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (params.status) {
      qb.andWhere('payment.status = :status', { status: params.status });
    }

    if (params.provider) {
      qb.andWhere('payment.provider = :provider', { provider: params.provider });
    }

    if (params.search) {
      const s = `%${params.search.trim()}%`;
      qb.andWhere(
        '(payment.transactionId ILIKE :s OR payment.orderId::text ILIKE :s OR user.phone ILIKE :s OR user.email ILIKE :s OR user.firstName ILIKE :s OR user.lastName ILIKE :s OR payment.bankTransactionId ILIKE :s)',
        { s },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Get single payment with full details.
   */
  async findOneAdmin(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order', 'order.address', 'order.items', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    return payment;
  }
}
