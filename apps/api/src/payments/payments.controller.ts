import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private configService: ConfigService
  ) {}

  @Post('success')
  async handleSuccess(@Body() payload: any, @Res() res: Response) {
    const success = await this.paymentsService.handleSuccess(payload);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    if (success) {
      return res.redirect(`${frontendUrl}/en/orders/${payload.tran_id}?success=true`);
    }
    return res.redirect(`${frontendUrl}/en/checkout/fail`);
  }

  @Post('fail')
  async handleFail(@Body() payload: any, @Res() res: Response) {
    await this.paymentsService.handleFail(payload);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/en/checkout/fail?order_id=${payload.tran_id}`);
  }

  @Post('cancel')
  async handleCancel(@Body() payload: any, @Res() res: Response) {
    await this.paymentsService.handleCancel(payload);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/en/checkout/cancel?order_id=${payload.tran_id}`);
  }

  @Post('ipn')
  async handleIpn(@Body() payload: any, @Res() res: Response) {
    // IPN (Instant Payment Notification) listener
    // This is called asynchronously by SSLCommerz server to verify payment
    const success = await this.paymentsService.handleSuccess(payload);
    if (success) {
      return res.status(HttpStatus.OK).send('IPN handled successfully');
    }
    return res.status(HttpStatus.BAD_REQUEST).send('Invalid IPN data');
  }
}
