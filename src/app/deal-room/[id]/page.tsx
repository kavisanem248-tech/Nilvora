'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DealRoomItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Building,
  DollarSign,
  AlertCircle,
  Calendar,
  Lock,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

function DealRoomContent() {
  const routerParams = useParams();
  const dealId = (routerParams?.id as string) || 'deal-101';

  const [deal, setDeal] = useState<DealRoomItem | null>(null);

  useEffect(() => {
    const list = nilvoraStore.getState().dealRooms;
    const found = list.find((d) => d.id === dealId) || list[0];
    setDeal(found || null);

    const unsubscribe = nilvoraStore.subscribe(() => {
      const updatedList = nilvoraStore.getState().dealRooms;
      const updated = updatedList.find((d) => d.id === dealId) || updatedList[0];
      setDeal(updated || null);
    });
    return () => unsubscribe();
  }, [dealId]);

  if (!deal) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Deal Room Not Found</h2>
        <Link href="/dashboard/buyer" className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const completedCount = deal.milestones.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / deal.milestones.length) * 100);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    nilvoraStore.toggleDealMilestone(deal.id, milestoneId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>NILVORA Secure Deal Room #{deal.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{deal.propertyTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {deal.propertyLocality}, Chennai • Agreed Consideration: <strong>{formatCurrency(deal.agreedPrice)}</strong>
          </p>
        </div>

        {/* Progress Circle Badge */}
        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 shrink-0">
          <div>
            <p className="text-2xl font-black text-emerald-400">{progressPercent}%</p>
            <p className="text-[11px] text-slate-400">
              {completedCount} of {deal.milestones.length} Milestones
            </p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-300">
            ✓
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Transaction Milestones (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Transaction Milestones & Closing Checklist</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any milestone to mark completion and synchronize with buyer, broker, and seller.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Audited Timeline
              </span>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
              {deal.milestones.map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() => handleMilestoneToggle(m.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                    m.isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                      m.isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-700 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {m.isCompleted ? '✓' : idx + 1}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-bold text-sm ${
                          m.isCompleted ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {m.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Target: {m.targetDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
                    {m.completedAt && (
                      <span className="text-[10px] text-emerald-400 font-semibold block pt-1">
                        Completed on {m.completedAt.split('T')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Participants & Commission Agreement (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Authorized Participants */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Deal Room Participants</h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold text-emerald-400">
                  Assigned Broker
                </span>
                <strong className="text-white text-sm">{deal.brokerName}</strong>
                <p className="text-slate-400 text-[11px]">TN RERA Registered Coordinator</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold text-teal-400">
                  Property Owner / Seller
                </span>
                <strong className="text-white text-sm">{deal.sellerName}</strong>
                <p className="text-slate-400 text-[11px]">Sole Title Holder</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold text-cyan-400">
                  Purchaser / Buyer
                </span>
                <strong className="text-white text-sm">{deal.buyerName}</strong>
                <p className="text-slate-400 text-[11px]">Pre-Sanctioned Home Loan</p>
              </div>
            </div>
          </div>

          {/* Transparent Commission & Revenue Accounting */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Commission Agreement</h3>
              <span className="text-emerald-400 font-bold">{deal.commissionPercentage}% Written</span>
            </div>

            <div className="space-y-2 border-y border-slate-800 py-3">
              <div className="flex justify-between text-slate-300">
                <span>Agreed Property Value:</span>
                <strong>{formatCurrency(deal.agreedPrice)}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Gross Broker Commission ({deal.commissionPercentage}%):</span>
                <strong className="text-emerald-400">₹{deal.commissionAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>NILVORA Platform Coordination Fee (10%):</span>
                <span>₹{(deal.commissionAmount * 0.1).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800 font-bold">
                <span>Net Broker Payout:</span>
                <span className="text-emerald-300">
                  ₹{(deal.commissionAmount * 0.9).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Platform revenue is derived strictly from subscription & coordination fees. Property consideration is disbursed directly between buyer and seller banking channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealRoomPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Deal Room...</div>}>
      <DealRoomContent />
    </React.Suspense>
  );
}
