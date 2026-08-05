import { PhoneAuthConfig } from '../../types';
import { OtpProvider, OtpDeliveryResult } from './types';

export class SimulatedWhatsappProvider implements OtpProvider {
  name = 'WhatsApp Sandbox Simulation';
  channel: 'whatsapp' = 'whatsapp';

  async sendOtp(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr' = 'en'
  ): Promise<OtpDeliveryResult> {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
    const message = lang === 'fr'
      ? `💬 [WhatsApp] Code de vérification Edulpha: ${otpCode}. Valide pour ${config.otpExpiryMinutes || 5} min.`
      : `💬 [WhatsApp] Your Edulpha verification code is: ${otpCode}. Valid for ${config.otpExpiryMinutes || 5} mins.`;

    console.log(`\n========================================`);
    console.log(`💬 [SIMULATED WHATSAPP OTP DELIVERED]`);
    console.log(`To: ${formattedPhone}`);
    console.log(`Message: "${message}"`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`========================================\n`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('edulpha:simulated-whatsapp', {
          detail: { phone: formattedPhone, otpCode, message, timestamp: Date.now() }
        })
      );
    }

    return {
      success: true,
      channel: 'whatsapp',
      provider: 'whatsapp_simulation',
      messageId: `WA-SIM-${Date.now()}`,
      simulatedOtp: otpCode
    };
  }
}

export class MetaWhatsappProvider implements OtpProvider {
  name = 'Meta WhatsApp Cloud API';
  channel: 'whatsapp' = 'whatsapp';

  async sendOtp(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr' = 'en'
  ): Promise<OtpDeliveryResult> {
    const token = config.whatsappApiKey;
    const phoneId = config.whatsappPhoneNumberId;

    if (!token || !phoneId) {
      throw new Error('Meta WhatsApp Cloud API Token & Phone Number ID are required in Admin Settings.');
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

    // Attempt sending via Meta Cloud API template or text
    const payload = config.whatsappTemplateName ? {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanDigits,
      type: 'template',
      template: {
        name: config.whatsappTemplateName || 'edulpha_otp_verification',
        language: { code: lang === 'fr' ? 'fr' : 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: otpCode }]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: otpCode }]
          }
        ]
      }
    } : {
      messaging_product: 'whatsapp',
      to: cleanDigits,
      type: 'text',
      text: {
        body: lang === 'fr'
          ? `Votre code de vérification Edulpha via WhatsApp est: ${otpCode}`
          : `Your Edulpha verification code via WhatsApp is: ${otpCode}`
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      const errDetail = data.error?.message || 'Meta WhatsApp API delivery failed';
      throw new Error(errDetail);
    }

    return {
      success: true,
      channel: 'whatsapp',
      provider: 'meta_cloud',
      messageId: data.messages?.[0]?.id || `META-WA-${Date.now()}`
    };
  }
}

export class TwilioWhatsappProvider implements OtpProvider {
  name = 'Twilio WhatsApp API';
  channel: 'whatsapp' = 'whatsapp';

  async sendOtp(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr' = 'en'
  ): Promise<OtpDeliveryResult> {
    const accountSid = config.smsApiKey;
    const authToken = config.smsApiSecret;
    const sender = config.whatsappSenderNumber || config.smsSenderId || '+14155238886';

    if (!accountSid || !authToken) {
      throw new Error('Twilio Account SID & Auth Token required for WhatsApp integration.');
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
    const auth = btoa(`${accountSid}:${authToken}`);

    const message = lang === 'fr'
      ? `Votre code de vérification Edulpha WhatsApp est: ${otpCode}. Expire dans ${config.otpExpiryMinutes || 5} minutes.`
      : `Your Edulpha WhatsApp verification code is: ${otpCode}. Expires in ${config.otpExpiryMinutes || 5} minutes.`;

    const body = new URLSearchParams({
      To: `whatsapp:${formattedPhone}`,
      From: sender.startsWith('whatsapp:') ? sender : `whatsapp:${sender}`,
      Body: message
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Twilio WhatsApp request failed');
    }

    return {
      success: true,
      channel: 'whatsapp',
      provider: 'twilio_whatsapp',
      messageId: data.sid
    };
  }
}

export class UltraMsgWhatsappProvider implements OtpProvider {
  name = 'UltraMsg WhatsApp Gateway';
  channel: 'whatsapp' = 'whatsapp';

  async sendOtp(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr' = 'en'
  ): Promise<OtpDeliveryResult> {
    const instanceId = config.whatsappPhoneNumberId;
    const token = config.whatsappApiKey;

    if (!instanceId || !token) {
      throw new Error('UltraMsg Instance ID and Token are required.');
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const message = lang === 'fr'
      ? `Code de vérification Edulpha WhatsApp: ${otpCode}`
      : `Edulpha WhatsApp Verification Code: ${otpCode}`;

    const res = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        to: cleanDigits,
        body: message,
        priority: '10'
      }).toString()
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'UltraMsg request failed');
    }

    return {
      success: true,
      channel: 'whatsapp',
      provider: 'ultramsg',
      messageId: data.id ? String(data.id) : `ULTRA-${Date.now()}`
    };
  }
}

export class WhatsAppProviderDispatcher {
  static async sendOtp(
    phone: string,
    otpCode: string,
    config: PhoneAuthConfig,
    lang: 'en' | 'fr' = 'en'
  ): Promise<OtpDeliveryResult> {
    const providerType = config.whatsappProvider || 'simulation';

    let provider: OtpProvider;
    switch (providerType) {
      case 'meta_cloud':
        provider = new MetaWhatsappProvider();
        break;
      case 'twilio_whatsapp':
        provider = new TwilioWhatsappProvider();
        break;
      case 'ultramsg':
        provider = new UltraMsgWhatsappProvider();
        break;
      case 'simulation':
      default:
        provider = new SimulatedWhatsappProvider();
        break;
    }

    try {
      return await provider.sendOtp(phone, otpCode, config, lang);
    } catch (err: any) {
      console.warn(`[WhatsApp Provider] ${provider.name} failed:`, err.message);
      return {
        success: false,
        channel: 'whatsapp',
        provider: providerType,
        error: err.message || 'WhatsApp delivery failed'
      };
    }
  }
}
