import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { PhoneAuthConfig, UserProfile } from '../types';
import { getSystemSettings } from './settingsService';
import { SmsService } from './smsService';

export interface PhoneCarrierInfo {
  carrier: 'MTN' | 'Orange' | 'Nexttel' | 'Camtel' | 'Other';
  country: string;
  countryCode: string;
  formatted: string;
  isValid: boolean;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  expiresAt?: number;
  simulatedOtp?: string;
  resendCooldownSeconds?: number;
}

const DEFAULT_CONFIG: PhoneAuthConfig = {
  phoneAuthRequired: true,
  emailAuthRequired: false,
  otpLength: 6,
  otpExpiryMinutes: 5,
  maxResendAttempts: 3,
  maxVerificationAttempts: 5,
  smsProvider: 'simulation',
  smsApiKey: '',
  smsApiSecret: '',
  smsSenderId: 'Edulpha',
  smsCustomEndpoint: '',
  enablePasswordlessLogin: true,
};

/**
 * Format raw phone number into standardized international format (+2376XXXXXXX).
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '237'): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle leading zeroes or lack of country code
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('237') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith('6') && cleaned.length === 9) {
    return `+${defaultCountryCode}${cleaned}`;
  }

  if (cleaned.startsWith('2') || cleaned.startsWith('3')) {
    if (cleaned.length === 9) {
      return `+${defaultCountryCode}${cleaned}`;
    }
  }

  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Detect Cameroon mobile carrier (MTN, Orange, Nexttel, Camtel) or general international format.
 */
export function detectCarrier(phone: string): PhoneCarrierInfo {
  const formatted = formatPhoneNumber(phone);
  const cleanDigits = formatted.replace(/\D/g, '');

  let carrier: 'MTN' | 'Orange' | 'Nexttel' | 'Camtel' | 'Other' = 'Other';
  let isValid = false;

  // Cameroon numbers: +237 6XXXXXXXX (9 digits after 237)
  if (cleanDigits.startsWith('237') && cleanDigits.length === 12) {
    const subscriber = cleanDigits.substring(3); // e.g., 670123456
    const prefix3 = subscriber.substring(0, 3);
    const prefix2 = subscriber.substring(0, 2);

    isValid = true;

    // MTN Cameroon: 67X, 650-654, 680-683
    if (
      prefix2 === '67' || 
      (prefix3 >= '650' && prefix3 <= '654') || 
      (prefix3 >= '680' && prefix3 <= '683')
    ) {
      carrier = 'MTN';
    } 
    // Orange Cameroon: 69X, 655-659, 684-689
    else if (
      prefix2 === '69' || 
      (prefix3 >= '655' && prefix3 <= '659') || 
      (prefix3 >= '684' && prefix3 <= '689')
    ) {
      carrier = 'Orange';
    } 
    // Nexttel Cameroon: 66X
    else if (prefix2 === '66') {
      carrier = 'Nexttel';
    } 
    // Camtel: 242, 243, 620
    else if (prefix2 === '62' || subscriber.startsWith('242') || subscriber.startsWith('243')) {
      carrier = 'Camtel';
    }
  } else if (cleanDigits.length >= 8 && cleanDigits.length <= 15) {
    isValid = true;
  }

  return {
    carrier,
    country: cleanDigits.startsWith('237') ? 'Cameroon' : 'International',
    countryCode: '+237',
    formatted,
    isValid
  };
}

/**
 * Generate a synthetic virtual email for Firebase Auth when a user registers with Phone only.
 * Format: 237670000000@phone.edulpha.local
 */
export function phoneToVirtualEmail(phone: string): string {
  const cleanDigits = formatPhoneNumber(phone).replace(/\D/g, '');
  return `${cleanDigits}@phone.edulpha.local`;
}

/**
 * Check if an email is a synthetic phone virtual email.
 */
export function isVirtualPhoneEmail(email?: string): boolean {
  return !!email && (email.endsWith('@phone.edulpha.local') || email.endsWith('@phone.edulpha.com'));
}

/**
 * Find user profile by Phone Number in Firestore.
 */
export async function findUserByPhone(phone: string): Promise<UserProfile | null> {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    const q = query(
      collection(db, 'users'), 
      where('phone', '==', formattedPhone), 
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
    
    // Fallback search by clean digits
    const cleanDigits = formattedPhone.replace(/\D/g, '');
    const q2 = query(
      collection(db, 'users'),
      where('email', '==', `${cleanDigits}@phone.edulpha.local`),
      limit(1)
    );
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      return snap2.docs[0].data() as UserProfile;
    }

    return null;
  } catch (err) {
    console.error('Error finding user by phone:', err);
    return null;
  }
}

/**
 * Get active phone auth configuration from system settings.
 */
export async function getPhoneAuthConfig(): Promise<PhoneAuthConfig> {
  try {
    const sys = await getSystemSettings();
    if (sys && sys.phoneAuthConfig) {
      return { ...DEFAULT_CONFIG, ...sys.phoneAuthConfig };
    }
    // Also check root system settings fields if mapped individually
    if (sys && (sys as any).smsProvider) {
      return {
        ...DEFAULT_CONFIG,
        smsProvider: (sys as any).smsProvider || 'simulation',
        smsApiKey: (sys as any).smsApiKey || '',
        smsApiSecret: (sys as any).smsApiSecret || '',
        smsSenderId: (sys as any).smsSenderId || 'Edulpha',
        smsCustomEndpoint: (sys as any).smsCustomEndpoint || ''
      };
    }
  } catch (err) {
    console.warn('Could not load system phone auth config, using defaults:', err);
  }
  return DEFAULT_CONFIG;
}

/**
 * Generate a cryptographically random N-digit OTP string.
 */
