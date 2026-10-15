'use client';

import React, { useState, useEffect } from 'react';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { VisitModal } from '@/components/ui/VisitModal';
import { KeyRound } from 'lucide-react';

function RentPropertiesContent() {
  const [properties, setProperties] = useState<PropertyItem[]>(() => nilvoraStore.getState().properties);
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<PropertyItem | null>(null);

  useEffect(() => {
    const unsubscribe = nilvoraStore.subscribe(() => {
      setProperties(nilvoraStore.getState().properties);
    });
    return () => unsubscribe();
  }, []);

  const rentalProperties = properties.filter((property) => property.listingType === 'rent');

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Rental & Commercial Hub</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">Rent Residences & Commercial Spaces</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Verified rental apartments in Ambattur & Mogappair, plus IT/warehouse facilities in Ambattur Industrial Estate with transparent lease terms and zero hidden advance claims.
            </p>
          </div>
        </div>

        {/* Property Grid */}
        {rentalProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rentalProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onQuickVisit={(p) => setSelectedVisitProperty(p)}
              />
            ))}
          </div>
        ) : (
          <div className="surface-3d space-y-3 p-8 text-center">
            <h2 className="text-lg font-bold text-black">No rentals listed yet</h2>
            <p className="text-sm text-black/65">Check back soon to see currently available rental properties.</p>
          </div>
        )}
      </div>

      {/* Visit Booking Modal */}
      <VisitModal
        property={selectedVisitProperty}
        onClose={() => setSelectedVisitProperty(null)}
      />
    </div>
  );
}

export default function RentPropertiesPage() {
  return <RentPropertiesContent />;
}
