import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  SubscriptionPlan, UserSubscription, PaymentRecord, 
  PaymentMethodConfig, PaymentReceipt, CouponCode, RefundRequest 
} from '../types';
import { getSystemSettings, updateSystemSettings } from './settingsService';

// Default Subscription Plans
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    nameFr: 'Formule Gratuite',
    description: 'Basic access to browse subjects, read selected lessons, and attempt sample quizzes.',
    descriptionFr: 'Accès de base pour parcourir les matières, lire des leçons et essayer des épreuves spécimens.',
    price: 0,
    currency: 'XAF',
    billingCycle: 'free',
    duration: 'Forever',
    maxDevices: 1,
    maxAttempts: 3,
    trialDays: 0,
    isActive: true,
    isRecommended: false,
    isDefault: false,
    badge: 'Starter',
    order: 1,
    visibility: 'public',
    features: [
      'Browse all academic subjects',
      'Access selected free lessons',
      'Attempt 3 daily practice quizzes',
      'Access student discussion forums',
      'Limited Edulpha AI requests (3 per day)'
    ],
    featuresFr: [
      'Parcourir toutes les matières',
      'Accéder aux leçons gratuites',
      'Effectuer 3 épreuves d\'entraînement par jour',
      'Accéder au forum de discussion des élèves',
      'Requêtes Edulpha IA limitées (3 par jour)'
    ],
    maxDailyQuizzes: 3,
    maxDailyAIRequests: 3,
    allowsOfflineDownloads: false,
    allowsCertificates: false,
    allowsPrioritySupport: false
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    nameFr: 'Pass Mensuel Premium',
    description: 'Full unlimited access to all subjects, mock exams, past papers, and 24/7 AI tutor.',
    descriptionFr: 'Accès illimité à toutes les matières, examens blancs, épreuves corrigées et tuteur IA 24/7.',
    price: 1000,
    currency: 'XAF',
    billingCycle: 'monthly',
    duration: '30 Days',
    maxDevices: 3,
    maxAttempts: 999,
    trialDays: 3,
    isActive: true,
    isRecommended: true,
    isDefault: true,
    badge: 'Popular',
    order: 2,
    visibility: 'public',
    features: [
      'Unlimited lessons and past paper solutions',
      'Unlimited mock examinations & daily drills',
      'Unlimited Edulpha 24/7 AI Smart Tutor',
      'Downloadable PDF revision packs',
      'Official performance certificates',
      'Customized revision plans & analytics'
    ],
    featuresFr: [
      'Leçons illimitées et épreuves corrigées',
      'Examens blancs et exercices quotidiens illimités',
      'Tuteur Intelligent Edulpha IA 24/7 illimité',
      'Fiches de révision PDF téléchargeables',
      'Certificats officiels de performance',
      'Programmes de révision et analyses personnalisés'
    ],
    maxDailyQuizzes: 9999,
    maxDailyAIRequests: 9999,
    allowsOfflineDownloads: true,
    allowsCertificates: true,
    allowsPrioritySupport: false
  },
  {
    id: 'premium_annual',
    name: 'Premium Annual',
    nameFr: 'Pass Annuel Premium (VIP)',
    description: 'Best value! Complete yearly preparation with priority support and exclusive resources.',
    descriptionFr: 'Le meilleur choix ! Préparation annuelle complète avec support prioritaire et contenus exclusifs.',
    price: 10000,
    currency: 'XAF',
    billingCycle: 'annual',
    duration: '365 Days',
    maxDevices: 5,
    maxAttempts: 999,
    trialDays: 7,
    isActive: true,
    isRecommended: false,
    isDefault: false,
    badge: 'Best Value',
    order: 3,
    visibility: 'public',
    features: [
      'Everything in Premium Monthly',
      '2 Months FREE (Save over 15%)',
      'Priority academic support & teacher assistance',
      'Exclusive VIP exam prediction packs',
      'Downloadable offline video lectures'
    ],
    featuresFr: [
      'Tout ce qui est inclus dans le Pass Mensuel',
      '2 mois GRATUITS (Économisez plus de 15%)',
      'Assistance pédagogique et soutien prioritaire',
      'Packs exclusifs de sujets pressentis pour l\'examen',
      'Vidéos de cours téléchargeables hors-ligne'
    ],
    maxDailyQuizzes: 9999,
    maxDailyAIRequests: 9999,
    allowsOfflineDownloads: true,
    allowsCertificates: true,
    allowsPrioritySupport: true
  }
];

