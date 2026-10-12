import { Injectable, Logger } from '@nestjs/common';
import {
  CourierProvider,
  CourierBookingRequest,
  CourierBookingResponse,
  CourierTrackingResponse,
} from './courier.interface.js';

@Injectable()
export class MockCourierProvider implements CourierProvider {
  readonly name = 'MOCK';
  private readonly logger = new Logger(MockCourierProvider.name);

  async bookParcel(request: CourierBookingRequest): Promise<CourierBookingResponse> {
    const consignmentId = `MOCK_CID_${Date.now()}`;
    const trackingCode = `GBZ_TRACK_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    this.logger.log(
      `[MOCK COURIER] Booked parcel for Order ${request.orderId} (Invoice: ${request.invoice}) to ${request.recipientName} (${request.recipientPhone}). Tracking: ${trackingCode}`,
    );

    return {
      success: true,
      provider: this.name,
      consignmentId,
      trackingCode,
      status: 'in_review',
    };
  }

  async trackParcel(trackingCode: string): Promise<CourierTrackingResponse> {
    this.logger.log(`[MOCK COURIER] Querying tracking for ${trackingCode}`);
    return {
      success: true,
      provider: this.name,
      trackingCode,
      status: 'in_transit',
      rawDetails: {
        note: 'Parcel is out for delivery via mock courier hub.',
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
