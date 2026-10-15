'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyItem, IntegrationServiceStatus, ComplianceRulePack } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { INITIAL_INTEGRATION_STATUS, INITIAL_COMPLIANCE_RULES } from '@/lib/mock-data';
import {
  ShieldAlert,
  Server,
  DollarSign,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Lock,
  Layers,
  Users,
  Building,
  Check,
  X,
  Search,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Tag,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  AlertCircle,
  Eye,
  PlusCircle,
  ArrowUpRight,
  Database,
  Activity,
  FileText,
  Sliders,
  HelpCircle,
} from 'lucide-react';

export default function AdminWorkspacePage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [integrations] = useState<IntegrationServiceStatus[]>(INITIAL_INTEGRATION_STATUS);
  const [complianceRules] = useState<ComplianceRulePack[]>(INITIAL_COMPLIANCE_RULES);
  const [activeNav, setActiveNav] = useState('Admin Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = nilvoraStore.getState();
    setProperties(state.properties);

    const unsubscribe = nilvoraStore.subscribe(() => {
      const s = nilvoraStore.getState();
      setProperties(s.properties);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveProperty = (id: string, title: string) => {
    nilvoraStore.updateProperty(id, { status: 'published' });
    showToast(`Approved property "${title}" for live publication.`);
  };

  const handleRejectProperty = (id: string, title: string) => {
    nilvoraStore.updateProperty(id, { status: 'rejected' });
    showToast(`Flagged property "${title}" for missing CMDA documentation.`);
  };

  const pendingListings = properties.filter((p) => p.status === 'under_review' || p.status === 'rejected');

  // Exact 18 Navigation Items in Order
  const navItems = [
    { name: 'Admin Dashboard', icon: LayoutDashboard, href: '#dashboard' },
    { name: 'User Management', icon: Users, href: '#users' },
    { name: 'Property Management', icon: Building, href: '#properties' },
    { name: 'Listing Approvals', icon: CheckCircle2, href: '#moderation', badge: '3' },
    { name: 'Broker & Seller Verification', icon: ShieldCheck, href: '#verification', badge: '2' },
    { name: 'Buyer & Client Management', icon: UserCheck, href: '#clients' },
    { name: 'Leads & Enquiries Oversight', icon: Activity, href: '#leads' },
    { name: 'Appointments & Site Visits', icon: Calendar, href: '#appointments' },
    { name: 'Offers & Transactions', icon: Tag, href: '#transactions' },
    { name: 'Revenue & Commission', icon: DollarSign, href: '#revenue' },
    { name: 'Payments & Payouts', icon: Layers, href: '#payments' },
    { name: 'Reports & Analytics', icon: BarChart3, href: '#analytics' },
    { name: 'Notifications & Announcements', icon: Bell, href: '#announcements' },
    { name: 'Support & Complaints', icon: MessageSquare, href: '#support' },
    { name: 'Trust & Compliance', icon: FileCheck, href: '#compliance' },
    { name: 'Audit Logs', icon: FileText, href: '#audit' },
    { name: 'System Settings', icon: Sliders, href: '#settings' },
    { name: 'Profile & Security', icon: Lock, href: '/login' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 flex flex-col md:flex-row selection:bg-[#315DE8] selection:text-white">
      
      {/* =========================================================================
          LEFT SIDEBAR: Fixed-width (~260px desktop) Dark Navy Shell
         ========================================================================= */}
      <aside className="w-full md:w-64 bg-[#101B33] text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4 space-y-6">
        <div className="space-y-4">
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
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                Admin Portal
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Level 5 RBAC</span>
            </div>
          </div>

          {/* Navigation Items (Exact 18 in Order) */}
          <nav className="space-y-1 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveNav(item.name)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#315DE8] text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
        <div className="space-y-3 pt-3 border-t border-slate-800">
          
          {/* Card 1: Platform Security & DPDP Audit */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">DPDP Act 2023 Audit</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400">
                Compliant
              </span>
            </div>
            <p className="text-[10px] text-slate-400">PBKDF2 SHA-256 Hashing • AES-256</p>
            <button
              onClick={() => showToast('Statutory consent audit log verified. 100% consent recorded.')}
              className="text-[10px] font-bold text-[#315DE8] hover:underline block pt-0.5"
            >
              Inspect Security Ledger →
            </button>
          </div>

          {/* Card 2: System Operational Health */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-300 block">System Health</span>
                <span className="text-[10px] text-emerald-400 font-semibold">99.98% Uptime</span>
              </div>
              {/* Circular Progress Indicator */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle cx="16" cy="16" r="12" stroke="#1e293b" strokeWidth="2.5" fill="transparent" />
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray={75}
                    strokeDashoffset={75 - (75 * 0.999)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[8px] font-bold text-white">100%</span>
              </div>
            </div>
            <a
              href="#compliance"
              className="text-[10px] font-bold text-slate-300 hover:text-white hover:underline block"
            >
              Adapter Statuses →
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
          {/* Global Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, listings, transactions, audit logs, or tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D9E4F5] text-xs text-slate-800 bg-[#F4F7FC] placeholder-slate-400 focus:outline-none focus:border-[#315DE8] focus:bg-white transition"
            />
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* Live Monitoring Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Production Hub</span>
            </div>

            {/* Notification Icon */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-slate-700 transition"
              title="Admin Alerts"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </Link>

            {/* User Profile & Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F4F7FC] transition border border-transparent hover:border-[#D9E4F5]"
              >
                <div className="w-8 h-8 rounded-full bg-[#101B33] text-purple-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-[#101B33] leading-tight">Admin Console</span>
                  <span className="block text-[10px] text-purple-600 font-semibold">Super Admin (Tamil Nadu)</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#D9E4F5] py-1.5 z-40 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-[#101B33]">Super Administrator</p>
                    <p className="text-[10px] text-slate-500">admin.governance@nilvora.in</p>
                  </div>
                  <a href="#moderation" className="block px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold">Moderation Queue (3)</a>
                  <a href="#compliance" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">State Rule Packs</a>
                  <a href="#audit" className="block px-3 py-2 text-slate-700 hover:bg-slate-50">Audit Logs</a>
                  <div className="border-t border-slate-100 mt-1">
                    <Link href="/login" className="block px-3 py-2 text-red-600 font-semibold hover:bg-red-50">Sign Out</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN ADMIN CONTENT AREA */}
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
              SECTION 16: ADMIN WELCOME HEADER & PLATFORM CONTROLS
             ========================================================================= */}
          <div className="bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200">
                  System Governance
                </span>
                <span className="text-xs text-slate-400 font-mono">TN RERA • Tamil Nilam • DPDP 2023</span>
              </div>
              <h1 className="text-2xl font-black text-[#101B33]">
                Platform Overview
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor NILVORA operations, manage platform activity, and maintain trust across the real estate ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] text-slate-700">
                Reporting: Real-Time Aggregated
              </span>
              <button
                onClick={() => showToast('Refreshed real-time analytics across all 53 endpoints.')}
                className="px-3.5 py-2 rounded-xl bg-[#315DE8] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              SECTION 17: ADMIN QUICK ACTIONS (Five Equal-Height Cards + '+ New' Menu)
             ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Quick Administrative Actions
              </h2>

              {/* '+ New' Administrative Action Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                  className="px-3 py-1.5 rounded-xl bg-[#315DE8] text-white text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ New Action</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isNewMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#D9E4F5] py-1.5 z-40 text-xs">
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        showToast('Broadcast announcement drafted for Chennai brokers & buyers.');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      Create Announcement
                    </button>
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        showToast('New staff RBAC role form initialized.');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Add Authorized Team Member
                    </button>
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        showToast('Tamil Nadu SRO Registration fee rates verified (7% + 2%).');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Configure State Setting
                    </button>
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        showToast('Monthly financial reconciliation report exported.');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Export Statutory Report
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Five Equal-Height Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Card 1: Review Pending Listings */}
              <a
                href="#moderation"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    3 Pending
                  </span>
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Review Pending Listings</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Audit CMDA & Patta numbers</span>
                </div>
              </a>

              {/* Card 2: Manage Users */}
              <a
                href="#users"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Users className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Manage Users</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">RBAC roles & access</span>
                </div>
              </a>

              {/* Card 3: Verify Broker / Seller */}
              <a
                href="#verification"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    2 Queued
                  </span>
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Verify Broker / Seller</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">RERA registration checks</span>
                </div>
              </a>

              {/* Card 4: Review Transactions */}
              <a
                href="#transactions"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <Tag className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">Review Transactions</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Deal Rooms & escrow</span>
                </div>
              </a>

              {/* Card 5: View Platform Reports */}
              <a
                href="#revenue"
                className="p-4 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#315DE8] flex items-center justify-center group-hover:bg-[#315DE8] group-hover:text-white transition">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#315DE8] transition" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#101B33] block">View Platform Reports</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Audited financial ledger</span>
                </div>
              </a>
            </div>
          </div>

          {/* =========================================================================
              SECTION 18: ADMIN PLATFORM STATISTICS (Five Compact Cards)
             ========================================================================= */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Platform Aggregated Metrics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Card 1: Total Registered Users */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Registered Users</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#315DE8] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">1,420</strong>
                <span className="text-[10px] text-emerald-600 font-bold mt-2 block">+38 this week</span>
              </div>

              {/* Card 2: Active Property Listings */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Active Listings</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">{properties.length}</strong>
                <span className="text-[10px] text-slate-400 mt-2 block">100% CMDA/Patta verified</span>
              </div>

              {/* Card 3: Pending Listing Approvals */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-amber-600">3</strong>
                <a href="#moderation" className="text-[10px] text-[#315DE8] hover:underline font-bold mt-2 block">
                  Review queue →
                </a>
              </div>

              {/* Card 4: Transactions in Progress */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Active Deal Rooms</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">4</strong>
                <span className="text-[10px] text-purple-600 font-bold mt-2 block">₹3.80 Cr pipeline</span>
              </div>

              {/* Card 5: Platform Revenue (Strict Segregation) */}
              <div className="p-4 rounded-xl bg-white border border-[#D9E4F5] flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Platform Revenue</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <strong className="text-2xl font-black text-[#101B33]">
                  ₹1,84,500
                </strong>
                <a href="#revenue" className="text-[10px] text-[#315DE8] hover:underline font-bold mt-2 block">
                  Inspect ledger →
                </a>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 19: ADMIN MAIN DASHBOARD — THREE-COLUMN GRID
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT: Pending Approvals (col-span-4) */}
            <div id="moderation" className="lg:col-span-4 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#315DE8]" />
                  <h3 className="font-bold text-sm text-[#101B33]">Pending Moderation</h3>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  3 Items Queued
                </span>
              </div>

              {/* Moderation Items */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                      Listing Submission
                    </span>
                    <span className="text-[10px] text-slate-400">10m ago</span>
                  </div>
                  <div>
                    <strong className="text-[#101B33] block text-xs">Gated 3 BHK Luxury Villa</strong>
                    <span className="text-[10px] text-slate-500">Ambattur OT • Survey: 412/1B2 • ₹1.15 Cr</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => handleApproveProperty('prop-1', 'Gated 3 BHK Luxury Villa')}
                      className="flex-1 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                    >
                      Approve Listing
                    </button>
                    <button
                      onClick={() => handleRejectProperty('prop-1', 'Gated 3 BHK Luxury Villa')}
                      className="px-3 py-1 rounded bg-red-100 text-red-700 font-bold text-[10px] hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                      Broker RERA Check
                    </span>
                    <span className="text-[10px] text-slate-400">1h ago</span>
                  </div>
                  <div>
                    <strong className="text-[#101B33] block text-xs">Senthil Kumaran (Broker)</strong>
                    <span className="text-[10px] text-slate-500">TN/AGENT/0491/2021 • Ambattur Prime Realty</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => showToast('Broker Senthil Kumaran verified with Tamil Nadu RERA registry.')}
                      className="flex-1 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                    >
                      Verify Broker
                    </button>
                    <button
                      onClick={() => showToast('Verification notes sent to broker.')}
                      className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-300 transition"
                    >
                      Details
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                      Seller Patta Audit
                    </span>
                    <span className="text-[10px] text-slate-400">3h ago</span>
                  </div>
                  <div>
                    <strong className="text-[#101B33] block text-xs">M. Jayaraman (Owner)</strong>
                    <span className="text-[10px] text-slate-500">Patta: TN-AMB-2023-9912 • Ambattur SRO</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => showToast('Seller Patta verified with Tamil Nilam digital portal.')}
                      className="flex-1 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                    >
                      Verify Document
                    </button>
                    <button
                      onClick={() => showToast('Requesting additional 30-year EC copy.')}
                      className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-300 transition"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER: Platform Activity & Audit Stream (col-span-5) */}
            <div id="audit" className="lg:col-span-5 bg-white rounded-2xl border border-[#D9E4F5] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#315DE8]" />
                  <h3 className="font-bold text-sm text-[#101B33]">Platform Activity Stream</h3>
                </div>
                <button
                  onClick={() => showToast('Activity log filtered for past 24 hours.')}
                  className="text-xs font-bold text-[#315DE8] hover:underline"
                >
                  Past 24 Hours
                </button>
              </div>

              {/* Activity Log Items */}
              <div className="space-y-2.5">
                {[
                  {
                    event: 'HMAC Payment Verified',
                    actor: 'Razorpay Sandbox Gateway',
                    ref: 'order_PRO_MONTHLY_1 • ₹999 + 18% GST',
                    time: '12m ago',
                    status: 'success',
                  },
                  {
                    event: 'Deal Room Created',
                    actor: 'Buyer Offer Acceptance',
                    ref: 'Deal #deal-1 • Gated 3 BHK Luxury Villa',
                    time: '35m ago',
                    status: 'success',
                  },
                  {
                    event: 'Double-Booking Prevented',
                    actor: 'Conflict Guard Engine',
                    ref: 'Slot 11:00 AM on Oct 20 already reserved',
                    time: '1h ago',
                    status: 'neutral',
                  },
                  {
                    event: 'DPDP Act Consent Recorded',
                    actor: 'Buyer Registration',
                    ref: 'User: Karthik Subburaj • IP SHA-256 Logged',
                    time: '2h ago',
                    status: 'success',
                  },
                  {
                    event: 'PBKDF2 Login Rate Limited',
                    actor: 'Brute-force Throttler',
                    ref: 'Blocked after 5 invalid attempts for 15 mins',
                    time: '4h ago',
                    status: 'alert',
                  },
                ].map((act, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#F4F7FC] border border-[#D9E4F5] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        act.status === 'success' ? 'bg-emerald-500' : act.status === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="truncate">
                        <strong className="block text-[#101B33] text-xs truncate">{act.event}</strong>
                        <span className="text-[10px] text-slate-500 block truncate">{act.ref}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">{act.time}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{act.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Platform Health & Trust (col-span-3) */}
            <div id="compliance" className="lg:col-span-3 bg-blue-50/60 rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#315DE8] text-white flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#101B33]">Platform Health & Adapters</h3>
                  <span className="text-[10px] text-slate-500">Status of connected services</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {integrations.slice(0, 5).map((srv) => (
                  <div key={srv.serviceKey} className="p-2.5 rounded-xl bg-white border border-blue-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span>{srv.serviceName}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        srv.status === 'configured'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {srv.status === 'configured' ? 'Configured' : 'Fallback Ready'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{srv.details}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => showToast('All 6 platform adapter diagnostic tests passed.')}
                className="w-full py-2 px-3 rounded-xl bg-[#315DE8] text-white text-xs font-bold text-center block hover:bg-blue-600 transition"
              >
                Run Diagnostics Test →
              </button>
            </div>

          </div>

          {/* =========================================================================
              SECTION 20: ADMIN LOWER FEATURE GRID — 10 PANELS (5 Columns x 2 Rows)
             ========================================================================= */}
          <div className="pt-6 border-t border-[#D9E4F5] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#315DE8] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                  Governance Architecture
                </span>
                <h2 className="text-xl font-black text-[#101B33] mt-2">
                  System-Wide Administrative Modules
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                All 10 modules aligned with NILVORA Design System
              </span>
            </div>

            {/* 10-Card Grid in Exact Reference Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
              
              {/* -------------------------------------------------------------
                  CARD 1: User & Role Management
                 ------------------------------------------------------------- */}
              <div id="users" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    <Users className="w-4 h-4 text-[#315DE8]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">User & Role Management</h3>
                    <p className="text-[10px] text-slate-500">RBAC permissions matrix</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Total: 1,420 Users</span>
                      <span className="text-emerald-600">Active</span>
                    </div>
                    <span className="text-slate-500 block truncate">Public admin creation strictly blocked</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Role-based access control</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Account activation & suspension</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Verification state assignment</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> PBKDF2 password resets</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Opening RBAC role directory.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#315DE8] text-white text-[11px] font-bold text-center block hover:bg-blue-600 transition"
                >
                  Manage Users →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 2: Property Moderation
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <Building className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Property Moderation</h3>
                    <p className="text-[10px] text-slate-500">Listing vetting & approval</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Moderation Queue:</span>
                      <strong className="text-amber-600">3 Pending</strong>
                    </div>
                    <span className="text-slate-500 block truncate">Price check: min ₹5L urban threshold</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Submitted listing inspection</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Survey & Patta validation</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Approve / Reject with reasons</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Soft-delete archiving protection</li>
                  </ul>
                </div>

                <a
                  href="#moderation"
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  Moderate Listings →
                </a>
              </div>

              {/* -------------------------------------------------------------
                  CARD 3: Broker & Seller Verification
                 ------------------------------------------------------------- */}
              <div id="verification" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Verification Queue</h3>
                    <p className="text-[10px] text-slate-500">RERA & title due diligence</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Verification Requests:</span>
                      <strong className="text-purple-700">2 Queued</strong>
                    </div>
                    <span className="text-slate-500 block truncate">RERA License: TN/AGENT/0491/2021</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> TN RERA portal cross-check</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Patta & Chitta document audit</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Legal advocate checklist review</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Trust Badge state issuance</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Opening professional due diligence queue.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-purple-600 text-white text-[11px] font-bold text-center block hover:bg-purple-700 transition"
                >
                  Verify Credentials →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 4: Transaction Oversight
                 ------------------------------------------------------------- */}
              <div id="transactions" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                    <Lock className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Transaction Oversight</h3>
                    <p className="text-[10px] text-slate-500">Deal rooms & milestones</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Deals:</span>
                      <strong className="text-teal-700">4 Deals in Progress</strong>
                    </div>
                    <span className="text-slate-500 block truncate">Deal #deal-1: Milestone 4/5</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Multi-party deal room access</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Token advance confirmation</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Milestone completion audit</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Dispute mediation protocol</li>
                  </ul>
                </div>

                <Link
                  href="/deal-room/deal-1"
                  className="w-full py-1.5 px-3 rounded-lg bg-teal-600 text-white text-[11px] font-bold text-center block hover:bg-teal-700 transition"
                >
                  Inspect Deal Room →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 5: Payments & Commission (Strict Segregation)
                 ------------------------------------------------------------- */}
              <div id="revenue" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">5</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Payments & Commission</h3>
                    <p className="text-[10px] text-slate-500">Financial accounting split</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] text-slate-600">
                    Live revenue figures are calculated from confirmed, non-demo payment records in the Revenue Dashboard.
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Platform vs property segregation</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> HMAC-SHA256 signature verification</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> 18% GST statutory invoice breakdown</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Admin refund authorization</li>
                  </ul>
                </div>

                <Link
                  href="/dashboard/admin#revenue"
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  View Revenue Ledger →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 6: Platform Analytics
                 ------------------------------------------------------------- */}
              <div id="analytics" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">6</span>
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Platform Analytics</h3>
                    <p className="text-[10px] text-slate-500">Growth & conversion trends</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Buyer Conversion:</span>
                      <strong className="text-emerald-600">6.2% Overall</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Views:</span>
                      <strong className="text-blue-600">15,850 Views</strong>
                    </div>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> User acquisition metrics</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Listing approval velocity</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Enquiry to site visit ratio</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Regional demand heatmaps</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Platform growth analytics exported for Q4 2026.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 text-white text-[11px] font-bold text-center block hover:bg-blue-700 transition"
                >
                  Export Analytics →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 7: Notifications & Support
                 ------------------------------------------------------------- */}
              <div id="support" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">7</span>
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Support & Grievances</h3>
                    <p className="text-[10px] text-slate-500">Statutory officer & tickets</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Open Grievances: 0</span>
                      <span className="text-emerald-600">Clean Status</span>
                    </div>
                    <span className="text-slate-500 block truncate">IT Act Grievance Officer: Adv. M. Balaji</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Statutory grievance handling</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Platform announcement engine</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Multi-channel dispatch tracking</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> SLA resolution tracking</li>
                  </ul>
                </div>

                <Link
                  href="/contact"
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 text-white text-[11px] font-bold text-center block hover:bg-indigo-700 transition"
                >
                  View Grievances →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 8: Trust, Compliance & Audit
                 ------------------------------------------------------------- */}
              <div id="compliance-card" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">8</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">Trust, Compliance & Audit</h3>
                    <p className="text-[10px] text-slate-500">Statutory regulatory pack</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">DPDP Compliance:</span>
                      <strong className="text-emerald-700">100% Consented</strong>
                    </div>
                    <span className="text-slate-500 block truncate">Audit log: Immutable append-only</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Tamil Nadu RERA rule pack</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Tamil Nilam Patta verification</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> DPDP statutory consent log</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Tamper-evident activity hashing</li>
                  </ul>
                </div>

                <Link
                  href="/safety"
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center block hover:bg-emerald-700 transition"
                >
                  Inspect Compliance →
                </Link>
              </div>

              {/* -------------------------------------------------------------
                  CARD 9: System Configuration
                 ------------------------------------------------------------- */}
              <div id="settings-card" className="p-4 rounded-2xl bg-white border border-[#D9E4F5] flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">9</span>
                    <Sliders className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#101B33]">System Configuration</h3>
                    <p className="text-[10px] text-slate-500">Global rules & limits</p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active State:</span>
                      <strong className="text-slate-800">Tamil Nadu (TN)</strong>
                    </div>
                    <span className="text-slate-500 block truncate">Stamp Duty: 7% • Reg: 2%</span>
                  </div>

                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> State rule pack management</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> Feature toggle configuration</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> Operational rate limits</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-slate-700" /> Environment secret protection</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Opening system parameter controls.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold text-center block hover:bg-slate-800 transition"
                >
                  Configure System →
                </button>
              </div>

              {/* -------------------------------------------------------------
                  CARD 10: Final NILVORA Admin Portal Brand Card
                 ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-[#101B33] text-white border border-slate-700 flex flex-col justify-between space-y-3 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#315DE8] to-[#7357D9] flex items-center justify-center">
                      <Building className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A66B] px-2 py-0.2 rounded bg-[#C9A66B]/10 border border-[#C9A66B]/20">
                      Super Admin
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-white">NILVORA Admin Portal</h3>
                    <p className="text-[11px] text-blue-400 font-semibold mt-0.5">Monitor. Manage. Protect. Improve.</p>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Centralized platform governance maintaining statutory compliance, legal due diligence, and financial integrity.
                  </p>
                </div>

                <button
                  onClick={() => showToast('Statutory audit report downloaded for Tamil Nadu authorities.')}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#C9A66B] to-[#DFBA7F] hover:from-[#DFBA7F] hover:to-[#C9A66B] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition"
                >
                  <span>Export Audit Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
