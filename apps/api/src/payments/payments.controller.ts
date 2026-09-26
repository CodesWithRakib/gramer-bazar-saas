import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Res,
  Req,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { InitiatePaymentDto, PaymentAdminQueryDto } from './dto/payment.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { InitiatePaymentResponseDto, PaymentResponseDto } from './dto/payment-response.dto.js';

@ApiTags('Payments')
@Controller('payments')
@ApiCommonErrors()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private configService: ConfigService,
  ) {}

  private getFrontendRedirectBase(payload: any): { baseUrl: string; lang: string } {
    let lang = payload.value_c || 'en';
    let frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (payload.value_d && payload.value_d.startsWith('http')) {
      const match = payload.value_d.match(/^(https?:\/\/[^\/]+)(?:\/([a-z]{2}))?/);
      if (match) {
        frontendUrl = match[1];
        if (match[2]) lang = match[2];
      }
    }

    return { baseUrl: frontendUrl.replace(/\/+$/, ''), lang };
  }

  // ========================================================
  // INITIATION & RETRY (Protected by JwtAuthGuard)
  // ========================================================

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate payment session for an order', description: 'Creates a payment session and returns SSLCOMMERZ gateway redirect URL.' })
  @ApiStandardResponse({ type: InitiatePaymentResponseDto, status: 201, description: 'Payment session created successfully' })
  async initiatePayment(@Req() req: any, @Body() dto: InitiatePaymentDto) {
    const originUrl = req.headers.origin || req.headers.referer || 'http://localhost:3000';
    return this.paymentsService.retryPayment(
      dto.orderId,
      req.user.id,
      req.user.roles?.map((r: any) => r.name) || [],
      dto.lang || 'en',
      originUrl,
    );
  }

  @Post('retry/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retry payment for an existing unpaid order', description: 'Re-initiates payment for an order in unpaid/pending status.' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  @ApiStandardResponse({ type: InitiatePaymentResponseDto, status: 201, description: 'Payment session re-initiated' })
  async retryPayment(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Query('lang') lang = 'en',
  ) {
    const originUrl = req.headers.origin || req.headers.referer || 'http://localhost:3000';
    return this.paymentsService.retryPayment(
      orderId,
      req.user.id,
      req.user.roles?.map((r: any) => r.name) || [],
      lang,
      originUrl,
    );
  }

  // ========================================================
  // SSLCOMMERZ GATEWAY CALLBACKS (Public - No Bearer Auth)
  // Both prefix `/sslcommerz/*` and legacy `/*` supported
  // ========================================================

  @Post(['sslcommerz/success', 'success'])
  @ApiOperation({ summary: 'SSLCOMMERZ Hosted Checkout Success Callback', description: 'Webhook called by SSLCOMMERZ on user successful transaction completion.' })
  @ApiResponse({ status: 302, description: 'Redirects to customer frontend success page' })
  async handleSuccess(@Body() payload: any, @Res() res: Response) {
    this.logger.log(`SSLCOMMERZ success callback received for tran_id: ${payload.tran_id}`);
    const result = await this.paymentsService.validateAndFinalizePayment(payload, false);
    const { baseUrl, lang } = this.getFrontendRedirectBase(payload);
    const orderId = payload.value_a || result.order?.id || payload.tran_id;
    const tranId = payload.tran_id;

    if (result.success) {
      return res.redirect(
        `${baseUrl}/${lang}/payment/success?orderId=${encodeURIComponent(orderId)}&tran_id=${encodeURIComponent(tranId)}`,
      );
    }

    return res.redirect(
      `${baseUrl}/${lang}/payment/failed?orderId=${encodeURIComponent(orderId)}&tran_id=${encodeURIComponent(tranId)}&reason=${encodeURIComponent(result.message || 'Validation failed')}`,
    );
  }

  @Post(['sslcommerz/fail', 'fail'])
  @ApiOperation({ summary: 'SSLCOMMERZ Hosted Checkout Fail Callback', description: 'Webhook called by SSLCOMMERZ on user failed transaction.' })
  @ApiResponse({ status: 302, description: 'Redirects to customer frontend failure page' })
  async handleFail(@Body() payload: any, @Res() res: Response) {
    this.logger.warn(`SSLCOMMERZ fail callback received for tran_id: ${payload.tran_id}`);
    await this.paymentsService.handleFail(payload);
    const { baseUrl, lang } = this.getFrontendRedirectBase(payload);
    const orderId = payload.value_a || payload.tran_id;
    const tranId = payload.tran_id;

    return res.redirect(
      `${baseUrl}/${lang}/payment/failed?orderId=${encodeURIComponent(orderId)}&tran_id=${encodeURIComponent(tranId)}`,
    );
  }

  @Post(['sslcommerz/cancel', 'cancel'])
  @ApiOperation({ summary: 'SSLCOMMERZ Hosted Checkout Cancel Callback', description: 'Webhook called by SSLCOMMERZ when user clicks cancel in payment gateway.' })
  @ApiResponse({ status: 302, description: 'Redirects to customer frontend cancelled page' })
  async handleCancel(@Body() payload: any, @Res() res: Response) {
    this.logger.log(`SSLCOMMERZ cancel callback received for tran_id: ${payload.tran_id}`);
    await this.paymentsService.handleCancel(payload);
    const { baseUrl, lang } = this.getFrontendRedirectBase(payload);
    const orderId = payload.value_a || payload.tran_id;
    const tranId = payload.tran_id;

    return res.redirect(
      `${baseUrl}/${lang}/payment/cancelled?orderId=${encodeURIComponent(orderId)}&tran_id=${encodeURIComponent(tranId)}`,
    );
  }

  @Post(['sslcommerz/ipn', 'ipn'])
  @ApiOperation({ summary: 'SSLCOMMERZ Server-to-Server IPN Webhook', description: 'Instant Payment Notification called directly by SSLCOMMERZ servers for validation.' })
  @ApiResponse({ status: 200, description: 'IPN validated and acknowledged' })
  async handleIpn(@Body() payload: any, @Res() res: Response) {
    this.logger.log(`SSLCOMMERZ IPN received for tran_id: ${payload.tran_id}`);
    const result = await this.paymentsService.validateAndFinalizePayment(payload, true);

    if (result.success) {
      return res.status(HttpStatus.OK).send('IPN handled successfully');
    }

    return res
      .status(HttpStatus.BAD_REQUEST)
      .send(`Invalid IPN data: ${result.message || 'Unknown error'}`);
  }

  // ========================================================
  // VERIFICATION & CUSTOMER ENDPOINTS
  // ========================================================

  @Get('verify/:transactionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify payment status by transaction ID', description: 'Fetches verified payment entity and order status for a transaction.' })
  @ApiParam({ name: 'transactionId', description: 'System transaction ID or Order ID' })
  @ApiStandardResponse({ type: PaymentResponseDto, description: 'Payment verification record' })
  async verifyPayment(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
  ) {
    const roles = req.user.roles?.map((r: any) => r.name) || [];
    return this.paymentsService.getPaymentByTransactionId(transactionId, req.user.id, roles);
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment records for an order', description: 'Lists all payment attempts and transactions associated with an order.' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiStandardResponse({ type: PaymentResponseDto, isArray: true, description: 'List of order payments' })
  async getOrderPayments(@Req() req: any, @Param('orderId') orderId: string) {
    const roles = req.user.roles?.map((r: any) => r.name) || [];
    return this.paymentsService.getPaymentsByOrderId(orderId, req.user.id, roles);
  }

  @Get('my-payments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment history for current logged in user', description: 'Returns paginated payment transactions made by the authenticated user.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiStandardPaginatedResponse(PaymentResponseDto, { description: 'Paginated user payments' })
  async getMyPayments(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getMyPayments(req.user.id, page, limit);
  }

  // ========================================================
  // ADMIN PAYMENT MANAGEMENT (Admin / Super Admin only)
  // ========================================================

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all payment transactions with filters (Admin only)', description: 'Returns all system payments with advanced filtering by status, provider, and customer.' })
  @ApiStandardPaginatedResponse(PaymentResponseDto, { description: 'Paginated payments for admin audit' })
  async getAdminPayments(@Query() query: PaymentAdminQueryDto) {
    return this.paymentsService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get payment transaction details by ID (Admin only)', description: 'Fetches raw transaction details, bank transaction IDs, and gateway responses.' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiStandardResponse({ type: PaymentResponseDto, description: 'Admin payment details' })
  async getAdminPaymentById(@Param('id') id: string) {
    return this.paymentsService.findOneAdmin(id);
  }
}
