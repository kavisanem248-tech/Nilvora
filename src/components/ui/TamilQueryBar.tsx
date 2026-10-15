'use client';

import React, { useState } from 'react';
import { parseNaturalLanguageQuery, ParsedSearchFilters } from '@/lib/ai/tamil-query-parser';
import { Sparkles, Search, ArrowRight } from 'lucide-react';

interface TamilQueryBarProps {
  onSearch: (filters: ParsedSearchFilters) => void;
  initialQuery?: string;
}

const SAMPLE_QUERIES = [
  'Ambattur-la 50 lakh-kulla 2BHK venum',
  'Mogappair CMDA approved plots',
  'Anna Nagar 3 BHK luxury flat for sale',
  'Korattur lake view individual house',
];

export const TamilQueryBar: React.FC<TamilQueryBarProps> = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [parsedPreview, setParsedPreview] = useState<ParsedSearchFilters | null>(null);

  const handleInputChange = (text: string) => {
    setQuery(text);
    if (text.trim().length > 3) {
      const parsed = parseNaturalLanguageQuery(text);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    const parsed = parseNaturalLanguageQuery(query);
    onSearch(parsed);
  };

  const handleChipClick = (q: string) => {
    setQuery(q);
    const parsed = parseNaturalLanguageQuery(q);
    setParsedPreview(parsed);
    onSearch(parsed);
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleExecute} className="relative flex items-center">
        <div className="absolute left-4 text-emerald-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Ask in English or Tanglish (e.g. 'Ambattur-la 50 lakh-kulla 2BHK venum')..."
          className="w-full bg-slate-900/95 border-2 border-slate-700 hover:border-emerald-500/50 focus:border-emerald-400 rounded-2xl py-3.5 pl-12 pr-28 text-white placeholder:text-slate-500 text-sm md:text-base focus:outline-none transition shadow-2xl backdrop-blur-md"
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs md:text-sm flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Real-time query interpretation explanation */}
      {parsedPreview && (
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] uppercase font-bold text-emerald-400">
              {parsedPreview.detectedLanguage} Query
            </span>
            <span>{parsedPreview.explanation}</span>
          </div>
          <span className="text-slate-400 text-[11px] hidden sm:inline">Press Enter to Apply</span>
        </div>
      )}

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
          Try Natural:
        </span>
        {SAMPLE_QUERIES.map((sq, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleChipClick(sq)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700/60 transition"
          >
            {sq}
          </button>
        ))}
      </div>
    </div>
  );
};
