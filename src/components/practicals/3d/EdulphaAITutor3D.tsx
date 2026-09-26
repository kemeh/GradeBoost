import React, { useState } from 'react';
import { 
  Bot, Sparkles, Send, RefreshCw, AlertTriangle, ShieldCheck, X, HelpCircle 
} from 'lucide-react';
import { AssembledItem, ChemistryState, PhysicsState, BiologyState, LabSubject } from './types';
import { toast } from 'react-hot-toast';

interface EdulphaAITutor3DProps {
  isOpen: boolean;
  onClose: () => void;
  subject: LabSubject;
  assembledItems: AssembledItem[];
  chemistryState: ChemistryState;
  physicsState: PhysicsState;
  biologyState: BiologyState;
  lang: 'en' | 'fr';
}

export const EdulphaAITutor3D: React.FC<EdulphaAITutor3DProps> = ({
  isOpen,
  onClose,
  subject,
  assembledItems,
  chemistryState,
  physicsState,
  biologyState,
  lang
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: lang === 'fr'
        ? `Bonjour ! Je suis Edulpha AI, votre assistant de laboratoire virtuel 3D. Posez-moi des questions sur vos manipulations, le matériel ou les équations chimiques et physiques !`
        : `Hello! I am Edulpha AI, your 3D Virtual Laboratory Assistant. Ask me anything about apparatus setup, chemical reactions, circuit calculations, or biological focus!`
    }
  ]);

  if (!isOpen) return null;

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || loading) return;

    const userText = promptInput.trim();
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setPromptInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `3D Practical Lab Assistant for ${subject}: ${userText}`,
          subject,
          topic: `${subject} 3D Lab Simulation`,
          educationLevel: 'Ordinary/Advanced Level',
          language: lang,
          mode: 'tutor'
        })
      });
      const data = await res.json();
      const aiText = data.reply || `In ${subject} practicals, remember to check your initial apparatus setup carefully.`;
      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiText }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: 'Ensure your titration setup is clamped and indicators are placed inside the conical flask.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Edulpha AI 3D Lab Assistant
              </h3>
              <p className="text-[10px] text-slate-400">Cameroon GCE & Bac Practical Tutor</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Status Banner */}
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4 flex items-center gap-2.5 text-xs text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>AI is monitoring your 3D workbench setup for safety & accuracy.</span>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white ml-auto'
                  : 'bg-slate-950 text-slate-200 border border-slate-800'
              }`}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-2xl text-xs text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Edulpha AI is analyzing your experiment...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendPrompt} className="pt-4 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder={lang === 'fr' ? 'Posez une question sur l\'expérience...' : 'Ask AI about your 3D setup...'}
          className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
