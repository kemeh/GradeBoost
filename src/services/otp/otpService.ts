import { db } from '../../firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { PhoneAuthConfig } from '../../types';
import { OtpDeliveryResult, OtpLogRecord } from './types';
import { WhatsAppProviderDispatcher } from './whatsappProvider';
import { SmsProviderDispatcher } from './smsProvider';

export class OtpService {
  /**
   * Main entry point to send OTP with optional channel selection and automatic SMS fallback.
   */
  static async sendOtpWithFallback(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr' = 'en',
    preferredChannel?: 'whatsapp' | 'sms'
  ): Promise<OtpDeliveryResult> {
    const primary = preferredChannel || config.primaryChannel || 'whatsapp';
    const enableWhatsapp = config.enableWhatsapp !== false; // Default true if unspecified
    const enableSmsFallback = config.enableSmsFallback !== false; // Default true

    console.log(`[OTP Service] Dispatching OTP to ${phone}. Preferred Channel: ${primary}`);

    // If Primary Channel is WhatsApp and WhatsApp is enabled
    if (primary === 'whatsapp' && enableWhatsapp) {
      console.log(`[OTP Service] Step 1: Attempting WhatsApp OTP delivery...`);
      const waResult = await WhatsAppProviderDispatcher.sendOtp(phone, otpCode, config, lang);

      if (waResult.success) {
        console.log(`[OTP Service] WhatsApp OTP delivered successfully via ${waResult.provider}.`);
        await this.logOtpAttempt(phone, 'whatsapp', waResult.provider, 'delivered', false, undefined, otpCode);
        return waResult;
      }

      // WhatsApp delivery failed or unavailable -> Trigger automatic SMS Fallback
      const fallbackReason = waResult.error || 'WhatsApp service unavailable or recipient not registered on WhatsApp.';
      console.warn(`[OTP Service] Step 2: WhatsApp failed (${fallbackReason}). Switching to SMS Fallback...`);

      if (enableSmsFallback) {
        const smsResult = await new SmsProviderDispatcher().sendOtp(phone, otpCode, config, lang);

        if (smsResult.success) {
          console.log(`[OTP Service] Fallback SMS OTP delivered successfully via ${smsResult.provider}.`);
          const finalResult: OtpDeliveryResult = {
            ...smsResult,
            fallbackTriggered: true,
            fallbackReason
          };
          await this.logOtpAttempt(phone, 'sms', smsResult.provider, 'fallback_triggered', true, fallbackReason, otpCode);
          return finalResult;
        } else {
          console.error(`[OTP Service] Both WhatsApp and SMS Fallback failed.`);
          await this.logOtpAttempt(phone, 'sms', smsResult.provider, 'failed', true, `WhatsApp & SMS both failed: ${smsResult.error}`, otpCode);
          return {
            success: false,
            channel: 'sms',
            provider: smsResult.provider,
            error: lang === 'fr'
              ? `Échec de l'envoi WhatsApp & SMS: ${smsResult.error || fallbackReason}`
              : `Both WhatsApp & SMS delivery failed: ${smsResult.error || fallbackReason}`,
            fallbackTriggered: true,
            fallbackReason
          };
        }
      } else {
        return {
          ...waResult,
          fallbackTriggered: false,
          fallbackReason: 'SMS fallback is disabled in system config'
        };
      }
    }

    // Direct SMS path (Primary = 'sms' or explicit fallback requested by user)
    console.log(`[OTP Service] Dispatching direct SMS OTP...`);
    const smsRes = await new SmsProviderDispatcher().sendOtp(phone, otpCode, config, lang);
    await this.logOtpAttempt(phone, 'sms', smsRes.provider, smsRes.success ? 'delivered' : 'failed', false, smsRes.error, otpCode);
    return smsRes;
  }

  /**
   * Log OTP delivery activity to Firestore `otp_logs` for Admin Dashboard analytics & audit logs.
   */
  private static async logOtpAttempt(
    phone: string,
    channel: 'whatsapp' | 'sms',
    provider: string,
    status: 'sent' | 'delivered' | 'fallback_triggered' | 'failed',
    fallbackTriggered: boolean,
    fallbackReason?: string,
    otpCode?: string
  ): Promise<void> {
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logRef = doc(db, 'otp_logs', logId);

      const record: OtpLogRecord = {
        id: logId,
        phone,
        reason: 'registration',
        channel,
        provider,
        status,
        fallbackTriggered,
        fallbackReason: fallbackReason || '',
        otpCode: otpCode || '******',
        timestamp: new Date().toISOString(),
        verified: false,
        resendCount: 1
      };

      await setDoc(logRef, record);
    } catch (err) {
      console.warn('Failed to write OTP audit log to Firestore:', err);
    }
  }

  /**
   * Fetch recent OTP logs for Admin Dashboard.
   */
  static async getRecentLogs(limitCount: number = 50): Promise<OtpLogRecord[]> {
    try {
      const q = query(
        collection(db, 'otp_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const logs: OtpLogRecord[] = [];
      snap.forEach((docSnap) => {
        logs.push(docSnap.data() as OtpLogRecord);
      });
      return logs;
    } catch (err) {
      console.warn('Could not query otp_logs, returning empty list:', err);
      return [];
    }
  }
}
