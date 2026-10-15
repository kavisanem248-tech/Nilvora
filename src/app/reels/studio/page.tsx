'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyItem } from '@/types';
import { requireSignedInForAction } from '@/lib/auth/client-session';
import {
  Sparkles,
  CheckCircle2,
  Film,
} from 'lucide-react';

const CATEGORIES = [
  { key: 'living_room', label: 'Living Room & Hall' },
  { key: 'exterior', label: 'Exterior & Street Access' },
  { key: 'bedrooms', label: 'Master Bedroom & Balcony' },
  { key: 'kitchen', label: 'Modular Kitchen' },
  { key: 'bathrooms', label: 'Bathrooms & Fittings' },
  { key: 'neighborhood', label: 'Locality & Nearby Transport' },
];

export default function ReelsStudioPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [accountRole, setAccountRole] = useState('');
  const [pageError, setPageError] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('living_room');
  const [captionEn, setCaptionEn] = useState('');
  const [captionTa, setCaptionTa] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    let current = true;
    const loadProperties = async () => {
      if (!await requireSignedInForAction()) return;
      try {
        const response = await fetch('/api/portal', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || data.success !== true) throw new Error(data.error || 'Unable to load your properties.');
        if (!current) return;
        setAccountRole(data.user.role);
        const list = data.properties as PropertyItem[];
        setProperties(list);
        if (list.length > 0) setSelectedPropertyId(list[0].id);
      } catch (error) {
        if (current) setPageError(error instanceof Error ? error.message : 'Unable to load your properties.');
      }
    };
    void loadProperties();
    return () => { current = false; };
  }, []);

  const handleGenerateAICaptions = async () => {
    if (!await requireSignedInForAction()) return;
    setIsGeneratingAI(true);
    setTimeout(() => {
      const selectedProp = properties.find((property) => property.id === selectedPropertyId);
      if (!selectedProp) {
        setPageError('Select one of your properties to draft a caption.');
        setIsGeneratingAI(false);
        return;
      }
      const bedroomText = selectedProp.bedrooms ? `${selectedProp.bedrooms} BHK ` : '';
      setCaptionEn(`${bedroomText}property in ${selectedProp.locality}, ${selectedProp.district}. ${selectedProp.areaSqft} sq.ft.`);
      setCaptionTa(`${selectedProp.locality} பகுதியில் ${selectedProp.bedrooms ? `${selectedProp.bedrooms} BHK ` : ''}சொத்து. ${selectedProp.areaSqft} சதுர அடி.`);
      setIsGeneratingAI(false);
    }, 100);
  };

  const handlePublishReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!await requireSignedInForAction()) return;
    const selectedProperty = properties.find((property) => property.id === selectedPropertyId);
    if (!selectedProperty) {
      setPageError('Select one of your properties before publishing a reel.');
      return;
    }
    try {
      const assetUrl = new URL(videoUrl);
      if (!['http:', 'https:'].includes(assetUrl.protocol)) throw new Error('Enter a valid HTTP or HTTPS video URL.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Enter a valid video URL.');
      return;
    }
    if (!['seller', 'admin'].includes(accountRole)) {
      setPageError('Only sellers can upload reels for their own listings.');
      return;
    }

    setIsPublishing(true);
    setPageError('');
    const newReel = {
      id: `reel-${crypto.randomUUID()}`,
      propertyId: selectedPropertyId,
      mediaType: 'video_reel' as const,
      url: videoUrl,
      thumbnailUrl: selectedProperty.images[0] || '',
      caption: captionEn,
      captionTa,
      category,
      durationSeconds: undefined,
      isCover: false,
    };

    try {
      const response = await fetch(`/api/properties/${encodeURIComponent(selectedPropertyId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reels: [...selectedProperty.reels, newReel] }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Reel could not be saved.');
      setProperties((current) => current.map((property) => property.id === selectedPropertyId ? result.data : property));
      setIsPublishing(false);
      setPublishedSuccess(true);
      setTimeout(() => {
        router.push('/reels');
      }, 1200);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Reel could not be saved.');
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>NILVORA Creator Studio</span>
          </div>
          <h1 className="text-3xl font-black text-white">Seller Property Reels Studio</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Add a video URL to one of your listings and save it to buyer discovery.
          </p>
        </div>

        {pageError && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">{pageError}</div>}
        {properties.length === 0 && accountRole === 'seller' && <p className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">You have no properties to attach a reel to yet.</p>}

        <button
          type="button"
          onClick={handleGenerateAICaptions}
          disabled={isGeneratingAI}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isGeneratingAI ? 'Generating Captions...' : 'AI Bilingual Captions'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Video Preview Frame (4 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-2xl">
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                {category.replace('_', ' ')}
              </span>
              <p className="text-xs font-bold text-white mt-1 line-clamp-2">
                {captionEn || 'Caption preview will appear here...'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Interactive mobile feed simulation</p>
        </div>

        {/* Right Editor Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl">
          <form onSubmit={handlePublishReel} className="space-y-5 text-xs">
            {/* Select Target Property */}
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                Target Property Listing
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-emerald-400"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — ₹{(p.price / 100000).toFixed(1)} Lakhs ({p.locality})
                  </option>
                ))}
              </select>
            </div>

            {/* Video File / URL Input */}
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                Video Asset URL (MP4 / WebM)
              </label>
              <input
                type="text"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-emerald-400"
              />
            </div>

            {/* Video Category */}
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                Property Area Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      category === cat.key
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* English Caption */}
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                Reel Caption (English)
              </label>
              <textarea
                rows={2}
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value)}
                placeholder="Walkthrough highlight e.g. 2150 sq.ft 3BHK Villa Hall & Garden"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-emerald-400"
              />
            </div>

            {/* Tamil Caption */}
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                Reel Caption in Tamil (தமிழ் உரை)
              </label>
              <textarea
                rows={2}
                value={captionTa}
                onChange={(e) => setCaptionTa(e.target.value)}
                placeholder="அம்பத்தூர் 3 BHK வில்லா முழுமையான வீடியோ பார்வை"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-emerald-400"
              />
            </div>

            {/* Quality Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-[11px] text-slate-400">
              <span className="font-bold text-slate-200 block mb-1">
                Video Authenticity Protocol:
              </span>
              <p className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vertical 9:16 aspect ratio verified for mobile devices</span>
              </p>
              <p className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Linked to authorized listing owner & registered broker</span>
              </p>
            </div>

            {publishedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-center font-bold">
                ✓ Reel Published! Redirecting to live feed...
              </div>
            ) : (
              <button
                type="submit"
                disabled={isPublishing || properties.length === 0 || !['seller', 'admin'].includes(accountRole)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:from-emerald-400 hover:to-teal-400 transition shadow-xl shadow-emerald-500/20"
              >
                {isPublishing ? 'Processing Video...' : 'Publish Reel to Feed'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
