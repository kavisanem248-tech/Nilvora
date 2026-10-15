'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { nilvoraStore } from '@/lib/store';
import { UserRole } from '@/types';
import {
  Building2,
  Video,
  FileCheck,
  Compass,
  Calculator,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  Scale,
  LandPlot,
  Building,
  TrendingUp,
  LogIn,
} from 'lucide-react';

const ROLES: { key: UserRole; label: string; icon: string; dashboard: string }[] = [
  { key: 'buyer', label: 'Buyer', icon: '🏡', dashboard: '/dashboard/buyer' },
  { key: 'seller', label: 'Seller', icon: '🔑', dashboard: '/dashboard/seller' },
  { key: 'broker', label: 'Broker / Agent', icon: '💼', dashboard: '/dashboard/broker' },
  { key: 'builder', label: 'Builder / Developer', icon: '🏗️', dashboard: '/dashboard/builder' },
  { key: 'legal_pro', label: 'Legal Professional', icon: '⚖️', dashboard: '/dashboard/professional' },
  { key: 'admin', label: 'Super Admin', icon: '🛡️', dashboard: '/dashboard/admin' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('buyer');

  useEffect(() => {
    const unsubscribe = nilvoraStore.subscribe(() => {
      const state = nilvoraStore.getState();
      setCurrentRole(state.currentRole);
    });
    const state = nilvoraStore.getState();
    setCurrentRole(state.currentRole);
    return () => unsubscribe();
  }, []);

  const activeRoleObj = ROLES.find((r) => r.key === currentRole) || ROLES[0];

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 text-black shadow-[0_8px_28px_rgba(0,0,0,0.1)] backdrop-blur-md">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between">
          {/* Brand Logo with Tagline */}
          <Link href="/" className="flex flex-col items-start gap-1 group shrink-0">
            <span className="text-[10px] leading-none font-semibold text-black/60">
              Your Dream Property. Our Priority.
            </span>
            <div className="flex items-center gap-2.5">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-white/20 bg-white shadow-lg shadow-white/10 group-hover:scale-105 transition">
                <Image src="/logo.jpg" alt="NILVORA logo" fill className="object-cover" priority />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-black transition">
                  NILVORA
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/5 text-black border border-black/10">
                  AI Real Estate
                </span>
              </div>
            </div>
          </Link>

          <nav className="navbar-nav-3d hidden xl:flex items-center gap-1 text-xs font-semibold">
            <Link
              href="/buy"
              className={`px-2.5 py-1.5 rounded-lg transition ${
                pathname === '/buy' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Buy
            </Link>
            <Link
              href="/rent"
              className={`px-2.5 py-1.5 rounded-lg transition ${
                pathname === '/rent' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Rent
            </Link>
            <Link
              href="/commercial"
              className={`px-2.5 py-1.5 rounded-lg transition ${
                pathname === '/commercial' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Commercial
            </Link>
            <Link
              href="/plots"
              className={`px-2.5 py-1.5 rounded-lg transition ${
                pathname === '/plots' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Sites
            </Link>
            <Link
              href="/new-projects"
              className={`px-2.5 py-1.5 rounded-lg transition ${
                pathname === '/new-projects' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              New Projects
            </Link>
            <Link
              href="/reels"
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                pathname === '/reels' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reels</span>
              <span className="text-[8px] bg-red-500 text-white font-bold px-1 rounded-full animate-pulse">
                Live
              </span>
            </Link>
            <Link
              href="/compare"
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                pathname === '/compare' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Compare Shortlisted Properties"
            >
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Compare</span>
            </Link>
            <Link
              href="/investment"
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                pathname === '/investment' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="ROI & Rental Yield Calculator"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Investment</span>
            </Link>
            <Link
              href="/brokers"
              className={`px-2.5 py-1.5 rounded-lg transition ${
                pathname === '/brokers' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Brokers
            </Link>
            <Link
              href="/document-intelligence"
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                pathname === '/document-intelligence' ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Doc OCR</span>
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex items-center xl:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-black/10 bg-white p-2 text-black shadow-[0_3px_0_#d8d8d8,0_8px_14px_rgba(0,0,0,0.1)] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Main action buttons sit below the brand row */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-black/10 py-3">
          <Link
            href="/sell"
            className="navbar-action-3d"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>List Property</span>
          </Link>

          <Link
            href={activeRoleObj.dashboard}
            className="navbar-action-3d navbar-action-primary"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{activeRoleObj.label} Portal</span>
          </Link>

          <Link
            href="/login"
            className="navbar-action-3d"
            title="Sign In / Register"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden space-y-3 border-b border-black/10 bg-white px-4 pt-3 pb-6">
          <div className="mobile-nav-grid grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200"
            >
              Buy Homes
            </Link>
            <Link
              href="/rent"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200"
            >
              Rent Residences
            </Link>
            <Link
              href="/commercial"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200"
            >
              Commercial IT/Offices
            </Link>
            <Link
              href="/plots"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200"
            >
              CMDA & DTCP Sites
            </Link>
            <Link
              href="/new-projects"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200"
            >
              New Builder Projects
            </Link>
            <Link
              href="/reels"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-emerald-300 flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              Property Reels
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-cyan-300 flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              Compare Homes
            </Link>
            <Link
              href="/investment"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-amber-300 flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Investment Yield
            </Link>
            <Link
              href="/document-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-teal-300 flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Doc OCR Scanner
            </Link>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200 flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              TN Calculator
            </Link>
            <Link
              href="/brokers"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200"
            >
              Find a Broker
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 rounded-xl bg-slate-800 text-slate-200 text-center font-semibold"
            >
              Messages
            </Link>
            <Link
              href="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 rounded-xl bg-slate-800 text-slate-200 text-center font-semibold"
            >
              Alerts
            </Link>
          </div>

        </div>
      )}
    </header>
  );
};
