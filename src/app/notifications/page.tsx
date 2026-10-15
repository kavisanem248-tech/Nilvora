'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { SessionGuard } from '@/components/auth/SessionGuard';
import { 
  Bell, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  ArrowRight, 
  Filter,
  Trash2
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'visit' | 'offer' | 'compliance' | 'payment' | 'security';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'normal' | 'high' | 'urgent';
  linkUrl?: string;
  linkLabel?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'visit',
    title: 'Site Visit Confirmed by Broker',
    message: 'Broker Senthil Kumaran confirmed your physical inspection of Gated 3 BHK Luxury Villa (prop-1) for Saturday at 11:00 AM.',
    timestamp: '25 mins ago',
    isRead: false,
    priority: 'high',
    linkUrl: '/dashboard/buyer',
    linkLabel: 'View Visit Details',
  },
  {
    id: 'n2',
    type: 'offer',
    title: 'Counter-Offer Received in Deal Room',
    message: 'Seller Jayaraman accepted token conditions and countered with ₹1.12 Cr for the Ambattur Villa.',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'urgent',
    linkUrl: '/deal-room/deal-1',
    linkLabel: 'Open Deal Room',
  },
  {
    id: 'n3',
    type: 'compliance',
    title: 'Patta & 30-Year EC Audit Cleared',
    message: 'Adv. Sivasankaran marked legal audit complete for Survey No. 412/1B2 with Nil encumbrances.',
    timestamp: 'Yesterday',
    isRead: true,
    priority: 'high',
    linkUrl: '/property/prop-1',
    linkLabel: 'View Trust Passport',
  },
  {
    id: 'n4',
    type: 'payment',
    title: 'Commission Escrow Milestone Met',
    message: 'Token advance of ₹1,00,000 verified. Platform fee invoice generated with 18% GST compliance.',
    timestamp: '2 days ago',
    isRead: true,
    priority: 'normal',
    linkUrl: '/pricing',
    linkLabel: 'View Invoice',
  },
  {
    id: 'n5',
    type: 'security',
    title: 'DPDP Act 2023 Consent Recorded',
    message: 'Your consent for property coordination and SRO documentation audit has been securely logged.',
    timestamp: '3 days ago',
    isRead: true,
    priority: 'normal',
    linkUrl: '/privacy',
    linkLabel: 'Review Privacy Terms',
  },
];

function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleClear = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter((n) => {
    if (showUnreadOnly && n.isRead) return false;
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'visit':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'offer':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'compliance':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-400" />
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold font-mono">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time alerts for property visits, Deal Room progress, offers, and legal audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3.5 py-2 rounded-xl bg-[#172642] hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
              >
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 rounded-xl bg-[#172642] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#172642] p-2 rounded-2xl border border-slate-700">
          <div className="flex flex-wrap gap-1.5">
            {['all', 'visit', 'offer', 'compliance', 'payment'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Alerts' : type}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 px-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span>Unread Only</span>
          </label>
        </div>

        {/* Notification List */}
        {filtered.length === 0 ? (
          <div className="bg-[#172642] border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">All Caught Up!</h3>
            <p className="text-xs text-slate-400">
              You have no pending alerts matching your selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition flex items-start gap-4 ${
                  !item.isRead
                    ? 'bg-[#172642] border-blue-500/40 shadow-lg'
                    : 'bg-[#101B33]/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${!item.isRead ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-xs font-bold truncate ${!item.isRead ? 'text-white' : 'text-slate-300'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between">
                    {item.linkUrl ? (
                      <Link
                        href={item.linkUrl}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold hover:underline"
                      >
                        <span>{item.linkLabel || 'View Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : <div />}

                    <button
                      onClick={() => handleToggleRead(item.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                    >
                      {item.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-white">Loading alerts...</div>}>
      <SessionGuard><NotificationsContent /></SessionGuard>
    </Suspense>
  );
}
