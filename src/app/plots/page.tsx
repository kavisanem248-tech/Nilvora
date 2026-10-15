'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { DEMO_PROPERTY_IDS } from '@/lib/mock-data';
import PropertyCard from '@/components/ui/PropertyCard';
import VisitModal from '@/components/ui/VisitModal';
import { 
  MapPin, 
  ShieldCheck, 
  Calculator, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Layers,
  FileCheck,
  Play,
  Video,
} from 'lucide-react';

function PlotsContent() {
  const [properties, setProperties] = useState<PropertyItem[]>(() =>
    nilvoraStore.getState().properties.filter((property) => property.propertyType === 'plot')
  );
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(20000000); // 2 Cr
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'area_desc'>('relevance');
  
  // Plot Measurement Converter State
  const [sqftInput, setSqftInput] = useState<number>(2400); // 1 Ground default
  const [centValue, setCentValue] = useState<number>(5.51);
  const [groundValue, setGroundValue] = useState<number>(1.0);

  // Visit Modal State
  const [visitProperty, setVisitProperty] = useState<PropertyItem | null>(null);

  useEffect(() => {
    const updatePlots = () => {
      const all = nilvoraStore.getState().properties;
      setProperties(all.filter((p) => p.propertyType === 'plot'));
    };
    const unsub = nilvoraStore.subscribe(updatePlots);
    return () => unsub();
  }, []);

  const handleSqftChange = (val: number) => {
    setSqftInput(val);
    setCentValue(Number((val / 435.6).toFixed(2)));
    setGroundValue(Number((val / 2400).toFixed(2)));
  };

  const handleGroundChange = (val: number) => {
    setGroundValue(val);
    const sqft = Math.round(val * 2400);
    setSqftInput(sqft);
    setCentValue(Number((sqft / 435.6).toFixed(2)));
  };

  const handleCentChange = (val: number) => {
    setCentValue(val);
    const sqft = Math.round(val * 435.6);
    setSqftInput(sqft);
    setGroundValue(Number((sqft / 2400).toFixed(2)));
  };

  const localities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => set.add(p.locality));
    return ['all', ...Array.from(set)];
  }, [properties]);

  const filteredPlots = useMemo(() => {
    return properties
      .filter((plot) => {
        if (selectedLocality !== 'all' && plot.locality !== selectedLocality) return false;
        if (plot.price > maxBudget) return false;
        if (selectedApproval === 'cmda') {
          return plot.title.toLowerCase().includes('cmda') || plot.description.toLowerCase().includes('cmda');
        }
        if (selectedApproval === 'dtcp') {
          return plot.title.toLowerCase().includes('dtcp') || plot.description.toLowerCase().includes('dtcp');
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'area_desc') return b.areaSqft - a.areaSqft;
        return b.trustScore - a.trustScore;
      });
  }, [properties, selectedLocality, selectedApproval, maxBudget, sortBy]);
  const plotReels = useMemo(
    () => filteredPlots.filter((property) => property.reels.length > 0).slice(0, 4),
    [filteredPlots]
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Filter Bar */}
      <section className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-blue-700" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-transparent text-xs text-slate-800 focus:outline-none capitalize"
                aria-label="Filter by locality"
              >
                <option value="all" className="bg-white">All Localities</option>
                {localities.filter((locality) => locality !== 'all').map((locality) => (
                  <option key={locality} value={locality} className="bg-white">{locality}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <select
                value={selectedApproval}
                onChange={(e) => setSelectedApproval(e.target.value)}
                className="bg-transparent text-xs text-slate-800 focus:outline-none"
                aria-label="Filter by approval"
              >
                <option value="all" className="bg-white">All Approvals</option>
                <option value="cmda" className="bg-white">CMDA Approved</option>
                <option value="dtcp" className="bg-white">DTCP Approved</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-600">Max Budget:</span>
              <span className="text-blue-700 font-semibold font-mono">
                {maxBudget >= 10000000 ? `₹${(maxBudget / 10000000).toFixed(2)} Cr` : `₹${(maxBudget / 100000).toFixed(0)} L`}
              </span>
              <input
                type="range"
                min={2000000}
                max={30000000}
                step={500000}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-24 accent-blue-500 cursor-pointer"
                aria-label="Maximum budget"
              />
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-slate-600">
              Found <strong className="text-slate-900 font-mono">{filteredPlots.length}</strong> plots
            </span>

            <select
              value={sortBy}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'relevance' || value === 'price_asc' || value === 'price_desc' || value === 'area_desc') {
                  setSortBy(value);
                }
              }}
              className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              aria-label="Sort plots"
            >
              <option value="relevance" className="bg-white">Sort: NILVORA Trust Score</option>
              <option value="price_asc" className="bg-white">Price: Low to High</option>
              <option value="price_desc" className="bg-white">Price: High to Low</option>
              <option value="area_desc" className="bg-white">Plot Extent: Largest First</option>
            </select>
          </div>
        </div>
      </section>

      {plotReels.length > 0 && (
        <section className="py-10 bg-white border-b border-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 text-black text-xs font-bold uppercase tracking-wider mb-1">
                  <Video className="w-4 h-4" />
                  <span>NILVORA Site Reels</span>
                </div>
                <h2 className="heading-box-3d mt-2 mb-3 text-2xl leading-tight font-bold text-black sm:text-3xl">
                  Explore Sites with Video Walkthroughs
                </h2>
                <p className="text-xs sm:text-sm text-black/70 mt-1">
                  See plot access, boundaries, and surroundings before arranging a site visit.
                </p>
              </div>
              <Link
                href="/reels"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs sm:text-sm hover:bg-black/80 transition shrink-0"
              >
                <span>Open Site Reels</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plotReels.map((plot) => {
                const reel = plot.reels[0];
                return (
                  <Link
                    key={plot.id}
                    href="/reels"
                    className="group relative rounded-2xl overflow-hidden aspect-[9/14] bg-slate-900 border border-slate-200 hover:border-emerald-500 transition shadow-xl flex flex-col justify-between p-4"
                  >
                    <img
                      src={reel.thumbnailUrl || plot.images[0]}
                      alt={plot.title}
                      loading="lazy"
                      onError={(event) => {
                        const fallbackImage = plot.images[1];
                        if (fallbackImage && event.currentTarget.src !== fallbackImage) {
                          event.currentTarget.src = fallbackImage;
                        }
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-75 group-hover:brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase">
                        Reel • {reel.durationSeconds || 30}s
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <p className="text-white font-bold text-sm line-clamp-1 group-hover:text-emerald-300 transition">
                        {plot.title}
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-1">{plot.locality}, Chennai</p>
                      <p className="text-emerald-400 font-extrabold text-sm">
                        ₹{(plot.price / 100000).toFixed(1)} L
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Top Banner / Hero */}
      <section className="relative py-12 md:py-16 px-4 md:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <Compass className="w-3.5 h-3.5" />
                Residential Sites • Chennai & Suburbs
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                Verified Sites in <span className="text-blue-700">Ambattur & Chennai</span>
              </h1>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                Discover verified residential land, layout plots, and independent villa plots with individual Patta, FMB sketch validation, and 30-year Encumbrance Certificate verification.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-700">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% On-Ground Boundary Stone Verified</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <span>TNRERA & CMDA Layout Approved</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Ready for Immediate Bank Loan</span>
                </div>
              </div>
            </div>

            {/* Tamil Nadu Land Unit Converter Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg max-w-md w-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Tamil Nadu Plot Area Converter</h3>
                    <p className="text-xs text-slate-500">Instant Sq.Ft ↔ Cent ↔ Ground</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">TN SRO Standard</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>Square Feet (sq.ft)</span>
                    <span className="text-slate-500">1 Ground = 2,400 sq.ft</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={sqftInput} 
                      onChange={(e) => handleSqftChange(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">sq.ft</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Cents</span>
                      <span className="text-[10px] text-slate-500">1c = 435.6 sqft</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        value={centValue} 
                        onChange={(e) => handleCentChange(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">Cent</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Grounds</span>
                      <span className="text-[10px] text-slate-500">1g = 2400 sqft</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        value={groundValue} 
                        onChange={(e) => handleGroundChange(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">Grnd</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  💡 <strong className="text-slate-800">Ambattur Market Insight:</strong> Average residential land rate currently ranges from <span className="text-amber-700 font-semibold">₹3,200 to ₹7,500/sq.ft</span> depending on road width and proximity to railway stations.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plots Grid */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
        {filteredPlots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Plots Found for Selected Filters</h3>
            <p className="text-sm text-slate-600 mb-6">
              Try expanding your budget or reset the locality filter to view available CMDA and DTCP residential plots.
            </p>
            <button
              onClick={() => {
                setSelectedLocality('all');
                setSelectedApproval('all');
                setMaxBudget(30000000);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlots.map((plot) => (
              <PropertyCard 
                key={plot.id} 
                property={plot} 
                isDemo={DEMO_PROPERTY_IDS.has(plot.id)}
                onQuickVisit={(p: PropertyItem) => setVisitProperty(p)} 
              />
            ))}
          </div>
        )}

        {/* Plot Buying Legal Checklist in Tamil Nadu */}
        <div className="mt-16 bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                <FileCheck className="w-3.5 h-3.5" />
                Due Diligence Guide
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                Tamil Nadu Land Due Diligence & Document Verification Checklist
              </h2>
            </div>
            <Link
              href="/document-intelligence"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Sparkles className="w-4 h-4" />
              Scan Patta / EC with AI Scanner
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h4 className="font-semibold text-slate-900 text-sm mb-2">Patta & Chitta Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensure individual sub-divided Patta is generated in the seller&apos;s name. Verify village name, taluk, survey number, and exact extent in Hectares/Ares on the official TN AnyQuery portal.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h4 className="font-semibold text-slate-900 text-sm mb-2">30-Year Encumbrance (EC)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Obtain a certified Non-Encumbrance Certificate (Nil EC) from Inspector General of Registration (TNreginet) across 30 years to verify the unbroken chain of parent sale deeds.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h4 className="font-semibold text-slate-900 text-sm mb-2">Layout Approval & Gift Deed</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify CMDA / DTCP planning permit approval order number. Ensure roads and public open space reservation (OSR) lands have been legally handed over to the local municipality via Gift Deed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Modal */}
      {visitProperty && (
        <VisitModal 
          property={visitProperty} 
          onClose={() => setVisitProperty(null)} 
        />
      )}
    </div>
  );
}

export default function PlotsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-900">Loading plots...</div>}>
      <PlotsContent />
    </Suspense>
  );
}
