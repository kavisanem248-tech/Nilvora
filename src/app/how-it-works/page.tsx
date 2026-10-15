import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Video,
  FileCheck2,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          Transaction Transparency Protocol
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">How NILVORA Works</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          The defining product experience: Discover Property → Watch Reels → Connect with Broker → Schedule Visit → Negotiate → Review Documents → Coordinate Payments → Track Registration Milestones → Complete the Deal.
        </p>
      </div>

      {/* Main Flow Diagram / Cards */}
      <div className="space-y-6">
        {[
          {
            step: '01',
            title: 'Owner Lists Property & Declares Authority',
            desc: 'The seller creates a verified listing with revenue survey numbers (Ambattur Taluk), uploads Tamil Nilam Patta documents, and selects an authorized TN RERA broker.',
            badge: 'Seller & Verification',
          },
          {
            step: '02',
            title: 'Broker Coordinates Buyer Inquiries & Reels Walkthroughs',
            desc: 'The broker manages incoming buyer leads, produces vertical 9:16 video Reels, schedules accompanied site visits, and answers municipal planning queries.',
            badge: 'Broker Collaboration',
          },
          {
            step: '03',
            title: 'Buyer Discovers & Submits Formal Offer',
            desc: 'Buyers inspect verified Trust Passports, watch realistic room-by-room video walkthroughs, and place written purchase offers through structured digital channels.',
            badge: 'Buyer Discovery',
          },
          {
            step: '04',
            title: 'Audited Deal Room & SRO Registration',
            desc: 'All parties collaborate inside the NILVORA Deal Room to verify the 30-year Encumbrance Certificate, execute bilateral sale agreements, track token advances, and finalize registration tokens on TNREGINET.',
            badge: 'Milestone Closing',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 font-black text-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                {item.step}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  {item.badge}
                </span>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Principle Section */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs text-slate-300">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Core NILVORA Trust Principles</span>
        </h3>
        <p className="leading-relaxed">
          <strong>Evidence before verification claims:</strong> We never issue generic “100% Verified” badges. Every trust badge links directly to specific inspected records (Patta, Encumbrance Certificate, Advocate report).
        </p>
        <p className="leading-relaxed">
          <strong>Server confirmation before success:</strong> Financial ledgers, booking advances, and subscription upgrades require cryptographic server and webhook validation.
        </p>
        <p className="leading-relaxed">
          <strong>Clear agreements before commission:</strong> Broker commissions are recorded explicitly in writing, protecting both sellers and transaction coordinators against sudden disputes.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/buy"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          <span>Explore Verified Listings Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
