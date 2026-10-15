'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileCheck, ShieldCheck, CheckCircle2, Clock, Award } from 'lucide-react';

export default function ProfessionalDashboardPage() {
  const [completedCases, setCompletedCases] = useState(['case-1']);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Advocate & Title Verification Portal
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Legal Review Queue & Document Sign-Off</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Inspect Patta/Chitta mutation records, 30-year Encumbrance Certificates, and issue formal Bar Council legal opinions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Adv. R. Sivasankaran (Madras Bar Council)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Assigned Cases (Active)</span>
          <p className="text-3xl font-black text-white">2</p>
          <p className="text-[11px] text-emerald-400 mt-1">Ambattur & Mogappair</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Opinions Issued</span>
          <p className="text-3xl font-black text-teal-400">28</p>
          <p className="text-[11px] text-slate-400 mt-1">Clear title confirmations</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Pending Advocate Review</span>
          <p className="text-3xl font-black text-amber-400">1</p>
          <p className="text-[11px] text-amber-400 mt-1">Awaiting parent deed scan</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Title Verification Queue</h3>
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                  In Review
                </span>
                <span className="text-slate-400">Survey No. 412/1B2 • Ambattur SRO</span>
              </div>
              <h4 className="font-bold text-white text-sm">Gated 3 BHK Luxury Villa with Private Garden</h4>
              <p className="text-slate-400">Vendor: K. Rajasekaran • Patta TN-AMB-2023-9912 verified</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/document-intelligence"
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs"
              >
                Inspect OCR Report
              </Link>
              <button
                onClick={() => alert('Legal title opinion signed and stamped successfully!')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                Sign Off Title Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