// Default Payment Providers
export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'mtn_momo',
    code: 'mtn_momo',
    name: 'MTN Mobile Money',
    nameFr: 'MTN Mobile Money',
    provider: 'mtn',
    isEnabled: true,
    accountNumber: '677 123 456',
    accountName: 'Edulpha Official',
    instructions: 'Dial *126# and pay to the number above. Use your email or payment code as reference.',
    instructionsFr: 'Composez le *126# et effectuez le paiement vers le numéro ci-dessus. Utilisez votre email comme référence.'
  },
  {
    id: 'orange_money',
    code: 'orange_money',
    name: 'Orange Money',
    nameFr: 'Orange Money',
    provider: 'orange',
    isEnabled: true,
    accountNumber: '699 123 456',
    accountName: 'Edulpha Official',
    instructions: 'Dial #150# and pay to the number above. Use your email or payment code as reference.',
    instructionsFr: 'Composez le #150# et effectuez le paiement vers le numéro ci-dessus. Utilisez votre email comme référence.'
  },
  {
    id: 'card_stripe',
    code: 'card_stripe',
    name: 'Credit / Debit Card (Visa / Mastercard)',
    nameFr: 'Carte Bancaire (Visa / Mastercard)',
    provider: 'card',
    isEnabled: true,
    instructions: 'Instant automatic payment processing via secure SSL gateway.',
    instructionsFr: 'Traitement instantané et sécurisé par carte bancaire SSL.'
  },
  {
    id: 'flutterwave',
    code: 'flutterwave',
    name: 'Flutterwave Online Checkout',
    nameFr: 'Paiement en ligne Flutterwave',
    provider: 'flutterwave',
    isEnabled: true,
    instructions: 'Supports Mobile Money & African Bank Cards.',
    instructionsFr: 'Prend en charge les cartes et Mobile Money dans toute l\'Afrique.'
  },
  {
    id: 'paypal',
    code: 'paypal',
    name: 'PayPal Global',
    nameFr: 'PayPal International',
    provider: 'paypal',
    isEnabled: false,
    instructions: 'Pay securely using your PayPal balance or international bank account.',
    instructionsFr: 'Payer en toute sécurité avec votre compte PayPal.'
  }
];

// --- API & Service Functions ---

/** Get all subscription plans (optionally filtered by visibility/active) */
export const getSubscriptionPlans = async (includeHidden: boolean = true): Promise<SubscriptionPlan[]> => {
  try {
    const snap = await getDocs(collection(db, 'subscription_plans'));
    if (!snap.empty) {
      let plansList = snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPlan));
      if (!includeHidden) {
        plansList = plansList.filter(p => p.isActive && p.visibility !== 'hidden');
      }
      return plansList.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const defaultList = includeHidden ? DEFAULT_PLANS : DEFAULT_PLANS.filter(p => p.isActive && p.visibility !== 'hidden');
    return defaultList.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.warn('Using default plans:', err);
    return DEFAULT_PLANS;
  }
};

/** Record a pricing change history entry */
export const addPricingHistoryRecord = async (data: {
  planId: string;
  planName: string;
  previousPrice: number;
  newPrice: number;
  currency: string;
  changedBy: string;
  changedByEmail?: string;
  reason?: string;
}) => {
  try {
    const record = {
      ...data,
      changedAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'pricing_history'), record);
  } catch (err) {
    console.error('Error recording pricing history:', err);
  }
};

