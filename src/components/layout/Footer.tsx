'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail, Award, AlertCircle, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer-3d text-xs text-black sm:text-sm">
      {/* Top Banner - Tagline & Compliance */}
      <div className="border-b border-black/10 bg-[#f3f3f1] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-bold text-base">NILVORA</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Your Dream Property. Our Priority.
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                Connecting genuine buyers, property owners, and certified TN RERA brokers through verified revenue records, vertical video Reels, and transparent Deal Rooms.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <Award className="w-4 h-4 text-emerald-400" />
              TN RERA Aligned
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <MapPin className="w-4 h-4 text-teal-400" />
              Ambattur & Chennai First
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: About Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-[#315DE8] flex items-center justify-center text-slate-950 font-black text-lg">
                N
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">NILVORA</span>
                <p className="text-[10px] text-slate-400 font-medium">Your Dream Property. Our Priority.</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Enterprise-grade real estate ecosystem pioneering smart property verification, vertical Reels discovery, broker-first collaboration, and digital transaction assistance across Chennai, Tamil Nadu.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="text-white font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Academic & Employability Alignment</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Anchored in the academic domain of <strong>Skill Gap and Youth Employability</strong>. Offering vocational career pathways in real estate transactions, digital surveying, and land revenue coordination.
              </p>
            </div>
          </div>

          {/* Col 2: Core Market Portals */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider">
              Properties
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/buy" className="hover:text-emerald-400 transition">
                  Buy Residential Properties
                </Link>
              </li>
              <li>
                <Link href="/rent" className="hover:text-emerald-400 transition">
                  Rent Homes & Apartments
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="hover:text-emerald-400 transition">
                  Commercial Offices & IT Parks
                </Link>
              </li>
              <li>
                <Link href="/plots" className="hover:text-emerald-400 transition">
                  CMDA & DTCP Approved Sites
                </Link>
              </li>
              <li>
                <Link href="/new-projects" className="hover:text-emerald-400 transition">
                  New Builder Launches
                </Link>
              </li>
              <li>
                <Link href="/reels" className="hover:text-emerald-400 transition">
                  Property Video Reels
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-emerald-400 transition text-emerald-400 font-semibold">
                  + List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tools & Intelligence */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider">
              Tools & Intelligence
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/compare" className="hover:text-emerald-400 transition">
                  Property Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/investment" className="hover:text-emerald-400 transition">
                  ROI & Rental Yield Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-emerald-400 transition">
                  TN Stamp Duty Calculator (7%+2%)
                </Link>
              </li>
              <li>
                <Link href="/document-intelligence" className="hover:text-emerald-400 transition">
                  AI Document OCR Screening
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-emerald-400 transition">
                  AI Property Matchmaker
                </Link>
              </li>
              <li>
                <Link href="/brokers" className="hover:text-emerald-400 transition">
                  Find a Verified Broker
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition">
                  Broker Plans & Listing Boosts
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Safety & Grievance */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider">
              Trust & Grievance
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/safety" className="hover:text-emerald-400 transition">
                  Safety & Anti-Fraud Guide
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition">
                  How NILVORA Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition">
                  About Us & Mission
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition">
                  Privacy Policy (DPDP 2023)
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                <span className="font-semibold text-slate-300">Grievance Officer:</span>
                <br />
                Adv. M. Balaji, Legal & Compliance
                <br />
                Ambattur, Chennai 600053
                <br />
                Email: grievance@nilvora.in
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NILVORA Technologies India. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 max-w-xl text-center md:text-right">
            Disclaimer: Property listings and AI document analyses are informational. NILVORA is a marketplace platform and does not provide legal title warranties. Parties must conduct independent advocate verification before registering conveyances.
          </p>
        </div>
      </div>
    </footer>
  );
};
