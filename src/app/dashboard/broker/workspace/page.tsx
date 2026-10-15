'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyItem, LeadItem, AppointmentItem, CommissionRecord, LeadStatus } from '@/types';
import { nilvoraStore } from '@/lib/store';
import {
  Building,
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  Filter,
  PlusCircle,
  Tag,
  Search,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  FileCheck,
  Check,
  X,
  Lock,
  Layers,
  Award,
  Compass,
  Megaphone,
  UserCheck,
  LayoutDashboard,
  ExternalLink,
  MapPin,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export default function BrokerWorkspacePage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [activeNav, setActiveNav] = useState('Broker Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('Ambattur & West Chennai');
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = nilvoraStore.getState();
    setProperties(state.properties);
    setLeads(state.leads);
    setAppointments(state.appointments);
    setCommissions(state.commissions);

    const unsubscribe = nilvoraStore.subscribe(() => {
      const s = nilvoraStore.getState();
      setProperties(s.properties);
      setLeads(s.leads);
      setAppointments(s.appointments);
      setCommissions(s.commissions);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    nilvoraStore.updateLeadStatus(leadId, newStatus);
    showToast(`Lead status updated to ${newStatus.replace('_', ' ')}.`);
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  // Commission calculations
  const totalCommissionEarned = commissions
    .filter((c) => c.status === 'paid' || c.status === 'invoiced')
    .reduce((acc, curr) => acc + curr.netBrokerCommission, 0);

  // Broker specific leads data (e.g. Senthil Kumaran's portfolio)
  const clientLeads = [
    {
      id: 'lead-1',
      name: 'Rajesh Kumar',
      property: properties[0]?.title || 'Gated 3 BHK Luxury Villa',
      source: 'NILVORA Direct Web',
      time: '15m ago',
      stage: 'qualified',
      stageLabel: 'Qualified',
      stageColor: 'bg-cyan-100 text-cyan-800',
      followUp: 'Call at 04:00 PM today',
      budget: '₹1.10 - ₹1.25 Cr',
    },
    {
      id: 'lead-2',
      name: 'Karthik Subburaj',
      property: properties[1]?.title || 'Modern 2 BHK Apartment',
      source: 'Verified Buyer Search',
      time: '1h ago',
      stage: 'visit_scheduled',
      stageLabel: 'Site Visit',
      stageColor: 'bg-amber-100 text-amber-800',
      followUp: 'Site visit booked for Oct 20',
      budget: '₹50 - ₹65 Lakhs',
    },
    {
      id: 'lead-3',
      name: 'Priya Sundaram',
      property: properties[2]?.title || 'CMDA Approved Plot',
      source: 'Property Reels Tour',
      time: '3h ago',
      stage: 'contacted',
      stageLabel: 'Contacted',
      stageColor: 'bg-blue-100 text-blue-800',
      followUp: 'Share Patta & survey plan',
      budget: '₹1.20 - ₹1.40 Cr',
    },
    {
      id: 'lead-4',
      name: 'Dr. Arunachalam',
      property: properties[3]?.title || 'Spacious 3 BHK High-Rise Flat',
      source: 'Ambattur WhatsApp Channel',
      time: '5h ago',
      stage: 'negotiation',
      stageLabel: 'Negotiation',
      stageColor: 'bg-purple-100 text-purple-800',
      followUp: 'Reviewing seller counter-offer',
      budget: '₹1.80 - ₹2.00 Cr',
    },
    {
      id: 'lead-5',
      name: 'Deepa Raghavan',
      property: properties[0]?.title || 'Gated 3 BHK Luxury Villa',
      source: 'Broker Referral',
      time: '1d ago',
      stage: 'new',
      stageLabel: 'New Inquiry',
      stageColor: 'bg-emerald-100 text-emerald-800',
      followUp: 'Initial intro call scheduled',
      budget: '₹1.15 Cr',
    },
  ];

  // Property matching recommendations
  const matchedProperties = properties.slice(0, 4);

  // Exact 14 Navigation items in order
  const navItems = [
    { name: 'Broker Dashboard', icon: LayoutDashboard, href: '#dashboard' },
    { name: 'Property Marketplace', icon: Compass, href: '/buy' },
    { name: 'My Listings', icon: Building, href: '#listings' },
    { name: 'Leads & Clients', icon: Users, href: '#leads', badge: '14' },
    { name: 'Buyer Matching', icon: Sparkles, href: '#matching' },
    { name: 'Site Visits', icon: Calendar, href: '#visits', badge: '6' },
    { name: 'Offers & Negotiations', icon: Tag, href: '#offers' },
    { name: 'Messages', icon: MessageSquare, href: '/messages', badge: '2' },
    { name: 'Notifications', icon: Bell, href: '/notifications', badge: notificationCount > 0 ? String(notificationCount) : undefined },
    { name: 'Commission & Earnings', icon: DollarSign, href: '#commission' },
    { name: 'Analytics & Reports', icon: BarChart3, href: '#analytics' },
    { name: 'Marketing Tools', icon: Megaphone, href: '/reels/studio' },
    { name: 'Team & Referrals', icon: UserCheck, href: '#team' },
    { name: 'Profile & Settings', icon: Settings, href: '/login' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 flex flex-col md:flex-row selection:bg-[#315DE8] selection:text-white">
      
      {/* =========================================================================
          LEFT SIDEBAR: Fixed-width (~260px desktop) Dark Navy Shell
         ========================================================================= */}
      <aside className="w-full md:w-64 bg-[#101B33] text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4 space-y-6">
        <div className="space-y-5">
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
              Your Dream Property. Our Priority.
            </p>
            <div className="pt-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 block px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                Broker Portal
              </span>
            </div>
          </div>

          {/* Navigation Items (Exact 14 in Order) */}
          <nav className="space-y-1 max-h-[52vh] overflow-y-auto pr-1 no-scrollbar">
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
          
          {/* Card 1: TN RERA Verification */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">TN RERA Agent License</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400">
                Verified
              </span>
            </div>
            <p className="text-xs font-mono text-white font-bold">TN/AGENT/0491/2021</p>
            <p className="text-[10px] text-slate-400">Ambattur Prime Realty Services</p>
            <button
              onClick={() => showToast('Licensed TN RERA Broker: Senthil Kumaran. Expiry: 2028.')}
              className="text-[10px] font-bold text-[#315DE8] hover:underline block pt-1"
            >
              View License Details →
            </button>
          </div>

          {/* Card 2: Active Broker Pipeline Progress */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-300 block">Active Pipeline</span>
                <span className="text-[10px] text-slate-400">4 Deals in Escrow</span>
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
                    strokeDashoffset={88 - (88 * 0.78)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-white">78%</span>
              </div>
            </div>
            <Link
              href={`/deal-room/${commissions[0]?.dealRoomId || 'deal-1'}`}
              className="text-[10px] font-bold text-slate-300 hover:text-white hover:underline block"
            >
              Open Active Deal Room →
            </Link>
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
              placeholder="Search clients, properties, leads, or site visits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D9E4F5] text-xs text-slate-800 bg-[#F4F7FC] placeholder-slate-400 focus:outline-none focus:border-[#315DE8] focus:bg-white transition"
            />
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* Location Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-xs font-semibold text-[#172642]">
              <MapPin className="w-3.5 h-3.5 text-[#315DE8]" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#172642] focus:outline-none cursor-pointer"
              >
                <option value="Ambattur & West Chennai">Ambattur & West Chennai</option>
                <option value="Mogappair & Nolambur">Mogappair & Nolambur</option>
                <option value="Anna Nagar West">Anna Nagar West</option>
              </select>
            </div>

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
              title="Broker Settings"
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
                  SK
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-[#101B33] leading-tight">Senthil Kumaran</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Licensed TN RERA Broker</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#D9E4F5] py-1.5 z-40 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-[#101B33]">Senthil Kumaran</p>
                    <p className="text-[10px] text-slate-500">TN/AGENT/0491/2021</p>
                  </div>
                  <Link href="/sell" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">Post Client Property</Link>
                  <Link href="/messages" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">Client Messages</Link>
                  <a href="#commission" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">Commission Ledger</a>
                  <div className="border-t border-slate-100 mt-1">
                    <Link href="/login" className="block px-3 py-2 text-red-600 font-semibold hover:bg-red-50">Sign Out</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BROKER CONTENT AREA */}
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
              SECTION 8: BROKER WELCOME AND INSIGHTS HEADER
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left: Welcome Text */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#315DE8] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                  Broker Partner Hub • Ambattur & West Chennai
                </span>
                <h1 className="text-2xl font-black text-[#101B33] mt-2">
                  Welcome back, Senthil Kumaran
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Manage your clients, match properties, track negotiations, and grow your business with NILVORA.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold">RERA Active (TN/AGENT/0491/2021)</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Assigned Territory: <strong>Ambattur OT & Industrial Estate</strong></span>
              </div>
            </div>

            {/* Center: Broker Performance Card */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Your Performance</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#315DE8] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="my-2">
                <span className="text-2xl font-black text-[#101B33] block">
                  14 Active Leads
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% lead conversion this month</span>
                </span>
              </div>

              <a href="#analytics" className="text-[11px] font-bold text-[#315DE8] hover:underline flex items-center gap-1">
                <span>View Full Reports</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Right: AI Insights Card */}
            <div className="lg:col-span-3 bg-gradient-to-br from-[#101B33] to-[#172642] text-white rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A66B]">AI Lead Matchmaker</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-[#C9A66B] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed my-2">
                3 pre-qualified buyers in Ambattur OT are actively searching for <strong className="text-white">3BHK villas within ₹1.2 Cr</strong>.
              </p>

              <a
                href="#matching"
                className="text-[11px] font-bold text-[#C9A66B] hover:underline flex items-center gap-1"
              >
                <span>View Matching Properties</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* =========================================================================
              SECTION 9: BROKER QUICK ACTIONS (Five Equal-Height Cards + '+ New' Menu)
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
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        showToast('New client intake form ready.');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      New Client / Lead
                    </button>
                    <a
                      href="#visits"
                      onClick={() => setIsNewMenuOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Schedule Site Visit
                    </a>
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        showToast('Enquiry follow-up reminder logged.');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      New Enquiry Follow-up
                    </button>
                    <Link
                      href="/reels/studio"
                      onClick={() => setIsNewMenuOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Create Campaign / Reel
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Five Equal-Height Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Card 1: Find Properties */}
              <Link
                href="/buy"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Compass className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Find Properties</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Search inventory & marketplace</span>
                </div>
              </Link>

              {/* Card 2: Add or Manage Listing */}
              <Link
                href="/sell"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Building className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Add or Manage Listing</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Post or update listings</span>
                </div>
              </Link>

              {/* Card 3: Add Client / Lead */}
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
                  <strong className="text-xs font-bold text-[#101B33] block">Add Client / Lead</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Capture buyer requirements</span>
                </div>
              </a>

              {/* Card 4: Schedule Site Visit */}
              <a
                href="#visits"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Schedule Site Visit</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Book accompanied tour</span>
                </div>
              </a>

              {/* Card 5: Track Commission */}
              <a
                href="#commission"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Track Commission</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Inspect earned payouts</span>
                </div>
              </a>
            </div>
          </div>

          {/* =========================================================================
              SECTION 10: BROKER STATISTICS (Five Compact Summary Cards)
             ========================================================================= */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Brokerage Key Metrics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Card 1: Assigned Leads */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Assigned Leads</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#315DE8] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">14</strong>
                <span className="text-[10px] text-emerald-600 font-bold mt-2 block">+2 new today</span>
              </div>

              {/* Card 2: Active Clients */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Active Clients</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">8</strong>
                <span className="text-[10px] text-slate-400 mt-2 block">Active search mode</span>
              </div>

              {/* Card 3: Upcoming Site Visits */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Site Visits</span>
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">6</strong>
                <span className="text-[10px] text-teal-600 font-bold mt-2 block">2 visits scheduled today</span>
              </div>

              {/* Card 4: Active Negotiations */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Active Negotiations</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">3</strong>
                <Link href={`/deal-room/${commissions[0]?.dealRoomId || 'deal-1'}`} className="text-[10px] text-[#315DE8] hover:underline font-bold mt-2 block">
                  Open Deal Room →
                </Link>
              </div>

              {/* Card 5: Commission Earned */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Commission Earned</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">
                  ₹4.85 L
                </strong>
                <a href="#commission" className="text-[10px] font-bold text-[#315DE8] hover:underline mt-2 block">
                  View breakdown →
                </a>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 11: BROKER MAIN DASHBOARD — THREE-COLUMN GRID
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT: Recent Leads & Clients (col-span-4) */}
            <div id="leads" className="lg:col-span-4 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#315DE8]" />
                  <h3 className="font-bold text-sm text-[#101B33]">Recent Leads & Clients</h3>
                </div>
                <button
                  onClick={() => showToast('Displaying 5 active buyer leads assigned to Senthil Kumaran.')}
                  className="text-xs font-bold text-[#315DE8] hover:underline"
                >
                  View all ({clientLeads.length})
                </button>
              </div>

              {/* Compact Client Rows */}
              <div className="space-y-3">
                {clientLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-[#315DE8] font-bold flex items-center justify-center text-[10px]">
                          {lead.name[0]}
                        </div>
                        <div>
                          <strong className="text-slate-900 block text-xs">{lead.name}</strong>
                          <span className="text-[10px] text-slate-500">{lead.source}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${lead.stageColor}`}>
                        {lead.stageLabel}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                      <p className="font-semibold text-slate-800 truncate">Target: {lead.property}</p>
                      <p className="text-[10px] text-slate-500">Budget: {lead.budget}</p>
                      <p className="text-[10px] text-blue-600 font-semibold mt-0.5">⚡ {lead.followUp}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="text-[10px] py-1 px-1.5 rounded border border-slate-300 bg-white text-slate-700"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="visit_scheduled">Visit Scheduled</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                      </select>

                      <Link
                        href="/messages"
                        className="text-[10px] font-bold text-[#315DE8] hover:underline flex items-center gap-1"
                      >
                        <span>Chat</span>
                        <MessageSquare className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER: Property Matching & Performance (col-span-5) */}
            <div id="matching" className="lg:col-span-5 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-[#101B33]">Buyer Matching & Inventory</h3>
                </div>
                <Link href="/buy" className="text-xs font-bold text-[#315DE8] hover:underline">
                  Browse All ({properties.length})
                </Link>
              </div>

              {/* Matched Property Cards */}
              <div className="space-y-3">
                {matchedProperties.map((prop, idx) => {
                  const matchScores = [96, 92, 89, 94];
                  const matchedClient = ['Rajesh Kumar', 'Karthik Subburaj', 'Priya Sundaram', 'Dr. Arunachalam'][idx];
                  return (
                    <div
                      key={prop.id}
                      className="p-3 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] flex items-center justify-between gap-3 text-xs hover:border-[#315DE8] transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-12 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="max-w-[170px] truncate">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#101B33] text-white">
                              {matchScores[idx]}% Match
                            </span>
                            <span className="text-[10px] text-blue-600 font-bold uppercase">{prop.propertyType}</span>
                          </div>
                          <strong className="block text-xs text-[#101B33] truncate">{prop.title}</strong>
                          <span className="text-[10px] text-slate-500">{prop.locality} • {formatCurrency(prop.price)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 block">Matches:</span>
                        <strong className="text-[11px] text-[#101B33] block">{matchedClient}</strong>
                        <button
                          onClick={() => showToast(`Sent ${prop.title} brochure to ${matchedClient}.`)}
                          className="mt-1 px-2 py-0.5 rounded bg-[#315DE8] text-white text-[9px] font-bold hover:bg-blue-600 transition"
                        >
                          Send to Client
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Broker Opportunities & Actions (col-span-3) */}
            <div className="lg:col-span-3 bg-blue-50/60 rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#315DE8] text-white flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#101B33]">Broker Priority Actions</h3>
                  <span className="text-[10px] text-slate-500">Today's high-impact agenda</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-white border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span>Accompanied Site Visit</span>
                    <span className="text-teal-600">02:30 PM</span>
                  </div>
                  <p className="text-[10px] text-slate-600">With Karthik Subburaj for Ambattur 2BHK Apartment.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span>Seller Counter Review</span>
                    <span className="text-amber-600">Urgent</span>
                  </div>
                  <p className="text-[10px] text-slate-600">Dr. Arunachalam's offer countered at ₹1.90 Cr.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span>Commission Settlement</span>
                    <span className="text-emerald-600">₹1,35,000</span>
                  </div>
                  <p className="text-[10px] text-slate-600">Milestone 4 approved for Deal #deal-1.</p>
                </div>
              </div>

              <Link
                href={`/deal-room/${commissions[0]?.dealRoomId || 'deal-1'}`}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#C9A66B] to-[#DFBA7F] hover:from-[#DFBA7F] hover:to-[#C9A66B] text-slate-950 font-black text-xs uppercase tracking-wider text-center block shadow transition"
              >
                Open Active Deal Room →
              </Link>
            </div>

          </div>

          {/* =========================================================================
              SECTION 12: BROKER LOWER FEATURE GRID — 10 PANELS (5 Columns x 2 Rows)
             ========================================================================= */}
          <div className="pt-6 border-t border-[#D9E4F5] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#315DE8] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                  Brokerage Ecosystem Architecture
                </span>
                <h2 className="text-xl font-black text-[#101B33] mt-2">
                  Comprehensive Brokerage Operations & Tools
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                All 10 modules aligned with NILVORA Design System
              </span>
            </div>

            {/* 10-Card Grid in Exact Reference Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
              
              {/* -------------------------------------------------------------
                  CARD 1: Property Marketplace
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    <Compass className="w-4 h-4 text-[#315DE8]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Property Marketplace</h3>
                    <p className="text-[10px] text-slate-500">Complete verified inventory</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Available: {properties.length} Listings</span>
                      <span className="text-emerald-600">TN RERA</span>
                    </div>
                    <span className="text-slate-500 block truncate">Territory: Ambattur & West Chennai</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Direct owner & builder listings</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Location & budget filters</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> High-res photos & Reels</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Instant client brochure share</li>
                  </ul>
                </div>

                <Link
                  href="/buy"
                  className="w-full py-1.5 px-3 rounded-lg bg-[#315DE8] text-white text-[11px] font-bold text-center block hover:bg-blue-600 transition"
                >
                  Explore Marketplace →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 2: Lead & Client CRM
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Lead & Client CRM</h3>
                    <p className="text-[10px] text-slate-500">Pipeline & stage tracking</p>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-1.5 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-center text-[9px]">
                    <div><strong className="block text-blue-600">14</strong><span className="text-slate-500">New</span></div>
                    <div><strong className="block text-amber-600">8</strong><span className="text-slate-500">Qual</span></div>
                    <div><strong className="block text-teal-600">6</strong><span className="text-slate-500">Visit</span></div>
                    <div><strong className="block text-emerald-600">3</strong><span className="text-slate-500">Offer</span></div>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Lead status advancement</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Follow-up calendar alerts</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Client requirement notes</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Phone & WhatsApp links</li>
                  </ul>
                </div>

                <a
                  href="#leads"
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  Manage CRM Leads →
                </a>
              </div>

              {/* -------------------------------------------------------------
                  CARD 3: Buyer–Property Matching
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Buyer–Property Matching</h3>
                    <p className="text-[10px] text-slate-500">Algorithmic preference fit</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Top Match:</span>
                      <strong className="text-purple-700 font-bold">96% Accuracy</strong>
                    </div>
                    <span className="text-slate-500 block truncate">Rajesh K. ↔ Ambattur Villa</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Budget compatibility check</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> BHK & square footage filters</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Vaastu & amenity preferences</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Tanglish natural language match</li>
                  </ul>
                </div>

                <a
                  href="#matching"
                  className="w-full py-1.5 px-3 rounded-lg bg-purple-600 text-white text-[11px] font-bold text-center block hover:bg-purple-700 transition"
                >
                  View Matches →
                </a>
              </div>

              {/* -------------------------------------------------------------
                  CARD 4: Site Visit Management
                 ------------------------------------------------------------- */}
              <div id="visits" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                    <Calendar className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Site Visit Management</h3>
                    <p className="text-[10px] text-slate-500">Accompanied tours & slots</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Scheduled Visits:</span>
                      <strong className="text-teal-700">{appointments.length || 6} Confirmed</strong>
                    </div>
                    <span className="text-slate-500 block truncate">Conflict Guard: Zero double-bookings</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Timeslot conflict prevention</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Client contact coordination</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Reschedule / cancel controls</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> GPS locality directions</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Displaying 6 confirmed site visits.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-teal-600 text-white text-[11px] font-bold text-center block hover:bg-teal-700 transition"
                >
                  Manage Visits →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 5: Offers & Negotiation
                 ------------------------------------------------------------- */}
              <div id="offers" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">5</span>
                    <Tag className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Offers & Negotiation</h3>
                    <p className="text-[10px] text-slate-500">Deal rooms & escrow</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Deals:</span>
                      <strong className="text-amber-700">3 in Progress</strong>
                    </div>
                    <span className="text-slate-500 block truncate">Deal #deal-1: Milestone 4/5</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Formal purchase bids</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Counter-negotiation records</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Milestone progress circles</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Token escrow verification</li>
                  </ul>
                </div>

                <Link
                  href={`/deal-room/${commissions[0]?.dealRoomId || 'deal-1'}`}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold text-center block hover:bg-amber-400 transition"
                >
                  Open Deal Room →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 6: Messaging & Notifications
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">6</span>
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Messaging & Hub</h3>
                    <p className="text-[10px] text-slate-500">Client & seller communication</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Unread Messages: 2</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-slate-500 truncate italic">"Patta copy verified for Ambattur..."</p>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Direct buyer messaging</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Seller negotiation threads</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Deal room group channels</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Document attachments</li>
                  </ul>
                </div>

                <Link
                  href="/messages"
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 text-white text-[11px] font-bold text-center block hover:bg-indigo-700 transition"
                >
                  Open Messages (2) →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 7: Commission & Earnings (Strict Separation!)
                 ------------------------------------------------------------- */}
              <div id="commission" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">7</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Commission & Earnings</h3>
                    <p className="text-[10px] text-slate-500">Audited settlement ledger</p>
                  </div>

                  {/* Strictly Segregated Financial Breakdown */}
                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Deal Value:</span>
                      <strong className="text-slate-800">₹1.00 Cr</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Agreed Comm. (1.5%):</span>
                      <strong className="text-slate-800">₹1,50,000</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform Share (10%):</span>
                      <strong className="text-purple-700">₹15,000</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                      <span className="text-emerald-700">Net Broker Payout:</span>
                      <strong className="text-emerald-700">₹1,35,000</strong>
                    </div>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Platform vs broker separation</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Invoiced & paid tracking</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Direct bank transfer status</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> GST input tax credit bills</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Opening audited commission ledger.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  View Earnings Ledger →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 8: Analytics & Marketing
                 ------------------------------------------------------------- */}
              <div id="analytics" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">8</span>
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Analytics & Marketing</h3>
                    <p className="text-[10px] text-slate-500">Conversion & campaign reports</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Visit Conversion:</span>
                      <strong className="text-emerald-600">42% to Offer</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reels Views:</span>
                      <strong className="text-blue-600">4,820 Views</strong>
                    </div>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Lead to client conversion</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Listing video views metrics</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Submarket price trends</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Campaign ROI attribution</li>
                  </ul>
                </div>

                <Link
                  href="/reels/studio"
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 text-white text-[11px] font-bold text-center block hover:bg-blue-700 transition"
                >
                  Launch Reels Campaign →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 9: Account & Verification
                 ------------------------------------------------------------- */}
              <div id="team" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">9</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Account & Verification</h3>
                    <p className="text-[10px] text-slate-500">TN RERA & agency credentials</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Broker:</span>
                      <strong className="text-slate-800">Senthil Kumaran</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Experience:</span>
                      <span className="text-emerald-700 font-bold">12 Years</span>
                    </div>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> TN RERA certified agent</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> DPDP privacy consented</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Agency team member slots</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> 2FA & secure credentials</li>
                  </ul>
                </div>

                <Link
                  href="/brokers"
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold text-center block hover:bg-slate-800 transition"
                >
                  View Public Profile →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 10: Final NILVORA Broker Portal CTA Card
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-[#101B33] text-white border border-slate-700 flex flex-col justify-between space-y-3 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#315DE8] to-[#7357D9] flex items-center justify-center">
                      <Building className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A66B] px-2 py-0.2 rounded bg-[#C9A66B]/10 border border-[#C9A66B]/20">
                      RERA Certified
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-white">NILVORA Broker Portal</h3>
                    <p className="text-[11px] text-blue-400 font-semibold mt-0.5">Connect. Match. Negotiate. Grow.</p>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Partner with Chennai's most transparent property ecosystem with direct escrow and instant commission settlements.
                  </p>
                </div>

                <Link
                  href="/buy"
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#C9A66B] to-[#DFBA7F] hover:from-[#DFBA7F] hover:to-[#C9A66B] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition"
                >
                  <span>Explore Properties</span>
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