/** Get pricing change history log */
export const getPricingHistory = async () => {
  try {
    const q = query(collection(db, 'pricing_history'), orderBy('changedAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return [];
  } catch (err) {
    console.error('Error fetching pricing history:', err);
    return [];
  }
};

/** Create or Save Subscription Plan */
export const saveSubscriptionPlan = async (
  plan: SubscriptionPlan, 
  adminUser?: { name?: string; email?: string; uid?: string },
  reason?: string
): Promise<SubscriptionPlan> => {
  try {
    const planId = plan.id || `plan_${Date.now()}`;
    const planRef = doc(db, 'subscription_plans', planId);
    
    // Check if updating price
    const existingDoc = await getDoc(planRef);
    if (existingDoc.exists()) {
      const oldPrice = existingDoc.data().price;
      if (oldPrice !== undefined && oldPrice !== plan.price) {
        await addPricingHistoryRecord({
          planId,
          planName: plan.name,
          previousPrice: oldPrice,
          newPrice: plan.price,
          currency: plan.currency || 'XAF',
          changedBy: adminUser?.name || adminUser?.email || 'Admin',
          changedByEmail: adminUser?.email || '',
          reason: reason || 'Plan price update'
        });
      }
    } else {
      await addPricingHistoryRecord({
        planId,
        planName: plan.name,
        previousPrice: 0,
        newPrice: plan.price,
        currency: plan.currency || 'XAF',
        changedBy: adminUser?.name || adminUser?.email || 'Admin',
        changedByEmail: adminUser?.email || '',
        reason: reason || 'New plan creation'
      });
    }

    // If marked as active/recommended, unset isRecommended and isDefault on all other plans
    if (plan.isRecommended || plan.isDefault) {
      const allPlansSnap = await getDocs(collection(db, 'subscription_plans'));
      for (const d of allPlansSnap.docs) {
        if (d.id !== planId) {
          await updateDoc(doc(db, 'subscription_plans', d.id), {
            isRecommended: false,
            isDefault: false
          });
        }
      }
    }

    const payload = {
      ...plan,
      id: planId,
      price: Number(plan.price),
      currency: plan.currency || 'XAF',
      billingCycle: plan.billingCycle || 'monthly',
      duration: plan.duration || '30 Days',
      maxDevices: Number(plan.maxDevices || 1),
      maxAttempts: Number(plan.maxAttempts || 999),
      trialDays: Number(plan.trialDays || 0),
      order: Number(plan.order || 1),
      visibility: plan.visibility || 'public',
      isRecommended: Boolean(plan.isRecommended),
      isDefault: Boolean(plan.isDefault),
      isActive: Boolean(plan.isActive),
      updatedAt: serverTimestamp()
    };

    await setDoc(planRef, payload, { merge: true });

    // Also sync system_settings if this is the active plan
    if (plan.isRecommended || plan.isDefault) {
      await updateSystemSettings({ paymentPrice: plan.price });
    }

    return { id: planId, ...payload };
  } catch (err) {
    console.error('Error saving subscription plan:', err);
    throw err;
  }
};

/** Delete Subscription Plan */
export const deleteSubscriptionPlan = async (planId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'subscription_plans', planId));
  } catch (err) {
    console.error('Error deleting subscription plan:', err);
    throw err;
  }
};

/** Duplicate Subscription Plan */
export const duplicateSubscriptionPlan = async (plan: SubscriptionPlan): Promise<SubscriptionPlan> => {
  const newId = `${plan.id}_copy_${Date.now().toString().slice(-4)}`;
  const duplicatedPlan: SubscriptionPlan = {
    ...plan,
    id: newId,
    name: `${plan.name} (Copy)`,
    nameFr: plan.nameFr ? `${plan.nameFr} (Copie)` : undefined,
    isRecommended: false,
    isDefault: false,
    order: (plan.order || 1) + 1,
    createdAt: new Date().toISOString()
  };
  return await saveSubscriptionPlan(duplicatedPlan);
};

