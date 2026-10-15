'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  IndianRupee, 
  Percent, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  PiggyBank,
  FileCheck
} from 'lucide-react';

function InvestmentContent() {
  // Inputs
  const [propertyPrice, setPropertyPrice] = useState<number>(6500000); // 65 Lakhs
  const [monthlyRent, setMonthlyRent] = useState<number>(24000); // 24k/month
  const [annualMaintenance, setAnnualMaintenance] = useState<number>(30000); // 30k/year
  const [vacancyPercent, setVacancyPercent] = useState<number>(5); // 5% vacancy
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20% down payment
  const [loanInterestRate, setLoanInterestRate] = useState<number>(8.5); // 8.5% p.a.
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20); // 20 years
  const [cagrAppreciation, setCagrAppreciation] = useState<number>(7.0); // 7% CAGR

  // Financial Calculations
  const calculations = useMemo(() => {
    const annualGrossRent = monthlyRent * 12;
    const vacancyLoss = annualGrossRent * (vacancyPercent / 100);
    const annualNetRent = annualGrossRent - vacancyLoss - annualMaintenance;

    const grossYield = (annualGrossRent / propertyPrice) * 100;
    const netYield = (annualNetRent / propertyPrice) * 100;

    const downPaymentAmount = propertyPrice * (downPaymentPercent / 100);
    const loanPrincipal = propertyPrice - downPaymentAmount;

    // Monthly EMI calculation
    const monthlyRate = loanInterestRate / 12 / 100;
    const totalMonths = loanTenureYears * 12;
    const emi = loanPrincipal > 0
      ? (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

    const monthlyMaintenance = annualMaintenance / 12;
    const monthlyNetCashflow = monthlyRent - emi - monthlyMaintenance;

    // 10-Year Projections
    const valueYear5 = propertyPrice * Math.pow(1 + cagrAppreciation / 100, 5);
    const valueYear10 = propertyPrice * Math.pow(1 + cagrAppreciation / 100, 10);
    const cumulativeRent10Yr = annualNetRent * 10;
    const totalWealth10Yr = valueYear10 + cumulativeRent10Yr;

    // Income Tax Section 24(b) and 80C estimations
    const maxSection24Benefit = 200000; // max ₹2 Lakhs interest deduction
    const maxSection80CBenefit = 150000; // max ₹1.5 Lakhs principal repayment
    const estimatedAnnualTaxSaved30PercentSlab = (Math.min(emi * 12 * 0.7, maxSection24Benefit) + Math.min(emi * 12 * 0.3, maxSection80CBenefit)) * 0.312;

    return {
      annualGrossRent,
      annualNetRent,
      grossYield,
      netYield,
      downPaymentAmount,
      loanPrincipal,
      emi: Math.round(emi),
      monthlyNetCashflow: Math.round(monthlyNetCashflow),
      valueYear5: Math.round(valueYear5),
      valueYear10: Math.round(valueYear10),
      totalWealth10Yr: Math.round(totalWealth10Yr),
      estimatedAnnualTaxSaved: Math.round(estimatedAnnualTaxSaved30PercentSlab),
    };
  }, [
    propertyPrice,
    monthlyRent,
    annualMaintenance,
    vacancyPercent,
    downPaymentPercent,
    loanInterestRate,
    loanTenureYears,
    cagrAppreciation,
  ]);

  const formatLakhsCrores = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <TrendingUp className="w-4 h-4" />
            Real Estate ROI & Wealth Simulation Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Rental Yield & Capital Appreciation <span className="text-blue-400">Calculator</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Evaluate rental returns, cashflow, 10-year capital appreciation, and Section 24(b) tax deductions for real estate investments in Ambattur and Greater Chennai.
          </p>
        </div>

        {/* Main Grid: Inputs vs Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-[#172642] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
              <Building2 className="w-4 h-4 text-blue-400" />
              Investment Parameters
            </h2>

            {/* Property Price */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Property Purchase Price</span>
                <span className="font-mono text-blue-400 font-bold">{formatLakhsCrores(propertyPrice)}</span>
              </div>
              <input
                type="range"
                min={2000000}
                max={30000000}
                step={250000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>₹20 L</span>
                <span>₹1.5 Cr</span>
                <span>₹3.0 Cr</span>
              </div>
            </div>

            {/* Monthly Rental Income */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Expected Monthly Rent</span>
                <span className="font-mono text-emerald-400 font-bold">₹{monthlyRent.toLocaleString('en-IN')}/mo</span>
              </div>
              <input
                type="range"
                min={8000}
                max={150000}
                step={1000}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>₹8,000</span>
                <span>₹50,000</span>
                <span>₹1,50,000</span>
              </div>
            </div>

            {/* Down Payment & Loan Tenure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Down Payment (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full bg-[#101B33] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Loan Interest (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min={6.5}
                    max={14}
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                    className="w-full bg-[#101B33] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Annual Maintenance & Vacancy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Annual Maintenance</label>
                <div className="relative">
                  <input
                    type="number"
                    value={annualMaintenance}
                    onChange={(e) => setAnnualMaintenance(Number(e.target.value))}
                    className="w-full bg-[#101B33] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400">₹/yr</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Est. Vacancy Loss</label>
                <div className="relative">
                  <input
                    type="number"
                    value={vacancyPercent}
                    onChange={(e) => setVacancyPercent(Number(e.target.value))}
                    className="w-full bg-[#101B33] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* CAGR Capital Appreciation */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Annual Capital Appreciation (CAGR)</span>
                <span className="font-mono text-amber-400 font-bold">{cagrAppreciation}% p.a.</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                step={0.5}
                value={cagrAppreciation}
                onChange={(e) => setCagrAppreciation(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Ambattur & Mogappair historic CAGR: 6.5% – 8.2%</p>
            </div>
          </div>

          {/* Results Analytics Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#172642] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                <span className="text-xs text-slate-400 block mb-1">Gross Rental Yield</span>
                <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-1">
                  {calculations.grossYield.toFixed(2)}
                  <span className="text-xs text-slate-400">%</span>
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  Above Chennai 3.2% avg
                </span>
              </div>

              <div className="bg-[#172642] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                <span className="text-xs text-slate-400 block mb-1">Net Rental Yield</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono flex items-baseline gap-1">
                  {calculations.netYield.toFixed(2)}
                  <span className="text-xs text-slate-400">%</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Post vacancy & repairs
                </span>
              </div>

              <div className="bg-[#172642] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                <span className="text-xs text-slate-400 block mb-1">Monthly Loan EMI</span>
                <div className="text-2xl font-bold text-amber-400 font-mono flex items-baseline gap-1">
                  ₹{calculations.emi.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  On ₹{(calculations.loanPrincipal / 100000).toFixed(1)}L loan
                </span>
              </div>
            </div>

            {/* 10-Year Wealth Projection Card */}
            <div className="bg-gradient-to-r from-[#172642] to-[#101B33] border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-blue-400" />
                  10-Year Total Wealth & Appreciation Forecast
                </h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {cagrAppreciation}% Compounding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div>
                  <span className="text-xs text-slate-400 block">Property Value in 5 Years</span>
                  <strong className="text-lg font-mono text-white block mt-1">
                    {formatLakhsCrores(calculations.valueYear5)}
                  </strong>
                  <span className="text-[10px] text-blue-400">+{(calculations.valueYear5 - propertyPrice).toLocaleString('en-IN')} Gain</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Property Value in 10 Years</span>
                  <strong className="text-lg font-mono text-emerald-400 block mt-1">
                    {formatLakhsCrores(calculations.valueYear10)}
                  </strong>
                  <span className="text-[10px] text-emerald-400">+{(calculations.valueYear10 - propertyPrice).toLocaleString('en-IN')} Gain</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">10-Yr Total Wealth Created</span>
                  <strong className="text-lg font-mono text-amber-400 block mt-1">
                    {formatLakhsCrores(calculations.totalWealth10Yr)}
                  </strong>
                  <span className="text-[10px] text-slate-400">Value + Cumulative Rent</span>
                </div>
              </div>

              {/* Monthly Cashflow Analysis */}
              <div className="p-4 bg-[#0B132B]/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300">Monthly Net Cashflow:</span>
                  <span className={`font-mono font-bold ${calculations.monthlyNetCashflow >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {calculations.monthlyNetCashflow >= 0 ? '+' : ''}₹{calculations.monthlyNetCashflow.toLocaleString('en-IN')}/month
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {calculations.monthlyNetCashflow >= 0 
                    ? '🎉 Positive Cash Flow: The rental income covers your monthly mortgage payments and maintenance with surplus profit.'
                    : '💡 Self-Financing Asset: Your rental income covers the majority of the monthly EMI, letting you build prime real estate equity at minimal out-of-pocket monthly cost.'}
                </p>
              </div>
            </div>

            {/* Income Tax Section 24(b) & 80C Benefits */}
            <div className="bg-[#172642] border border-slate-700/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Indian Income Tax Relief Under Old & New Tax Regimes
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#101B33] p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-300">Section 24(b) (Loan Interest)</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">Up to ₹2,00,000/yr</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Deduct up to ₹2 Lakhs of home loan interest from your taxable income for self-occupied or rented residential homes.</p>
                </div>

                <div className="bg-[#101B33] p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-300">Section 80C (Principal)</span>
                    <span className="text-xs font-mono text-blue-400 font-bold">Up to ₹1,50,000/yr</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Deduct up to ₹1.5 Lakhs of principal repayment alongside PF, PPF, and ELSS investments.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs">
                <span className="text-slate-300">Estimated Annual Tax Saved (30% Income Bracket):</span>
                <span className="font-mono font-bold text-blue-300 text-sm">~₹{calculations.estimatedAnnualTaxSaved.toLocaleString('en-IN')}/year</span>
              </div>
            </div>

            {/* CTA to Explore High-Yield Properties */}
            <div className="flex items-center justify-between p-6 bg-[#101B33] border border-slate-800 rounded-2xl">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Looking for High-Yield Real Estate in Ambattur?</h4>
                <p className="text-xs text-slate-400">Explore pre-leased IT facilities, commercial plots, and gated apartments.</p>
              </div>
              <Link
                href="/commercial"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition"
              >
                <span>Browse Commercial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-white">Loading investment calculator...</div>}>
      <InvestmentContent />
    </Suspense>
  );
}
