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
    let baseRedirectUrl = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/en`;
    if (payload.value_a) {
      const urlMatch = payload.value_a.match(/^(https?:\/\/[^\/]+)\/([a-z]{2})\/checkout$/);
      if (urlMatch) baseRedirectUrl = `${urlMatch[1]}/${urlMatch[2]}`;
    }
    
    if (success) {
      return res.redirect(`${baseRedirectUrl}/orders/${payload.tran_id}?success=true`);
    }
    return res.redirect(`${baseRedirectUrl}/checkout/fail`);
  }

  @Post('fail')
  async handleFail(@Body() payload: any, @Res() res: Response) {
    await this.paymentsService.handleFail(payload);
    let baseRedirectUrl = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/en`;
    if (payload.value_a) {
      const urlMatch = payload.value_a.match(/^(https?:\/\/[^\/]+)\/([a-z]{2})\/checkout$/);
      if (urlMatch) baseRedirectUrl = `${urlMatch[1]}/${urlMatch[2]}`;
    }
    return res.redirect(`${baseRedirectUrl}/checkout/fail?order_id=${payload.tran_id}`);
  }

  @Post('cancel')
  async handleCancel(@Body() payload: any, @Res() res: Response) {
    await this.paymentsService.handleCancel(payload);
    let baseRedirectUrl = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/en`;
    if (payload.value_a) {
      const urlMatch = payload.value_a.match(/^(https?:\/\/[^\/]+)\/([a-z]{2})\/checkout$/);
      if (urlMatch) baseRedirectUrl = `${urlMatch[1]}/${urlMatch[2]}`;
    }
    return res.redirect(`${baseRedirectUrl}/checkout/cancel?order_id=${payload.tran_id}`);
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
