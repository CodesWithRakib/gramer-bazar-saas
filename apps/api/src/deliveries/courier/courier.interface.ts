export interface CourierBookingRequest {
  orderId: string;
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface CourierBookingResponse {
  success: boolean;
  provider: string;
  consignmentId?: string;
  trackingCode?: string;
  status: string;
  error?: string;
}

export interface CourierTrackingResponse {
  success: boolean;
  provider: string;
  trackingCode: string;
  status: string;
  deliveredAt?: string;
  error?: string;
  rawDetails?: unknown;
}

export interface CourierProvider {
  readonly name: string;
  bookParcel(request: CourierBookingRequest): Promise<CourierBookingResponse>;
  trackParcel(trackingCode: string): Promise<CourierTrackingResponse>;
}
