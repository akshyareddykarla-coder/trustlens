import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Info,
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  usedModel?: string;
}

export const AssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('analysisId');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your **TrustLens AI Assistant**. I can explain risk indicators, summarize available fact-checks, suggest verification steps, and answer questions about digital literacy in English, Telugu, or Hindi. How can I assist your investigation today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextClaim, setContextClaim] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadAnalysisContext() {
      if (analysisId) {
        try {
          const res = await api.getAnalysisById(analysisId);
          if (res?.analysis) {
            setContextClaim(res.analysis.original_input);
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: `I have loaded the context for this claim: **"${res.analysis.original_input}"**\n\nCalculated Risk: **${res.analysis.risk_level.replace('_', ' ').toUpperCase()}** (${res.analysis.risk_score}/100).\n\nYou can ask me why specific indicators were flagged, how the evidence compares, or what next steps to take.`,
              },
            ]);
          }
        } catch {
          // Ignore
        }
      }
    }

    loadAnalysisContext();
  }, [analysisId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q || !q.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: q.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant({
        message: q.trim(),
        analysisId: analysisId || undefined,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          usedModel: res.usedModel,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Apologies, I encountered an error: ${err.message}. Please try asking again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptChips = [
    'How do I spot WhatsApp rumors?',
    'Why is manufactured urgency a risk signal?',
    'What is the difference between primary and secondary sources?',
    'ఈ మెసేజ్ నిజమో కాదో ఎలా తెలుసుకోవాలి? (Telugu)',
    'सोशल मीडिया पर वायरल मैसेज की जांच कैसे करें? (Hindi)',
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Verification Assistant</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                Context-Aware
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Assisting media literacy and explainable indicator analysis
            </p>
          </div>
        </div>

        {contextClaim && (
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm truncate">
            Context: <strong className="text-slate-800 dark:text-slate-200">{contextClaim}</strong>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white dark:bg-slate-700'
                  : 'bg-teal-600 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
              }`}
            >
              {msg.content}

              {msg.usedModel && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Engine: {msg.usedModel}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-2xl">
            <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Analyzing indicators and formulating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 rounded-full text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors flex-shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this claim, linguistic indicators, or verification habits..."
          className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl text-xs font-semibold flex items-center justify-center transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
