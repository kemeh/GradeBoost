import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Bot, Send, CheckCircle2, MessageSquare, Zap, Cpu, RefreshCw,
  Calculator, Atom, Receipt, BookOpen, FileText, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface PromptsMap {
  id: string;
  label: string;
  labelFr?: string;
  category: string;
  icon: any;
  userMessage: string;
  userMessageFr?: string;
  aiResponse: string;
  aiResponseFr?: string;
}

const SAMPLE_PROMPTS: PromptsMap[] = [
  {
    id: 'quad',
    label: '📐 Quadratic Solver',
    labelFr: '📐 Résolveur d\'Équation du Second Degré',
    category: 'Mathematics',
    icon: Calculator,
    userMessage: 'Solve 2x² + 5x - 3 = 0 step-by-step for GCE O-Level Mathematics.',
    userMessageFr: 'Résous étape par étape 2x² + 5x - 3 = 0 pour le niveau BEPC / GCE O-Level.',
    aiResponse: `Here is the step-by-step solution for **2x² + 5x - 3 = 0**:

**Step 1: Identify coefficients**
a = 2, b = 5, c = -3

**Step 2: Factorization Method**
We find two numbers that multiply to give (a × c) = 2 × (-3) = -6, and add to give b = 5.
Those numbers are **+6** and **-1**.

Rewrite middle term:
2x² + 6x - x - 3 = 0
Factor by grouping:
2x(x + 3) - 1(x + 3) = 0
(2x - 1)(x + 3) = 0

**Step 3: Solve for x**
• 2x - 1 = 0  =>  **x = 1/2**
• x + 3 = 0   =>  **x = -3**

**Final Answer:** x = 1/2 or x = -3.
*Exam Tip: Always check your solutions by substituting back into the original equation!*`,
    aiResponseFr: `Voici la résolution détaillée pas à pas de **2x² + 5x - 3 = 0** :

**Étape 1 : Identifier les coefficients**
a = 2, b = 5, c = -3

**Étape 2 : Calcul du Discriminant (Δ)**
Δ = b² - 4ac = (5)² - 4(2)(-3) = 25 + 24 = **49**
Comme Δ > 0, l'équation admet deux solutions réelles distinctes.

**Étape 3 : Calcul des solutions**
√Δ = 7
• x₁ = (-b - √Δ) / 2a = (-5 - 7) / 4 = -12/4 = **-3**
• x₂ = (-b + √Δ) / 2a = (-5 + 7) / 4 = 2/4 = **1/2**

**Réponse finale :** S = { -3 ; 1/2 }
*Conseil d'examen : Vérifiez toujours vos résultats en remplaçant x dans l'équation d'origine !*`
  },
  {
    id: 'circuit',
    label: '⚡ AC Parallel Circuit',
    labelFr: '⚡ Circuit Parallèle RLC',
    category: 'Electrical Tech',
    icon: Zap,
    userMessage: 'How do I calculate total impedance (Z) in an RLC parallel AC circuit?',
    userMessageFr: 'Comment calculer l\'impédance totale (Z) dans un circuit RLC parallèle en courant alternatif ?',
    aiResponse: `In **TVEE Electrical Technology / Physics**:

For a parallel RLC circuit operating on AC voltage **V**:

1. **Calculate Admittance (Y):**
   Admittance is the reciprocal of impedance: Y = 1 / Z.
   Y = √[ (1/R)² + (1/X_L - 1/X_C)² ]

2. **Calculate Total Impedance (Z):**
   Z = 1 / Y

3. **Phase Angle (θ):**
   cos(θ) = (1/R) / Y

*Edulpha AI Schematic Tip: Draw the current phasor diagram with I_R on the real axis and (I_C - I_L) on the quadrature axis to verify your result.*`,
    aiResponseFr: `En **Électrotechnique / Physique Technique** :

Pour un circuit RLC parallèle soumis à une tension alternative **V** :

1. **Calculer l'Admittance (Y) :**
   L'admittance est l'inverse de l'impédance : Y = 1 / Z.
   Y = √[ (1/R)² + (1/X_L - 1/X_C)² ]

2. **Calculer l'Impédance Totale (Z) :**
   Z = 1 / Y

3. **Facteur de Puissance (cos θ) :**
   cos(θ) = (1/R) / Y

*Conseil Edulpha IA : Tracez le diagramme vectoriel de Fresnel des courants pour vérifier vos calculs.*`
  },
  {
    id: 'ledger',
    label: '📊 Accounting Balance Sheet',
    labelFr: '📊 Balance de Vérification',
    category: 'Commercial',
    icon: Receipt,
    userMessage: 'Explain how to balance a Trial Balance when debits and credits do not match.',
    userMessageFr: 'Explique comment équilibrer une balance de vérification lorsque les débits et crédits ne concordent pas.',
    aiResponse: `For **Commercial Education & Financial Accounting**:

When trial balance totals differ:

1. **Calculate Difference:** Find the exact amount (Credit - Debit).
2. **Divide Difference by 2:** If an item of that halved value was posted to the wrong column, it creates a discrepancy equal to double its amount.
3. **Divide Difference by 9:** If divisible by 9, you likely made a **transposition error** (e.g., writing 54 instead of 45).
4. **Check Ledger Balances:** Re-verify total debit postings against cash books and sales ledgers.

*Need an exercise on correcting errors? Click below to generate a practice trial balance problem!*`,
    aiResponseFr: `En **Comptabilité Financière & Sciences Commerciales** :

Lorsque le total des débits ne correspond pas aux crédits :

1. **Calculer l'écart :** Différence = | Total Débits - Total Crédits |.
2. **Diviser l'écart par 2 :** Si le montant divisé par 2 existe, une écriture a probablement été passée dans la mauvaise colonne.
3. **Diviser l'écart par 9 :** Si la différence est divisible par 9, il s'agit d'une **erreur de transposition** (ex: 54 inscrit au lieu de 45).
4. **Vérifier les reports du Grand-Livre :** Recontrôler les totaux des comptes de trésorerie et clients.`
  },
  {
    id: 'french-essay',
    label: '✍️ Dissertation Littéraire',
    labelFr: '✍️ Dissertation Littéraire',
    category: 'Francophone BAC',
    icon: BookOpen,
    userMessage: 'Donne-moi le plan détaillé pour une dissertation sur le rôle de la littérature africaine.',
    userMessageFr: 'Donne-moi le plan détaillé pour une dissertation sur le rôle de la littérature africaine.',
    aiResponse: `Voici la structure recommandée pour l'épreuve du **Baccalauréat MINESEC** :

**I. Introduction**
• **Amorce :** La littérature comme miroir et moteur de la société africaine.
• **Problématique :** La littérature africaine doit-elle privilégier l'engagement politique ou la quête esthétique ?
• **Annonce du plan.**

**II. Développement (Plan Dialectique)**
• **Thèse :** La littérature comme outil de dénonciation et d'émancipation (Ex: Ferdinand Oyono, Chinua Achebe).
• **Antithèse :** La valeur esthétique, poétique et universelle de l'œuvre (Ex: Léopold Sédar Senghor).
• **Synthèse :** La conciliation entre beauté formelle et utilité sociale.

**III. Conclusion**
• Bilan synthétique & Ouverture sur la littérature numérique moderne.`,
    aiResponseFr: `Voici la structure recommandée pour l'épreuve du **Baccalauréat MINESEC** :

**I. Introduction**
• **Amorce :** La littérature comme miroir et moteur de la société africaine.
• **Problématique :** La littérature africaine doit-elle privilégier l'engagement politique ou la quête esthétique ?
• **Annonce du plan.**

**II. Développement (Plan Dialectique)**
• **Thèse :** La littérature comme outil de dénonciation et d'émancipation (Ex: Ferdinand Oyono, Chinua Achebe).
• **Antithèse :** La valeur esthétique, poétique et universelle de l'œuvre (Ex: Léopold Sédar Senghor).
• **Synthèse :** La conciliation entre beauté formelle et utilité sociale.

**III. Conclusion**
• Bilan synthétique & Ouverture sur la littérature numérique moderne.`
  }
];

