'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_BROKERS } from '@/lib/mock-data';
import {
  UserCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  Briefcase,
  Search,
} from 'lucide-react';

export default function BrokersDirectoryPage() {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [brokers] = useState(INITIAL_BROKERS);

  const filteredBrokers = brokers.filter((b) => {
    if (selectedArea === 'all') return true;
    return b.serviceAreas.some((area) => area.toLowerCase().includes(selectedArea.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Directory Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          TN RERA Registered Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Find Verified Area Brokers in Ambattur & West Chennai
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          NILVORA works with licensed, background-checked real-estate professionals who uphold transparent commission agreements and end-to-end title assistance.
        </p>
      </div>

      {/* Locality Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { key: 'all', label: 'All Localities' },
          { key: 'Ambattur', label: 'Ambattur OT & Industrial' },
          { key: 'Mogappair', label: 'Mogappair' },
          { key: 'Anna Nagar', label: 'Anna Nagar' },
          { key: 'Korattur', label: 'Korattur' },
          { key: 'Avadi', label: 'Avadi' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setSelectedArea(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedArea === f.key
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Brokers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBrokers.map((broker) => (
          <div
            key={broker.id}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition duration-300 shadow-xl flex flex-col justify-between space-y-5"
          >
            <div>
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <img
                  src={broker.avatarUrl}
                  alt={broker.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40"
                />
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{broker.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {broker.totalDealsClosed}+ Deals Closed
                  </span>
                </div>
              </div>

              {/* Name & Agency */}
              <h3 className="font-bold text-white text-lg">{broker.fullName}</h3>
              <p className="text-xs text-slate-400 font-medium">{broker.agencyName}</p>

              {/* RERA Badge */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{broker.reraNumber}</span>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-3">
                {broker.bio}
              </p>

              {/* Service Areas */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Service Areas:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {broker.serviceAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Standard Commission:</span>
                <strong className="text-emerald-400">{broker.defaultCommissionPercent}% on Sale</strong>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${broker.phone}`}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Agent</span>
                </a>
                <Link
                  href={`/buy?locality=${encodeURIComponent(broker.serviceAreas[0].split(' ')[0])}`}
                  className="py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs text-center hover:bg-emerald-400 transition"
                >
                  View Listings
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broker Partner CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Are you a Real Estate Agent in West Chennai?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Join NILVORA Partner Network to receive pre-qualified buyer inquiries, create vertical Property Reels, and manage your deals inside our collaborative Deal Rooms.
          </p>
        </div>
        <Link
          href="/pricing"
          className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition shrink-0"
        >
          Explore Broker Partner Plans
        </Link>
      </div>
    </div>
  );
}
