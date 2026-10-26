import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  User,
  Loader2,
  ChevronDown,
  Info,
} from 'lucide-react';
import { api } from '../../services/api.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract analysisId if user is on /analysis/:id or has query param
  const analysisMatch = location.pathname.match(/\/analysis\/([a-zA-Z0-9_-]+)/);
  const analysisId = analysisMatch ? analysisMatch[1] : searchParams.get('analysisId') || null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your **TrustLens AI Assistant**. I can explain risk indicators, summarize fact-check evidence, and assist with verification methodology in English, Telugu, or Hindi. How can I help your investigation?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextLoaded, setContextLoaded] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If on an analysis page, automatically load context
  useEffect(() => {
    async function checkAnalysisContext() {
      if (analysisId && analysisId !== contextLoaded) {
        try {
          const res = await api.getAnalysisById(analysisId);
          if (res?.analysis) {
            setContextLoaded(analysisId);
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: `Active Investigation Context Loaded:\n**"${res.analysis.original_input}"**\n\nOverall Risk: **${res.analysis.risk_level.replace('_', ' ').toUpperCase()}** (${res.analysis.risk_score}/100).\n\nAsk me anything about these findings, linguistic indicators, or source citations!`,
              },
            ]);
          }
        } catch {
          // Ignore
        }
      }
    }

    if (isOpen) {
      checkAnalysisContext();
    }
  }, [analysisId, isOpen, contextLoaded]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant({
        message: textToSend.trim(),
        analysisId: analysisId || undefined,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply || 'Analysis completed.',
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to process request: ${err.message}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Conversation reset. You can ask a new question about claim verification, linguistic signals, or media forensics.',
      },
    ]);
  };

  const samplePrompts = [
    'How do I detect manufactured urgency?',
    'What does "attribution gap" mean?',
    'Explain the ISRO landing verification',
    'ఈ క్లెయిమ్ ఎలా ధృవీకరించాలి?',
  ];

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#0B1220] dark:bg-[#14B8A6] text-white hover:bg-slate-900 dark:hover:bg-[#0D9488] rounded-full shadow-2xl border border-[#14B8A6]/40 transition-all transform hover:scale-105 active:scale-95 group"
          aria-label="Open TrustLens AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#14B8A6] dark:text-[#0B1220]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#14B8A6] animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[85vh] bg-white dark:bg-[#0B1220] rounded-3xl shadow-2xl border border-[#E2E8F0] dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-[#E2E8F0] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#14B8A6] text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>TrustLens AI Assistant</span>
                </h3>
                <p className="text-[10px] text-slate-400">Multilingual Fact Verification</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-[#14B8A6]/20 text-[#14B8A6] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#14B8A6] text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {m.content}
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-8">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#14B8A6]" />
                <span>Consulting verification heuristics & sources...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sample prompt pills */}
          <div className="px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-[#0B1220] border-t border-[#E2E8F0] dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about claims, sources, or evidence..."
              className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-[#14B8A6]/50 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 text-white rounded-xl transition-colors"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
