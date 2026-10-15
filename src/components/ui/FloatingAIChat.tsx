'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { parseNaturalLanguageQuery } from '@/lib/ai/tamil-query-parser';
import { ArrowRight, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matches?: PropertyItem[];
}

interface AIStatus {
  model: string;
  configured: boolean;
}

export const FloatingAIChat: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Vanakkam! Tell me your property needs in Tamil, Tanglish, or English. For example: “Ambattur-la 50 lakh-kulla 2BHK venum”.',
    },
  ]);

  useEffect(() => {
    const syncProperties = () => setProperties(nilvoraStore.getState().properties);
    syncProperties();
    const unsubscribe = nilvoraStore.subscribe(syncProperties);

    fetch('/api/ai-assistant')
      .then((response) => response.json())
      .then((status: AIStatus) => setAiStatus(status))
      .catch(() => setAiStatus({ model: 'gemini-3.8-flash', configured: false }));

    return () => unsubscribe();
  }, []);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { id: `user-${Date.now()}`, sender: 'user', text: query },
    ]);
    setInput('');
    setIsLoading(true);

    const parsed = parseNaturalLanguageQuery(query);
    const matches = properties.filter((property) => {
      if (parsed.locality && !property.locality.toLowerCase().includes(parsed.locality.toLowerCase())) return false;
      if (parsed.listingType && property.listingType !== parsed.listingType) return false;
      if (parsed.propertyType && property.propertyType !== parsed.propertyType) return false;
      if (parsed.bedrooms && property.bedrooms !== parsed.bedrooms) return false;
      if (parsed.maxPrice && property.price > parsed.maxPrice) return false;
      return true;
    });

    const matchSummary = matches.length
      ? `I found ${Math.min(matches.length, 2)} matching local listing(s).`
      : 'No exact local listing match found. Try a locality, property type, BHK, rent/buy, or budget.';
    let answer = `Local search: ${parsed.explanation}. ${matchSummary}`;

    if (aiStatus?.configured) {
      try {
        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const result = await response.json();
        if (response.ok && typeof result.answer === 'string') {
          answer = `${result.answer} ${matchSummary}`;
        } else if (typeof result.error === 'string') {
          answer = `${result.error} ${answer}`;
        }
      } catch {
        answer = `The AI service is unavailable. ${answer}`;
      }
    } else {
      answer = `Gemini is not connected yet; I used local search. ${answer}`;
    }

    setMessages((previous) => [
      ...previous,
      {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        matches: matches.slice(0, 2),
      },
    ]);
    setIsLoading(false);
  };

  if (pathname === '/ai-assistant') return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section className="surface-3d flex h-[min(34rem,calc(100dvh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden">
          <header className="flex items-start justify-between gap-3 border-b border-black/10 bg-[#e9eaec] p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                <Image
                  src="/nilvora-mark.png"
                  alt=""
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-black">NILVORA AI Assistant</h2>
                <p className="text-[11px] text-black/60">Tamil · Tanglish · English</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-black/10 bg-white p-1.5 text-black shadow-sm"
              aria-label="Close AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7f7f6] p-3" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`max-w-[90%] space-y-2 rounded-xl border p-3 text-xs leading-relaxed ${message.sender === 'user' ? 'ml-auto border-black/10 bg-[#eeeeed] text-black' : 'border-black/10 bg-white text-black shadow-sm'}`}>
                <p>{message.text}</p>
                {message.matches?.map((property) => (
                  <Link
                    key={property.id}
                    href={`/property/${property.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-white p-2 text-[11px] font-semibold text-black shadow-sm"
                  >
                    <span className="min-w-0 truncate">{property.title} · ₹{(property.price / 100000).toFixed(1)}L</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            ))}
            {isLoading && <p className="px-2 text-xs text-black/60">Finding property matches…</p>}
          </div>

          <Link href="/ai-assistant" className="border-t border-black/10 px-4 py-2 text-[11px] font-semibold text-black/65 underline underline-offset-2">
            {aiStatus?.configured ? 'AI setup and status' : 'Set up Gemini AI'}
          </Link>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-black/10 bg-white p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={600}
              placeholder="Tell me what you need…"
              aria-label="Describe your property needs"
              className="form-control-3d min-w-0 flex-1 rounded-xl px-3 py-2.5 text-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-xl border border-black/10 bg-white p-2.5 text-black shadow-[0_2px_0_#d8d8d8,0_6px_12px_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white text-black shadow-[0_4px_0_#d8d8d8,0_12px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-1"
        aria-label={isOpen ? 'Close NILVORA AI chat' : 'Open NILVORA AI chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-black/10 bg-white">
            <Image
              src="/nilvora-mark.png"
              alt=""
              fill
              sizes="40px"
              className="object-contain"
            />
          </span>
        )}
      </button>
    </div>
  );
};
