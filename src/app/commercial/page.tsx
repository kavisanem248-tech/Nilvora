'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { VisitModal } from '@/components/ui/VisitModal';
import {
  Building2,
  Building,
  Zap,
  ShieldCheck,
  MapPin,
  Maximize2,
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react';

function CommercialPropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<PropertyItem | null>(null);
  const [subType, setSubType] = useState<'all' | 'it_office' | 'warehouse' | 'building' | 'shops'>('all');

  useEffect(() => {
    const list = nilvoraStore.getState().properties;
    setProperties(list);
    const unsubscribe = nilvoraStore.subscribe(() => {
      setProperties(nilvoraStore.getState().properties);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const requestedType = searchParams.get('type');
    if (requestedType === 'building' || requestedType === 'shops') setSubType(requestedType);
    else setSubType('all');
  }, [searchParams]);

  const commercialListings = properties.filter((property) => {
    if (property.propertyType !== 'commercial') return false;
    const listingText = `${property.title} ${property.description}`.toLowerCase();
    if (subType === 'it_office') return /office|it\/ites|tech park/.test(listingText);
    if (subType === 'warehouse') return /warehouse|logistics|industrial/.test(listingText);
    if (subType === 'building') return /building|office|facility|tower|complex/.test(listingText);
    if (subType === 'shops') return /shop|retail|showroom|store/.test(listingText);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#101B33] via-[#172642] to-[#101B33] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#315DE8]/20 text-[#315DE8] border border-[#315DE8]/30 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Commercial & IT Real Estate Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Commercial Offices & Tech Parks in Ambattur & Chennai
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Plug-and-play IT/ITES office floors, industrial logistics sheds in Ambattur Industrial Estate (South & North Phase), and high-footfall retail showrooms with 100% DG power backup and fire safety clearances.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-xs space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Ambattur SIDCO Estate:</span>
            <strong className="text-emerald-400">Ready to Occupy</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Power Supply:</span>
            <strong className="text-teal-400">63 KVA - 500 KVA</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Broker Assistance:</span>
            <strong className="text-white">Commercial Specialists</strong>
          </div>
        </div>
      </div>

      {/* Commercial Category Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              subType === 'all'
                ? 'bg-[#315DE8] text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Commercial ({commercialListings.length})
          </button>
          <button
            onClick={() => setSubType('it_office')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              subType === 'it_office'
                ? 'bg-[#315DE8] text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            IT / ITES Office Space
          </button>
          <button
            onClick={() => setSubType('warehouse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              subType === 'warehouse'
                ? 'bg-[#315DE8] text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Logistics & Warehousing
          </button>
          <button
            onClick={() => setSubType('building')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              subType === 'building'
                ? 'bg-[#315DE8] text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Buildings
          </button>
          <button
            onClick={() => setSubType('shops')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              subType === 'shops'
                ? 'bg-[#315DE8] text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Shops
          </button>
        </div>

        <Link
          href="/calculator"
          className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Calculate Commercial SRO Charges (4%)</span>
          <span>→</span>
        </Link>
      </div>

      {/* Listings Grid */}
      {commercialListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {commercialListings.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onQuickVisit={(p) => setSelectedVisitProperty(p)}
            />
          ))}
        </div>
      ) : (
        <div className="surface-3d space-y-3 p-8 text-center">
          <h2 className="text-lg font-bold text-black">No {subType === 'shops' ? 'shop' : subType === 'building' ? 'building' : 'commercial'} listings found</h2>
          <p className="text-sm text-black/65">Try all commercial listings or another category.</p>
          <button
            type="button"
            onClick={() => setSubType('all')}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black shadow-sm"
          >
            Show all commercial listings
          </button>
        </div>
      )}

      {/* Commercial Advisory Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-300">
        <div className="space-y-1 max-w-xl">
          <strong className="text-white text-sm block">Looking for Custom Built-to-Suit Industrial Facilities?</strong>
          <p className="text-slate-400">
            Our registered Ambattur commercial brokers manage long-term SIDCO lease transfers, HT power sanctions, and factory compliance inspections.
          </p>
        </div>
        <Link
          href="/brokers"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition shrink-0"
        >
          Connect with Commercial Broker
        </Link>
      </div>

      {/* Quick Visit Modal */}
      <VisitModal
        property={selectedVisitProperty}
        onClose={() => setSelectedVisitProperty(null)}
      />
    </div>
  );
}

export default function CommercialPropertiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-black/60">Loading commercial listings...</div>}>
      <CommercialPropertiesContent />
    </Suspense>
  );
}
