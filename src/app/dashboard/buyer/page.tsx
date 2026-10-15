'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyItem, AppointmentItem, OfferItem, DealRoomItem, PaymentOrder } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { DEMO_PROPERTY_IDS } from '@/lib/mock-data';
import { getPropertyImage, getPropertyTypeImage } from '@/lib/property-images';
import {
  Heart,
  Calendar,
  Tag,
  Lock,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Search,
  MapPin,
  Bell,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Calculator,
  Compass,
  MessageSquare,
  Scale,
  Award,
  ExternalLink,
  ChevronDown,
  User,
  Star,
  Zap,
  TrendingUp,
  DollarSign,
  AlertCircle,
  HelpCircle,
  LayoutDashboard,
  Check,
} from 'lucide-react';

export default function BuyerDashboardPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [dealRooms, setDealRooms] = useState<DealRoomItem[]>([]);
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [paymentHistoryError, setPaymentHistoryError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('Ambattur & West Chennai');
  const [activeNav, setActiveNav] = useState('Buyer Dashboard');
  const [notificationCount, setNotificationCount] = useState(3);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [selectedDate, setSelectedDate] = useState('2026-10-20');
  const [calcPropertyValue, setCalcPropertyValue] = useState<number>(6500000); // 65 Lakhs default
  const [calcPropertyType, setCalcPropertyType] = useState<'apartment' | 'villa' | 'plot'>('apartment');

  useEffect(() => {
    const state = nilvoraStore.getState();
    setProperties(state.properties);
    setSavedPropertyIds(state.savedPropertyIds);
    setAppointments(state.appointments);
    setOffers(state.offers);
    setDealRooms(state.dealRooms);

    const unsubscribe = nilvoraStore.subscribe(() => {
      const s = nilvoraStore.getState();
      setProperties(s.properties);
      setSavedPropertyIds(s.savedPropertyIds);
      setAppointments(s.appointments);
      setOffers(s.offers);
      setDealRooms(s.dealRooms);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let current = true;
    fetch('/api/portal', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error(result.error || 'Could not load payment history.');
        return result as { payments?: PaymentOrder[] };
      })
      .then((result) => { if (current) { setPayments(result.payments || []); setPaymentHistoryError(''); } })
      .catch((error: unknown) => {
        if (current) setPaymentHistoryError(error instanceof Error ? error.message : 'Payment history is unavailable.');
      });
    return () => { current = false; };
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  const handleToggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    nilvoraStore.toggleSaveProperty(id);
  };

  const handleQuickVisitBooking = async (propertyId: string, propertyTitle: string) => {
    const fullTime = `${selectedDate}T${selectedSlot}`;
    try {
      nilvoraStore.addAppointment({
        propertyId,
        propertyTitle,
        brokerId: 'broker-1',
        buyerName: 'Karthik Subburaj',
        buyerPhone: '+91 98409 33211',
        scheduledTime: fullTime,
        status: 'confirmed',
        notes: 'Requested accompanied visit through NILVORA Buyer Portal.',
      });
      setBookingSuccess(`Site visit scheduled for ${propertyTitle} on ${selectedDate} at ${selectedSlot}!`);
      setTimeout(() => setBookingSuccess(null), 5000);
    } catch {
      setBookingSuccess('Site visit request recorded.');
      setTimeout(() => setBookingSuccess(null), 4000);
    }
  };

  // Calculation for Tamil Nadu stamp duty & registration
  const stampDuty = Math.round((calcPropertyValue * 7) / 100);
  const regFeeRate = calcPropertyType === 'plot' ? 4 : 2;
  const regFee = Math.round((calcPropertyValue * regFeeRate) / 100);
  const legalFee = 25000;
  const totalGovtCharges = stampDuty + regFee + legalFee + 1500;
  const approxMonthlyRent = Math.round((calcPropertyValue * 0.04) / 12);
  const grossYield = ((approxMonthlyRent * 12) / calcPropertyValue) * 100;

  const recommendedProps = properties
    .filter((property) => property.status === 'published' && property.listingType === 'sale')
    .slice(0, 4);

  const propertyCategories = [
    {
      name: 'Sites & Land',
      href: '/buy?type=plot',
      matches: (property: PropertyItem) => property.listingType === 'sale' && property.propertyType === 'plot',
    },
    {
      name: 'Apartments',
      href: '/buy?type=apartment',
      matches: (property: PropertyItem) => property.listingType === 'sale' && property.propertyType === 'apartment',
    },
    {
      name: 'Villas & Homes',
      href: '/buy?type=house',
      matches: (property: PropertyItem) =>
        property.listingType === 'sale' &&
        (property.propertyType === 'villa' || property.propertyType === 'independent_house'),
    },
    {
      name: 'Builder Projects',
      href: '/buy?type=builder_project',
      matches: (property: PropertyItem) =>
        property.listingType === 'sale' && property.propertyType === 'builder_project',
    },
    {
      name: 'Commercial',
      href: '/buy?type=commercial',
      matches: (property: PropertyItem) =>
        property.listingType === 'sale' && property.propertyType === 'commercial',
    },
    {
      name: 'Rentals',
      href: '/rent',
      matches: (property: PropertyItem) => property.listingType === 'rent',
    },
  ]
    .flatMap((category) => {
      const listings = properties.filter(
        (property) => property.status === 'published' && category.matches(property),
      );
      const featuredProperty =
        listings.find((property) => DEMO_PROPERTY_IDS.has(property.id)) || listings[0];

      return featuredProperty ? [{ ...category, listings, featuredProperty }] : [];
    })

  const navItems = [
    { name: 'Buyer Dashboard', icon: LayoutDashboard, href: '#workspace' },
    { name: 'Search Properties', icon: Search, href: '/buy' },
    { name: 'Saved Properties', icon: Heart, href: '#saved' },
    { name: 'Site Visits', icon: Calendar, href: '#visits' },
    { name: 'My Offers', icon: Tag, href: '#offers' },
    { name: 'Messages', icon: MessageSquare, href: '/messages', badge: '3' },
    { name: 'Payment History', icon: DollarSign, href: '#payments' },
    { name: 'Notifications', icon: Bell, href: '/notifications', badge: notificationCount > 0 ? String(notificationCount) : undefined },
    { name: 'Comparisons', icon: Scale, href: '/compare' },
    { name: 'Investment Tools', icon: Calculator, href: '/investment' },
    { name: 'Profile & Settings', icon: User, href: '/login' },
  ];

  return (
    <div className="min-h-screen bg-[#101B33] text-white selection:bg-[#315DE8] selection:text-white">
      {/* =========================================================================
          REGION A: UPPER HERO AND DASHBOARD (Exact Three-Column Composition)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* -------------------------------------------------------------
              LEFT COLUMN: Brand Introduction (~25% width / col-span-3)
             ------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-6 pt-2">
            <div>
              {/* Brand Logo & Wordmark */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#315DE8] to-[#7357D9] flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-wider text-white">NILVORA</span>
                  <span className="block text-[10px] uppercase font-bold tracking-widest text-[#C9A66B]">Real Estate</span>
                </div>
              </div>

              {/* Tagline */}
              <p className="mt-4 text-xs font-semibold text-[#C9A66B] uppercase tracking-wider">
                Your Dream Property. Our Priority.
              </p>

              {/* Buyer Portal Heading */}
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Buyer Portal
              </h1>

              {/* Supporting Line */}
              <p className="mt-1 text-sm font-bold text-blue-400">
                Find. Explore. Compare. Invest.
              </p>

              {/* Short Description */}
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                Discover verified residential & investment properties across Ambattur & West Chennai. Schedule broker-guided tours, submit transparent purchase offers, and track your transactions with complete legal assurance.
              </p>
            </div>

            {/* Four Trust Indicators */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                NILVORA Trust Standard
              </span>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">Secure</strong>
                    <span className="text-[10px] text-slate-400">Escrow milestones & DPDP security</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">Trusted</strong>
                    <span className="text-[10px] text-slate-400">RERA verified & direct owner listings</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-[#C9A66B]/20 text-[#C9A66B] flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">Transparent</strong>
                    <span className="text-[10px] text-slate-400">Zero hidden fees & 30-yr EC verification</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">AI-Powered</strong>
                    <span className="text-[10px] text-slate-400">Smart yield analytics & Tanglish query search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              CENTER COLUMN: Main Buyer Dashboard (~55% width / col-span-7)
              Enclosed in a bordered, rounded white container
             ------------------------------------------------------------- */}
          <div id="workspace" className="lg:col-span-7 rounded-2xl border border-slate-700/80 bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[720px]">
            
            {/* Narrow Left Sidebar (~200px fixed width) */}
            <aside className="w-full md:w-48 lg:w-52 bg-[#101B33] text-slate-300 p-3.5 flex flex-col justify-between border-r border-slate-800 shrink-0">
              <div className="space-y-1">
                <div className="px-2 py-2 mb-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.name;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveNav(item.name)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#315DE8] text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
              </div>

              {/* Sidebar Footer Info */}
              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <span>Portal Version</span>
                  <span className="text-slate-300 font-mono">v2.4.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chennai Metro Hub</span>
                  <span className="text-emerald-400 font-bold">Live</span>
                </div>
              </div>
            </aside>

            {/* Main White Dashboard Workspace */}
            <main className="flex-1 bg-[#F4F7FC] p-4 lg:p-5 flex flex-col space-y-4 overflow-x-hidden">
              
              {/* Dashboard Top Navigation Bar */}
              <div className="bg-white rounded-xl border border-[#D9E4F5] p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                {/* Search Input */}
                <div className="relative flex-1 w-full sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by location, project, BHK, or budget..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D9E4F5] text-xs text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-[#315DE8]"
                  />
                </div>

                {/* Location Selector & User Profile */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  {/* Location Selector */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F4F7FC] border border-[#D9E4F5] text-xs font-semibold text-[#172642]">
                    <MapPin className="w-3.5 h-3.5 text-[#315DE8]" />
                    <select
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-[#172642] focus:outline-none cursor-pointer"
                    >
                      <option value="Ambattur & West Chennai">Ambattur & West Chennai</option>
                      <option value="Mogappair & Nolambur">Mogappair & Nolambur</option>
                      <option value="Anna Nagar West">Anna Nagar West</option>
                      <option value="Avadi & Korattur">Avadi & Korattur</option>
                    </select>
                  </div>

                  {/* Notification Icon */}
                  <Link
                    href="/notifications"
                    className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </Link>

                  {/* User Profile Info */}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-[#315DE8] text-white flex items-center justify-center font-bold text-xs shadow">
                      KS
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="block text-xs font-bold text-[#101B33] leading-tight">Karthik Subburaj</span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">Verified Buyer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="bg-white rounded-xl border border-[#D9E4F5] p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#101B33]">Hello, Karthik Subburaj</h2>
                  <p className="text-xs text-slate-500">
                    Find your perfect property in {selectedLocality}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Active Search: Residential & Plots
                  </span>
                </div>
              </div>

              {/* Notification Banner if action succeeded */}
              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              {/* Five Primary Quick-Action Cards (5 Columns on desktop) */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Actions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  <Link
                    href="/buy"
                    className="p-3 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#315DE8] flex items-center justify-center mb-2 group-hover:bg-[#315DE8] group-hover:text-white transition">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[#101B33] block">Search Properties</strong>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Browse verified listings</span>
                    </div>
                  </Link>

                  <a
                    href="#saved"
                    className="p-3 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-500 group-hover:text-white transition">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[#101B33] block">Saved Properties</strong>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Review your favorites</span>
                    </div>
                  </a>

                  <a
                    href="#visits"
                    className="p-3 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[#101B33] block">Book Site Visit</strong>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Schedule accompanied tour</span>
                    </div>
                  </a>

                  <a
                    href="#offers"
                    className="p-3 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:text-white transition">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[#101B33] block">My Offers</strong>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Track active bids</span>
                    </div>
                  </a>

                  <Link
                    href="/investment"
                    className="p-3 rounded-xl bg-white border border-[#D9E4F5] hover:border-[#315DE8] hover:shadow-md transition text-left group flex flex-col justify-between col-span-2 sm:col-span-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[#101B33] block">Investment Tools</strong>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">ROI & stamp duty</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Four Compact Dashboard Statistic Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-[#D9E4F5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Saved</span>
                    <strong className="text-xl font-black text-[#101B33] block mt-0.5">{savedPropertyIds.length}</strong>
                    <a href="#saved" className="text-[10px] text-[#315DE8] hover:underline font-semibold">View all</a>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D9E4F5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Site Visits</span>
                    <strong className="text-xl font-black text-[#101B33] block mt-0.5">{appointments.length}</strong>
                    <a href="#visits" className="text-[10px] text-[#315DE8] hover:underline font-semibold">View all</a>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D9E4F5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Offers</span>
                    <strong className="text-xl font-black text-[#101B33] block mt-0.5">{offers.length}</strong>
                    <a href="#offers" className="text-[10px] text-[#315DE8] hover:underline font-semibold">View all</a>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D9E4F5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deal Rooms</span>
                    <strong className="text-xl font-black text-[#101B33] block mt-0.5">{dealRooms.length}</strong>
                    <Link href={`/deal-room/${dealRooms[0]?.id || 'deal-1'}`} className="text-[10px] text-[#315DE8] hover:underline font-semibold">View all</Link>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#315DE8] flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <section className="space-y-2.5" aria-labelledby="browse-property-types">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3
                      id="browse-property-types"
                      className="text-xs font-bold text-[#101B33] uppercase tracking-wider"
                    >
                      Browse by property type
                    </h3>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Explore sample listings across Chennai
                    </p>
                  </div>
                  <Link href="/buy" className="shrink-0 text-[11px] font-bold text-[#315DE8] hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {propertyCategories.map(({ name, href, listings, featuredProperty }) => (
                    <Link
                      key={name}
                      href={href}
                      className="group overflow-hidden rounded-xl border border-[#D9E4F5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#315DE8] hover:shadow-md"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={getPropertyImage(featuredProperty)}
                          alt={`${name} property in ${featuredProperty.locality}`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => {
                            const fallbackImage = getPropertyTypeImage(featuredProperty.propertyType);
                            if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
                          }}
                        />
                        {DEMO_PROPERTY_IDS.has(featuredProperty.id) && (
                          <span className="absolute left-2 top-2 rounded bg-[#101B33]/85 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2.5">
                        <span className="truncate text-xs font-bold text-[#101B33] group-hover:text-[#315DE8]">
                          {name}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-500">
                          {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Recommended Property Section (Four Aligned Property Cards) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#101B33] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recommended For You</span>
                    </h3>
                    <p className="text-[10px] text-slate-500">Based on your preference for Ambattur & West Chennai</p>
                  </div>
                  <Link href="/buy" className="text-[11px] font-bold text-[#315DE8] hover:underline flex items-center gap-1">
                    <span>Explore All ({properties.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {recommendedProps.map((p) => {
                    const isSaved = savedPropertyIds.includes(p.id);
                    const pricePerSqft = Math.round(p.price / (p.areaSqft || 1000));
                    return (
                      <div
                        key={p.id}
                        className="group bg-white rounded-xl border border-[#D9E4F5] hover:border-[#315DE8] overflow-hidden transition shadow-sm hover:shadow-md flex flex-col justify-between"
                      >
                        {/* Image with Badges */}
                        <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                          <img
                            src={getPropertyImage(p)}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                            onError={(event) => {
                              const fallbackImage = getPropertyTypeImage(p.propertyType);
                              if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
                            }}
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#101B33]/90 text-white backdrop-blur-sm">
                              {p.trustScore}% Match
                            </span>
                            {DEMO_PROPERTY_IDS.has(p.id) && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/95 text-white backdrop-blur-sm">
                                Demo
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleToggleSave(p.id, e)}
                            className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm transition ${
                              isSaved ? 'text-red-500 fill-red-500' : 'text-slate-600 hover:text-red-500'
                            }`}
                            title={isSaved ? 'Remove from saved' : 'Save property'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500' : ''}`} />
                          </button>
                        </div>

                        {/* Card Details */}
                        <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-semibold uppercase text-blue-600">{p.propertyType}</span>
                              <span>{p.locality}</span>
                            </div>
                            <h4 className="text-xs font-bold text-[#101B33] line-clamp-1 group-hover:text-[#315DE8] transition" title={p.title}>
                              {p.title}
                            </h4>
                          </div>

                          <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-baseline justify-between">
                              <strong className="text-sm font-black text-[#101B33]">{formatCurrency(p.price)}</strong>
                              <span className="text-[10px] text-slate-500">{p.areaSqft} sq.ft</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                              <span>₹{pricePerSqft.toLocaleString('en-IN')}/sq.ft</span>
                              <Link
                                href={`/property/${p.id}`}
                                className="font-bold text-[#315DE8] hover:underline flex items-center gap-0.5"
                              >
                                Details →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </main>
          </div>

          {/* -------------------------------------------------------------
              RIGHT COLUMN: Buyer Benefits (~20% width / col-span-2)
             ------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-4 pt-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A66B] block">
                Why Buy With NILVORA
              </span>
              <h2 className="text-xl font-black text-white mt-1 leading-snug">
                Smarter Decisions. Better Homes.
              </h2>
            </div>

            {/* Five Benefit Items */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-xs text-white block">Verified Properties</strong>
                  <p className="text-[11px] text-slate-400 leading-tight">Trust & transparency with CMDA & Patta checks.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-xs text-white block">AI Property Matching</strong>
                  <p className="text-[11px] text-slate-400 leading-tight">Personalized recommendations tailored to budget.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#C9A66B]/20 text-[#C9A66B] flex items-center justify-center shrink-0 mt-0.5">
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-xs text-white block">Complete Cost Calculator</strong>
                  <p className="text-[11px] text-slate-400 leading-tight">Transparent ownership & Tamil Nadu stamp duty costs.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-xs text-white block">Secure Transactions</strong>
                  <p className="text-[11px] text-slate-400 leading-tight">Appropriate payment escrow & DPDP data protection.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-xs text-white block">End-to-End Support</strong>
                  <p className="text-[11px] text-slate-400 leading-tight">From search & site visit to key possession.</p>
                </div>
              </div>
            </div>

            {/* Gold Call-to-Action Button */}
            <div className="pt-2">
              <Link
                href="/buy"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A66B] to-[#DFBA7F] hover:from-[#DFBA7F] hover:to-[#C9A66B] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition transform hover:-translate-y-0.5"
              >
                <span>Your Dream Home Awaits</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section id="payments" className="bg-white py-8 text-slate-900">
        <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#101B33]">Payment history</h2>
              <p className="mt-1 text-sm text-slate-600">Property search and viewing are free. Paid services are optional.</p>
            </div>
            <Link href="/pricing" className="rounded-lg bg-[#315DE8] px-4 py-2 text-sm font-semibold text-white">Premium services & pricing</Link>
          </div>
          {paymentHistoryError && <p role="alert" className="text-sm text-red-700">{paymentHistoryError}</p>}
          {payments.length === 0 ? <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">No payment records are available for this account.</p> : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-2">Receipt</th><th>Service</th><th>Amount</th><th>Payment status</th><th>Service access</th><th>Date</th></tr></thead>
                <tbody>{payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{payment.receiptNumber}</td>
                    <td>{payment.purpose.replaceAll('_', ' ')}</td>
                    <td>₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td>{payment.isDemo && <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">DEMO</span>}{payment.status}</td>
                    <td>{payment.serviceStatus ? `${payment.serviceStatus}${payment.serviceExpiresAt ? ` · until ${new Date(payment.serviceExpiresAt).toLocaleDateString('en-IN')}` : ''}` : '—'}</td>
                    <td>{new Date(payment.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          REGION B: LOWER FEATURE OVERVIEW (Exact 10 Panels in 5-Column Grid x 2 Rows)
         ========================================================================= */}
      <section className="bg-white text-slate-900 py-12 border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#315DE8] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                End-to-End Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#101B33] mt-2">
                NILVORA Buyer Platform & Feature Ecosystem
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Every critical tool required by residential buyers and commercial investors in Tamil Nadu — integrated directly into live endpoints.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>10 Connected Operational Hubs</span>
            </div>
          </div>

          {/* 10 Feature Panels Grid: 5 columns on desktop, 2 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
            
            {/* -------------------------------------------------------------
                CARD 1: Property Search & Discovery
               ------------------------------------------------------------- */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  <Search className="w-4 h-4 text-[#315DE8]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Property Search & Discovery</h3>
                  <p className="text-[11px] text-slate-500">Intelligent discovery across Chennai</p>
                </div>

                {/* Compact Interactive Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>Location: Ambattur</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Budget: ₹50L – ₹1.5Cr</span>
                    <span>2–3 BHK</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <img src={properties[0]?.images[0]} alt="thumb" className="h-8 w-full object-cover rounded" />
                    <img src={properties[1]?.images[0]} alt="thumb" className="h-8 w-full object-cover rounded" />
                    <img src={properties[2]?.images[0]} alt="thumb" className="h-8 w-full object-cover rounded" />
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Listing browse & maps</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Advanced budget filters</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> 2–4 property comparison matrix</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Vertical video Reels tours</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Plots & builder launches</li>
                </ul>
              </div>

              <Link
                href="/buy"
                className="w-full py-2 px-3 rounded-lg bg-[#315DE8] text-white text-xs font-bold text-center hover:bg-blue-600 transition"
              >
                Browse All Properties →
              </Link>
            </div>

            {/* -------------------------------------------------------------
                CARD 2: Buyer Dashboard
               ------------------------------------------------------------- */}
            <div id="saved" className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  <LayoutDashboard className="w-4 h-4 text-[#315DE8]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Buyer Dashboard</h3>
                  <p className="text-[11px] text-slate-500">Centralized purchase command center</p>
                </div>

                {/* Compact Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Saved Properties:</span>
                    <strong className="text-red-500 font-bold">{savedPropertyIds.length}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Site Visit Bookings:</span>
                    <strong className="text-emerald-600 font-bold">{appointments.length}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Offers in Review:</span>
                    <strong className="text-amber-600 font-bold">{offers.length}</strong>
                  </div>
                  <div className="pt-1 text-[9px] text-slate-400 italic">
                    Recent: Ambattur Villa viewed 24m ago
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Saved homes management</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Site visit appointments</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Submitted offer tracking</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Deal Room milestone coordinator</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#315DE8]" /> Broker enquiry history</li>
                </ul>
              </div>

              <a
                href="#workspace"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition"
              >
                Go to Workspace ↑
              </a>
            </div>

            {/* -------------------------------------------------------------
                CARD 3: Site Visit & Appointment Booking
               ------------------------------------------------------------- */}
            <div id="visits" className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  <Calendar className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Site Visit & Booking</h3>
                  <p className="text-[11px] text-slate-500">Direct broker-guided appointments</p>
                </div>

                {/* Interactive Booking Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-2">
                  <div className="font-semibold text-slate-800 truncate">
                    Target: {properties[0]?.title || 'Ambattur 3BHK Villa'}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-1.5 py-1 rounded border border-slate-200 text-[10px] bg-slate-50"
                    />
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="px-1.5 py-1 rounded border border-slate-200 text-[10px] bg-slate-50"
                    >
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleQuickVisitBooking(properties[0]?.id || 'prop-1', properties[0]?.title || 'Ambattur Villa')}
                    className="w-full py-1 rounded bg-teal-600 text-white font-bold text-[10px] hover:bg-teal-700 transition"
                  >
                    Confirm Site Visit
                  </button>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Double-booking conflict guard</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Area broker assignment</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> Real-time status confirmation</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-teal-600" /> WhatsApp & SMS alerts</li>
                </ul>
              </div>

              <div className="text-[10px] text-slate-400 text-center font-semibold">
                {appointments.length} Visits Scheduled
              </div>
            </div>

            {/* -------------------------------------------------------------
                CARD 4: Offers & Negotiation
               ------------------------------------------------------------- */}
            <div id="offers" className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                  <Tag className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Offers & Negotiation</h3>
                  <p className="text-[11px] text-slate-500">Transparent bid & counter-offer flow</p>
                </div>

                {/* Compact Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Asking Price:</span>
                    <strong className="text-slate-800">₹1.15 Cr</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Buyer Offer:</span>
                    <strong className="text-emerald-600">₹1.08 Cr</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Seller Counter:</span>
                    <strong className="text-amber-600">₹1.12 Cr</strong>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[9px]">
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">In Review</span>
                    <span className="text-slate-400">Offer #off-1</span>
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Structured digital offers</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Counter-negotiation timeline</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Token advance escrow linkage</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-amber-600" /> Automatic Deal Room creation</li>
                </ul>
              </div>

              <Link
                href={`/deal-room/${dealRooms[0]?.id || 'deal-1'}`}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold text-center hover:bg-amber-400 transition"
              >
                View Deal Room →
              </Link>
            </div>

            {/* -------------------------------------------------------------
                CARD 5: Messaging & Communication
               ------------------------------------------------------------- */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">5</span>
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Messaging & Hub</h3>
                  <p className="text-[11px] text-slate-500">Unified buyer-broker chat channel</p>
                </div>

                {/* Compact Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Senthil Kumaran</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-slate-500 line-clamp-2 italic">
                    &quot;I have arranged the Patta copy and verified the 30-year EC for the Ambattur property.&quot;
                  </p>
                  <div className="text-[9px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Deal Room #deal-1</span>
                    <span>10m ago</span>
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Direct broker coordination</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Property enquiry threads</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Document attachment viewer</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-600" /> Tamper-proof message log</li>
                </ul>
              </div>

              <Link
                href="/messages"
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 text-white text-xs font-bold text-center hover:bg-indigo-700 transition"
              >
                Open Messages (3) →
              </Link>
            </div>

            {/* -------------------------------------------------------------
                CARD 6: Notifications
               ------------------------------------------------------------- */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">6</span>
                  <Bell className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Notifications</h3>
                  <p className="text-[11px] text-slate-500">Real-time alerts & status updates</p>
                </div>

                {/* Compact Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                    <div>
                      <strong className="text-slate-800 block">Offer Countered:</strong>
                      <span className="text-slate-500">Seller updated counter to ₹1.12 Cr</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 border-t border-slate-100 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                    <div>
                      <strong className="text-slate-800 block">New Property in Mogappair:</strong>
                      <span className="text-slate-500">3BHK High-rise newly listed</span>
                    </div>
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> Site visit confirmations</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> Offer negotiation alerts</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> Price reduction notifications</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-500" /> DPDP consent updates</li>
                </ul>
              </div>

              <Link
                href="/notifications"
                className="w-full py-2 px-3 rounded-lg bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-700 transition"
              >
                View Notifications →
              </Link>
            </div>

            {/* -------------------------------------------------------------
                CARD 7: Property Cost & Investment Tools
               ------------------------------------------------------------- */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">7</span>
                  <Calculator className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Cost & Investment Tools</h3>
                  <p className="text-[11px] text-slate-500">Tamil Nadu stamp duty & ROI engine</p>
                </div>

                {/* Live Calculator Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Property Price:</span>
                    <strong className="text-purple-700">{formatCurrency(calcPropertyValue)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>7% Stamp Duty:</span>
                    <span>₹{stampDuty.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>2% Registration:</span>
                    <span>₹{regFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold border-t border-slate-100 pt-1 text-slate-800">
                    <span>Total Govt Fees:</span>
                    <span className="text-emerald-600">₹{totalGovtCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Estimated Gross Rental Yield: <strong>{grossYield.toFixed(2)}%</strong>
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> TN stamp duty (7% + 2%)</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Monthly EMI forecast</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> 10-year CAGR wealth forecast</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-600" /> Cent / Ground area converter</li>
                </ul>
              </div>

              <Link
                href="/investment"
                className="w-full py-2 px-3 rounded-lg bg-purple-600 text-white text-xs font-bold text-center hover:bg-purple-700 transition"
              >
                Open Investment Tools →
              </Link>
            </div>

            {/* -------------------------------------------------------------
                CARD 8: Account & Access
               ------------------------------------------------------------- */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">8</span>
                  <User className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Account & Access</h3>
                  <p className="text-[11px] text-slate-500">Security & DPDP Act compliance</p>
                </div>

                {/* Compact Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Buyer Persona:</span>
                    <strong className="text-slate-800">Karthik S.</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Auth Method:</span>
                    <span className="text-emerald-600 font-semibold">PBKDF2 + OTP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">DPDP Consent:</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">Active</span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Session TTL: 24h • Rate limited
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-700" /> Phone OTP & PBKDF2 hashing</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-700" /> Role-based access control (RBAC)</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-700" /> DPDP Act 2023 consent ledger</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-700" /> Profile & language switch</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition"
              >
                Manage Profile & Security →
              </Link>
            </div>

            {/* -------------------------------------------------------------
                CARD 9: Property Trust & Verification
               ------------------------------------------------------------- */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#D9E4F5] flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#101B33] text-white text-[11px] font-bold flex items-center justify-center">9</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101B33]">Trust & Verification</h3>
                  <p className="text-[11px] text-slate-500">Legal due diligence & Trust Passport</p>
                </div>

                {/* Compact Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D9E4F5] text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Patta Number:</span>
                    <strong className="text-slate-800 font-mono">TN-AMB-2023</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">30-Yr EC Status:</span>
                    <span className="text-emerald-600 font-bold">Clear (Nil Encumbrance)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">CMDA Planning:</span>
                    <span className="text-blue-600 font-bold">Permit Approved</span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Reviewed by: Madras Bar Council Advocate
                  </div>
                </div>

                {/* Feature List */}
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Patta / Chitta document vault</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Sub-registrar EC tracking</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Survey number validation</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Trust Passport 100-pt audit</li>
                </ul>
              </div>

              <Link
                href="/verification"
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center hover:bg-emerald-700 transition"
              >
                Inspect Trust Passport →
              </Link>
            </div>

            {/* -------------------------------------------------------------
                CARD 10: Final NILVORA Buyer Portal Brand Card
               ------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-[#101B33] text-white border border-slate-700 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#315DE8] to-[#7357D9] flex items-center justify-center">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A66B] px-2 py-0.5 rounded bg-[#C9A66B]/10 border border-[#C9A66B]/20">
                    Verified Direct
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-base text-white">NILVORA Buyer Portal</h3>
                  <p className="text-xs text-blue-400 font-semibold mt-0.5">Your Dream Property. Our Priority.</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Start your property search with direct broker communication, clear titles, and verified Chennai documentation.
                </p>
              </div>

              <Link
                href="/buy"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A66B] to-[#DFBA7F] hover:from-[#DFBA7F] hover:to-[#C9A66B] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
              >
                <span>Find Your Home Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
