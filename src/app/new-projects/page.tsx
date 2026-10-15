'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PropertyItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import PropertyCard from '@/components/ui/PropertyCard';
import VisitModal from '@/components/ui/VisitModal';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Download, 
  CheckCircle2, 
  Award, 
  Layers, 
  ArrowRight,
  Eye,
  KeyRound,
  Hammer
} from 'lucide-react';

function NewProjectsContent() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new_launch' | 'under_construction' | 'ready_to_move'>('all');
  const [bhkFilter, setBhkFilter] = useState<number | 'all'>('all');
  const [localityFilter, setLocalityFilter] = useState<string>('all');
  const [visitProperty, setVisitProperty] = useState<PropertyItem | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const all = nilvoraStore.getState().properties;
      // builder projects or high-rise apartments
      setProperties(all.filter((p) => p.propertyType === 'builder_project' || p.builderProjectName || p.totalFloors && p.totalFloors > 4));
    };
    update();
    const unsub = nilvoraStore.subscribe(update);
    return () => unsub();
  }, []);

  const localities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => set.add(p.locality));
    return ['all', ...Array.from(set)];
  }, [properties]);

  const filteredProjects = useMemo(() => {
    return properties.filter((p) => {
      if (localityFilter !== 'all' && p.locality !== localityFilter) return false;
      if (bhkFilter !== 'all' && p.bedrooms !== bhkFilter) return false;
      return true;
    });
  }, [properties, localityFilter, bhkFilter]);

  const handleDownloadBrochure = (projectName: string) => {
    setDownloadToast(`Brochure and Floor Plans for "${projectName}" downloaded successfully!`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-fadeIn text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative py-14 px-4 md:px-8 border-b border-slate-800 bg-gradient-to-b from-[#101B33] via-[#0F1C36] to-[#0B132B]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Building2 className="w-4 h-4" />
              TNRERA Approved Gated Enclaves & High-Rise Towers
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              New Projects & Builder Launches in <span className="text-blue-400">Ambattur & West Chennai</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
              Explore premier residential townships from leading developers like Casagrand, TVS Emerald, Appaswamy, and VGN. Transparent price sheets, verified RERA certificates, construction milestones, and direct developer pricing with zero brokerage.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% TNRERA Registered
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <KeyRound className="w-4 h-4 text-blue-400" />
                Guaranteed Possession Timelines
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award className="w-4 h-4 text-amber-400" />
                Direct Builder Priority Allocation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mega Project Spotlight */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#172642] to-[#101B33] border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                  Featured Community
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
                  RERA: TN/29/Building/0342/2024
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Casagrand Hazen — Ambattur Industrial Corridor
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Spread across 9 acres with 60+ contemporary lifestyle amenities. Features a 25,000 sq.ft clubhouse, infinity swimming pool, rooftop sports deck, EV charging stations, and dedicated work-from-home suites.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#0B132B]/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Configurations</span>
                  <strong className="text-sm text-white">2 & 3 BHK</strong>
                </div>
                <div className="bg-[#0B132B]/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Carpet Area</span>
                  <strong className="text-sm text-white">980 - 1,480 sq.ft</strong>
                </div>
                <div className="bg-[#0B132B]/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Price Range</span>
                  <strong className="text-sm text-emerald-400 font-mono">₹65 L - ₹1.10 Cr</strong>
                </div>
                <div className="bg-[#0B132B]/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Handover Date</span>
                  <strong className="text-sm text-blue-300">Dec 2026</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleDownloadBrochure('Casagrand Hazen')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  Download Brochure & Floor Plans
                </button>
                <Link
                  href="/property/prop-7"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Eye className="w-4 h-4" />
                  View Units & Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-slate-700 shadow-xl group">
                <Image
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                  alt="Casagrand Hazen High-rise community"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="text-xs font-semibold text-white bg-blue-600/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
                      Under Construction • 45% Completed
                    </span>
                    <p className="text-xs text-slate-300 mt-1">Structure complete up to 8th floor. Brickwork in progress.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 z-20 bg-[#101B33]/95 backdrop-blur-md border-y border-slate-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#172642] px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-blue-400" />
              <select
                value={localityFilter}
                onChange={(e) => setLocalityFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                <option value="all" className="bg-[#172642]">All Suburbs</option>
                {localities.filter(l => l !== 'all').map((loc) => (
                  <option key={loc} value={loc} className="bg-[#172642]">{loc}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#172642] px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400">Configuration:</span>
              <select
                value={bhkFilter}
                onChange={(e) => setBhkFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-transparent text-xs text-white focus:outline-none font-semibold"
              >
                <option value="all" className="bg-[#172642]">All BHKs</option>
                <option value="2" className="bg-[#172642]">2 BHK</option>
                <option value="3" className="bg-[#172642]">3 BHK</option>
                <option value="4" className="bg-[#172642]">4 BHK</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Displaying <strong className="text-white font-mono">{filteredProjects.length}</strong> project developments
            </span>
            <Link
              href="/calculator"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold border border-blue-500/30 transition flex items-center gap-1.5"
            >
              <span>TN Stamp Duty Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <PropertyCard
              key={project.id}
              property={project}
              onQuickVisit={(p: PropertyItem) => setVisitProperty(p)}
            />
          ))}
        </div>

        {/* Why Buy New Construction with NILVORA */}
        <div className="mt-16 bg-[#172642] border border-slate-700/80 rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Why Purchase New Construction & Builder Enclaves on NILVORA?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#101B33] p-4 rounded-xl border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-semibold text-white text-sm mb-1">RERA Escrow Verification</h4>
              <p className="text-xs text-slate-400">70% of buyer payments strictly monitored in project escrow account per TN RERA rules.</p>
            </div>
            <div className="bg-[#101B33] p-4 rounded-xl border border-slate-800">
              <Award className="w-6 h-6 text-blue-400 mb-2" />
              <h4 className="font-semibold text-white text-sm mb-1">Zero Buyer Brokerage</h4>
              <p className="text-xs text-slate-400">Purchase direct from approved developer sales inventories with no platform mark-up or hidden fees.</p>
            </div>
            <div className="bg-[#101B33] p-4 rounded-xl border border-slate-800">
              <Hammer className="w-6 h-6 text-amber-400 mb-2" />
              <h4 className="font-semibold text-white text-sm mb-1">Drone Milestones</h4>
              <p className="text-xs text-slate-400">Monthly high-resolution video and drone reels tracking structural progress, slab casting, and brickwork.</p>
            </div>
            <div className="bg-[#101B33] p-4 rounded-xl border border-slate-800">
              <KeyRound className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="font-semibold text-white text-sm mb-1">Bank Approval Matrix</h4>
              <p className="text-xs text-slate-400">Pre-sanctioned APF approval numbers from SBI, HDFC, ICICI, and Axis Bank for rapid 48-hr loan sanctions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Modal */}
      {visitProperty && (
        <VisitModal
          property={visitProperty}
          onClose={() => setVisitProperty(null)}
        />
      )}
    </div>
  );
}

export default function NewProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-white">Loading builder projects...</div>}>
      <NewProjectsContent />
    </Suspense>
  );
}
