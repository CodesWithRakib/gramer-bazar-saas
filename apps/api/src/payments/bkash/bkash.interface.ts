export interface BkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface BkashCreatePaymentRequest {
  orderId: string;
  amount: number;
  customerPhone?: string;
  callbackUrl?: string;
  payerReference?: string;
}

export interface BkashCreatePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  bkashURL: string;
  customerMsisdn?: string;
  amount: string;
  intent: string;
  merchantInvoiceNumber: string;
  paymentCreateTime: string;
  transactionStatus: string;
}

export interface BkashExecutePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  trxID: string;
  amount: string;
  customerMsisdn: string;
  paymentExecuteTime: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  transactionStatus: string;
}

export interface BkashRefundRequest {
  paymentId: string;
  trxId: string;
  amount: number;
  reason?: string;
  sku?: string;
}

export interface BkashRefundResponse {
  statusCode: string;
  statusMessage: string;
  originalTrxID: string;
  refundTrxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  charge: string;
  completedTime: string;
}
