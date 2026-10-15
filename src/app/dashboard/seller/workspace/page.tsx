'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyItem, LeadItem, AppointmentItem } from '@/types';
import { nilvoraStore } from '@/lib/store';
import {
  Building,
  Building2,
  Video,
  Eye,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Search,
  Bell,
  Settings,
  ChevronDown,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Users,
  MessageSquare,
  BarChart3,
  DollarSign,
  Share2,
  Check,
  AlertCircle,
  FileCheck,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Briefcase,
  ChevronRight,
  X,
  CreditCard,
  Lock,
} from 'lucide-react';

export default function SellerWorkspacePage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = nilvoraStore.getState();
    setProperties(state.properties);
    setLeads(state.leads);

    const unsubscribe = nilvoraStore.subscribe(() => {
      const s = nilvoraStore.getState();
      setProperties(s.properties);
      setLeads(s.leads);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalViews = properties.reduce((acc, curr) => acc + curr.viewsCount, 0);
  const activeListings = properties.filter((p) => p.status === 'published');
  const pendingApproval = 1; // 1 in moderation verification
  const totalEnquiries = leads.length > 0 ? leads.length : 18;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  // Recent enquiries data
  const recentEnquiries = [
    {
      id: 'enq-1',
      buyerName: 'Rajesh Kumar',
      propertyTitle: properties[0]?.title || 'Gated 3 BHK Luxury Villa',
      time: '12m ago',
      status: 'New',
      statusClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'enq-2',
      buyerName: 'Priya Sundaram',
      propertyTitle: properties[1]?.title || 'Modern 2 BHK Apartment',
      time: '1h ago',
      status: 'Active',
      statusClass: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'enq-3',
      buyerName: 'Anand Swaminathan',
      propertyTitle: properties[2]?.title || 'CMDA Approved Residential Plot',
      time: '3h ago',
      status: 'Follow Up',
      statusClass: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'enq-4',
      buyerName: 'Deepa Raghavan',
      propertyTitle: properties[0]?.title || 'Gated 3 BHK Luxury Villa',
      time: '5h ago',
      status: 'Active',
      statusClass: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'enq-5',
      buyerName: 'Murugan V.',
      propertyTitle: properties[3]?.title || 'Spacious 3 BHK High-Rise Flat',
      time: '1d ago',
      status: 'Closed',
      statusClass: 'bg-slate-100 text-slate-800',
    },
  ];

  // Nav items in exact order
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
    { name: 'My Properties', icon: Building, href: '#inventory' },
    { name: 'Add New Property', icon: PlusCircle, href: '/sell' },
    { name: 'Leads & Enquiries', icon: Users, href: '#leads', badge: '12' },
    { name: 'Messages', icon: MessageSquare, href: '/messages', badge: '2' },
    { name: 'Notifications', icon: Bell, href: '/notifications', badge: notificationCount > 0 ? String(notificationCount) : undefined },
    { name: 'Analytics & Reports', icon: BarChart3, href: '#analytics' },
    { name: 'Marketing Tools', icon: Megaphone, href: '/reels/studio' },
    { name: 'My Team', icon: Briefcase, href: '#team' },
    { name: 'Profile & Settings', icon: Settings, href: '#settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 flex flex-col md:flex-row selection:bg-[#315DE8] selection:text-white">
      
      {/* =========================================================================
          LEFT SIDEBAR: Fixed-width (~260px desktop) Dark Navy Shell
         ========================================================================= */}
      <aside className="w-full md:w-64 bg-[#101B33] text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4 space-y-6">
        <div className="space-y-6">
          {/* Top Brand Identity */}
          <div className="space-y-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#315DE8] to-[#7357D9] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white">NILVORA</span>
                <span className="block text-[9px] uppercase font-bold tracking-widest text-[#C9A66B]">Real Estate</span>
              </div>
            </Link>
            <p className="text-[10px] text-slate-400 font-semibold italic pl-0.5">
              Secure Today. Safer Tomorrow.
            </p>
            <div className="pt-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 block px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                Seller Portal
              </span>
            </div>
          </div>

          {/* Navigation Items (Exact 10 In Order) */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveNav(item.name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#315DE8] text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Two Bordered Cards */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          
          {/* Card 1: Listing Quality Score */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">Listing Quality Score</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                High Quality
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">94%</span>
              <span className="text-[10px] text-slate-400">Top 5% in Ambattur</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '94%' }} />
            </div>
            <button
              onClick={() => showToast('Listing quality score: All survey numbers, Patta documents, and HD media present.')}
              className="text-[10px] font-bold text-[#315DE8] hover:underline block text-left"
            >
              View Details →
            </button>
          </div>

          {/* Card 2: Active Listings with Circular Progress */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-300 block">Active Listings</span>
                <span className="text-xs text-slate-400">{activeListings.length} of {properties.length} live</span>
              </div>
              {/* Circular Progress Indicator */}
              <div className="relative w-9 h-9 flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" stroke="#1e293b" strokeWidth="3" fill="transparent" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="#315DE8"
                    strokeWidth="3"
                    strokeDasharray={88}
                    strokeDashoffset={88 - (88 * 0.85)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-white">85%</span>
              </div>
            </div>
            <a
              href="#inventory"
              className="text-[10px] font-bold text-slate-300 hover:text-white hover:underline block"
            >
              Manage Listings →
            </a>
          </div>

        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE: White / Light Blue-Gray Dashboard Container
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* TOP NAVIGATION BAR */}
        <header className="bg-white border-b border-[#D9E4F5] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties, leads, buyers, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D9E4F5] text-xs text-slate-800 bg-[#F4F7FC] placeholder-slate-400 focus:outline-none focus:border-[#315DE8] focus:bg-white transition"
            />
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* Notification Icon */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-slate-700 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </Link>

            {/* Settings Icon */}
            <a
              href="#settings"
              className="p-2 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-slate-700 transition"
              title="Portal Settings"
            >
              <Settings className="w-4 h-4" />
            </a>

            {/* User Profile & Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F4F7FC] transition border border-transparent hover:border-[#D9E4F5]"
              >
                <div className="w-8 h-8 rounded-full bg-[#101B33] text-[#C9A66B] flex items-center justify-center font-bold text-xs shadow-sm">
                  MJ
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-[#101B33] leading-tight">M. Jayaraman</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Verified Property Owner</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#D9E4F5] py-1.5 z-40 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-[#101B33]">M. Jayaraman</p>
                    <p className="text-[10px] text-slate-500">jayaraman.properties@ambattur.in</p>
                  </div>
                  <Link href="/sell" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">Post New Property</Link>
                  <Link href="/messages" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">Enquiry Messages</Link>
                  <a href="#settings" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">Account Settings</a>
                  <div className="border-t border-slate-100 mt-1">
                    <Link href="/login" className="block px-3 py-2 text-red-600 font-semibold hover:bg-red-50">Sign Out</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* =========================================================================
              SECTION 6: SELLER WELCOME AND INSIGHTS HEADER
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left: Welcome Text */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#315DE8] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                  Seller Dashboard Overview
                </span>
                <h1 className="text-2xl font-black text-[#101B33] mt-2">
                  Good morning, M. Jayaraman
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Manage your properties, track enquiries and grow your business with NILVORA.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold">Ambattur Market Active</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Assigned Broker: <strong>Senthil Kumaran</strong></span>
              </div>
            </div>

            {/* Center: Seller Performance Card */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Your Performance</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#315DE8] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="my-2">
                <span className="text-2xl font-black text-[#101B33] block">
                  {activeListings.length} Active Listings
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+14.2% MoM enquiry volume</span>
                </span>
              </div>

              <a href="#analytics" className="text-[11px] font-bold text-[#315DE8] hover:underline flex items-center gap-1">
                <span>View Full Analytics</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Right: AI Insights Card */}
            <div className="lg:col-span-3 bg-gradient-to-br from-[#101B33] to-[#172642] text-white rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A66B]">AI Insights for You</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-[#C9A66B] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed my-2">
                Properties with video Reels in Ambattur receive <strong className="text-white">3.4x more buyer site visits</strong>.
              </p>

              <Link
                href="/reels/studio"
                className="text-[11px] font-bold text-[#C9A66B] hover:underline flex items-center gap-1"
              >
                <span>Upload New Reel Now</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* =========================================================================
              SECTION 7: QUICK ACTIONS — FIVE CARDS (+ '+ New' Dropdown)
             ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Quick Actions
              </h2>

              {/* '+ New' Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                  className="px-3 py-1.5 rounded-xl bg-[#315DE8] text-white text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ New</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isNewMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#D9E4F5] py-1.5 z-40 text-xs">
                    <Link href="/sell" className="block px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold">
                      Add Property
                    </Link>
                    <Link href="/dashboard/builder" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">
                      Add Project
                    </Link>
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        showToast('Bulk CSV Upload modal activated.');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Bulk Upload
                    </button>
                    <Link href="/reels/studio" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">
                      Campaign / Reel
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Five Equal-Height Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Card 1: Add New Property */}
              <Link
                href="/sell"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Add New Property</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">List your property in minutes</span>
                </div>
              </Link>

              {/* Card 2: Manage Listings */}
              <a
                href="#inventory"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Building className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Manage Listings</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">View, edit, update listings</span>
                </div>
              </a>

              {/* Card 3: View Leads */}
              <a
                href="#leads"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Users className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">View Leads</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Check new enquiries</span>
                </div>
              </a>

              {/* Card 4: Track Performance */}
              <a
                href="#analytics"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Track Performance</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Analytics and reports</span>
                </div>
              </a>

              {/* Card 5: Builder Tools */}
              <Link
                href="/dashboard/builder"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Builder Tools</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Manage projects and units</span>
                </div>
              </Link>
            </div>
          </div>

          {/* =========================================================================
              SECTION 8: LISTINGS OVERVIEW — FIVE STATISTIC CARDS
             ========================================================================= */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Listings Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Card 1: Total Properties */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Total Properties</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#315DE8] flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">{properties.length}</strong>
                <a href="#inventory" className="text-[10px] font-bold text-[#315DE8] hover:underline mt-2 block">
                  View all
                </a>
              </div>

              {/* Card 2: Active Listings */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Active Listings</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">{activeListings.length}</strong>
                <a href="#inventory" className="text-[10px] font-bold text-[#315DE8] hover:underline mt-2 block">
                  View all
                </a>
              </div>

              {/* Card 3: Pending Approval */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Pending Approval</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">{pendingApproval}</strong>
                <button onClick={() => showToast('1 listing under Tamil Nadu RERA document audit.')} className="text-[10px] font-bold text-[#315DE8] hover:underline mt-2 block text-left">
                  View all
                </button>
              </div>

              {/* Card 4: Total Views */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Total Views</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">
                  {totalViews.toLocaleString('en-IN')}
                </strong>
                <a href="#analytics" className="text-[10px] font-bold text-[#315DE8] hover:underline mt-2 block">
                  View all
                </a>
              </div>

              {/* Card 5: Total Enquiries */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Total Enquiries</span>
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">{totalEnquiries}</strong>
                <a href="#leads" className="text-[10px] font-bold text-[#315DE8] hover:underline mt-2 block">
                  View all
                </a>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 9: MAIN DASHBOARD CONTENT — THREE-COLUMN GRID
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT: Recent Enquiries (col-span-4) */}
            <div id="leads" className="lg:col-span-4 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#315DE8]" />
                  <h3 className="font-bold text-sm text-[#101B33]">Recent Enquiries</h3>
                </div>
                <button
                  onClick={() => showToast('Displaying 5 most recent buyer enquiries.')}
                  className="text-xs font-bold text-[#315DE8] hover:underline"
                >
                  View all
                </button>
              </div>

              {/* Five Compact Enquiry Rows */}
              <div className="space-y-3">
                {recentEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="p-2.5 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#315DE8] font-bold flex items-center justify-center text-[10px] shrink-0">
                        {enq.buyerName[0]}
                      </div>
                      <div className="truncate">
                        <strong className="block text-[#101B33] text-xs truncate">{enq.buyerName}</strong>
                        <span className="block text-[10px] text-slate-500 truncate">{enq.propertyTitle}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${enq.statusClass}`}>
                        {enq.status}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">{enq.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER: Listing Performance Table (col-span-5) */}
            <div id="inventory" className="lg:col-span-5 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#315DE8]" />
                  <h3 className="font-bold text-sm text-[#101B33]">Listing Performance</h3>
                </div>
                <Link href="/sell" className="text-xs font-bold text-[#315DE8] hover:underline">
                  View all ({properties.length})
                </Link>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2">Property</th>
                      <th className="pb-2 text-center">Views</th>
                      <th className="pb-2 text-center">Enquiries</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.slice(0, 4).map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={prop.images[0]}
                              alt={prop.title}
                              className="w-10 h-8 rounded-lg object-cover shrink-0"
                            />
                            <div className="truncate max-w-[140px]">
                              <strong className="block text-xs text-[#101B33] truncate">{prop.title}</strong>
                              <span className="text-[10px] text-slate-500">{prop.locality}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-bold text-slate-700">
                          {prop.viewsCount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 text-center font-bold text-blue-600">
                          {Math.max(3, Math.round(prop.viewsCount / 85))}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: Seller Advantages (col-span-3) */}
            <div className="lg:col-span-3 bg-blue-50/60 rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#315DE8] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#101B33]">Your Seller Advantages</h3>
                  <span className="text-[10px] text-slate-500">NILVORA verified seller perks</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#101B33] block">Verified Buyer Network</strong>
                    <span className="text-[11px] text-slate-600">Pre-qualified buyers with confirmed identity.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#101B33] block">AI-Powered Lead Matching</strong>
                    <span className="text-[11px] text-slate-600">Matches buyers seeking your exact BHK & locality.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#101B33] block">Marketing & Promotion</strong>
                    <span className="text-[11px] text-slate-600">Free vertical Reels hosting & social boost.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#101B33] block">Secure Transaction Flow</strong>
                    <span className="text-[11px] text-slate-600">Token deposit protection via regulated escrow.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#101B33] block">Dedicated Support</strong>
                    <span className="text-[11px] text-slate-600">Assigned Chennai area broker coordination.</span>
                  </div>
                </div>
              </div>

              <Link
                href="/sell"
                className="w-full py-2 px-3 rounded-xl bg-[#315DE8] text-white text-xs font-bold text-center block hover:bg-blue-600 transition"
              >
                Promote Another Listing →
              </Link>
            </div>

          </div>

          {/* =========================================================================
              SECTION 10: LOWER FEATURE GRID — EXACT 10 CARDS (5 Columns x 2 Rows)
             ========================================================================= */}
          <div className="pt-6 border-t border-[#D9E4F5] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#315DE8] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                  Seller Feature Architecture
                </span>
                <h2 className="text-xl font-black text-[#101B33] mt-2">
                  Comprehensive Seller & Owner Operations
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                All 10 modules connected to NILVORA server APIs
              </span>
            </div>

            {/* 10-Card Grid in Exact Reference Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
              
              {/* -------------------------------------------------------------
                  CARD 1: Property Management
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    <Building className="w-4 h-4 text-[#315DE8]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Property Management</h3>
                    <p className="text-[10px] text-slate-500">Inventory & listing controls</p>
                  </div>

                  {/* Compact Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Total: {properties.length} Properties</span>
                      <span className="text-emerald-600">Active</span>
                    </div>
                    <span className="text-slate-500 block truncate">Recent: {properties[0]?.title}</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Add, edit, manage listings</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Upload photos & videos</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Price & amenities setting</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Listing quality audit</li>
                  </ul>
                </div>

                <Link
                  href="/sell"
                  className="w-full py-1.5 px-3 rounded-lg bg-[#315DE8] text-white text-[11px] font-bold text-center block hover:bg-blue-600 transition"
                >
                  Manage Properties →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 2: Lead Management
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Lead Management</h3>
                    <p className="text-[10px] text-slate-500">Pipeline & CRM tracking</p>
                  </div>

                  {/* Compact CRM Pipeline */}
                  <div className="grid grid-cols-4 gap-1 p-1.5 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-center text-[9px]">
                    <div>
                      <strong className="block text-blue-600">12</strong>
                      <span className="text-slate-500">New</span>
                    </div>
                    <div>
                      <strong className="block text-amber-600">7</strong>
                      <span className="text-slate-500">Qual</span>
                    </div>
                    <div>
                      <strong className="block text-teal-600">4</strong>
                      <span className="text-slate-500">Visit</span>
                    </div>
                    <div>
                      <strong className="block text-emerald-600">2</strong>
                      <span className="text-slate-500">Offer</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Track genuine enquiries</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Source analytics</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Follow-up reminders</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Convert leads to offers</li>
                  </ul>
                </div>

                <a
                  href="#leads"
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  View Leads →
                </a>
              </div>

              {/* -------------------------------------------------------------
                  CARD 3: Marketing & Promotion
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                    <Megaphone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Marketing & Promotion</h3>
                    <p className="text-[10px] text-slate-500">Reels & campaign tools</p>
                  </div>

                  {/* Compact Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-slate-700">Reels Boost</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold text-[9px]">Active</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Featured listings highlight</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Vertical Reels player</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Social media campaigns</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Campaign ROI analytics</li>
                  </ul>
                </div>

                <Link
                  href="/reels/studio"
                  className="w-full py-1.5 px-3 rounded-lg bg-purple-600 text-white text-[11px] font-bold text-center block hover:bg-purple-700 transition"
                >
                  Create Campaign →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 4: Analytics & Reports
                 ------------------------------------------------------------- */}
              <div id="analytics" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Analytics & Reports</h3>
                    <p className="text-[10px] text-slate-500">Views, enquiries, trends</p>
                  </div>

                  {/* Compact Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Conversion Rate:</span>
                      <strong className="text-emerald-600 font-bold">4.8%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg. Days to Offer:</span>
                      <strong className="text-slate-800">18 Days</strong>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Listing view analytics</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Ambattur price benchmarks</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Competitive comparison</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Exportable PDF reports</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Listing analytics report compiled for current month.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 text-white text-[11px] font-bold text-center block hover:bg-blue-700 transition"
                >
                  View Reports →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 5: Team & Collaboration
                 ------------------------------------------------------------- */}
              <div id="team" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">5</span>
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Team & Collaboration</h3>
                    <p className="text-[10px] text-slate-500">Broker & staff coordination</p>
                  </div>

                  {/* Compact Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] flex items-center gap-2 text-[10px]">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                      SK
                    </div>
                    <div className="truncate">
                      <strong className="block text-slate-800 truncate">Senthil Kumaran</strong>
                      <span className="text-slate-500 block text-[9px]">Ambattur Prime Realty</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Area broker assignment</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Role-based permission controls</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Shared enquiry dispatch</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Audit log tracking</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Broker Senthil Kumaran is assigned to your Ambattur properties.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 text-white text-[11px] font-bold text-center block hover:bg-indigo-700 transition"
                >
                  Manage Team →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 6: Notifications
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">6</span>
                    <Bell className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Notifications</h3>
                    <p className="text-[10px] text-slate-500">Alerts & event triggers</p>
                  </div>

                  {/* Compact Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>Unread: {notificationCount} alerts</span>
                      <button onClick={() => { setNotificationCount(0); showToast('All notifications marked read.'); }} className="text-[#315DE8] hover:underline text-[9px]">
                        Mark Read
                      </button>
                    </div>
                    <span className="text-slate-500 block truncate">• New buyer enquiry from Rajesh</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> Enquiry notifications</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> Property approval updates</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> Offer counter notifications</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> System security alerts</li>
                  </ul>
                </div>

                <Link
                  href="/notifications"
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800 text-white text-[11px] font-bold text-center block hover:bg-slate-700 transition"
                >
                  View All Notifications →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 7: Revenue & Commission (Strict Financial Separation!)
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">7</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Revenue & Commission</h3>
                    <p className="text-[10px] text-slate-500">Transparent financial ledger</p>
                  </div>

                  {/* Separated Financial Ledger Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Deal Value:</span>
                      <strong className="text-slate-800">₹1.00 Cr</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seller Net Proceeds:</span>
                      <strong className="text-emerald-700">₹98.50 L</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Broker Commission (1.5%):</span>
                      <strong className="text-blue-700">₹1.50 L</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span className="text-slate-500 font-semibold">Platform Fee (10%):</span>
                      <strong className="text-purple-700">₹15,000</strong>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Platform vs seller segregation</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Broker commission split</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> GST compliant invoicing</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Payout reconciliation</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Displaying segregated transaction ledger.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  View Revenue Ledger →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 8: Account & Access
                 ------------------------------------------------------------- */}
              <div id="settings" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">8</span>
                    <Lock className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Account & Access</h3>
                    <p className="text-[10px] text-slate-500">Security & payout settings</p>
                  </div>

                  {/* Compact Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Payout:</span>
                      <strong className="text-slate-700 font-mono">HDFC ****4821</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">DPDP Consent:</span>
                      <span className="text-emerald-600 font-bold">Consented</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block truncate">2FA: SMS OTP Active</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> Bank details & payouts</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> Password & OTP security</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> DPDP privacy compliance</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> Profile information update</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Opening seller account preferences.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold text-center block hover:bg-slate-800 transition"
                >
                  Account Settings →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 9: Property Verification
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">9</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Property Verification</h3>
                    <p className="text-[10px] text-slate-500">Document vault & audit</p>
                  </div>

                  {/* Compact Preview */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document Vault:</span>
                      <strong className="text-emerald-700">4 Docs Uploaded</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Legal Due Diligence:</span>
                      <span className="text-blue-600 font-bold">Passed</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Patta / Chitta vault</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Sub-registrar EC status</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> RERA registration proof</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Bank loan pre-eligibility</li>
                  </ul>
                </div>

                <Link
                  href="/verification"
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  View Verification →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 10: Final NILVORA Seller Portal CTA Card
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-[#101B33] text-white border border-slate-700 flex flex-col justify-between space-y-3 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#315DE8] to-[#7357D9] flex items-center justify-center">
                      <Building className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A66B] px-2 py-0.2 rounded bg-[#C9A66B]/10 border border-[#C9A66B]/20">
                      Seller Network
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-white">List. Manage. Grow.</h3>
                    <p className="text-[11px] text-blue-400 font-semibold mt-0.5">Your property. Our platform.</p>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Showcase your property to thousands of active, verified buyers in Ambattur & West Chennai.
                  </p>
                </div>

                <Link
                  href="/sell"
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#C9A66B] to-[#DFBA7F] hover:from-[#DFBA7F] hover:to-[#C9A66B] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition"
                >
                  <span>Add Your Property</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
