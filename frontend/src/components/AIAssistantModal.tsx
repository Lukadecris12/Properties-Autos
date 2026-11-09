'use client';

import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, User, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  suggestedActions?: string[];
  disclaimer?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am Properties & Autos AI. I can help you find compatible properties or automobiles, explain title documents (like C of O or Governor's Consent), assist with rental bookings, or help you formulate requirements.",
      suggestedActions: [
        "Explain C of O vs Governor's Consent",
        "Find Short-let Apartments in Lagos",
        "How does AI Matching work?",
        "Car rental pricing guidance"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAI(query);
      const aiData = res.data;
      const aiMsg: Message = {
        sender: 'ai',
        text: aiData.answer || 'Thank you for your inquiry. How else can I assist you?',
        suggestedActions: aiData.suggested_actions,
        disclaimer: aiData.disclaimer,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I am currently having trouble contacting the AI intelligence layer. Please try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl h-[620px] rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Properties & Autos AI
                <span className="text-[10px] bg-brand-950 text-brand-300 border border-brand-500/40 px-2 py-0.5 rounded-full font-medium">
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Marketplace Intelligence & Assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI Assistant"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-brand-950 border border-brand-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-brand-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-gray-800/90 text-gray-200 border border-gray-700/60'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Suggested Follow-up Actions */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/60 flex flex-wrap gap-1.5">
                    {m.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(action)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-900/80 hover:bg-brand-950 text-brand-300 border border-brand-500/30 transition-all flex items-center gap-1"
                      >
                        <span>{action}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Legal / Informational Disclaimer */}
                {m.disclaimer && (
                  <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-gold-400 shrink-0" />
                    <span>{m.disclaimer}</span>
                  </div>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-brand-950 border border-brand-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-400" />
              </div>
              <div className="p-3 rounded-2xl bg-gray-800 text-xs text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                Thinking & analyzing marketplace records...
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about titles, rental pricing, vehicle rentals, or search..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-all shadow-md shadow-brand-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
