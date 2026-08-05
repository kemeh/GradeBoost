import { PhoneAuthConfig } from '../../types';
import { OtpProvider, OtpDeliveryResult } from './types';
import { SmsService } from '../smsService';

export class SmsProviderDispatcher implements OtpProvider {
  name = 'SMS Gateway Provider';
  channel: 'sms' = 'sms';

  async sendOtp(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr' = 'en'
  ): Promise<OtpDeliveryResult> {
    const providerType = config.smsProvider || 'simulation';
    try {
      const res = await SmsService.sendOtp(phone, otpCode, config, lang);
      return {
        success: res.success,
        channel: 'sms',
        provider: providerType,
        messageId: res.messageId,
        error: res.error,
        simulatedOtp: res.simulatedOtp
      };
    } catch (err: any) {
      console.error('[SMS Provider Error]', err);
      return {
        success: false,
        channel: 'sms',
        provider: providerType,
        error: err.message || 'SMS delivery failed'
      };
    }
  }
}
