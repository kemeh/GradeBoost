import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calculator, FileText, Building2, DollarSign, TrendingUp, Layers, BookOpen, 
  CheckCircle2, AlertCircle, Plus, Trash2, RefreshCw, Download, ShieldCheck, 
  Users, Briefcase, Scale, Receipt, Landmark, PieChart, ArrowRight, Check, 
  ArrowLeft, Search, Filter, Printer, HelpCircle, Lock, Unlock, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  category: string;
  openingBalance: number;
}

interface JournalEntryLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  isFinalized?: boolean;
}

interface BankStatementItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  matched: boolean;
}

export default function AccountingPracticalLab() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isFr = language === 'fr';

  // Active Company Simulation State
  const [company, setCompany] = useState({
    name: 'ABC Trading & Services S.A.',
    industry: 'Retail & Commerce',
    currency: 'XAF (FCFA)',
    fiscalYear: '2025/2026',
    vatRate: 19.25, // Cameroon Standard VAT
    capital: 10000000
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'journal' | 'ledger' | 'trial_balance' | 'bank_rec' | 'statements' | 'payroll' | 'audit' | 'erp'>('dashboard');

  // Ledger Finalization Lock State
  const [isLedgerFinalized, setIsLedgerFinalized] = useState<boolean>(false);

  // Chart of Accounts State
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 'acc_101', code: '1010', name: isFr ? 'Capital Social' : 'Share Capital', type: 'Equity', category: 'Capital', openingBalance: 10000000 },
    { id: 'acc_102', code: '1610', name: isFr ? 'Emprunts Bancaires' : 'Bank Loans', type: 'Liability', category: 'Long-term Liabilities', openingBalance: 0 },
    { id: 'acc_201', code: '2110', name: isFr ? 'Terrains & Bâtiments' : 'Land & Buildings', type: 'Asset', category: 'Non-Current Assets', openingBalance: 4000000 },
    { id: 'acc_202', code: '2440', name: isFr ? 'Matériel Informatique & Bureau' : 'Office & Computer Equipment', type: 'Asset', category: 'Non-Current Assets', openingBalance: 1500000 },
    { id: 'acc_301', code: '3110', name: isFr ? 'Stocks de Marchandises' : 'Inventory / Merchandise', type: 'Asset', category: 'Current Assets', openingBalance: 2500000 },
    { id: 'acc_401', code: '4110', name: isFr ? 'Clients & Comptes Rattachés' : 'Accounts Receivable (Customers)', type: 'Asset', category: 'Current Assets', openingBalance: 1200000 },
    { id: 'acc_402', code: '4010', name: isFr ? 'Fournisseurs & Comptes Rattachés' : 'Accounts Payable (Suppliers)', type: 'Liability', category: 'Current Liabilities', openingBalance: 1800000 },
    { id: 'acc_521', code: '5210', name: isFr ? 'Banque (BICEC / SGBC)' : 'Bank Account (Primary)', type: 'Asset', category: 'Cash & Cash Equivalents', openingBalance: 2600000 },
    { id: 'acc_531', code: '5310', name: isFr ? 'Caisse (Espèces)' : 'Cash on Hand', type: 'Asset', category: 'Cash & Cash Equivalents', openingBalance: 200000 },
    { id: 'acc_601', code: '6010', name: isFr ? 'Achats de Marchandises' : 'Purchases of Goods', type: 'Expense', category: 'Cost of Sales', openingBalance: 0 },
    { id: 'acc_631', code: '6310', name: isFr ? 'Salaires & Rémunérations' : 'Salaries & Wages', type: 'Expense', category: 'Operating Expenses', openingBalance: 0 },
    { id: 'acc_651', code: '6510', name: isFr ? 'Loyers & Charges Locatives' : 'Rent & Utilities', type: 'Expense', category: 'Operating Expenses', openingBalance: 0 },
    { id: 'acc_701', code: '7010', name: isFr ? 'Ventes de Marchandises' : 'Sales Revenue', type: 'Revenue', category: 'Operating Revenue', openingBalance: 0 },
    { id: 'acc_706', code: '7060', name: isFr ? 'Prestations de Services' : 'Service Revenue', type: 'Revenue', category: 'Operating Revenue', openingBalance: 0 },
  ]);

  // New Account Modal / Form State
  const [newAcc, setNewAcc] = useState({ code: '', name: '', type: 'Asset' as Account['type'], category: 'Current Assets', openingBalance: 0 });

  // Journal Entries State (Fully compliant with robust multi-line transactions)
  const [journals, setJournals] = useState<JournalEntry[]>([
    {
      id: 'j_1',
      date: '2025-10-01',
      reference: 'REF-001',
      description: isFr ? 'Capital initial apporté par les actionnaires' : 'Initial capital introduced by shareholders',
      lines: [
        { id: 'jl_1', accountId: 'acc_521', debit: 10000000, credit: 0 },
        { id: 'jl_2', accountId: 'acc_101', debit: 0, credit: 10000000 }
      ],
      isFinalized: false
    },
    {
      id: 'j_2',
      date: '2025-10-03',
      reference: 'REF-002',
      description: isFr ? 'Achat de marchandises en espèces' : 'Purchase of inventory in cash',
      lines: [
        { id: 'jl_3', accountId: 'acc_601', debit: 500000, credit: 0 },
        { id: 'jl_4', accountId: 'acc_531', debit: 0, credit: 500000 }
      ],
      isFinalized: false
    },
    {
      id: 'j_3',
      date: '2025-10-05',
      reference: 'REF-003',
      description: isFr ? 'Vente de marchandises au comptant' : 'Cash sales of goods to customers',
      lines: [
        { id: 'jl_5', accountId: 'acc_521', debit: 1200000, credit: 0 },
        { id: 'jl_6', accountId: 'acc_701', debit: 0, credit: 1200000 }
      ],
      isFinalized: false
    },
    {
      id: 'j_4',
      date: '2025-10-10',
      reference: 'REF-004',
      description: isFr ? 'Paiement du loyer du mois par virement' : 'Monthly rent payment by bank transfer',
      lines: [
        { id: 'jl_7', accountId: 'acc_651', debit: 300000, credit: 0 },
        { id: 'jl_8', accountId: 'acc_521', debit: 0, credit: 300000 }
      ],
      isFinalized: false
    }
  ]);

  // Draft Multi-line Entry Form State
  const [draftDate, setDraftDate] = useState(new Date().toISOString().split('T')[0]);
  const [draftReference, setDraftReference] = useState(`REF-${Math.floor(100 + Math.random() * 900)}`);
  const [draftDescription, setDraftDescription] = useState('');
  const [draftLines, setDraftLines] = useState<Omit<JournalEntryLine, 'id'>[]>([
    { accountId: 'acc_601', debit: 0, credit: 0 },
    { accountId: 'acc_521', debit: 0, credit: 0 }
  ]);

  // Payroll Simulation State
  const [payroll, setPayroll] = useState({
    employeeName: 'Jean Dupont',
    baseSalary: 250000,
    allowances: 50000,
    cnpsEmployeeRate: 4.2, // 4.2% employee social security
    irppRate: 10, // Income tax estimate
    advancedBonus: 0
  });

  // Bank Reconciliation State
  const [bankReconciliation, setBankReconciliation] = useState({
    cashBookBalance: 2600000,
    bankStatementBalance: 2950000,
    outstandingCheques: 450000,
    depositsInTransit: 100000,
    bankCharges: 25000
  });

  // ERP Practice State
  const [customers, setCustomers] = useState([
    { id: 'c_1', name: 'Société Camerounaise de Distribution', phone: '+237 670112233', balance: 450000 },
    { id: 'c_2', name: 'Global Tech SARL', phone: '+237 699887766', balance: 750000 }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 's_1', name: 'AfriDrink Wholesale Ltd', phone: '+237 650001122', balance: 900000 },
    { id: 's_2', name: 'Office Depot Douala', phone: '+237 677443322', balance: 250000 }
  ]);

  // Add Account Handler
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLedgerFinalized) {
      toast.error(isFr ? 'Le grand livre est clôturé. Déverrouillez-le d\'abord.' : 'Ledger is finalized/locked. Unlock it first.');
      return;
    }
    if (!newAcc.code || !newAcc.name) {
      toast.error(isFr ? 'Veuillez remplir le code et le nom du compte.' : 'Please enter account code and name.');
      return;
    }
    const acc: Account = {
      id: `acc_${Date.now()}`,
      ...newAcc
    };
    setAccounts([...accounts, acc]);
    setNewAcc({ code: '', name: '', type: 'Asset', category: 'Current Assets', openingBalance: 0 });
    toast.success(isFr ? 'Compte ajouté au Plan Comptable !' : 'Account added to Chart of Accounts!');
  };

  // Add a line to the drafted transaction
  const addDraftLine = () => {
    setDraftLines([...draftLines, { accountId: 'acc_601', debit: 0, credit: 0 }]);
  };

  // Remove a line from the drafted transaction
  const removeDraftLine = (index: number) => {
    if (draftLines.length <= 2) {
      toast.error(isFr ? 'Un enregistrement comptable doit contenir au moins 2 lignes.' : 'A transaction must have at least 2 lines.');
      return;
    }
    const updated = [...draftLines];
    updated.splice(index, 1);
    setDraftLines(updated);
  };

  // Update specific field in drafted transaction line
  const updateDraftLine = (index: number, field: 'accountId' | 'debit' | 'credit', value: any) => {
    const updated = [...draftLines];
    if (field === 'accountId') {
      updated[index].accountId = value;
    } else {
      updated[index][field] = Math.max(0, Number(value));
      // Standard rule: A single line cannot have both a debit and a credit
      if (field === 'debit' && Number(value) > 0) {
        updated[index].credit = 0;
      } else if (field === 'credit' && Number(value) > 0) {
        updated[index].debit = 0;
      }
    }
    setDraftLines(updated);
  };

  // Sum calculations for Draft Entry
  const draftTotalDebit = draftLines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const draftTotalCredit = draftLines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const draftDifference = Math.abs(draftTotalDebit - draftTotalCredit);
  const isDraftBalanced = draftTotalDebit === draftTotalCredit && draftTotalDebit > 0;

  // Submit Multi-line Journal Entry
  const handlePostJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLedgerFinalized) {
      toast.error(isFr ? 'Le grand livre est clôturé. Impossible de modifier ou rajouter des écritures.' : 'Ledger is locked/closed. Cannot add entries.');
      return;
    }
    if (!draftDescription.trim()) {
      toast.error(isFr ? 'Veuillez saisir un libellé ou une narration pour cette opération.' : 'Please enter description/narration.');
      return;
    }
    if (!isDraftBalanced) {
      toast.error(isFr ? 'Erreur: Les débits doivent être égaux aux crédits !' : 'Error: Total debits must equal total credits!');
      return;
    }

    const linesWithIds = draftLines.map((line, idx) => ({
      id: `jl_${Date.now()}_${idx}`,
      ...line
    }));

    const newEntry: JournalEntry = {
      id: `j_${Date.now()}`,
      date: draftDate,
      reference: draftReference,
      description: draftDescription,
      lines: linesWithIds,
      isFinalized: false
    };

    setJournals([newEntry, ...journals]);
    setDraftDescription('');
    setDraftReference(`REF-${Math.floor(100 + Math.random() * 900)}`);
    setDraftLines([
      { accountId: 'acc_601', debit: 0, credit: 0 },
      { accountId: 'acc_521', debit: 0, credit: 0 }
    ]);
    toast.success(isFr ? 'Écriture postée avec succès ! (Le Grand Livre a été mis à jour automatiquement)' : 'Journal entry posted successfully! (Ledger updated)');
  };

  // Core Ledger Calculations
  const getAccountMovements = (accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    let totalDebit = acc?.type === 'Asset' || acc?.type === 'Expense' ? acc.openingBalance : 0;
    let totalCredit = acc?.type === 'Liability' || acc?.type === 'Equity' || acc?.type === 'Revenue' ? acc.openingBalance : 0;

    const movements: any[] = [];
    if (acc && acc.openingBalance !== 0) {
      movements.push({
        date: 'Opening',
        reference: 'INITIAL',
        description: isFr ? 'Solde initial d\'ouverture' : 'Opening balance',
        debit: acc.type === 'Asset' || acc.type === 'Expense' ? acc.openingBalance : 0,
        credit: acc.type === 'Liability' || acc.type === 'Equity' || acc.type === 'Revenue' ? acc.openingBalance : 0
      });
    }

    journals.forEach(j => {
      j.lines.forEach(l => {
        if (l.accountId === accountId) {
          totalDebit += l.debit;
          totalCredit += l.credit;
          if (l.debit > 0 || l.credit > 0) {
            movements.push({
              date: j.date,
              reference: j.reference,
              description: j.description,
              debit: l.debit,
              credit: l.credit,
              isFinalized: j.isFinalized
            });
          }
        }
      });
    });

    const netBalance = totalDebit - totalCredit;
    return { totalDebit, totalCredit, netBalance, movements };
  };

  // Trial Balance Data computation
  const trialBalanceRows = accounts.map(acc => {
    const mov = getAccountMovements(acc.id);
    let debitDisplay = 0;
    let creditDisplay = 0;
    if (mov.netBalance >= 0) {
      debitDisplay = mov.netBalance;
    } else {
      creditDisplay = Math.abs(mov.netBalance);
    }
    return {
      account: acc,
      debit: debitDisplay,
      credit: creditDisplay
    };
  });

  const totalTrialDebit = trialBalanceRows.reduce((sum, r) => sum + r.debit, 0);
  const totalTrialCredit = trialBalanceRows.reduce((sum, r) => sum + r.credit, 0);
  const isTrialBalanced = Math.abs(totalTrialDebit - totalTrialCredit) < 1;

  // Finalize / Close Ledger Action
  const handleFinalizeLedger = () => {
    if (!isTrialBalanced) {
      toast.error(isFr 
        ? 'Impossible de clôturer: La balance de vérification est déséquilibrée.' 
        : 'Cannot finalize: The trial balance is currently unbalanced.');
      return;
    }

    // Freeze existing transactions
    setJournals(prev => prev.map(j => ({ ...j, isFinalized: true })));
    setIsLedgerFinalized(true);
    toast.success(isFr 
      ? 'Félicitations ! L\'exercice comptable est clôturé et verrouillé avec succès.' 
      : 'Congratulations! The accounting cycle is locked and finalized successfully.');
  };

  const handleUnlockLedger = () => {
    setIsLedgerFinalized(false);
    setJournals(prev => prev.map(j => ({ ...j, isFinalized: false })));
    toast.success(isFr ? 'Livre journal déverrouillé.' : 'Journal book unlocked.');
  };

  // Persistence State & Operations
  const [isLoadingPersistence, setIsLoadingPersistence] = useState(false);
  const [isSavingPersistence, setIsSavingPersistence] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const loadCompanyData = async () => {
      setIsLoadingPersistence(true);
      try {
        const companyRef = doc(db, 'accounting_companies', user.uid);
        const docSnap = await getDoc(companyRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.company) setCompany(data.company);
          if (data.accounts) setAccounts(data.accounts);
          if (data.journals) setJournals(data.journals);
          if (data.payroll) setPayroll(data.payroll);
          if (data.bankReconciliation) setBankReconciliation(data.bankReconciliation);
          if (data.isLedgerFinalized !== undefined) setIsLedgerFinalized(data.isLedgerFinalized);
          toast.success(isFr ? 'Données d\'entreprise chargées avec succès !' : 'Company practice data loaded successfully!');
        }
      } catch (err) {
        console.error("Error loading accounting lab data:", err);
      } finally {
        setIsLoadingPersistence(false);
      }
    };

    loadCompanyData();
  }, [user?.uid]);

  const handleSaveCompanyData = async () => {
    if (!user?.uid) {
      toast.error(isFr ? 'Vous devez être connecté pour sauvegarder vos données.' : 'You must be logged in to save data.');
      return;
    }
    setIsSavingPersistence(true);
    try {
      const companyRef = doc(db, 'accounting_companies', user.uid);
      await setDoc(companyRef, {
        userId: user.uid,
        company,
        accounts,
        journals,
        payroll,
        bankReconciliation,
        isLedgerFinalized,
        updatedAt: serverTimestamp(),
      });
      toast.success(isFr ? 'Données d\'entreprise sauvegardées dans le Cloud !' : 'Company data saved successfully to the Cloud!');
    } catch (err) {
      console.error("Error saving accounting lab data:", err);
      toast.error(isFr ? 'Erreur lors de la sauvegarde.' : 'Error saving company data.');
    } finally {
      setIsSavingPersistence(false);
    }
  };

  // Income Statement
  const totalRevenue = accounts
    .filter(a => a.type === 'Revenue')
    .reduce((sum, a) => sum + Math.abs(getAccountMovements(a.id).netBalance), 0);

  const totalExpenses = accounts
    .filter(a => a.type === 'Expense')
    .reduce((sum, a) => sum + Math.abs(getAccountMovements(a.id).netBalance), 0);

  const netIncome = totalRevenue - totalExpenses;

  // Balance Sheet Assets, Liabilities, Equity
  const totalAssets = accounts
    .filter(a => a.type === 'Asset')
    .reduce((sum, a) => sum + getAccountMovements(a.id).netBalance, 0);

  const totalLiabilities = accounts
    .filter(a => a.type === 'Liability')
    .reduce((sum, a) => sum + Math.abs(getAccountMovements(a.id).netBalance), 0);

  const totalEquity = accounts
    .filter(a => a.type === 'Equity')
    .reduce((sum, a) => sum + Math.abs(getAccountMovements(a.id).netBalance), 0) + netIncome;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        
        {/* HEADER & TOP SUMMARY BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/student-practical-lab')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> {isFr ? 'Retour aux Labos' : 'Back to Labs'}
              </button>
              <span className="text-slate-300">•</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase rounded-full border border-emerald-200">
                {isFr ? 'Moteur Double Entrée' : 'Double-Entry Engine'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isFr ? 'Laboratoire de Comptabilité Professionnelle' : 'Professional Accounting Laboratory'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isFr ? `Exercice en cours de simulation: ${company.name}` : `Currently simulating: ${company.name}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <Building2 size={20} className="text-indigo-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{isFr ? 'Période Fiscale' : 'Fiscal Period'}</p>
                <p className="text-xs font-black text-slate-900">{company.fiscalYear}</p>
              </div>
            </div>

            {/* Save to Cloud Button */}
            <Button 
              onClick={handleSaveCompanyData}
              disabled={isSavingPersistence}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-2xl text-xs font-bold px-4 py-3 flex items-center gap-2 shadow-sm"
            >
              <Save size={14} className={isSavingPersistence ? "animate-spin" : ""} />
              {isSavingPersistence ? (isFr ? 'Sauvegarde...' : 'Saving...') : (isFr ? 'Sauvegarder S.A.' : 'Save to Cloud')}
            </Button>

            {/* Finalization status indicator */}
            {isLedgerFinalized ? (
              <Button 
                onClick={handleUnlockLedger}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold px-4 py-3 flex items-center gap-2 shadow-sm"
              >
                <Lock size={14} /> {isFr ? 'Clôturé (Déverrouiller)' : 'Finalized (Unlock)'}
              </Button>
            ) : (
              <Button 
                onClick={handleFinalizeLedger}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold px-4 py-3 flex items-center gap-2 shadow-sm"
              >
                <Unlock size={14} /> {isFr ? 'Clôturer l\'Exercice' : 'Close Exercise'}
              </Button>
            )}
          </div>
        </div>

        {/* ACCOUNTING TABS NAV */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm no-scrollbar">
          {[
            { id: 'dashboard', label: isFr ? 'Tableau de Bord' : 'Dashboard', icon: PieChart },
            { id: 'accounts', label: isFr ? 'Plan Comptable' : 'Chart of Accounts', icon: Layers },
            { id: 'journal', label: isFr ? 'Journal des Écritures' : 'Journal Practice', icon: BookOpen },
            { id: 'ledger', label: isFr ? 'Grand Livre' : 'General Ledger', icon: Scale },
            { id: 'trial_balance', label: isFr ? 'Balance Générale' : 'Trial Balance', icon: CheckCircle2 },
            { id: 'bank_rec', label: isFr ? 'Rapprochement' : 'Bank Reconciliation', icon: Landmark },
            { id: 'statements', label: isFr ? 'États Financiers' : 'Financial Statements', icon: FileText },
            { id: 'payroll', label: isFr ? 'Simulation Paie' : 'Payroll Simulator', icon: Users },
            { id: 'audit', label: isFr ? 'Audit Practice' : 'Audit Lab', icon: ShieldCheck },
            { id: 'erp', label: isFr ? 'ERP Commercial' : 'ERP Commercial', icon: Briefcase },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl shadow-xl space-y-2">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">{isFr ? 'Total Actif' : 'Total Assets'}</p>
                <h3 className="text-2xl font-black tracking-tight">{(totalAssets).toLocaleString()} XAF</h3>
                <p className="text-[11px] text-indigo-300">{isFr ? 'Total Débiteur Actif' : 'Active Balance'}</p>
              </Card>

              <Card className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{isFr ? 'Total Produits' : 'Total Revenues'}</p>
                <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{(totalRevenue).toLocaleString()} XAF</h3>
                <p className="text-[11px] text-slate-500">{isFr ? 'Chiffre d\'affaires brut' : 'Sales and other credits'}</p>
              </Card>

              <Card className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{isFr ? 'Total Charges' : 'Total Expenses'}</p>
                <h3 className="text-2xl font-black text-rose-600 tracking-tight">{(totalExpenses).toLocaleString()} XAF</h3>
                <p className="text-[11px] text-slate-500">{isFr ? 'Achats, loyer, paie' : 'Operating debits'}</p>
              </Card>

              <Card className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{isFr ? 'Bénéfice Net' : 'Net Profit'}</p>
                <h3 className={`text-2xl font-black tracking-tight ${netIncome >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {(netIncome).toLocaleString()} XAF
                </h3>
                <p className="text-[11px] text-slate-500">{isFr ? 'Résultat d\'exercice' : 'Net business income'}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 md:col-span-2">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Calculator size={18} className="text-indigo-600" /> {isFr ? 'Simulations & Scénarios Professionnels' : 'Simulations & Professional Scenarios'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isFr ? 'Choisissez un scénario prédéfini pour tester ou chargez-le directement dans votre brouillon de transaction ci-dessous.' : 'Select an exercise scenario to automatically set up standard multi-line bookkeeping transactions.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: isFr ? '1. Augmentation de Capital' : '1. Capital Increase',
                      desc: isFr ? 'Débitez la Banque, Créditez le Capital' : 'Debit Bank, Credit Share Capital',
                      action: () => {
                        setDraftDescription(isFr ? 'Apport de capital par virement' : 'Capital introduction by bank wire');
                        setDraftLines([
                          { accountId: 'acc_521', debit: 5000000, credit: 0 },
                          { accountId: 'acc_101', debit: 0, credit: 5000000 }
                        ]);
                        setActiveTab('journal');
                        toast.success(isFr ? 'Scénario de capital chargé !' : 'Capital scenario loaded into journal draft!');
                      }
                    },
                    {
                      title: isFr ? '2. Vente de services avec TVA' : '2. Service Sale with VAT',
                      desc: isFr ? 'Débitez Clients, Créditez Prestations & TVA' : 'Debit Customer, Credit Service Revenue & VAT',
                      action: () => {
                        setDraftDescription(isFr ? 'Prestation informatique facturée avec TVA' : 'IT Consulting service invoiced with VAT');
                        setDraftLines([
                          { accountId: 'acc_401', debit: 1192500, credit: 0 }, // Client includes 19.25% VAT
                          { accountId: 'acc_706', debit: 0, credit: 1000000 }, // Revenue
                          { accountId: 'acc_402', debit: 0, credit: 192500 }   // VAT Payable / Creditor
                        ]);
                        setActiveTab('journal');
                        toast.success(isFr ? 'Scénario de vente complexe avec TVA chargé !' : 'Complex VAT sale scenario loaded!');
                      }
                    }
                  ].map((scen, idx) => (
                    <div 
                      key={idx}
                      onClick={scen.action}
                      className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-600 transition cursor-pointer bg-slate-50/50 hover:bg-white group space-y-1.5"
                    >
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">{scen.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{scen.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" /> {isFr ? 'Statut du Grand Livre' : 'Ledger Status & Audit'}
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{isFr ? 'Balance Générale ?' : 'Trial Balance Balanced?'}</span>
                    <Badge variant={isTrialBalanced ? 'success' : 'danger'}>
                      {isTrialBalanced ? (isFr ? '✓ Équilibrée' : '✓ Balanced') : (isFr ? '✗ Déséquilibre' : '✗ Out of Balance')}
                    </Badge>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{isFr ? 'Statut de clôture' : 'Close Status'}</span>
                    <Badge variant={isLedgerFinalized ? 'success' : 'warning'}>
                      {isLedgerFinalized ? (isFr ? 'Clôturé' : 'Finalized') : (isFr ? 'Brouillon ouvert' : 'Draft Open')}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: CHART OF ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Account Form */}
              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Plus size={18} className="text-indigo-600" /> {isFr ? 'Créer un Compte' : 'Add New Account'}
                </h3>
                <form onSubmit={handleAddAccount} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600">{isFr ? 'Code du Compte' : 'Account Code'}</label>
                    <input
                      type="text"
                      disabled={isLedgerFinalized}
                      value={newAcc.code}
                      onChange={e => setNewAcc({ ...newAcc, code: e.target.value })}
                      placeholder="e.g. 5210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none mt-1 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">{isFr ? 'Nom du Compte' : 'Account Name'}</label>
                    <input
                      type="text"
                      disabled={isLedgerFinalized}
                      value={newAcc.name}
                      onChange={e => setNewAcc({ ...newAcc, name: e.target.value })}
                      placeholder={isFr ? 'ex: Banque commerciale' : 'e.g. Commercial Bank'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none mt-1 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">{isFr ? 'Type de Compte' : 'Account Type'}</label>
                    <select
                      disabled={isLedgerFinalized}
                      value={newAcc.type}
                      onChange={e => setNewAcc({ ...newAcc, type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none mt-1 disabled:opacity-50"
                    >
                      <option value="Asset">{isFr ? 'Actif (Asset)' : 'Asset'}</option>
                      <option value="Liability">{isFr ? 'Passif (Liability)' : 'Liability'}</option>
                      <option value="Equity">{isFr ? 'Capitaux Propres (Equity)' : 'Equity'}</option>
                      <option value="Revenue">{isFr ? 'Produits (Revenue)' : 'Revenue'}</option>
                      <option value="Expense">{isFr ? 'Charges (Expense)' : 'Expense'}</option>
                    </select>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLedgerFinalized}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold py-3 disabled:opacity-50"
                  >
                    {isFr ? 'Ajouter au Plan Comptable' : 'Add to Chart of Accounts'}
                  </Button>
                </form>
              </Card>

              {/* Accounts Table */}
              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 lg:col-span-2 overflow-hidden">
                <h3 className="font-black text-base text-slate-900">
                  {isFr ? 'Plan de Comptes de l\'Établissement' : 'General Chart of Accounts'} ({accounts.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400">
                        <th className="pb-3">{isFr ? 'Code' : 'Code'}</th>
                        <th className="pb-3">{isFr ? 'Intitulé du Compte' : 'Account Name'}</th>
                        <th className="pb-3">{isFr ? 'Catégorie' : 'Category'}</th>
                        <th className="pb-3 text-right">{isFr ? 'Solde Initial' : 'Opening Balance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                      {accounts.map(acc => (
                        <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 font-mono font-bold text-indigo-600">{acc.code}</td>
                          <td className="py-3 font-bold text-slate-900">{acc.name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              acc.type === 'Asset' ? 'bg-blue-50 text-blue-700' :
                              acc.type === 'Liability' ? 'bg-amber-50 text-amber-700' :
                              acc.type === 'Equity' ? 'bg-purple-50 text-purple-700' :
                              acc.type === 'Revenue' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {acc.type}
                            </span>
                          </td>
                          <td className="py-3 text-right font-black text-slate-900">{acc.openingBalance.toLocaleString()} XAF</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: JOURNAL ENTRIES (MULTILINE DOUBLE ENTRY SYSTEM) */}
        {activeTab === 'journal' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Interactive Journal Draft Form (Left Column: Builder) */}
              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 lg:col-span-5">
                <div className="space-y-1">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-600" /> {isFr ? 'Saisie Multiligne en Partie Double' : 'Multiline Double-Entry Posting'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isFr ? 'Renseignez l\'en-tête de pièce puis ajoutez vos lignes de débit et de crédit.' : 'Fill transaction metadata and define multiple debit and credit rows.'}
                  </p>
                </div>

                <form onSubmit={handlePostJournalEntry} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isFr ? 'Date d\'opération' : 'Posting Date'}</label>
                      <input
                        type="date"
                        disabled={isLedgerFinalized}
                        value={draftDate}
                        onChange={e => setDraftDate(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 mt-1 focus:bg-white focus:border-indigo-600 outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isFr ? 'Numéro de Pièce' : 'Doc Reference'}</label>
                      <input
                        type="text"
                        disabled={isLedgerFinalized}
                        value={draftReference}
                        onChange={e => setDraftReference(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 mt-1 focus:bg-white focus:border-indigo-600 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isFr ? 'Libellé de l\'écriture / Narration' : 'Transaction Narration'}</label>
                    <input
                      type="text"
                      disabled={isLedgerFinalized}
                      value={draftDescription}
                      onChange={e => setDraftDescription(e.target.value)}
                      placeholder={isFr ? 'ex: Facturation client du mois' : 'e.g. IT services rendered'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 mt-1 focus:bg-white focus:border-indigo-600 outline-none disabled:opacity-50"
                    />
                  </div>

                  {/* Multi-line entry rows */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isFr ? 'Lignes d\'écriture' : 'Journal Lines'}</span>
                      <button
                        type="button"
                        disabled={isLedgerFinalized}
                        onClick={addDraftLine}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-black flex items-center gap-1 disabled:opacity-50"
                      >
                        <Plus size={14} /> {isFr ? 'Ajouter ligne' : 'Add Line'}
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {draftLines.map((line, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          <select
                            disabled={isLedgerFinalized}
                            value={line.accountId}
                            onChange={e => updateDraftLine(idx, 'accountId', e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-950 outline-none disabled:opacity-50"
                          >
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                            ))}
                          </select>

                          <input
                            type="number"
                            disabled={isLedgerFinalized}
                            placeholder="Debit"
                            value={line.debit || ''}
                            onChange={e => updateDraftLine(idx, 'debit', e.target.value)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-900 text-right outline-none disabled:opacity-50 focus:border-indigo-600"
                          />

                          <input
                            type="number"
                            disabled={isLedgerFinalized}
                            placeholder="Credit"
                            value={line.credit || ''}
                            onChange={e => updateDraftLine(idx, 'credit', e.target.value)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-900 text-right outline-none disabled:opacity-50 focus:border-indigo-600"
                          />

                          <button
                            type="button"
                            disabled={isLedgerFinalized}
                            onClick={() => removeDraftLine(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Balancing Audit Panel */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{isFr ? 'Total Débits:' : 'Total Debits:'}</span>
                      <span className="text-emerald-700">{draftTotalDebit.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{isFr ? 'Total Crédits:' : 'Total Credits:'}</span>
                      <span className="text-rose-700">{draftTotalCredit.toLocaleString()} XAF</span>
                    </div>

                    <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{isFr ? 'Écart / Différence:' : 'Difference:'}</span>
                      <span className={`font-black ${draftDifference === 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {draftDifference.toLocaleString()} XAF
                      </span>
                    </div>

                    <div className="pt-1">
                      {isDraftBalanced ? (
                        <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-indigo-800 text-[10px] font-black uppercase">
                          <CheckCircle2 size={14} /> {isFr ? '✓ Écriture équilibrée ! Prête à poster.' : '✓ Balanced! Ready to post.'}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-800 text-[10px] font-black uppercase">
                          <AlertCircle size={14} /> {isFr ? '✗ Écriture déséquilibrée.' : '✗ Unbalanced entry.'}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={!isDraftBalanced || isLedgerFinalized}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold py-3.5 shadow-md disabled:opacity-50 transition"
                  >
                    {isFr ? 'Poster au Livre-Journal' : 'Post to Journal Book'}
                  </Button>
                </form>
              </Card>

              {/* General Journal Book (Right Column: History) */}
              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 lg:col-span-7 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-base text-slate-900">
                    {isFr ? 'Livre-Journal des Opérations' : 'General Ledger Journal Book'} ({journals.length})
                  </h3>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                  {journals.map(j => (
                    <div key={j.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 transition space-y-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-black text-slate-900">{j.date}</span>
                          <span className="mx-2 text-slate-300">•</span>
                          <span className="text-xs font-mono font-bold text-indigo-600">{j.reference}</span>
                        </div>
                        <Badge variant={j.isFinalized ? 'success' : 'warning'}>
                          {j.isFinalized ? (isFr ? 'Clôturé' : 'Locked') : (isFr ? 'Brouillon' : 'Draft')}
                        </Badge>
                      </div>

                      <p className="text-xs font-bold text-slate-700">{j.description}</p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] font-medium border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/60 pb-1 text-slate-400 font-bold uppercase">
                              <th className="pb-1">{isFr ? 'Compte' : 'Account'}</th>
                              <th className="pb-1 text-right">{isFr ? 'Débit' : 'Debit'}</th>
                              <th className="pb-1 text-right">{isFr ? 'Crédit' : 'Credit'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/40 text-slate-700">
                            {j.lines.map((line, lIdx) => {
                              const acc = accounts.find(a => a.id === line.accountId);
                              return (
                                <tr key={lIdx} className="hover:bg-slate-100/40 transition">
                                  <td className="py-2.5 font-bold">
                                    <span className="font-mono text-indigo-600 mr-2">{acc?.code}</span>
                                    {acc?.name}
                                  </td>
                                  <td className="py-2.5 text-right font-semibold text-emerald-700">
                                    {line.debit > 0 ? line.debit.toLocaleString() : '-'}
                                  </td>
                                  <td className="py-2.5 text-right font-semibold text-rose-700">
                                    {line.credit > 0 ? line.credit.toLocaleString() : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          </div>
        )}

        {/* TAB 4: GENERAL LEDGER (GRAND LIVRE) */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-black text-lg text-slate-900">
                {isFr ? 'Grand Livre des Comptes' : 'General Ledger Accounts Posting'}
              </h3>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                {accounts.map(acc => {
                  const { movements, totalDebit, totalCredit, netBalance } = getAccountMovements(acc.id);
                  if (movements.length === 0) return null;
                  return (
                    <div key={acc.id} className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-mono text-xs font-black text-indigo-600 mr-2">{acc.code}</span>
                          <span className="text-xs font-black text-slate-900">{acc.name}</span>
                        </div>
                        <Badge variant={netBalance >= 0 ? 'success' : 'danger'}>
                          Solde: {netBalance.toLocaleString()} XAF
                        </Badge>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                              <th className="pb-2">{isFr ? 'Date' : 'Date'}</th>
                              <th className="pb-2">{isFr ? 'Réf' : 'Ref'}</th>
                              <th className="pb-2">{isFr ? 'Description' : 'Description'}</th>
                              <th className="pb-2 text-right">{isFr ? 'Débit' : 'Debit'}</th>
                              <th className="pb-2 text-right">{isFr ? 'Crédit' : 'Credit'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {movements.map((m, idx) => (
                              <tr key={idx} className="hover:bg-slate-100/30">
                                <td className="py-2">{m.date}</td>
                                <td className="py-2 font-mono text-indigo-600">{m.reference}</td>
                                <td className="py-2 font-bold">{m.description}</td>
                                <td className="py-2 text-right text-emerald-700">{m.debit > 0 ? m.debit.toLocaleString() : '-'}</td>
                                <td className="py-2 text-right text-rose-700">{m.credit > 0 ? m.credit.toLocaleString() : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: TRIAL BALANCE (BALANCE GENERALE) */}
        {activeTab === 'trial_balance' && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">{isFr ? 'Balance de Vérification Générale' : 'General Trial Balance'}</h3>
                  <p className="text-xs text-slate-500">
                    {isFr ? 'Rapport comptable validant que l\'ensemble des débits est égal à l\'ensemble des crédits.' : 'Bilingual report verifying total ledger debit and credit equilibrium.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isTrialBalanced ? 'success' : 'danger'}>
                    {isTrialBalanced ? (isFr ? '✓ Équilibrée' : '✓ Balanced') : (isFr ? '✗ Déséquilibrée' : '✗ Unbalanced')}
                  </Badge>
                  <Button onClick={() => window.print()} className="bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-2">
                    <Printer size={14} /> {isFr ? 'Imprimer / PDF' : 'Print / PDF'}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 bg-slate-50">
                      <th className="p-3">{isFr ? 'Code' : 'Code'}</th>
                      <th className="p-3">{isFr ? 'Intitulé du Compte' : 'Account Name'}</th>
                      <th className="p-3 text-right">{isFr ? 'Débit (XAF)' : 'Debit (XAF)'}</th>
                      <th className="p-3 text-right">{isFr ? 'Crédit (XAF)' : 'Credit (XAF)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
                    {trialBalanceRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono text-indigo-600">{row.account.code}</td>
                        <td className="p-3">{row.account.name}</td>
                        <td className="p-3 text-right text-emerald-700">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</td>
                        <td className="p-3 text-right text-rose-700">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-black text-xs">
                      <td className="p-4" colSpan={2}>{isFr ? 'TOTAUX GÉNÉRAUX' : 'TOTAL MOVEMENTS'}</td>
                      <td className="p-4 text-right">{totalTrialDebit.toLocaleString()} XAF</td>
                      <td className="p-4 text-right">{totalTrialCredit.toLocaleString()} XAF</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 6: BANK RECONCILIATION */}
        {activeTab === 'bank_rec' && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-black text-lg text-slate-900">{isFr ? 'État de Rapprochement Bancaire' : 'Bank Reconciliation Statement'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">{isFr ? 'Solde Livre de Caisse (Entreprise)' : 'Cash Book / Company Balance'}</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{isFr ? 'Solde avant ajustement' : 'Unadjusted Balance'}</span>
                      <span>{bankReconciliation.cashBookBalance.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-600">
                      <span>{isFr ? 'Frais bancaires non enregistrés' : 'Unrecorded Bank Charges'}</span>
                      <span>- {bankReconciliation.bankCharges.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between font-black text-indigo-900 bg-white p-3 rounded-xl border border-slate-100 text-sm">
                      <span>{isFr ? 'Solde Réajusté' : 'Adjusted Cash Balance'}</span>
                      <span>{(bankReconciliation.cashBookBalance - bankReconciliation.bankCharges).toLocaleString()} XAF</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">{isFr ? 'Solde Relevé Bancaire (Banque)' : 'Bank Statement Balance'}</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{isFr ? 'Solde de fin de mois' : 'End of Month Statement Balance'}</span>
                      <span>{bankReconciliation.bankStatementBalance.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>{isFr ? 'Dépôts en transit' : 'Deposits in Transit'}</span>
                      <span>+ {bankReconciliation.depositsInTransit.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-600">
                      <span>{isFr ? 'Chèques en circulation' : 'Outstanding Cheques'}</span>
                      <span>- {bankReconciliation.outstandingCheques.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between font-black text-indigo-900 bg-white p-3 rounded-xl border border-slate-100 text-sm">
                      <span>{isFr ? 'Solde Bancaire Ajusté' : 'Adjusted Bank Balance'}</span>
                      <span>{(bankReconciliation.bankStatementBalance + bankReconciliation.depositsInTransit - bankReconciliation.outstandingCheques).toLocaleString()} XAF</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 7: FINANCIAL STATEMENTS (BILAN / COMPTE RESULTAT) */}
        {activeTab === 'statements' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Statement */}
              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-black text-base text-slate-900 flex items-center justify-between">
                  <span>{isFr ? 'Compte de Résultat (P&L)' : 'Income Statement'}</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">{company.fiscalYear}</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-2xl flex justify-between font-bold text-emerald-900">
                    <span>{isFr ? 'Chiffre d\'Affaires / Ventes' : 'Total Revenues'}</span>
                    <span>{totalRevenue.toLocaleString()} XAF</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-2xl flex justify-between font-bold text-rose-900">
                    <span>{isFr ? 'Total Charges et Dépenses' : 'Total Expenses'}</span>
                    <span>{totalExpenses.toLocaleString()} XAF</span>
                  </div>
                  <div className={`p-4 rounded-2xl flex justify-between font-black text-sm ${netIncome >= 0 ? 'bg-indigo-900 text-white' : 'bg-rose-900 text-white'}`}>
                    <span>{isFr ? 'RÉSULTAT NET COMPTABLE' : 'NET INCOME'}</span>
                    <span>{netIncome.toLocaleString()} XAF</span>
                  </div>
                </div>
              </Card>

              {/* Balance Sheet */}
              <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-black text-base text-slate-900 flex items-center justify-between">
                  <span>{isFr ? 'Bilan (Actif vs Passif & Capitaux)' : 'Balance Sheet / Statement of Financial Position'}</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">{company.fiscalYear}</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 rounded-2xl flex justify-between font-bold text-blue-900">
                    <span>{isFr ? 'Actif Global' : 'Total Assets'}</span>
                    <span>{totalAssets.toLocaleString()} XAF</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl flex justify-between font-bold text-amber-900">
                    <span>{isFr ? 'Passif / Dettes' : 'Total Liabilities'}</span>
                    <span>{totalLiabilities.toLocaleString()} XAF</span>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-2xl flex justify-between font-bold text-purple-900">
                    <span>{isFr ? 'Capitaux Propres + Résultat net' : 'Total Equity + Net Income'}</span>
                    <span>{totalEquity.toLocaleString()} XAF</span>
                  </div>
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between font-black text-xs">
                    <span>{isFr ? 'Équilibre Passif + Capitaux' : 'Total Liab + Equity Check'}</span>
                    <span>{(totalLiabilities + totalEquity).toLocaleString()} XAF</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 8: PAYROLL SIMULATOR */}
        {activeTab === 'payroll' && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-black text-lg text-slate-900">{isFr ? 'Calcul de Paie Cameroun' : 'Cameroon Payroll Simulator'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-600">{isFr ? 'Nom de l\'Employé' : 'Employee Name'}</label>
                  <input
                    type="text"
                    value={payroll.employeeName}
                    onChange={e => setPayroll({ ...payroll, employeeName: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                  <label className="text-xs font-bold text-slate-600">{isFr ? 'Salaire de Base (XAF)' : 'Base Salary (XAF)'}</label>
                  <input
                    type="number"
                    value={payroll.baseSalary}
                    onChange={e => setPayroll({ ...payroll, baseSalary: Number(e.target.value) })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                  <label className="text-xs font-bold text-slate-600">{isFr ? 'Primes & Indemnités (XAF)' : 'Allowances (XAF)'}</label>
                  <input
                    type="number"
                    value={payroll.allowances}
                    onChange={e => setPayroll({ ...payroll, allowances: Number(e.target.value) })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="font-black text-sm text-slate-900">{isFr ? 'Bulletin de Paie Calculé' : 'Calculated Pay Slip'}</h4>
                  {(() => {
                    const gross = payroll.baseSalary + payroll.allowances;
                    const cnps = Math.round(gross * (payroll.cnpsEmployeeRate / 100));
                    const taxable = gross - cnps;
                    const irpp = Math.round(taxable * (payroll.irppRate / 100));
                    const net = gross - cnps - irpp;
                    return (
                      <div className="space-y-2 text-xs font-medium text-slate-700">
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span>{isFr ? 'Salaire Brut Global' : 'Gross Salary'}</span>
                          <span className="font-bold text-slate-900">{gross.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 text-rose-700">
                          <span>{isFr ? 'Retenue CNPS Salariale (4.2%)' : 'CNPS Employee Deduction (4.2%)'}</span>
                          <span>- {cnps.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 text-rose-700">
                          <span>{isFr ? 'Impôt sur le Revenu (IRPP)' : 'Income Tax (IRPP)'}</span>
                          <span>- {irpp.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-black text-indigo-900 bg-indigo-50 px-4 rounded-xl">
                          <span>{isFr ? 'SALAIRE NET À PAYER' : 'NET SALARY PAYABLE'}</span>
                          <span>{net.toLocaleString()} XAF</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 9: ERP COMMERCIAL */}
        {activeTab === 'erp' && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-black text-lg text-slate-900">{isFr ? 'ERP Commercial & Facturation' : 'ERP Commercial & Invoicing'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">{isFr ? 'Clients' : 'Registered Customers'}</h4>
                  {customers.map(c => (
                    <div key={c.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.phone}</p>
                      </div>
                      <span className="text-xs font-black text-indigo-600">{c.balance.toLocaleString()} XAF</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">{isFr ? 'Fournisseurs' : 'Registered Suppliers'}</h4>
                  {suppliers.map(s => (
                    <div key={s.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-500">{s.phone}</p>
                      </div>
                      <span className="text-xs font-black text-rose-600">{s.balance.toLocaleString()} XAF</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* OTHER TABS PLACEHOLDER */}
        {['ledger', 'audit'].includes(activeTab) && (
          <Card className="p-12 text-center bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
            <Calculator size={48} className="mx-auto text-indigo-600 opacity-60" />
            <h3 className="text-lg font-black text-slate-900">{isFr ? 'Module Pratique Actif' : 'Active Practical Module'}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isFr ? 'Toutes les données de ce module sont synchronisées avec le Plan Comptable et le Journal Général en temps réel.' : 'All data in this module synchronizes with the Chart of Accounts and General Journal in real-time.'}
            </p>
            <Button onClick={() => setActiveTab('journal')} className="bg-indigo-600 text-white rounded-xl text-xs font-bold px-5 py-2.5">
              {isFr ? 'Voir le Journal' : 'Go to Journal Entries'}
            </Button>
          </Card>
        )}

      </main>
    </div>
  );
}
