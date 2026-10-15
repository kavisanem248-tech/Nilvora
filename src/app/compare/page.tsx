'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { calculateTamilNaduRegistrationCharges } from '@/lib/compliance/rules';
import VisitModal from '@/components/ui/VisitModal';
import { requireSignedInForAction } from '@/lib/auth/client-session';
import { 
  Scale, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Building, 
  CheckCircle2, 
  FileText,
  IndianRupee,
  Layers
} from 'lucide-react';

function CompareContent() {
  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['prop-1', 'prop-2']);
  const [visitProperty, setVisitProperty] = useState<PropertyItem | null>(null);

  useEffect(() => {
    const update = () => {
      const props = nilvoraStore.getState().properties;
      setAllProperties(props);
    };
    update();
    const unsub = nilvoraStore.subscribe(update);
    return () => unsub();
  }, []);

  const comparedProperties = allProperties.filter((p) => selectedIds.includes(p.id));

  const handleAddProperty = async (id: string) => {
    if (!id) return;
    if (!await requireSignedInForAction()) return;
    setSelectedIds((currentIds) =>
      currentIds.length < 4 && !currentIds.includes(id) ? [...currentIds, id] : currentIds
    );
  };

  const handleRemoveProperty = async (id: string) => {
    if (!await requireSignedInForAction()) return;
    setSelectedIds((currentIds) => currentIds.filter((propertyId) => propertyId !== id));
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} Lakhs`;
  };

  // Compile list of all unique amenities across compared properties
  const allAmenities = Array.from(
    new Set(comparedProperties.flatMap((p) => p.amenities || []))
  );

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
              <Scale className="w-3.5 h-3.5" />
              Side-by-Side Property Comparison Matrix
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Compare Properties in <span className="text-blue-400">Ambattur & Chennai</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Evaluate pricing, per-sq.ft rate, Tamil Nadu SRO registration costs, amenities, and Trust Scores.
            </p>
          </div>

          {/* Add property dropdown */}
          {selectedIds.length < 4 && (
            <div className="flex items-center gap-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    void handleAddProperty(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-[#172642] border border-blue-500/40 text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400 shadow-lg"
              >
                <option value="" disabled>+ Add Property to Compare ({selectedIds.length}/4)</option>
                {allProperties
                  .filter((p) => !selectedIds.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#172642]">
                      {p.title} ({p.locality} • {formatPrice(p.price)})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {comparedProperties.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-[#101B33] px-6 py-12 text-center">
            <Scale className="mx-auto mb-3 h-8 w-8 text-slate-400" />
            <h2 className="text-lg font-bold text-white">No properties selected</h2>
            <p className="mt-2 text-sm text-slate-400">
              Add a property above to start comparing listings.
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto pb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left w-64 min-w-[200px] bg-[#101B33]/80 border-b border-r border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Features & Metrics
                </th>
                {comparedProperties.map((prop) => (
                  <th key={prop.id} className="p-4 text-left min-w-[280px] bg-[#172642] border-b border-r border-slate-800 relative">
                    <button
                      type="button"
                      onClick={() => void handleRemoveProperty(prop.id)}
                      aria-label={`Remove ${prop.title} from comparison`}
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300"
                      title="Remove from comparison"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </button>

                    <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 border border-slate-700">
                      <Image
                        src={prop.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                        alt={prop.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-semibold text-white uppercase">
                        {prop.propertyType.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{prop.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">{prop.locality}, Chennai</p>

                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-emerald-400 font-mono">
                        {formatPrice(prop.price)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        ₹{Math.round(prop.price / (prop.areaSqft || 1)).toLocaleString('en-IN')}/sqft
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setVisitProperty(prop)}
                        className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition"
                      >
                        Book Visit
                      </button>
                      <Link
                        href={`/property/${prop.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
                      >
                        Details
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: Overview & Location */}
              <tr className="bg-[#101B33]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Locality & Suburb
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-3 text-xs text-slate-200 border-r border-b border-slate-800">
                    <span className="font-semibold text-white">{p.locality}</span>
                    {p.subLocality && <span className="block text-[11px] text-slate-400">{p.subLocality}</span>}
                  </td>
                ))}
              </tr>

              {/* Row: Area & Config */}
              <tr className="bg-[#0B132B]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Carpet / Super Area
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-3 text-xs font-mono font-semibold text-white border-r border-b border-slate-800">
                    {p.areaSqft.toLocaleString('en-IN')} sq.ft
                    <span className="block text-[10px] text-slate-400 font-normal">
                      (~{(p.areaSqft / 435.6).toFixed(2)} Cents)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row: Bedrooms & Bathrooms */}
              <tr className="bg-[#101B33]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Bedrooms & Bathrooms
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-3 text-xs text-white border-r border-b border-slate-800">
                    {p.bedrooms > 0 ? `${p.bedrooms} BHK (${p.bathrooms} Baths)` : 'Open Plot / Non-Res'}
                  </td>
                ))}
              </tr>

              {/* Row: Furnishing */}
              <tr className="bg-[#0B132B]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Furnishing Status
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-3 text-xs capitalize text-slate-200 border-r border-b border-slate-800">
                    {p.furnishingStatus || 'Unfurnished'}
                  </td>
                ))}
              </tr>

              {/* Row: Floor Info */}
              <tr className="bg-[#101B33]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Floor Level
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-3 text-xs text-slate-200 border-r border-b border-slate-800">
                    {p.floorNumber ? `Floor ${p.floorNumber} of ${p.totalFloors || p.floorNumber}` : 'Ground / Plot'}
                  </td>
                ))}
              </tr>

              {/* Section Header: Trust & Legal */}
              <tr className="bg-[#172642]">
                <td colSpan={comparedProperties.length + 1} className="p-3 text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800">
                  🛡️ NILVORA Trust Passport & Legal Verification
                </td>
              </tr>

              {/* Row: Trust Score */}
              <tr className="bg-[#0B132B]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Trust Score (0–100)
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-3 border-r border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/40 font-mono">
                        {p.trustScore}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">Verified Status</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Patta & EC */}
              <tr className="bg-[#101B33]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Patta & 30-Yr EC Status
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-3 text-xs text-slate-200 border-r border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Patta No: {p.pattaNumber || 'Verified In-Record'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Survey: {p.surveyNumber || 'FMB Checked'}</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Section Header: Government SRO Registration Costs */}
              <tr className="bg-[#172642]">
                <td colSpan={comparedProperties.length + 1} className="p-3 text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                  🏛️ Estimated Tamil Nadu Registration Costs (TNreginet 2026)
                </td>
              </tr>

              {/* Row: Stamp Duty */}
              <tr className="bg-[#0B132B]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Stamp Duty (7%)
                </td>
                {comparedProperties.map((p) => {
                  const reg = calculateTamilNaduRegistrationCharges(p.price, p.propertyType);
                  return (
                    <td key={p.id} className="p-3 text-xs font-mono font-semibold text-slate-200 border-r border-b border-slate-800">
                      ₹{reg.stampDutyAmount.toLocaleString('en-IN')}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Registration Fee */}
              <tr className="bg-[#101B33]">
                <td className="p-3 text-xs font-semibold text-slate-300 border-r border-b border-slate-800">
                  Registration Fee
                </td>
                {comparedProperties.map((p) => {
                  const reg = calculateTamilNaduRegistrationCharges(p.price, p.propertyType);
                  return (
                    <td key={p.id} className="p-3 text-xs font-mono font-semibold text-slate-200 border-r border-b border-slate-800">
                      ₹{reg.registrationFeeAmount.toLocaleString('en-IN')}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ({reg.registrationFeePercent}% rate)
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Total SRO Cost */}
              <tr className="bg-[#0B132B]">
                <td className="p-3 text-xs font-bold text-white border-r border-b border-slate-800">
                  Total Government Charges
                </td>
                {comparedProperties.map((p) => {
                  const reg = calculateTamilNaduRegistrationCharges(p.price, p.propertyType);
                  return (
                    <td key={p.id} className="p-3 text-xs font-mono font-bold text-amber-400 border-r border-b border-slate-800">
                      ₹{reg.totalGovtAndLegalCharges.toLocaleString('en-IN')}
                    </td>
                  );
                })}
              </tr>

              {/* Section Header: Amenities Breakdown */}
              <tr className="bg-[#172642]">
                <td colSpan={comparedProperties.length + 1} className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider border-b border-slate-800">
                  ✨ Lifestyle & Infrastructure Amenities
                </td>
              </tr>

              {allAmenities.map((amenity) => (
                <tr key={amenity} className="hover:bg-slate-900/40">
                  <td className="p-3 text-xs text-slate-300 border-r border-b border-slate-800">
                    {amenity}
                  </td>
                  {comparedProperties.map((p) => {
                    const hasAmenity = (p.amenities || []).includes(amenity);
                    return (
                      <td key={p.id} className="p-3 text-center border-r border-b border-slate-800">
                        {hasAmenity ? (
                          <div className="inline-flex p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="inline-flex p-1 rounded-full bg-slate-800 text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

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

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-white">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
