import { PhoneAuthConfig } from '../../types';

export type OtpChannel = 'whatsapp' | 'sms';

export type WhatsAppProviderType = 'simulation' | 'meta_cloud' | 'twilio_whatsapp' | 'ultramsg';
export type SmsProviderType = 'simulation' | 'twilio' | 'africastalking' | 'infobip' | 'termii' | 'custom';

export interface OtpDeliveryResult {
  success: boolean;
  channel: OtpChannel;
  provider: string;
  messageId?: string;
  error?: string;
  simulatedOtp?: string;
  fallbackTriggered?: boolean;
  fallbackReason?: string;
}

export interface OtpProvider {
  name: string;
  channel: OtpChannel;
  sendOtp(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr'
  ): Promise<OtpDeliveryResult>;
}

export interface OtpLogRecord {
  id: string;
  phone: string;
  reason: 'registration' | 'login' | 'reset_password' | 'update_phone';
  channel: OtpChannel;
  provider: string;
  status: 'sent' | 'delivered' | 'fallback_triggered' | 'failed';
  fallbackTriggered: boolean;
  fallbackReason?: string;
  otpCode?: string;
  carrier?: string;
  timestamp: string; // ISO string
  verified: boolean;
  resendCount: number;
}
