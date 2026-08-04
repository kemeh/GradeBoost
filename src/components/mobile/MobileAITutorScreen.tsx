import React, { useState } from 'react';
import {
  Bot,
  Send,
  Mic,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Globe,
  HelpCircle,
  Brain,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  latex?: string;
  code?: string;
  timestamp: string;
}

interface MobileAITutorScreenProps {
  simLang: 'en' | 'fr';
  isDarkMode: boolean;
}

export const MobileAITutorScreen: React.FC<MobileAITutorScreenProps> = ({
  simLang,
  isDarkMode,
}) => {
  const isEn = simLang === 'en';
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: isEn 
        ? 'Hello Hilary! I am your Edulpha AI Tutor. Ask me any GCE (Ordinary & Advanced Level) or BEPC/Baccalauréat question in Math, Physics, or Chemistry.'
        : 'Bonjour Hilary! Je suis ton Tuteur IA Edulpha. Pose-moi toute question sur le programme du GCE ou du BAC en Mathématiques, Physique et Chimie.',
      timestamp: '10:14 AM'
    },
    {
      id: 'm-2',
      sender: 'user',
      text: isEn
        ? 'How do I solve integration of x * e^x dx in GCE Pure Math Paper 3?'
        : 'Comment résoudre l\'intégration de x * e^x dx dans le programme Terminale C?',
      timestamp: '10:15 AM'
    },
    {
      id: 'm-3',
      sender: 'ai',
      text: isEn
        ? 'Great GCE Pure Math P3 question! We use Integration by Parts formula: \\int u \\, dv = u v - \\int v \\, du.\n\nLet u = x (so du = dx) and dv = e^x dx (so v = e^x).\n\nPlugging into the formula:\n\\int x e^x dx = x e^x - \\int e^x dx = x e^x - e^x + C = e^x (x - 1) + C.'
        : 'Excellente question de Terminale C! On utilise la formule d\'intégration par parties: \\int u \\, dv = u v - \\int v \\, du.\n\nPosons u = x (donc du = dx) et dv = e^x dx (donc v = e^x).\n\nEn appliquant la formule:\n\\int x e^x dx = x e^x - \\int e^x dx = x e^x - e^x + C = e^x (x - 1) + C.',
      latex: '\\int x e^x \\, dx = e^x (x - 1) + C',
      code: 'IntegrationByPartsResult: e^x * (x - 1) + Constant_C',
      timestamp: '10:15 AM'
    }
  ]);

  const promptChips = isEn
    ? [
        '📐 Solve 2x² + 5x - 3 = 0 step-by-step',
        '⚡ Explain Faraday\'s Law of Electromagnetism',
        '🧪 How to name organic alkanes IUPAC',
        '📝 Give me a GCE Physics Paper 2 sample problem'
      ]
    : [
        '📐 Résoudre 2x² + 5x - 3 = 0 étape par étape',
        '⚡ Expliquer les lois de Faraday en Physique',
        '🧪 Nomenclature IUPAC des alcanes',
        '📝 Donner un exercice type Baccalauréat'
      ];

  const handleSend = (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: isEn
          ? `Here is the Edulpha AI solution for "${text}":\n\n1. Identify given variables and formulas.\n2. Apply Cameroon GCE marking scheme standards.\n3. Final Answer Verified: Correct step-by-step breakdown provided!`
          : `Voici la solution IA Edulpha pour "${text}":\n\n1. Identifier les données et règles de calcul.\n2. Appliquer les critères d'évaluation MINESEC.\n3. Résultat validé étape par étape!`,
        latex: 'f(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied solution to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[520px] select-none">
      {/* Top Banner */}
      <div className="p-3 bg-gradient-to-r from-purple-900 via-indigo-900 to-[#0F2C59] text-white rounded-2xl shadow-sm space-y-1 mb-3 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-400 text-[#0F2C59] rounded-lg">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-white">Edulpha AI Tutor</h4>
              <p className="text-[9px] text-purple-200">
                {isEn ? 'Bilingual Academic AI Assistant' : 'Assistant IA Bilingue'}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      {/* Suggested Prompts Chips Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-[10px]">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.replace(/^[^\s]+\s/, ''))}
            className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-full font-semibold whitespace-nowrap hover:bg-purple-100 transition active:scale-95 shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium px-1">
                <span>{isUser ? 'You' : 'Edulpha AI'}</span>
                <span>• {m.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 shadow-xs ${
                  isUser
                    ? 'bg-[#0F2C59] text-white rounded-br-xs'
                    : isDarkMode
                    ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                    : 'bg-white border border-slate-100 text-slate-900 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                {/* Mathematical Equation Block */}
                {m.latex && (
                  <div className="p-2.5 bg-slate-950 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto border border-amber-400/20 flex items-center justify-between">
                    <span>{m.latex}</span>
                    <button
                      onClick={() => copyToClipboard(m.id, m.latex || '')}
                      className="p-1 hover:text-white transition"
                    >
                      {copiedId === m.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}

                {/* Code / Method Box */}
                {m.code && (
                  <div className="p-2 bg-slate-800/80 text-blue-300 rounded-lg font-mono text-[10px] border border-slate-700">
                    {m.code}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Animation */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold p-2">
            <Bot className="h-4 w-4 animate-bounce" />
            <span>Edulpha AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Quick Helper Actions */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Voice input feature initialized! (Future ready)')}
              className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <Mic className="h-3.5 w-3.5 text-rose-500" /> {isEn ? 'Voice Input' : 'Vocal'}
            </button>
            <button
              onClick={() => toast.success('Image OCR scanner initialized! (Future ready)')}
              className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> {isEn ? 'Upload Problem Photo' : 'Photo'}
            </button>
          </div>

          <button
            onClick={() => setMessages([])}
            className="hover:text-rose-500 transition flex items-center gap-0.5"
          >
            <RotateCcw className="h-3 w-3" /> {isEn ? 'Clear' : 'Effacer'}
          </button>
        </div>

        {/* Input Controls */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isEn ? 'Ask AI any math equation or physics problem...' : 'Posez une question de math ou physique...'}
            className={`flex-1 px-3.5 py-2.5 rounded-2xl text-xs border ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
            } focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs`}
          />

          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-[#0F2C59] hover:from-purple-700 hover:to-blue-900 text-white rounded-2xl font-bold transition shadow-md active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