/** Set a single plan as the current Active / Recommended Plan */
export const setActivePlan = async (
  planId: string, 
  adminUser?: { name?: string; email?: string },
  reason?: string
): Promise<void> => {
  try {
    const plansSnap = await getDocs(collection(db, 'subscription_plans'));
    
    // Unset all plans first
    for (const d of plansSnap.docs) {
      await updateDoc(doc(db, 'subscription_plans', d.id), {
        isRecommended: false,
        isDefault: false
      });
    }

    // Set target plan as active and recommended
    const targetRef = doc(db, 'subscription_plans', planId);
    const targetSnap = await getDoc(targetRef);
    if (targetSnap.exists()) {
      const planData = targetSnap.data();
      await updateDoc(targetRef, {
        isRecommended: true,
        isDefault: true,
        isActive: true
      });
      await updateSystemSettings({ paymentPrice: planData.price });
      await addPricingHistoryRecord({
        planId,
        planName: planData.name,
        previousPrice: planData.price,
        newPrice: planData.price,
        currency: planData.currency || 'XAF',
        changedBy: adminUser?.name || adminUser?.email || 'Admin',
        changedByEmail: adminUser?.email || '',
        reason: reason || 'Set as Current Active Plan'
      });
    }
  } catch (err) {
    console.error('Error setting active plan:', err);
    throw err;
  }
};

/** Toggle Plan Active / Inactive Status */
export const togglePlanStatus = async (planId: string, isActive: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db, 'subscription_plans', planId), {
      isActive,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error toggling plan status:', err);
    throw err;
  }
};

/** Reorder Plans */
export const reorderPlans = async (plansList: SubscriptionPlan[]): Promise<void> => {
  try {
    for (let index = 0; index < plansList.length; index++) {
      const plan = plansList[index];
      await updateDoc(doc(db, 'subscription_plans', plan.id), {
        order: index + 1
      });
    }
  } catch (err) {
    console.error('Error reordering plans:', err);
    throw err;
  }
};

/** Get available payment methods */
export const getPaymentMethods = async (): Promise<PaymentMethodConfig[]> => {
  try {
    const snap = await getDocs(collection(db, 'payment_methods'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentMethodConfig));
    }
    return DEFAULT_PAYMENT_METHODS;
  } catch (err) {
    return DEFAULT_PAYMENT_METHODS;
  }
};

/** Validate Coupon / Promo Code */
export const validateCouponCode = async (code: string, planId: string): Promise<{ valid: boolean; coupon?: CouponCode; discountAmount: number; message: string }> => {
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0, message: 'Invalid coupon code' };
  }
  const cleanCode = code.trim().toUpperCase();

  try {
    const q = query(collection(db, 'coupons'), where('code', '==', cleanCode));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Check built-in demo promo code
      if (cleanCode === 'GB60BONUS' || cleanCode === 'STUDENT50') {
        return {
          valid: true,
          coupon: {
            id: 'gb60bonus',
            code: cleanCode,
            discountType: 'percent',
            discountValue: 20,
            maxUses: 1000,
            currentUses: 12,
            expiryDate: '2026-12-31',
            isEnabled: true
          },
          discountAmount: 20, // 20% off
          message: 'Promo Code Applied! 20% Discount Applied.'
        };
      }
      return { valid: false, discountAmount: 0, message: 'Coupon code not found or expired.' };
    }

    const couponData = snap.docs[0].data() as CouponCode;
    if (!couponData.isEnabled) {
      return { valid: false, discountAmount: 0, message: 'This coupon is no longer active.' };
    }

    if (couponData.currentUses >= couponData.maxUses) {
      return { valid: false, discountAmount: 0, message: 'Coupon usage limit has been reached.' };
    }

    return {
      valid: true,
      coupon: { id: snap.docs[0].id, ...couponData },
      discountAmount: couponData.discountValue,
      message: `Coupon Applied! ${couponData.discountType === 'percent' ? `${couponData.discountValue}% Off` : `${couponData.discountValue} XAF Off`}`
    };
  } catch (err) {
    console.error('Error validating coupon:', err);
    return { valid: false, discountAmount: 0, message: 'Error validating promo code.' };
  }
};

