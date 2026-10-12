export interface SmsSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export interface SmsProvider {
  readonly name: string;
  sendSms(to: string, message: string): Promise<SmsSendResult>;
}
