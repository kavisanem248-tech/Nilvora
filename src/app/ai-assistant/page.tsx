'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { parseNaturalLanguageQuery } from '@/lib/ai/tamil-query-parser';
import {
  Sparkles,
  Send,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  User,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matchedProperties?: PropertyItem[];
  tradeoffs?: string[];
}

interface AIStatus {
  provider: string;
  model: string;
  configured: boolean;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Vanakkam! I am NILVORA’s AI Property Matchmaker for Ambattur and Chennai. Tell me what you are looking for in Tamil, Tanglish, or English — for example: "Ambattur-la 50 lakh-kulla 2BHK venum" or "Mogappair 1800 sqft CMDA plot".',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [setupCopied, setSetupCopied] = useState(false);

  useEffect(() => {
    setProperties(nilvoraStore.getState().properties);
    fetch('/api/ai-assistant')
      .then((response) => response.json())
      .then((status: AIStatus) => setAiStatus(status))
      .catch(() => setAiStatus({ provider: 'Google Gemini', model: 'gemini-3.8-flash', configured: false }));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const parsed = parseNaturalLanguageQuery(userText);
    const exactMatches = properties.filter((property) => {
      if (parsed.locality && !property.locality.toLowerCase().includes(parsed.locality.toLowerCase())) {
        return false;
      }
      if (parsed.listingType && property.listingType !== parsed.listingType) return false;
      if (parsed.propertyType && property.propertyType !== parsed.propertyType) return false;
      if (parsed.bedrooms && property.bedrooms !== parsed.bedrooms) return false;
      if (parsed.maxPrice && property.price > parsed.maxPrice) return false;
      return true;
    });
    const matches = exactMatches;
    const matchSummary = exactMatches.length > 0
      ? `I found ${Math.min(exactMatches.length, 2)} local listing match(es).`
      : 'I could not find an exact match in the local listings. Try a locality, property type, BHK, rent/buy, or budget.';

    let assistantText = `Local search: ${parsed.explanation}. ${matchSummary}`;
    if (aiStatus?.configured) {
      try {
        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userText }),
        });
        const result = await response.json();
        if (response.ok && typeof result.answer === 'string') {
          assistantText = `${result.answer} ${matchSummary}`;
        } else if (typeof result.error === 'string') {
          assistantText = `${result.error} ${assistantText}`;
        }
      } catch {
        assistantText = `The AI service is unavailable right now. ${assistantText}`;
      }
    } else {
      assistantText = `Gemini is not connected yet, so I used local search. ${assistantText}`;
    }

    const responseMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      text: assistantText,
      matchedProperties: matches.slice(0, 2),
      tradeoffs: [
        'Prices are asking prices; the final negotiated amount may differ.',
        'Independently verify title, Patta, and EC records with a qualified advocate before purchase.',
      ],
    };

    setMessages((prev) => [...prev, responseMsg]);
    setIsTyping(false);
  };

  const copySetupTemplate = async () => {
    try {
      await navigator.clipboard.writeText(
        'AI_PROVIDER=gemini\nGEMINI_API_KEY=\nAI_MODEL_NAME=gemini-3.8-flash'
      );
      setSetupCopied(true);
      window.setTimeout(() => setSetupCopied(false), 2000);
    } catch {
      setSetupCopied(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grounded Real-Estate Matchmaker</span>
        </div>
        <h1 className="heading-box-3d text-3xl font-black">AI Property Assistant & Matchmaker</h1>
        <p className="text-xs text-black/70 sm:text-sm">
          Find exact matches in Ambattur, Mogappair, and West Chennai. Our AI explains trade-offs honestly without inventing inventory.
        </p>
      </div>

      <section className="surface-3d space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-black/60">
              <ShieldCheck className="h-4 w-4" />
              <span>Recommended AI setup</span>
            </div>
            <h2 className="text-lg font-bold text-black">Google Gemini · {aiStatus?.model || 'gemini-3.8-flash'}</h2>
            <p className="max-w-2xl text-xs leading-relaxed text-black/70 sm:text-sm">
              Gemini 3.8 Flash is the current fast choice for Tamil, Tanglish, and English property queries. The API call runs on the server.
            </p>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm" role="status">
            <span className={`h-2 w-2 rounded-full ${aiStatus?.configured ? 'bg-black' : 'bg-[#bdbdbd]'}`} />
            {aiStatus === null ? 'Checking server setup' : aiStatus.configured ? 'API key connected' : 'API key not set'}
          </span>
        </div>

        <div className="rounded-lg border border-black/10 bg-[#f6f6f6] p-3 sm:p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-black">
            <KeyRound className="h-4 w-4" />
            Configure the key securely
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-black/70 sm:text-sm">
            Open <code className="rounded bg-white px-1.5 py-0.5 font-semibold text-black">.env.local</code> in the project root and paste the setup block there. Add your key after <code className="rounded bg-white px-1.5 py-0.5 font-semibold text-black">GEMINI_API_KEY=</code>, then restart the dev server. Never paste the secret into this page, browser code, or a <code className="font-semibold text-black">NEXT_PUBLIC_</code> variable.
          </p>
          <button
            type="button"
            onClick={copySetupTemplate}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black shadow-[0_2px_0_#d8d8d8,0_6px_12px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
          >
            {setupCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {setupCopied ? 'Setup block copied' : 'Copy setup block'}
          </button>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black shadow-[0_2px_0_#d8d8d8,0_6px_12px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
          >
            Create Gemini API key
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* Chat Window Container */}
      <div className="surface-3d flex min-h-[500px] flex-col justify-between space-y-4 p-4 sm:p-6">
        {/* Messages Stream */}
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#eeeeed] text-black rounded-tr-none'
                    : 'bg-white border border-black/10 text-black rounded-tl-none shadow-sm'
                }`}
              >
                <p>{msg.text}</p>

                {/* Grounded Property Cards inside Assistant bubble */}
                {msg.matchedProperties && msg.matchedProperties.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {msg.matchedProperties.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col justify-between space-y-2 rounded-xl border border-black/10 bg-white p-3 shadow-md"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-400">
                            {p.locality} • Trust {p.trustScore}/100
                          </span>
                          <h4 className="line-clamp-1 text-xs font-bold text-black">{p.title}</h4>
                          <p className="text-emerald-300 font-extrabold text-sm mt-0.5">
                            ₹{(p.price / 100000).toFixed(1)} Lakhs
                          </p>
                        </div>
                        <Link
                          href={`/property/${p.id}`}
                          className="w-full rounded-lg border border-black/10 bg-white py-1.5 text-center text-xs font-bold text-black shadow-sm transition hover:-translate-y-0.5"
                        >
                          View Property →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trade-offs & Limitations explanation */}
                {msg.tradeoffs && (
                  <div className="space-y-1 rounded-lg border border-black/10 bg-[#f6f6f6] p-2.5 text-[11px] text-black/70">
                    <strong className="text-amber-400 block">AI Trade-off Analysis:</strong>
                    {msg.tradeoffs.map((t, idx) => (
                      <p key={idx}>• {t}</p>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 pl-11">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Matching against available Chennai property listings...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="relative flex items-center pt-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your requirement in Tamil, Tanglish, or English (e.g. 'Ambattur 2BHK with car parking')..."
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3.5 pr-14 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="absolute right-2 p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition shadow-md"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
