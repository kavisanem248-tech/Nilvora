import React from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock, FileText, Phone } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider">
          Consumer Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Real Estate Safety & Anti-Fraud Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Protect yourself against fraudulent property transactions, unapproved plot layouts, and unverified token advances in Tamil Nadu.
        </p>
      </div>

      {/* Safety Golden Rules */}
      <div className="space-y-4">
        {[
          {
            title: '1. Never Pay Unverified Cash Advances',
            desc: 'Legitimate booking advances should be paid only via traceable banking instruments (RTGS/NEFT/Cheque) following mutual execution of a written sale agreement or bilateral confirmation inside the NILVORA Deal Room.',
          },
          {
            title: '2. Inspect 30-Year Encumbrance Certificate (EC)',
            desc: 'Always verify an online certified extract from the Tamil Nadu Registration Department (TNREGINET) covering at least 30 years to confirm that no bank mortgage, court attachment, or previous unregistered agreement encumbers the property.',
          },
          {
            title: '3. Match Tamil Nilam Patta & TSLR Records',
            desc: 'Ensure the vendor’s name matches the current Patta passbook issued by the Ambattur / Chennai Tahsildar. In urban town survey wards, examine the Town Survey Land Record (TSLR).',
          },
          {
            title: '4. Verify CMDA / DTCP Layout Approval',
            desc: 'For residential plots, verify the layout approval registration number. Do not purchase unapproved or unregularized layout plots which cannot obtain building permits or water connections.',
          },
        ].map((rule, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg"
          >
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{rule.title}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pl-7">{rule.desc}</p>
          </div>
        ))}
      </div>

      {/* Grievance Officer Contact Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-xs space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Report Suspicious Listings or Violations</span>
        </h4>
        <p className="text-slate-400 leading-relaxed">
          If you encounter duplicate listings, misidentified survey numbers, or unauthorized agent demands, please notify NILVORA’s dedicated Grievance & Compliance Cell immediately:
        </p>
        <div className="p-3 rounded-xl bg-slate-800 text-slate-300 space-y-1">
          <p><strong>Grievance Officer:</strong> Adv. M. Balaji</p>
          <p><strong>Email:</strong> grievance@nilvora.in</p>
          <p><strong>Address:</strong> MTH Road, Ambattur, Chennai 600053, Tamil Nadu</p>
        </div>
      </div>
    </div>
  );
}
