import React from 'react';
import Link from 'next/link';
import { Building2, Award, Users, BookOpen, MapPin, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          Company Mission & Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">About NILVORA</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Pioneering AI-Powered Real Estate Discovery, Document Intelligence, and Broker-First Coordination in Chennai, Tamil Nadu.
        </p>
      </div>

      {/* Origin & Geography */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span>Rooted in Ambattur & West Chennai</span>
        </h2>
        <p>
          NILVORA was architected to solve the pervasive challenges of Indian real-estate transactions: ambiguous revenue title records, unverified online advances, and lack of accountability between sellers, agents, and purchasers.
        </p>
        <p>
          Starting from the vibrant industrial and residential corridors of Ambattur, Mogappair, Anna Nagar West, Korattur, and Avadi, our platform implements structured, evidence-backed verification. Rather than replacing local real estate brokers with impersonal aggregators, NILVORA empowers licensed Tamil Nadu RERA brokers with AI Copilots, vertical Reels discovery, and collaborative Deal Rooms.
        </p>
      </div>

      {/* Academic Domain Linkage (Section 29 of prompt) */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/30 space-y-4 text-xs sm:text-sm text-slate-300 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <span>Academic Domain: Skill Gap & Youth Employability</span>
        </div>
        <h3 className="text-xl font-bold text-white">Vocational Real Estate Career Pathway</h3>
        <p className="leading-relaxed">
          While NILVORA functions as a production real-estate marketplace, it anchors its academic core in <strong>Youth Employability and Skill Gap reduction</strong>. The Indian property sector employs millions of informal workers with minimal formal training in land revenue law, town planning, digital surveying, or escrow settlement.
        </p>
        <p className="leading-relaxed">
          We are developing a modular vocational module offering internships, certified training in Tamil Nilam Patta mutation, TSLR interpretation, CMDA building rules, and digital transaction coordination to equip young graduates for high-demand careers in organized prop-tech and asset management.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/buy"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition"
        >
          <span>Discover Verified Properties</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