/** Initiate Payment Checkout & Register Transaction */
export const createPaymentCheckout = async (data: {
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionPlan;
  paymentMethod: string;
  phoneNumber?: string;
  couponCode?: string;
  manualTransactionId?: string;
}): Promise<PaymentRecord> => {
  const receiptNum = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
  const refNum = data.manualTransactionId || `TX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  let finalAmount = data.plan.price;
  if (data.couponCode) {
    const couponRes = await validateCouponCode(data.couponCode, data.plan.id);
    if (couponRes.valid && couponRes.coupon) {
      if (couponRes.coupon.discountType === 'percent') {
        finalAmount = Math.max(0, data.plan.price * (1 - couponRes.coupon.discountValue / 100));
      } else {
        finalAmount = Math.max(0, data.plan.price - couponRes.coupon.discountValue);
      }
    }
  }

  const paymentRecord: PaymentRecord = {
    id: refNum,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    planId: data.plan.id,
    planName: data.plan.name,
    amount: finalAmount,
    currency: data.plan.currency || 'XAF',
    paymentMethod: data.paymentMethod,
    transactionId: data.manualTransactionId || refNum,
    referenceNumber: refNum,
    status: 'pending',
    receiptNumber: receiptNum,
    createdAt: new Date().toISOString(),
    phoneNumber: data.phoneNumber || ''
  };

  // 1. Save to manual_approvals for admin tracking
  await addDoc(collection(db, 'manual_approvals'), {
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    planId: data.plan.id,
    planName: data.plan.name,
    amount: finalAmount,
    currency: data.plan.currency,
    method: data.paymentMethod,
    transactionId: paymentRecord.transactionId,
    receiptNumber: receiptNum,
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  // 2. Also save to payments collection
  await setDoc(doc(db, 'payments', refNum), paymentRecord);

  // 3. Update user payment status to pending
  await updateDoc(doc(db, 'users', data.userId), {
    paymentStatus: 'pending',
    paymentReference: paymentRecord.transactionId,
    updatedAt: serverTimestamp()
  });

  return paymentRecord;
};

/** Verify and Activate User Subscription (Admin or Auto Callback) */
export const verifyAndActivateSubscription = async (
  userId: string, 
  planId: string, 
  transactionId: string, 
  durationDays: number = 30
): Promise<boolean> => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const subscriptionData: UserSubscription = {
      userId,
      planId,
      planName: planId.includes('annual') ? 'Premium Annual' : 'Premium Monthly',
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      amountPaid: planId.includes('annual') ? 10000 : 1000,
      currency: 'XAF',
      paymentMethod: 'Verified Payment',
      transactionId
    };

    // Update user profile
    await updateDoc(doc(db, 'users', userId), {
      isPaid: true,
      paymentStatus: 'paid',
      paidAt: startDate.toISOString(),
      paymentExpiryDate: endDate.toISOString(),
      subscriptionPlan: planId,
      updatedAt: serverTimestamp()
    });

    // Save user_subscriptions document
    await setDoc(doc(db, 'user_subscriptions', userId), subscriptionData);

    return true;
  } catch (err) {
    console.error('Error activating subscription:', err);
    return false;
  }
};

/** Generate Receipt Object */
export const generateReceiptData = (payment: PaymentRecord, appName = 'Edulpha', contactEmail = 'support@edulpha.com'): PaymentReceipt => {
  const expiry = new Date(payment.createdAt || Date.now());
  expiry.setDate(expiry.getDate() + (payment.planId.includes('annual') ? 365 : 30));

  return {
    receiptNumber: payment.receiptNumber || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
    transactionId: payment.transactionId || payment.referenceNumber,
    studentName: payment.userName || 'Student',
    studentEmail: payment.userEmail,
    planName: payment.planName,
    amountPaid: payment.amount,
    currency: payment.currency || 'XAF',
    paymentMethod: payment.paymentMethod,
    date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    expiryDate: expiry.toLocaleDateString(),
    companyName: appName,
    companyContact: contactEmail
  };
};
