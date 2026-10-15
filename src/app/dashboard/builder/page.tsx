'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Layers, Users, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function BuilderDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Builder & Developer Portal
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Project Portfolio & Unit Inventory</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage gated enclaves, CMDA-sanctioned apartment phases, and bulk buyer leads across Ambattur & West Chennai.
          </p>
        </div>

        <Link
          href="/sell"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
        >
          Add New Project Phase
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Active Projects</span>
          <p className="text-3xl font-black text-white">2</p>
          <p className="text-[11px] text-emerald-400 mt-1">TN RERA Approved Enclaves</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Units Available</span>
          <p className="text-3xl font-black text-teal-400">18</p>
          <p className="text-[11px] text-slate-400 mt-1">2 BHK & 3 BHK inventory</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Qualified Inquiries</span>
          <p className="text-3xl font-black text-cyan-400">42</p>
          <p className="text-[11px] text-cyan-400 mt-1">Assigned to channel brokers</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Active Builder Projects</h3>
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm">NILVORA Ambattur Gated Enclave Phase 1</h4>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
              TNRERA/PR/0241/2023
            </span>
          </div>
          <p className="text-slate-400">Venkatapuram, Ambattur • 12 Individual Villas • 100% CMDA Sanctioned</p>
        </div>
      </div>
    </div>
  );
}
