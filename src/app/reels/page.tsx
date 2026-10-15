'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { VisitModal } from '@/components/ui/VisitModal';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Calendar,
  MessageSquare,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

export default function ReelsFeedPage() {
  const [propertiesWithReels, setPropertiesWithReels] = useState<PropertyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<PropertyItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const list = nilvoraStore.getState().properties.filter((p) => p.reels && p.reels.length > 0);
    setPropertiesWithReels(list);

    const unsubscribe = nilvoraStore.subscribe(() => {
      const updated = nilvoraStore.getState().properties.filter((p) => p.reels && p.reels.length > 0);
      setPropertiesWithReels(updated);
    });
    return () => unsubscribe();
  }, []);

  const currentProperty = propertiesWithReels[currentIndex];
  const currentReel = currentProperty?.reels[0];

  const handleNext = () => {
    if (currentIndex < propertiesWithReels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleToggleSave = () => {
    if (!currentProperty) return;
    nilvoraStore.toggleSaveProperty(currentProperty.id);
    setIsSaved(!isSaved);
  };

  if (!currentProperty || !currentReel) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
        <p className="text-lg font-bold text-white">No Property Reels Active</p>
        <Link
          href="/reels/studio"
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Create First Property Reel in Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center py-4 px-2 overflow-hidden">
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Reels Feed</span>
          <span className="text-slate-400">• {currentIndex + 1} of {propertiesWithReels.length}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <Link
          href="/reels/studio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-emerald-400 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Seller Studio</span>
        </Link>
      </div>

      {/* Vertical Video Phone Frame Container */}
      <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          key={currentReel.url}
          src={currentReel.url}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        />

        {/* Play/Pause Overlay indicator when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-10"
          >
            <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Gradients for readability */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none z-10" />

        {/* Top Video Header Overlay */}
        <div className="relative z-20 p-4 flex items-center justify-between">
          <TrustBadge score={currentProperty.trustScore} scope={currentProperty.trustScope} />
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-slate-900/70 text-white backdrop-blur-md hover:bg-slate-800 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Side Vertical Action Bar */}
        <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
          <button
            onClick={handleToggleSave}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center group-hover:scale-110 transition">
              <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            </div>
            <span className="text-[10px] font-semibold">Save</span>
          </button>

          <button
            onClick={() => setSelectedVisitProperty(currentProperty)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center group-hover:scale-110 transition shadow-lg shadow-emerald-500/25">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-400">Visit</span>
          </button>

          <Link
            href={`/property/${currentProperty.id}`}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center group-hover:scale-110 transition">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold">Details</span>
          </Link>
        </div>

        {/* Bottom Property Information Card Overlay */}
        <div className="relative z-20 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {currentProperty.price >= 10000000
                ? `₹${(currentProperty.price / 10000000).toFixed(2)} Cr`
                : `₹${(currentProperty.price / 100000).toFixed(1)} Lakhs`}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase border border-emerald-500/30">
              {currentProperty.listingType}
            </span>
          </div>

          <h3 className="font-bold text-white text-base line-clamp-1 leading-snug">
            {currentProperty.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{currentProperty.locality}, Chennai • {currentProperty.areaSqft} sq.ft</span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {currentReel.caption || currentProperty.description}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setSelectedVisitProperty(currentProperty)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs text-center shadow-lg hover:from-emerald-400 hover:to-teal-400 transition"
            >
              Book Site Visit
            </button>
            <Link
              href={`/property/${currentProperty.id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-800 transition"
            >
              Contact Broker
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Next/Previous Navigation Buttons */}
      <div className="hidden md:flex flex-col gap-3 ml-4 z-20">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-slate-900 border border-slate-700 text-white disabled:opacity-30 hover:bg-slate-800 transition"
          title="Previous Reel"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === propertiesWithReels.length - 1}
          className="p-3 rounded-full bg-slate-900 border border-slate-700 text-white disabled:opacity-30 hover:bg-slate-800 transition"
          title="Next Reel"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Visit Modal */}
      <VisitModal
        property={selectedVisitProperty}
        onClose={() => setSelectedVisitProperty(null)}
      />
    </div>
  );
}
