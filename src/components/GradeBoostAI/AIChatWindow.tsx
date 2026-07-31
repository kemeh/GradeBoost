import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  PlusCircle, 
  MessageSquare, 
  History, 
  RefreshCw, 
  GraduationCap,
  ChevronRight,
  Code,
  FileText
} from 'lucide-react';
import { AIConversation, AIMessage } from '../../types';
import { 
  fetchUserConversations, 
  createConversation, 
  fetchMessages, 
  sendAIMessage 
} from '../../services/aiService';

interface AIChatWindowProps {
  userId: string;
  defaultSubject?: string;
  educationLevel?: string;
  onSelectAction?: (action: string) => void;
}

const SAMPLE_PROMPTS = [
  { text: "Explain Binary Search with pseudocode and exam tips", subject: "Computer Science", icon: Code },
  { text: "What is Secondary Storage vs Primary Memory?", subject: "ICT", icon: BookOpen },
  { text: "Explain how Operating Systems handle Process Management", subject: "Computer Science", icon: Lightbulb },
  { text: "Explain the causes and effects of the French Revolution", subject: "History", icon: FileText },
  { text: "Explain Demand and Supply equilibrium with diagrams", subject: "Economics", icon: Sparkles },
  { text: "Explain Ohm's Law and solve a resistor network example", subject: "Physics", icon: Lightbulb },
];

export const AIChatWindow: React.FC<AIChatWindowProps> = ({ 
  userId, 
  defaultSubject = 'Computer Science', 
  educationLevel = 'Ordinary Level',
  onSelectAction
}) => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(defaultSubject);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversations
  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    const list = await fetchUserConversations(userId);
    setConversations(list);
    if (list.length > 0) {
      setCurrentConvId(list[0].id);
      loadMessages(list[0].id);
    } else {
      handleNewConversation();
    }
  };

  const loadMessages = async (convId: string) => {
    const msgs = await fetchMessages(convId);
    setMessages(msgs);
  };

  const handleNewConversation = async () => {
    setIsLoading(true);
    const newId = await createConversation(userId, selectedSubject, educationLevel, `Study Session - ${selectedSubject}`);
    setCurrentConvId(newId);
    setMessages([]);
    setIsLoading(false);
    loadConversations();
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputText;
    if (!queryText.trim() || isLoading) return;

    let activeConvId = currentConvId;
    if (!activeConvId) {
      activeConvId = await createConversation(userId, selectedSubject, educationLevel, queryText.slice(0, 30));
      setCurrentConvId(activeConvId);
    }

    setInputText('');
    setIsLoading(true);

    // Optimistic user message addition
    const tempUserMsg: AIMessage = {
      id: 'temp-' + Date.now(),
      conversationId: activeConvId,
      userId,
      sender: 'user',
      text: queryText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const { aiMessage } = await sendAIMessage(
        activeConvId,
        userId,
        queryText,
        selectedSubject,
        'General',
        educationLevel,
        messages
      );

      setMessages(prev => [...prev.filter(m => !m.id.startsWith('temp-')), tempUserMsg, aiMessage]);
    } catch (err) {
      console.error("Send AI message error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[750px]">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-800 text-white p-4 px-6 flex items-center justify-between border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-200 flex items-center justify-center">
            <Sparkles size={22} className="text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-white">Edulpha AI Tutor</h2>
              <span className="bg-indigo-500/30 text-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-medium border border-indigo-400/20">
                24/7 GCE Assistant
              </span>
            </div>
            <p className="text-xs text-indigo-200/80">
              Ordinary & Advanced Level • Step-by-Step Concepts, Tips & Marking Schemes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Selector */}
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-indigo-900/80 text-white text-xs rounded-xl px-3 py-1.5 border border-indigo-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="ICT">ICT</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Economics">Economics</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
            <option value="French">French</option>
          </select>

          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${showHistory ? 'bg-indigo-700 text-white' : 'bg-indigo-800/60 text-indigo-200 hover:bg-indigo-800'}`}
            title="Conversation History"
          >
            <History size={16} />
            <span className="hidden sm:inline">Sessions</span>
          </button>

          <button 
            onClick={handleNewConversation}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs flex items-center gap-1.5 font-medium transition-all shadow-sm"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar History Drawer */}
        {showHistory && (
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-3 flex flex-col gap-2 z-10 overflow-y-auto">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Saved Sessions</h3>
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">No previous conversations.</p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setCurrentConvId(conv.id);
                    loadMessages(conv.id);
                    setShowHistory(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${conv.id === currentConvId ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <MessageSquare size={14} className="shrink-0 text-slate-400" />
                  <span className="truncate flex-1">{conv.title}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Chat Messages Window */}
        <div className="flex-1 flex flex-col bg-slate-50/50 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="my-auto max-w-2xl mx-auto text-center space-y-6 py-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
                <Bot size={36} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">What would you like to master today?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ask Edulpha AI to explain any concept, generate exam tips, or break down difficult past questions for <strong>{selectedSubject}</strong>.
                </p>
              </div>

              {/* Quick Action Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {SAMPLE_PROMPTS.filter(p => p.subject === selectedSubject || selectedSubject === 'Computer Science').slice(0, 4).map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt.text)}
                      className="p-3.5 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-xl text-left transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">{prompt.subject}</span>
                        <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-900 line-clamp-2">{prompt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Functional Quick Action Pills */}
              {onSelectAction && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="text-xs text-slate-400 font-medium mr-1">Or launch tool:</span>
                  <button 
                    onClick={() => onSelectAction('quiz')}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs rounded-full flex items-center gap-1.5 shadow-2xs hover:text-indigo-600 transition-colors"
                  >
                    <BookOpen size={14} /> AI Quiz Generator
                  </button>
                  <button 
                    onClick={() => onSelectAction('planner')}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs rounded-full flex items-center gap-1.5 shadow-2xs hover:text-indigo-600 transition-colors"
                  >
                    <GraduationCap size={14} /> AI Revision Planner
                  </button>
                  <button 
                    onClick={() => onSelectAction('summarizer')}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs rounded-full flex items-center gap-1.5 shadow-2xs hover:text-indigo-600 transition-colors"
                  >
                    <FileText size={14} /> AI Lesson Summarizer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-amber-400'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
              }`}>
                {msg.sender === 'ai' ? (
                  <div className="space-y-3">
                    <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-line">
                      {msg.text}
                    </div>

                    {msg.source === 'fallback' && (
                      <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg p-2 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>Generated using Edulpha offline study guidelines.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>{msg.text}</div>
                )}

                <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 text-sm text-slate-500 flex items-center gap-2 shadow-xs">
                <RefreshCw size={16} className="animate-spin text-indigo-600" />
                <span>Edulpha AI is analyzing syllabus concept & generating explanation...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask Edulpha AI anything about ${selectedSubject}... (e.g. Explain Binary Search)`}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm shrink-0"
            >
              <span>Send</span>
              <Send size={16} />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Subject: <strong className="text-slate-600">{selectedSubject}</strong></span>
            <span>Edulpha AI • GCE Study Assistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
