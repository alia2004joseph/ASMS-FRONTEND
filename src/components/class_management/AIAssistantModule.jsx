import React, { useState } from "react";
import { Sparkles, Send, Bot, User, BookOpen, Lightbulb, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function AIAssistantModule() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: "m-1",
      sender: "model",
      text: "Hello! I am your University Class AI Assistant. How can I help you with your lectures, timetable, or notes today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Summarize the key equations in Engineering Mechanics II",
    "What is the next topic scheduled in Dynamics?",
    "Generate 3 sample revision questions for CAT 1",
    "Draft a class announcement about tomorrow's tutorial",
  ];

  const handleSend = async (customText) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt("");
    setLoading(true);

    setTimeout(() => {
      let reply = "Here is an overview based on your class syllabus and lecture notes. For further details, please review the uploaded materials in the Course Materials section.";
      if (textToSend.toLowerCase().includes("equation") || textToSend.toLowerCase().includes("mechanics")) {
        reply = "Key Dynamics Equations:\n1. Newton's 2nd Law = m*a\n2. Work-Energy Principle + U1-2 = T2\n3. Conservation of Linear Momentum: m*v1 = m*v2";
      } else if (textToSend.toLowerCase().includes("question") || textToSend.toLowerCase().includes("revision")) {
        reply = "Sample Revision Questions for CAT 1:\nQ1. Derive the velocity equation for curvilinear motion.\nQ2. A 15kg block slides down a 30° incline. Calculate its speed after 5m.\nQ3. State D'Alembert's principle and apply it to a rotating pulley system.";
      } else if (textToSend.toLowerCase().includes("announcement")) {
        reply = "Draft Class Notice:\n'Attention Class note that tomorrow's Engineering Mechanics tutorial will take place at 10:00 AM in LT-3. Please come with your tutorial question sheets printed.'";
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "model",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Gemini Flash Academic Helper
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Class AI Assistant</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Ask questions about syllabus topics, revision questions, or study schedules.
          </p>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:shadow-xs transition-all flex items-start gap-2 group"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[480px]">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-purple-600 text-white"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-xs"
                    : "bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-xs"
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === "user" ? "text-indigo-200" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 mr-auto">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700/80 text-slate-500 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-500" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl"
        >
          <input
            type="text"
            placeholder="Ask a question about your engineering subjects..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
