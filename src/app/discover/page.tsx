// Preserve the original marketplace landing page at /discover.
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PropertyItem, UserRole } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { TamilQueryBar } from '@/components/ui/TamilQueryBar';
import { VisitModal } from '@/components/ui/VisitModal';
import { ParsedSearchFilters } from '@/lib/ai/tamil-query-parser';
import {
  ShieldCheck,
  Video,
  FileCheck2,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Building,
  CheckCircle,
  TrendingUp,
  MapPin,
  Award,
  PhoneCall,
  Clock,
  Briefcase,
  Play,
  Bell,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';

const ROLE_OPTIONS: { key: UserRole; label: string; icon: string }[] = [
  { key: 'buyer', label: 'Buyer', icon: '🏡' },
  { key: 'seller', label: 'Seller', icon: '🔑' },
  { key: 'broker', label: 'Broker / Agent', icon: '💼' },
  { key: 'builder', label: 'Builder / Developer', icon: '🏗️' },
  { key: 'legal_pro', label: 'Legal Professional', icon: '⚖️' },
  { key: 'admin', label: 'Super Admin', icon: '🛡️' },
];

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<PropertyItem | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'plot' | 'commercial'>('buy');
  const [currentRole, setCurrentRole] = useState<UserRole>('buyer');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const state = nilvoraStore.getState();
    setProperties(state.properties);
    setCurrentRole(state.currentRole);
    setLang(state.preferredLanguage);

    const unsubscribe = nilvoraStore.subscribe(() => {
      const updatedState = nilvoraStore.getState();
      setProperties(updatedState.properties);
      setCurrentRole(updatedState.currentRole);
      setLang(updatedState.preferredLanguage);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    nilvoraStore.setRole(role);
    setRoleMenuOpen(false);
  };

  const toggleLanguage = () => {
    nilvoraStore.setLanguage(lang === 'en' ? 'ta' : 'en');
  };

  const activeRole = ROLE_OPTIONS.find((role) => role.key === currentRole) || ROLE_OPTIONS[0];

  const handleQuerySearch = (parsed: ParsedSearchFilters) => {
    const params = new URLSearchParams();
    if (parsed.locality) params.set('locality', parsed.locality);
    if (parsed.propertyType) params.set('type', parsed.propertyType);
    if (parsed.listingType) params.set('listing', parsed.listingType);
    if (parsed.bedrooms) params.set('bhk', parsed.bedrooms.toString());
    if (parsed.maxPrice) params.set('maxPrice', parsed.maxPrice.toString());
    router.push(`/buy?${params.toString()}`);
  };

  const filteredProperties = properties.filter((p) => {
    if (activeTab === 'buy') return p.listingType === 'sale';
    if (activeTab === 'rent') return p.listingType === 'rent';
    if (activeTab === 'plot') return p.propertyType === 'plot';
    if (activeTab === 'commercial') return p.propertyType === 'commercial';
    return true;
  });

  const heroProperty = properties[0];
  const heroImage = heroProperty?.images?.[0] || 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-[#e9eaec] border-b border-black/10">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(233,234,236,0.96) 0%, rgba(233,234,236,0.86) 48%, rgba(233,234,236,0.72) 100%)',
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.05),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(0,0,0,0.04),_transparent_28%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-black/80">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>
                {lang === 'ta' ? 'அம்பத்தூர் & சென்னை நேரடி மனை சந்தை' : 'Ambattur & West Chennai Real Estate Hub'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={toggleLanguage}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 font-semibold text-black transition hover:bg-black/5"
                title="Toggle Tamil / English"
              >
                {lang === 'en' ? '🇮🇳 தமிழ் (Tamil)' : '🇬🇧 English'}
              </button>
              <Link href="/messages" className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 font-semibold text-black transition hover:bg-black/5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Messages</span>
              </Link>
              <Link href="/notifications" className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 font-semibold text-black transition hover:bg-black/5">
                <Bell className="h-3.5 w-3.5" />
                <span>Alerts</span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 font-semibold text-black transition hover:bg-black/5"
                  aria-expanded={roleMenuOpen}
                >
                  <span>{activeRole.icon}</span>
                  <span>Role: {activeRole.label}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {roleMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-black/10 bg-white py-1 shadow-xl">
                    <p className="border-b border-black/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-black/55">
                      Switch Active Persona
                    </p>
                    {ROLE_OPTIONS.map((role) => (
                      <button
                        key={role.key}
                        onClick={() => handleRoleChange(role.key)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-black/5 ${
                          currentRole === role.key ? 'font-semibold text-black' : 'text-black/75'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{role.icon}</span>
                          <span>{role.label}</span>
                        </span>
                        {currentRole === role.key && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-12">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold shadow-lg shadow-black/10">
                <Sparkles className="w-4 h-4 text-white" />
                <span>Ambattur & West Chennai’s Verified AI Property Marketplace</span>
              </div>

              <div className="space-y-4">
                <h1 className="heading-box-3d text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-[-0.04em] leading-[0.95]">
                  Real Estate with
                  <span className="mt-2 block">
                    <span className="inline-block">Evidence-Based Trust</span>
                  </span>
                  <span className="mt-2 block">& Reels</span>
                </h1>

                <p className="max-w-xl text-base text-black/90 leading-relaxed">
                  Discover trusted homes, plots, and commercial spaces in Ambattur, Mogappair, and Anna Nagar with verified docs, AI intelligence, and real-time broker coordination.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/buy"
                  className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-black/85"
                >
                  Explore listings
                </Link>
                <Link
                  href="/reels"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-black/5"
                >
                  Watch reels
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 text-sm text-black/70">
                <div>
                  <span className="block text-xl font-black text-black">200+</span>
                  <span>Verified deals</span>
                </div>
                <div>
                  <span className="block text-xl font-black text-black">4.9/5</span>
                  <span>Trust score</span>
                </div>
                <div>
                  <span className="block text-xl font-black text-black">24/7</span>
                  <span>Broker support</span>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-8 top-14 h-52 w-52 rounded-full bg-black/5 blur-3xl" />
              <div className="absolute -right-6 bottom-8 h-52 w-52 rounded-full bg-black/5 blur-3xl" />

              <div className="relative rounded-[34px] border border-black/10 bg-white p-3 shadow-[0_25px_60px_rgba(0,0,0,0.12)] rotate-[-2deg]">
                <div className="overflow-hidden rounded-[26px] border border-black/5">
                  <img src={heroImage} alt={heroProperty?.title || 'Featured property'} className="h-[480px] w-full object-cover" />
                </div>

                <div className="absolute -left-4 top-10 rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-black/60">Verified</p>
                  <p className="mt-1 text-sm font-black text-black">Patta + EC</p>
                </div>

                <div className="absolute -right-4 bottom-10 w-56 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between text-xs text-black/60">
                    <span>Featured Home</span>
                    <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">AI</span>
                  </div>
                  <p className="mt-2 text-base font-black text-black line-clamp-1">{heroProperty?.title || 'Premium Ambattur Villa'}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-black">₹{heroProperty ? (heroProperty.price / 100000).toFixed(1) : '42.5'} L</span>
                    <span className="text-black/60">{heroProperty?.bedrooms || 3}BHK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box Card with Tabs */}
          <div className="mt-12 max-w-4xl mx-auto bg-white border border-black/10 rounded-3xl p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 border-b border-black/10 pb-3 mb-4 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === 'buy'
                    ? 'bg-black text-white shadow-md'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <span>🏡 Buy Homes</span>
              </button>

              <button
                onClick={() => setActiveTab('rent')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === 'rent'
                    ? 'bg-black text-white shadow-md'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <span>🔑 Rent</span>
              </button>

              <button
                onClick={() => setActiveTab('plot')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === 'plot'
                    ? 'bg-black text-white shadow-md'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <span>📐 CMDA Plots</span>
              </button>

              <button
                onClick={() => setActiveTab('commercial')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === 'commercial'
                    ? 'bg-black text-white shadow-md'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <span>🏢 Commercial & IT</span>
              </button>
            </div>

            {/* Tamil & English Natural Language Search Engine */}
            <TamilQueryBar onSearch={handleQuerySearch} />

            {/* Quick Locality Links */}
            <div className="mt-4 pt-3 border-t border-black/10 flex flex-wrap items-center justify-between text-xs text-black/70 gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="font-semibold text-black">Popular Localities:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Ambattur OT', 'Mogappair West', 'Anna Nagar West', 'Korattur', 'Avadi'].map(
                  (loc) => (
                    <Link
                      key={loc}
                      href={`/buy?locality=${encodeURIComponent(loc.split(' ')[0])}`}
                      className="px-2.5 py-1 rounded-lg bg-black text-white hover:bg-black/80 transition"
                    >
                      {loc}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Value Proposition Micro-Metrics */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="p-3 rounded-2xl bg-white border border-black/10">
              <p className="text-xl sm:text-2xl font-black text-black">100%</p>
              <p className="text-xs text-black/65 font-medium">Patta / EC Scoped Verification</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-black/10">
              <p className="text-xl sm:text-2xl font-black text-black">TN RERA</p>
              <p className="text-xs text-black/65 font-medium">Authorised Area Brokers</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-black/10">
              <p className="text-xl sm:text-2xl font-black text-black">Vertical Reels</p>
              <p className="text-xs text-black/65 font-medium">Authentic Video Walkthroughs</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-black/10">
              <p className="text-xl sm:text-2xl font-black text-black">Deal Room</p>
              <p className="text-xs text-black/65 font-medium">Milestone & Commission Safety</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REELS DISCOVERY BANNER (VERTICAL VIDEO HIGHLIGHT) */}
      <section className="py-12 bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-black text-xs font-bold uppercase tracking-wider mb-1">
                <Video className="w-4 h-4" />
                <span>NILVORA Property Reels</span>
              </div>
              <h2 className="heading-box-3d mt-2 mb-3 text-2xl leading-tight font-bold text-black sm:text-3xl">
                Inspect Properties with Video Walkthroughs
              </h2>
              <p className="text-xs sm:text-sm text-black/70 mt-1">
                Experience real room dimensions, street access, and sunlight before booking an in-person visit.
              </p>
            </div>
            <Link
              href="/reels"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs sm:text-sm hover:bg-black/80 transition shrink-0"
            >
              <span>Open Full Reels Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Horizontal Reels Carousel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {properties.slice(0, 4).map((prop) => {
              const reel = prop.reels[0];
              return (
                <Link
                  key={prop.id}
                  href={`/reels`}
                  className="group relative rounded-2xl overflow-hidden aspect-[9/14] bg-slate-900 border border-slate-800 hover:border-emerald-500 transition shadow-xl flex flex-col justify-between p-4"
                >
                  <img
                    src={reel?.thumbnailUrl || prop.images[0]}
                    alt={prop.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-75 group-hover:brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase">
                      Reel • {reel?.durationSeconds || 30}s
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="relative z-10 space-y-1">
                    <p className="text-white font-bold text-sm line-clamp-1 group-hover:text-emerald-300 transition">
                      {prop.title}
                    </p>
                    <p className="text-xs text-slate-300 line-clamp-1">{prop.locality}, Chennai</p>
                    <p className="text-emerald-400 font-extrabold text-sm">
                      ₹{(prop.price / 100000).toFixed(1)} L
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES GRID */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-black text-xs font-bold uppercase tracking-wider">
                Curated Chennai Inventory
              </span>
              <h2 className="heading-box-3d mt-2 mb-3 text-2xl leading-tight font-bold text-black sm:text-3xl">
                Verified Properties in Ambattur & Surrounds
              </h2>
              <p className="text-xs sm:text-sm text-black/70 mt-1">
                Each listing includes a grounded Trust Passport outlining Patta, EC, and approval status.
              </p>
            </div>
            <Link
              href="/buy"
              className="text-xs sm:text-sm font-bold text-black hover:text-black/70 flex items-center gap-1.5 transition"
            >
              <span>Explore All {properties.length} Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="rounded-[28px] border border-black/10 bg-white p-3 shadow-[0_18px_45px_rgba(0,0,0,0.08)] transform hover:-translate-y-1 transition-all duration-300">
                <PropertyCard
                  property={property}
                  onQuickVisit={(p) => setSelectedVisitProperty(p)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW NILVORA WORKS (BROKER-FIRST WORKFLOW) */}
      <section className="py-16 bg-[#f6f6f6] border-y border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-black text-xs font-bold uppercase tracking-wider">
              Protected Transaction Pipeline
            </span>
            <h2 className="heading-box-3d mt-2 mb-3 text-2xl leading-tight font-bold text-black sm:text-3xl">
              How NILVORA Safeguards Real Estate Deals
            </h2>
            <p className="text-xs sm:text-sm text-black/70">
              The platform coordinates sellers, brokers, and buyers inside an accountable Deal Room instead of loose verbal promises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-[26px] bg-white border border-black/10 shadow-[0_16px_35px_rgba(0,0,0,0.04)] relative transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-black text-white font-bold flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-black mb-2">Verified Listing</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                Owner lists property with Patta/Chitta and survey numbers. NILVORA checks records for basic consistency before publication.
              </p>
            </div>

            <div className="p-6 rounded-[26px] bg-white border border-black/10 shadow-[0_16px_35px_rgba(0,0,0,0.04)] relative transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-black text-white font-bold flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-black mb-2">Authorised Broker</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                Registered TN RERA broker accepts assignment under a transparent commission agreement. Coordinates genuine buyer visits.
              </p>
            </div>

            <div className="p-6 rounded-[26px] bg-white border border-black/10 shadow-[0_16px_35px_rgba(0,0,0,0.04)] relative transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-black text-white font-bold flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-black mb-2">Document Intelligence</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                AI extracts survey dimensions, owner names, and 30-year Encumbrance details. Highlights missing records for advocate scrutiny.
              </p>
            </div>

            <div className="p-6 rounded-[26px] bg-white border border-black/10 shadow-[0_16px_35px_rgba(0,0,0,0.04)] relative transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-black text-white font-bold flex items-center justify-center text-lg mb-4">
                4
              </div>
              <h3 className="font-bold text-base text-black mb-2">Deal Room & SRO</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                Track token advances, sale agreement covenants, and Sub-Registrar Office registration tokens through clear milestone checklists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOCALITY SPOTLIGHT: AMBATTUR & CHENNAI CONNECTIVITY */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-[30px] bg-gradient-to-br from-white via-[#f5f5f5] to-[#efefef] border border-black/10 shadow-[0_18px_50px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Primary Launch Market</span>
              </div>
              <h3 className="heading-box-3d text-2xl sm:text-3xl font-black text-black">
                Ambattur: Chennai’s Booming Residential & Industrial Axis
              </h3>
              <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                Positioned between Chennai Central and the industrial hub of Sriperumbudur, Ambattur offers unmatched suburban rail connectivity, CMDA-sanctioned layouts, abundant educational institutions, and thriving IT parks.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-sm">
                  <strong className="text-black block text-sm">₹5,200 – ₹7,800</strong>
                  <span className="text-black/60">Avg. sq.ft rate</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-sm">
                  <strong className="text-black block text-sm">Suburban Rail</strong>
                  <span className="text-black/60">18 min to Central</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-sm">
                  <strong className="text-black block text-sm">Metro Phase II</strong>
                  <span className="text-black/60">Corridor 3 linkage</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
              <Link
                href="/buy?locality=Ambattur"
                className="px-6 py-3 rounded-xl bg-black text-white font-bold text-sm text-center hover:bg-black/80 transition shadow-lg shadow-black/10"
              >
                Browse Ambattur Properties
              </Link>
              <Link
                href="/calculator"
                className="px-6 py-3 rounded-xl bg-white text-black border border-black/10 font-semibold text-sm text-center hover:bg-black/5 transition"
              >
                Calculate TN Stamp Duty
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Visit Booking Modal */}
      <VisitModal
        property={selectedVisitProperty}
        onClose={() => setSelectedVisitProperty(null)}
      />
    </div>
  );
}
