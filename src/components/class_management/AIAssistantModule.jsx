import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Sparkles,
  Bot,
  User as UserIcon,
  Send,
  Loader2,
  HelpCircle,
  BookOpen,
  Calendar,
  Users,
  Megaphone,
  CheckCircle2,
  RefreshCw,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface Message {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const AIAssistantModule: React.FC = () => {
  const { user, isClassRep, studentProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'model',
      text: `Hello **${user?.first_name || 'there'}**! I am your **ASMS Class Management AI Assistant** powered by Google Gemini 3.7. \n\nI have authorized, live access to your enrolled timetable, published materials, class announcements, study group allocations, and active attendance sessions. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await api.askAiAssistant({
        prompt: userMsg.text,
        conversation_history: history,
      });

      const modelMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'model',
        text: res.reply || 'I processed your request, but received an empty response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      console.error('AI Query failed:', err);
      const fallbackMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'model',
        text: 'I could not reach the university AI engine. Please verify that your system is connected.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Context-tailored prompt chips
  const studentPrompts = [
    'What classes do I have tomorrow?',
    'Summarize the latest announcements.',
    'What is my study group for Engineering Mathematics?',
    'What materials were recently uploaded?',
    'Is there any active attendance session right now?',
  ];

  const classRepPrompts = [
    'Draft an announcement: Tomorrow Engineering Mechanics class moved to 2 PM.',
    'Summarize common student concerns and feedback.',
    'Suggest a fair strategy for allocating project study groups.',
    'What are the attendance statistics for our class?',
  ];

  const lecturerPrompts = [
    'Summarize student feedback and grievances for this semester.',
    'Draft an announcement regarding next week mid-semester test.',
    'What is my teaching schedule for today?',
  ];

  const promptSuggestions =
    user?.role === 'LECTURER'
      ? lecturerPrompts
      : isClassRep
      ? classRepPrompts
      : studentPrompts;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Institutional AI Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Class Management AI Assistant</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Secure, permission-aware assistant powered by Google Gemini 3.7. Ask questions about your courses, timetable, announcements, materials, and study groups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            Gemini 3.7 Flash
          </Badge>
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Node
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                ASMS Academic Intelligence
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              </h3>
              <p className="text-[11px] text-slate-500">
                Persona: {user?.first_name} {user?.last_name} ({user?.role === 'STUDENT' && isClassRep ? 'Class Rep' : user?.role}) • Scoped to ME-Y3
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: `welcome-${Date.now()}`,
                  sender: 'model',
                  text: `Conversation restarted. How can I assist you with your class management today?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Chat</span>
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-xs max-w-none">
                    {msg.text}
                  </div>
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isUser ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-xs">
                    {user?.first_name?.[0] || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white text-slate-600 border border-slate-200 rounded-2xl rounded-bl-none p-4 text-xs flex items-center gap-2 shadow-xs">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Consulting ASMS academic registry & timetable...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Shelf */}
        <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Prompts:
          </span>
          {promptSuggestions.map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSend(promptText)}
              disabled={loading}
              className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 px-3 py-1.5 rounded-full shrink-0 transition-all text-left"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
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
              placeholder={`Ask about timetable, announcements, study groups, or materials...`}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            ASMS AI integrates strictly with university registry data. AI suggestions must be reviewed before institutional publication.
          </p>
        </div>
      </div>
    </div>
  );
};
