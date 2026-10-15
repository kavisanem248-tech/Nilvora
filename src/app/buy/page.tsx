'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { VisitModal } from '@/components/ui/VisitModal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Video,
  X,
  LayoutGrid,
  List,
  RotateCcw,
} from 'lucide-react';

function BuyPropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<PropertyItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter States
  const [locality, setLocality] = useState<string>(searchParams.get('locality') || 'all');
  const [propertyType, setPropertyType] = useState<string>(searchParams.get('type') || 'all');
  const [bhk, setBhk] = useState<string>(searchParams.get('bhk') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(
    searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : 25000000
  );
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [videoOnly, setVideoOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'trust' | 'price_asc' | 'price_desc' | 'newest'>('trust');

  useEffect(() => {
    setProperties(nilvoraStore.getState().properties);
    const unsubscribe = nilvoraStore.subscribe(() => {
      setProperties(nilvoraStore.getState().properties);
    });
    return () => unsubscribe();
  }, []);

  // Update filters if URL parameters change
  useEffect(() => {
    const locParam = searchParams.get('locality');
    if (locParam) setLocality(locParam);
    const typeParam = searchParams.get('type');
    if (typeParam) setPropertyType(typeParam);
    const bhkParam = searchParams.get('bhk');
    if (bhkParam) setBhk(bhkParam);
  }, [searchParams]);

  // Filtering & Sorting
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => p.listingType === 'sale')
      .filter((p) => {
        if (locality !== 'all' && !p.locality.toLowerCase().includes(locality.toLowerCase())) {
          return false;
        }
        if (propertyType === 'house' && p.propertyType !== 'villa' && p.propertyType !== 'independent_house') return false;
        if (propertyType !== 'all' && propertyType !== 'house' && p.propertyType !== propertyType) return false;
        if (bhk !== 'all' && p.bedrooms !== parseInt(bhk, 10)) {
          return false;
        }
        if (p.price > maxPrice) {
          return false;
        }
        if (verifiedOnly && p.trustScore < 90) {
          return false;
        }
        if (videoOnly && (!p.reels || p.reels.length === 0)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'trust') return b.trustScore - a.trustScore;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [properties, locality, propertyType, bhk, maxPrice, verifiedOnly, videoOnly, sortBy]);

  const activeFilterCount = [
    locality !== 'all',
    propertyType !== 'all',
    bhk !== 'all',
    maxPrice < 25000000,
    verifiedOnly,
    videoOnly,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setLocality('all');
    setPropertyType('all');
    setBhk('all');
    setMaxPrice(25000000);
    setVerifiedOnly(false);
    setVideoOnly(false);
    setSortBy('trust');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="heading-box-3d text-2xl sm:text-3xl font-black tracking-tight">
          Buy Verified Properties in Ambattur & Chennai
        </h1>
        <p className="mt-3 text-xs text-black/65 sm:text-sm">
          Explore residential villas, apartments, and CMDA plots with transparent Patta & Encumbrance records.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-3 shadow-sm lg:hidden">
        <p className="text-sm font-semibold text-black">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
        </p>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-bold text-black shadow-sm"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} surface-3d h-fit space-y-6 p-5 lg:col-span-1 lg:block`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Filters</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Locality */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Locality / Area
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="form-control-3d w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="all">All Areas in Chennai</option>
              <option value="Ambattur">Ambattur (OT & Industrial)</option>
              <option value="Mogappair">Mogappair East & West</option>
              <option value="Anna Nagar">Anna Nagar West Extn</option>
              <option value="Korattur">Korattur</option>
              <option value="Avadi">Avadi</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Property Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { key: 'all', label: 'All' },
                { key: 'apartment', label: 'Apartment' },
                { key: 'house', label: 'House' },
                { key: 'villa', label: 'Villa' },
                { key: 'builder_project', label: 'Complexes' },
                { key: 'plot', label: 'Plot / Land' },
                { key: 'independent_house', label: 'Ind. House' },
                { key: 'commercial', label: 'Commercial' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setPropertyType(t.key)}
                  className={`filter-option-3d text-left font-medium ${
                    propertyType === t.key
                      ? 'is-selected'
                      : ''
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* BHK Requirement */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Bedrooms (BHK)
            </label>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Any' },
                { key: '1', label: '1 BHK' },
                { key: '2', label: '2 BHK' },
                { key: '3', label: '3 BHK' },
              ].map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setBhk(b.key)}
                  className={`filter-option-3d flex-1 text-center text-xs font-medium ${
                    bhk === b.key
                      ? 'is-selected'
                      : ''
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Budget Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Max Budget
              </span>
              <span className="font-bold text-emerald-400">
                {maxPrice >= 10000000
                  ? `₹${(maxPrice / 10000000).toFixed(2)} Cr`
                  : `₹${(maxPrice / 100000).toFixed(0)} Lakhs`}
              </span>
            </div>
            <input
              type="range"
              min="2000000"
              max="25000000"
              step="500000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>₹20L</span>
              <span>₹1 Cr</span>
              <span>₹2.5 Cr+</span>
            </div>
          </div>

          {/* Verification & Reels Toggles */}
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>High Trust Score (90%+) Only</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={videoOnly}
                onChange={(e) => setVideoOnly(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Video className="w-3.5 h-3.5 text-teal-400" />
                <span>Video Reel Available</span>
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="w-full rounded-lg border border-black/10 bg-white py-2.5 text-xs font-bold text-black shadow-sm lg:hidden"
          >
            Show {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar: Count, Sort, View Toggle */}
          <div className="surface-3d flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="text-xs text-slate-300">
              Showing <strong className="text-emerald-400">{filteredProperties.length}</strong>{' '}
              verified properties in{' '}
              <strong className="text-white">
                {locality === 'all' ? 'Ambattur & West Chennai' : locality}
              </strong>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="trust">Trust Passport Score</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Recently Listed</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`view-mode-button ${
                    viewMode === 'grid' ? 'is-selected' : ''
                  }`}
                  title="Grid View"
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`view-mode-button ${
                    viewMode === 'list' ? 'is-selected' : ''
                  }`}
                  title="List View"
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredProperties.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No properties match your filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your budget range or clearing specific locality filters to discover properties nearby.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onQuickVisit={(p) => setSelectedVisitProperty(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Visit Modal */}
      <VisitModal
        property={selectedVisitProperty}
        onClose={() => setSelectedVisitProperty(null)}
      />
    </div>
  );
}

export default function BuyPropertiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading properties...</div>}>
      <BuyPropertiesContent />
    </Suspense>
  );
}
