import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// @ts-ignore
import SSLCommerzPayment from 'sslcommerz-lts';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity.js';
import { PaymentStatus, OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private sslcz: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    const storeId = this.configService.get<string>('SSLCOMMERZ_STORE_ID');
    const storePassword = this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD');
    const isLive = this.configService.get<string>('SSLCOMMERZ_IS_LIVE') === 'true';

    if (storeId && storePassword) {
      this.sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
    } else {
      this.logger.warn('SSLCommerz credentials not provided. Payment gateway will not work.');
    }
  }

  async initPayment(order: Order, customerInfo: any, redirectUrl: string) {
    if (!this.sslcz) {
      this.logger.warn('Payment gateway is not configured. Returning mock payment URL.');
      // Return a mock URL for local development/testing
      return `${redirectUrl}/success?mock_payment=true&tran_id=${order.id}`;
    }

    const data = {
      total_amount: order.total,
      currency: 'BDT',
      tran_id: order.id, // Using Order ID as Transaction ID for simplicity
      success_url: `${redirectUrl}/success`,
      fail_url: `${redirectUrl}/fail`,
      cancel_url: `${redirectUrl}/cancel`,
      ipn_url: `${this.configService.get<string>('API_URL')}/payments/ipn`,
      shipping_method: 'Courier',
      product_name: 'Gramer Bazar Products',
      product_category: 'E-commerce',
      product_profile: 'general',
      cus_name: customerInfo.name,
      cus_email: customerInfo.email || 'customer@example.com',
      cus_add1: customerInfo.address || 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: customerInfo.phone,
      cus_fax: customerInfo.phone,
      ship_name: customerInfo.name,
      ship_add1: customerInfo.address || 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
    };

    try {
      const apiResponse = await this.sslcz.init(data);
      if (apiResponse?.GatewayPageURL) {
        return apiResponse.GatewayPageURL;
      } else {
        throw new Error('Failed to generate payment URL from SSLCommerz');
      }
    } catch (error) {
      this.logger.error('SSLCommerz Init Error', error);
      throw error;
    }
  }

  async handleSuccess(payload: any) {
    const orderId = payload.tran_id;
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    
    if (order) {
      order.paymentStatus = PaymentStatus.PAID;
      order.transactionId = payload.bank_tran_id;
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.CONFIRMED;
      }
      await this.orderRepository.save(order);
      return true;
    }
    return false;
  }

  async handleFail(payload: any) {
    const orderId = payload.tran_id;
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    
    if (order) {
      order.paymentStatus = PaymentStatus.FAILED;
      await this.orderRepository.save(order);
      return true;
    }
    return false;
  }

  async handleCancel(payload: any) {
    const orderId = payload.tran_id;
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    
    if (order) {
      order.paymentStatus = PaymentStatus.FAILED;
      order.status = OrderStatus.CANCELLED;
      await this.orderRepository.save(order);
      return true;
    }
    return false;
  }
}