export const EdulphaAISection: React.FC = () => {
  const [activePrompt, setActivePrompt] = useState<PromptsMap>(SAMPLE_PROMPTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const handleSelectPrompt = (promptItem: PromptsMap) => {
    setIsGenerating(true);
    setActivePrompt(promptItem);
    setTimeout(() => {
      setIsGenerating(false);
    }, 300);
  };

  const userMsg = isFr && activePrompt.userMessageFr ? activePrompt.userMessageFr : activePrompt.userMessage;
  const aiResp = isFr && activePrompt.aiResponseFr ? activePrompt.aiResponseFr : activePrompt.aiResponse;

  return (
    <section id="ai-tutor" className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-400" />
            {isFr ? 'Compagnon Intelligent Edulpha IA' : 'Edulpha AI Intelligent Companion'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {isFr ? 'Rencontrez Votre Tuteur Personnel 24/7' : 'Meet Your 24/7 Personal Exam Tutor'}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-medium">
            {isFr
              ? 'Posez vos questions, résolvez des problèmes étape par étape, recevez des corrections instantanées et générez des plannings de révision en français et anglais.'
              : 'Ask questions, solve complex step-by-step problems, receive immediate feedback, and generate customized exam revision plans in English and French.'}
          </p>
        </div>

        {/* Main Grid: Features Left & Interactive AI Canvas Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Feature Bullet Points */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Bot size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isFr ? 'IA Entraînée sur les Programmes Officiels' : 'Curriculum-Trained Intelligence'}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {isFr
                  ? 'Entraînée spécifiquement sur les exigences officielles du MINESEC et du GCE Board pour garantir le respect de la terminologie et des barèmes d’examen.'
                  : 'Trained specifically on official MINESEC and Cameroon GCE Board syllabus requirements to ensure correct examination terminology and marking scheme rules.'}
              </p>
            </div>

            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isFr ? 'Résolutions Détaillées Étape par Étape' : 'Step-by-Step Problem Solvers'}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {isFr
                  ? 'Réglez équations mathématiques, formules de physique, réactions chimiques, écritures comptables et schémas techniques avec explications claires.'
                  : 'Solves math equations, physics formulas, chemistry equations, accounting ledgers, and technical schematics with clear explanation steps.'}
              </p>
            </div>

            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isFr ? 'Plannings de Révision Personnalisés' : 'Personalized Revision Timetables'}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {isFr
                  ? 'Générez un emploi du temps quotidien personnalisé selon votre date d’examen, ciblant vos lacunes avec des exercices adaptés.'
                  : 'Generates daily study schedules tailored to your target exam date, pinpointing weak areas and offering diagnostic drills.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>{isFr ? 'Interroger Edulpha IA Maintenant' : 'Start Asking Edulpha AI Now'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Interactive AI Canvas */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Top Prompt Selection Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {isFr ? 'Exemples de Questions d\'Examen :' : 'Try Sample Exam Queries:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPrompt(item)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activePrompt.id === item.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{isFr && item.labelFr ? item.labelFr : item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-4 min-h-[360px] flex flex-col justify-between">
              
              {/* Messages Area */}
              <div className="space-y-4">
                {/* User Bubble */}
                <div className="flex items-start justify-end gap-3">
                  <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none text-xs font-medium max-w-[85%] shadow-md">
                    {userMsg}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {isFr ? 'Vous' : 'You'}
                  </div>
                </div>

                {/* AI Bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Sparkles size={16} />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-slate-200 p-5 rounded-2xl rounded-tl-none text-xs font-mono leading-relaxed max-w-[90%] shadow-lg">
                    {isGenerating ? (
                      <div className="flex items-center gap-2 text-indigo-400 py-4">
                        <RefreshCw size={16} className="animate-spin" />
                        <span>{isFr ? 'Edulpha IA élabore la solution étape par étape...' : 'Edulpha AI is formulating step-by-step solution...'}</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{aiResp}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Chat Input Bar */}
              <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={isFr ? 'Saisissez votre question ou sujet d\'examen ici...' : 'Type your exam question or topic here...'}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500 outline-none cursor-pointer min-w-[200px]"
                  onClick={() => navigate('/auth')}
                />
                <button
                  onClick={() => navigate('/edulpha-ai')}
                  className="px-4 py-3 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 rounded-xl text-xs font-bold transition shrink-0"
                >
                  {isFr ? 'En savoir plus' : 'Learn More AI'}
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
