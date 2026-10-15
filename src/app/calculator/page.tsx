'use client';

import React, { useState } from 'react';
import { calculateTamilNaduRegistrationCharges } from '@/lib/compliance/rules';
import { Calculator, ArrowRight, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function StampDutyCalculatorPage() {
  const [propertyValue, setPropertyValue] = useState<number>(6500000); // ₹65 Lakhs default
  const [propertyType, setPropertyType] = useState<string>('apartment');

  const breakdown = calculateTamilNaduRegistrationCharges(propertyValue, propertyType);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          <span>Tamil Nadu Registration Department (TNREGINET)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Tamil Nadu Stamp Duty & Registration Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Calculate official government conveyance fees, reduced apartment registration rates (2%), and legal documentation outlays for Chennai properties.
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
              Property Market / Guideline Value (₹)
            </label>
            <input
              type="number"
              step="50000"
              value={propertyValue}
              onChange={(e) => setPropertyValue(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-base font-bold focus:border-emerald-400"
            />
            <span className="text-emerald-400 font-bold mt-1 block">
              {formatLakhs(propertyValue)}
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
              Property Classification
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white text-xs font-semibold focus:border-emerald-400"
            >
              <option value="apartment">Residential Apartment / Flat (2% Reg. Fee)</option>
              <option value="villa">Independent Villa / House (2% Reg. Fee)</option>
              <option value="plot">Vacant Land / CMDA Plot (4% Reg. Fee)</option>
              <option value="commercial">Commercial / Industrial Space (4% Reg. Fee)</option>
            </select>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
          <h3 className="font-bold text-white text-sm">Official Fee Breakdown (Chennai / Ambattur)</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Stamp Duty ({breakdown.stampDutyPercent}% on Guideline Value)</span>
              </span>
              <strong className="text-white text-sm">{formatCurrency(breakdown.stampDutyAmount)}</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Registration Fee ({breakdown.registrationFeePercent}% as per TN Gazette)</span>
              </span>
              <strong className="text-white text-sm">{formatCurrency(breakdown.registrationFeeAmount)}</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-slate-300">Sub-Registrar Computer & Digital Token Charges</span>
              <span className="text-slate-300">{formatCurrency(breakdown.subRegistrarComputerFee)}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-slate-300">Approx. Advocate Legal Drafting & Title Search</span>
              <span className="text-slate-300">{formatCurrency(breakdown.approxLegalAdvocateFee)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 text-sm font-black">
              <span className="text-emerald-300">Total Statutory & Legal Outlay</span>
              <span className="text-emerald-400 text-base">
                {formatCurrency(breakdown.totalGovtAndLegalCharges)} ({((breakdown.totalGovtAndLegalCharges / propertyValue) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-sm font-black text-white">
              <span>Grand Total Acquisition Cost (Property + Registration)</span>
              <span className="text-xl text-emerald-300">{formatCurrency(breakdown.effectiveTotalCost)}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{breakdown.disclaimer}</span>
        </div>
      </div>
    </div>
  );
}
