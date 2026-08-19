import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Challenge, ChallengeDay, ChallengeEnrollment, ChallengeProgress } from '../types';

export const fetchAllChallenges = async (): Promise<Challenge[]> => {
  const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
};

export const fetchPublishedChallenges = async (): Promise<Challenge[]> => {
  const q = query(
    collection(db, 'challenges'), 
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  let challenges = snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
  
  if (challenges.length === 0) {
    challenges = [
      {
        id: 'challenge_syscohada_30',
        title: 'SYSCOHADA Practical Accounting Challenge',
        description: 'Master West and Central African double-entry bookkeeping, ledger entries, payroll CNPS tax computations, and balance sheet prep.',
        duration: 7,
        subjects: ['Financial Accounting', 'SYSCOHADA Accounting'],
        level: 'All Levels',
        status: 'published',
        createdAt: new Date().toISOString() as any,
      },
      {
        id: 'challenge_gce_economics',
        title: 'Cameroon GCE Economics Masterclass Challenge',
        description: 'Daily practice of microeconomics, macroeconomics, and national income accounting concepts.',
        duration: 7,
        subjects: ['Economics'],
        level: 'Advanced Level',
        status: 'published',
        createdAt: new Date().toISOString() as any,
      }
    ];
  }

  // Sort client side by createdAt
  return challenges.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
};

export const createChallenge = async (data: Omit<Challenge, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'challenges'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateChallenge = async (id: string, data: Partial<Challenge>): Promise<void> => {
  const ref = doc(db, 'challenges', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteChallenge = async (id: string): Promise<void> => {
  // Delete challenge doc
  await deleteDoc(doc(db, 'challenges', id));

  // Delete associated challengeDays
  const daysQ = query(collection(db, 'challengeDays'), where('challengeId', '==', id));
  const daysSnap = await getDocs(daysQ);
  const batch = writeBatch(db);
  daysSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

export const fetchChallengeDays = async (challengeId: string): Promise<ChallengeDay[]> => {
  const q = query(
    collection(db, 'challengeDays'),
    where('challengeId', '==', challengeId)
  );
  const snap = await getDocs(q);
  let days = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeDay));

  if (days.length === 0 && challengeId === 'challenge_syscohada_30') {
    days = [
      {
        id: 'syscohada_day1',
        challengeId: 'challenge_syscohada_30',
        dayNumber: 1,
        title: 'SYSCOHADA Framework & Chart of Accounts',
        description: 'Understand the standard structure of accounts used in the CEMAC region under the revised SYSCOHADA act.',
        lessonContent: `### Revised SYSCOHADA Chart of Accounts (Plan Comptable)
The SYSCOHADA framework organizes accounts into 9 distinct classes:
- **Classe 1**: Comptes de Ressources Durables (Equity and Long-term Liabilities)
- **Classe 2**: Comptes de l'Actif Immobilisé (Non-Current Assets)
- **Classe 3**: Comptes de Stocks (Inventory)
- **Classe 4**: Comptes de Tiers (Receivables, Payables, and Staff Accounts)
- **Classe 5**: Comptes de Trésorerie (Cash, Bank, and Financial Instruments)
- **Classe 6**: Comptes de Charges (Expenses)
- **Classe 7**: Comptes de Produits (Revenues)
- **Classe 8**: Comptes des Autres Charges et Autres Produits (Other Non-Operating Items)
- **Classe 9**: Comptes des Opérations de la Comptabilité Analytique (Analytical/Cost Accounting)

#### Practical Steps inside Edulpha Accounting Lab:
1. Open the **Chart of Accounts** tab in the Practical Lab.
2. Verify existing Class 1 and Class 2 accounts.
3. Try adding a custom Class 4 account (e.g., Code \`4111\` for Customer Douala) to see how Class categorization works in Cameroon.`,
        createdAt: new Date().toISOString() as any
      },
      {
        id: 'syscohada_day2',
        challengeId: 'challenge_syscohada_30',
        dayNumber: 2,
        title: 'Double-Entry Bookkeeping Principles',
        description: 'Verify the absolute accounting identity: Debits must equal Credits for every journal entry.',
        lessonContent: `### Bookkeeping & Double Entry
Every financial transaction under SYSCOHADA consists of at least two accounts where:
- The sum of **Debit** entries must mathematically equal the sum of **Credit** entries.
- Increasing an Asset or Expense account involves a **Debit**.
- Increasing an Equity, Liability, or Revenue account involves a **Credit**.

#### Practical Steps inside Edulpha Accounting Lab:
1. Navigate to the **Journal Practice** tab.
2. Create a new journal entry for shareholder cash contribution: Debit Bank (\`5210\`) and Credit Share Capital (\`1010\`).
3. Notice how the real-time balance indicator dynamically changes!`,
        createdAt: new Date().toISOString() as any
      },
      {
        id: 'syscohada_day3',
        challengeId: 'challenge_syscohada_30',
        dayNumber: 3,
        title: 'Purchase & Sales Transactions with Cameroon VAT',
        description: 'Learn to record transactions including the standard 19.25% Value Added Tax (TVA) applied in Cameroon.',
        lessonContent: `### Accounting for Value Added Tax (TVA)
The standard TVA rate in Cameroon is **19.25%** (17.5% principal + 10% CAC surcharges).
- **Purchases**: Debit Purchase of Goods (\`6010\`), Debit Recoverable VAT (\`4452\`), and Credit Cash/Bank/Supplier (\`4010\`).
- **Sales**: Debit Cash/Bank/Customer (\`4110\`), Credit Sales of Goods (\`7010\`), and Credit Payable VAT (\`4431\`).

#### Practical Steps:
1. Calculate the TVA for a 1,000,000 XAF purchase of merchandise. (VAT = 192,500 XAF, Total Due = 1,192,500 XAF).
2. Record this multi-line transaction inside the Journal entries list.`,
        createdAt: new Date().toISOString() as any
      },
      {
        id: 'syscohada_day4',
        challengeId: 'challenge_syscohada_30',
        dayNumber: 4,
        title: 'Bank Reconciliation Statements (État de Rapprochement)',
        description: 'Reconcile discrepancies between the company\'s bank ledger and the official bank statement.',
        lessonContent: `### Bank Reconciliation (Rapprochement Bancaire)
Discrepancies often occur due to:
- Outstanding checks (cheques non encore encaissés).
- Deposits in transit (remises en suspens).
- Unrecorded bank charges (frais bancaires) and interests.

#### Practical Steps:
1. Go to the **Bank Reconciliation** tab.
2. Enter the Cash Book balance vs the Bank statement balance.
3. Apply outstanding checks and bank charges to balance the accounts and verify perfect matching.`,
        createdAt: new Date().toISOString() as any
      },
      {
        id: 'syscohada_day5',
        challengeId: 'challenge_syscohada_30',
        dayNumber: 5,
        title: 'Payroll & Social Security (CNPS & IRPP Accounting)',
        description: 'Master employee social security (CNPS) and salary income tax calculations under Cameroonian labor law.',
        lessonContent: `### Payroll Simulation
Under Cameroon Tax Code:
- **CNPS Employee Contribution**: 4.2% of gross salary (subject to specific ceiling limits).
- **IRPP (Personal Income Tax)**: Progressive bracket or flat estimation based on taxable base.
- **Employer Contribution**: Social charges including CNPS (e.g., 16.2%), FNE (National Employment Fund) 1%, and Credit Foncier.

#### Practical Steps:
1. Go to the **Payroll Simulator** tab.
2. Set up the Base Salary for Jean Dupont.
3. Observe how net payable salary and employer charges are instantly computed.`,
        createdAt: new Date().toISOString() as any
      },
      {
        id: 'syscohada_day6',
        challengeId: 'challenge_syscohada_30',
        dayNumber: 6,
        title: 'General Ledger Closing & Trial Balance (Balance de Vérification)',
        description: 'Generate the 6-column Trial Balance and lock ledger entries for the period.',
        lessonContent: `### Closing Procedures & Trial Balance
Before preparing financial statements:
1. All journal entries must be finalized and posted to the General Ledger.
2. A **Trial Balance** (Balance des Comptes) must be generated.
3. The sum of Debit balances must equal the sum of Credit balances.

#### Practical Steps:
1. Check the **Trial Balance** tab to verify that the general balance identity is respected.
2. If correct, use the **Close Exercise** button at the top header to finalize and lock the ledger!`,
        createdAt: new Date().toISOString() as any
      },
      {
        id: 'syscohada_day7',
        challengeId: 'challenge_syscohada_30',
        dayNumber: 7,
        title: 'Preparing the SYSCOHADA Balance Sheet & Income Statement',
        description: 'Compile the Bilan (Balance Sheet) and Compte de Résultat (Income Statement) to present the final financial position.',
        lessonContent: `### SYSCOHADA Financial Statements
- **Bilan (Balance Sheet)**: Shows the financial position dividing items into Actif (Assets) and Passif (Equity + Liabilities).
- **Compte de Résultat (Income Statement)**: Computes the net profit or loss by comparing Produits (Classe 7) and Charges (Classe 6).

#### Practical Steps:
1. Navigate to the **Financial Statements** tab.
2. Verify that Assets = Liabilities + Equity.
3. Print or download the simulated Financial Statement!`,
        createdAt: new Date().toISOString() as any
      }
    ];
  } else if (days.length === 0 && challengeId === 'challenge_gce_economics') {
    days = Array.from({ length: 7 }, (_, idx) => ({
      id: `gce_eco_day${idx + 1}`,
      challengeId: 'challenge_gce_economics',
      dayNumber: idx + 1,
      title: `Economics Masterclass - Day ${idx + 1}`,
      description: `Concepts and questions related to micro/macro economic policies.`,
      lessonContent: `### Day ${idx + 1}: Micro and Macro Fundamentals
Please study national income accounting and public finance metrics relevant to the GCE syllabus.`,
      createdAt: new Date().toISOString() as any
    }));
  }

  return days.sort((a, b) => a.dayNumber - b.dayNumber);
};

export const saveChallengeDay = async (data: Partial<ChallengeDay> & { challengeId: string; dayNumber: number }): Promise<string> => {
  if (data.id) {
    const ref = doc(db, 'challengeDays', data.id);
    const { id, ...updateData } = data;
    await updateDoc(ref, updateData);
    return id;
  } else {
    // Check if day exists
    const q = query(
      collection(db, 'challengeDays'),
      where('challengeId', '==', data.challengeId),
      where('dayNumber', '==', data.dayNumber)
    );
    const existingSnap = await getDocs(q);
    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0];
      await updateDoc(existingDoc.ref, data);
      return existingDoc.id;
    } else {
      const docRef = await addDoc(collection(db, 'challengeDays'), {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  }
};

export const deleteChallengeDay = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'challengeDays', id));
};

export const fetchStudentEnrollments = async (studentId: string): Promise<ChallengeEnrollment[]> => {
  const q = query(collection(db, 'challengeEnrollments'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeEnrollment));
};

export const enrollInChallenge = async (studentId: string, challengeId: string): Promise<ChallengeEnrollment> => {
  // Check if already enrolled
  const q = query(
    collection(db, 'challengeEnrollments'),
    where('studentId', '==', studentId),
    where('challengeId', '==', challengeId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ChallengeEnrollment;
  }

  const newEnrollment = {
    studentId,
    challengeId,
    progress: 0,
    completedDays: [],
    joinedDate: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'challengeEnrollments'), newEnrollment);
  return { id: ref.id, ...newEnrollment };
};

export const toggleDayCompletion = async (
  enrollmentId: string, 
  studentId: string, 
  challengeId: string, 
  dayNumber: number,
  totalDays: number
): Promise<{ completedDays: number[]; progress: number }> => {
  const enrollmentRef = doc(db, 'challengeEnrollments', enrollmentId);
  const snap = await getDoc(enrollmentRef);
  
  let completedDays: number[] = [];
  if (snap.exists()) {
    completedDays = snap.data().completedDays || [];
  }

  if (completedDays.includes(dayNumber)) {
    completedDays = completedDays.filter(d => d !== dayNumber);
  } else {
    completedDays.push(dayNumber);
  }

  const progress = Math.round((completedDays.length / Math.max(1, totalDays)) * 100);

  await updateDoc(enrollmentRef, {
    completedDays,
    progress,
    updatedAt: serverTimestamp()
  });

  return { completedDays, progress };
};