export function generateOtpCode(length: number = 6): string {
  let digits = '';
  for (let i = 0; i < length; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return digits;
}

/**
 * Generate and send an SMS OTP for phone verification.
 */
export async function sendPhoneOtp(
  phone: string, 
  reason: 'registration' | 'login' | 'reset_password' | 'update_phone' = 'registration',
  lang: 'en' | 'fr' = 'en'
): Promise<VerificationResult> {
  const formattedPhone = formatPhoneNumber(phone);
  const carrierInfo = detectCarrier(formattedPhone);

  if (!carrierInfo.isValid) {
    return {
      success: false,
      message: lang === 'fr' 
        ? 'Numéro de téléphone invalide. Veuillez entrer un numéro valide (ex: +237 670000000).'
        : 'Invalid phone number. Please enter a valid mobile number (e.g. +237 670000000).'
    };
  }

  const config = await getPhoneAuthConfig();
  const docId = `otp_${formattedPhone.replace(/\D/g, '')}_${reason}`;
  const verificationRef = doc(db, 'phone_verifications', docId);

  // Check rate limits & existing active OTP
  const existingDoc = await getDoc(verificationRef);
  const now = Date.now();

  if (existingDoc.exists()) {
    const data = existingDoc.data();
    // Cooldown check (60 seconds between resends)
    if (data.lastSentAt && (now - data.lastSentAt) < 60000) {
      const remainingSeconds = Math.ceil((60000 - (now - data.lastSentAt)) / 1000);
      return {
        success: false,
        message: lang === 'fr'
          ? `Veuillez patienter ${remainingSeconds} secondes avant de demander un nouveau code.`
          : `Please wait ${remainingSeconds} seconds before requesting a new code.`,
        resendCooldownSeconds: remainingSeconds
      };
    }

    // Check resend limits
    if (data.resendCount >= (config.maxResendAttempts || 3) && (now - data.firstSentAt) < 3600000) {
      return {
        success: false,
        message: lang === 'fr'
          ? 'Nombre maximum de tentatives d\'envoi atteint. Veuillez réessayer dans 1 heure.'
          : 'Maximum SMS resend limit reached. Please try again in 1 hour.'
      };
    }
  }

  const otpCode = generateOtpCode(config.otpLength || 6);
  const expiresAt = now + (config.otpExpiryMinutes || 5) * 60 * 1000;

  const resendCount = existingDoc.exists() ? (existingDoc.data().resendCount || 0) + 1 : 1;
  const firstSentAt = existingDoc.exists() ? (existingDoc.data().firstSentAt || now) : now;

  // Store verification record in Firestore
  await setDoc(verificationRef, {
    phone: formattedPhone,
    reason,
    otpCode,
    expiresAt,
    lastSentAt: now,
    firstSentAt,
    resendCount,
    verificationAttempts: 0,
    verified: false,
    carrier: carrierInfo.carrier
  });

  // Dispatch SMS via provider
  const smsRes = await SmsService.sendOtp(formattedPhone, otpCode, config, lang);

  if (!smsRes.success) {
    return {
      success: false,
      message: smsRes.error || 'Failed to send SMS code. Please try again.'
    };
  }

  return {
    success: true,
    message: lang === 'fr' 
      ? `Code de vérification envoyé au ${formattedPhone} par SMS.`
      : `Verification code sent to ${formattedPhone} via SMS.`,
    expiresAt,
    simulatedOtp: smsRes.simulatedOtp
  };
}

/**
 * Verify phone OTP entered by user.
 */
export async function verifyPhoneOtp(
  phone: string,
  otpCode: string,
  reason: 'registration' | 'login' | 'reset_password' | 'update_phone' = 'registration',
  lang: 'en' | 'fr' = 'en'
): Promise<VerificationResult> {
  const formattedPhone = formatPhoneNumber(phone);
  const docId = `otp_${formattedPhone.replace(/\D/g, '')}_${reason}`;
  const verificationRef = doc(db, 'phone_verifications', docId);

  const snap = await getDoc(verificationRef);
  if (!snap.exists()) {
    return {
      success: false,
      message: lang === 'fr'
        ? 'Aucun code de vérification trouvé. Veuillez en demander un nouveau.'
        : 'No verification code found. Please request a new code.'
    };
  }

  const data = snap.data();
  const config = await getPhoneAuthConfig();
  const now = Date.now();

  if (data.verified) {
    return {
      success: true,
      message: lang === 'fr' ? 'Numéro déjà vérifié.' : 'Phone number already verified.'
    };
  }

  if (now > data.expiresAt) {
    return {
      success: false,
      message: lang === 'fr'
        ? 'Le code de vérification a expiré. Veuillez en demander un nouveau.'
        : 'Verification code has expired. Please request a new code.'
    };
  }

  const attempts = (data.verificationAttempts || 0) + 1;
  await updateDoc(verificationRef, { verificationAttempts: attempts });

  if (attempts > (config.maxVerificationAttempts || 5)) {
    return {
      success: false,
      message: lang === 'fr'
        ? 'Trop de tentatives incorrectes. Veuillez demander un nouveau code.'
        : 'Too many incorrect attempts. Please request a new code.'
    };
  }

  if (data.otpCode !== otpCode.trim()) {
    const remainingAttempts = (config.maxVerificationAttempts || 5) - attempts;
    return {
      success: false,
      message: lang === 'fr'
        ? `Code incorrect. Il vous reste ${remainingAttempts} tentative(s).`
        : `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`
    };
  }

  // Mark verified in Firestore
  await updateDoc(verificationRef, { 
    verified: true,
    verifiedAt: now 
  });

  return {
    success: true,
    message: lang === 'fr' ? 'Numéro de téléphone vérifié avec succès!' : 'Phone number verified successfully!'
  };
}
