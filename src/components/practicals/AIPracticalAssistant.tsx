import React, { useState } from 'react';
import { 
  Bot, Send, Sparkles, Code2, FlaskConical, X, MessageSquare, 
  HelpCircle, RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PracticalActivity } from '../../types';

interface AIPracticalAssistantProps {
  practical: PracticalActivity;
  initialPrompt?: string;
  onClose?: () => void;
}

export const AIPracticalAssistant: React.FC<AIPracticalAssistantProps> = ({
  practical,
  initialPrompt,
  onClose
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your Edulpha Practical AI Assistant for **${practical.title}**. Ask me questions about debugging your code, understanding experiment steps, or explaining scientific formulas. I provide guidance without giving direct exam answers!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>(initialPrompt || '');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: textToSend, time: timeStr };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Call Gemini API server-side or via @google/genai
      const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
      let aiText = '';

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are the Edulpha Socratic AI Practical Assistant for the course: "${practical.title}" (${practical.subject}, ${practical.level}).
User prompt: "${textToSend}".
Instructions: Provide clear, encouraging, Socratic scientific explanation or debugging advice. Guide the student to understand the underlying logic rather than giving away full answers.`
        });
        aiText = response.text || 'I analyzed your query. Let us review the key principles step-by-step.';
      } else {
        // High quality educational fallback response
        aiText = `Let's break down your question for **${practical.title}**:

1. **Key Concept**: Verify the initial setup parameters and make sure all units match the formula specifications.
2. **Debugging / Analysis**: Check for missing boundary conditions or syntax errors in logic blocks.
3. **Next Step**: Try running a single test case with known input values to verify step-by-step execution.`;
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.warn('AI Assistant error:', err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'I encountered a temporary connection issue. Please check your network and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              Edulpha AI Lab Tutor
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                Socratic AI
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{practical.title}</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40 text-xs font-sans">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">
                {m.time}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-purple-400 border border-slate-700/60 p-3 rounded-xl text-xs flex items-center space-x-2 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing practical logic with Gemini AI...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex gap-2 overflow-x-auto text-[10px]">
        {[
          'Help debug my code',
          'Explain this error',
          'What is the formula?',
          'Check my observations'
        ].map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full whitespace-nowrap border border-slate-700"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI for lab guidance..."
          className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
