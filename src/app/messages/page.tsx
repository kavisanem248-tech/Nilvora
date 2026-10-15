'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  ShieldCheck, 
  Building, 
  User, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Phone,
  Video
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'buyer' | 'seller' | 'broker' | 'builder' | 'legal_pro';
  content: string;
  timestamp: string;
  isMe: boolean;
  attachmentName?: string;
}

interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  category: 'deal_room' | 'property' | 'legal';
  dealRoomId?: string;
  propertyId?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
  verifiedBadge?: string;
  messages: ChatMessage[];
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread-1',
    title: 'Gated 3 BHK Villa Deal Room',
    subtitle: 'Senthil Kumaran (TN RERA Broker) & Seller Jayaraman',
    category: 'deal_room',
    dealRoomId: 'deal-1',
    propertyId: 'prop-1',
    unreadCount: 1,
    lastMessage: 'Advocate has verified the 30-year Encumbrance Certificate from Ambattur SRO.',
    lastMessageTime: '10:45 AM',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    verifiedBadge: 'TN/AGENT/0491/2021',
    messages: [
      {
        id: 'm1',
        senderName: 'Senthil Kumaran',
        senderRole: 'broker',
        content: 'Vanakkam Karthik sir! I have scheduled the joint site inspection for this Saturday at 11:00 AM.',
        timestamp: 'Yesterday 4:15 PM',
        isMe: false,
      },
      {
        id: 'm2',
        senderName: 'Karthik Subburaj',
        senderRole: 'buyer',
        content: 'Thanks Senthil. Can you confirm if the Patta copy in the seller name has been uploaded to the Deal Room?',
        timestamp: 'Yesterday 4:30 PM',
        isMe: true,
      },
      {
        id: 'm3',
        senderName: 'Senthil Kumaran',
        senderRole: 'broker',
        content: 'Yes sir! Adv. Sivasankaran inspected Patta No. TN-AMB-2023-9912. The 30-year EC from 1996 to 2026 is 100% clean with Nil encumbrances.',
        timestamp: '10:45 AM',
        isMe: false,
        attachmentName: 'Ambattur_SRO_Nil_EC_1996_2026.pdf',
      },
    ],
  },
  {
    id: 'thread-2',
    title: 'Ambattur 2 BHK TI Cycles Enquiry',
    subtitle: 'Direct with Owner M. Jayaraman',
    category: 'property',
    propertyId: 'prop-2',
    unreadCount: 0,
    lastMessage: 'The covered two-wheeler parking and water connection are included in the price.',
    lastMessageTime: 'Yesterday',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    messages: [
      {
        id: 'm2-1',
        senderName: 'Karthik Subburaj',
        senderRole: 'buyer',
        content: 'Hello sir, does the ₹52 Lakh price include maintenance deposit or are there additional charges?',
        timestamp: 'Yesterday 2:10 PM',
        isMe: true,
      },
      {
        id: 'm2-2',
        senderName: 'M. Jayaraman',
        senderRole: 'seller',
        content: 'The covered two-wheeler parking and water connection are included in the price. Registration charges can be handled via NILVORA Deal Room.',
        timestamp: 'Yesterday 3:05 PM',
        isMe: false,
      },
    ],
  },
  {
    id: 'thread-3',
    title: 'Casagrand Hazen Project Helpdesk',
    subtitle: 'Developer Sales Operations Team',
    category: 'property',
    propertyId: 'prop-7',
    unreadCount: 0,
    lastMessage: 'SBI has issued APF letter No. APF/CHE/2024/889 with 8.5% interest rate.',
    lastMessageTime: '2 days ago',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    verifiedBadge: 'TNRERA Approved Builder',
    messages: [
      {
        id: 'm3-1',
        senderName: 'Casagrand Sales Desk',
        senderRole: 'builder',
        content: 'Welcome Karthik! Thank you for downloading the Casagrand Hazen Tower-B brochure. SBI has issued APF letter No. APF/CHE/2024/889 with 8.5% interest rate.',
        timestamp: '2 days ago',
        isMe: false,
      },
    ],
  },
];

function MessagesContent() {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'deal_room' | 'property'>('all');

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'Karthik Subburaj',
      senderRole: 'buyer',
      content: newMessage.trim(),
      timestamp: 'Just now',
      isMe: true,
    };

    const updatedThreads = threads.map((t) => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: userMsg.content,
          lastMessageTime: 'Just now',
          messages: [...t.messages, userMsg],
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setNewMessage('');

    // Trigger intelligent simulated reply after 1.2s
    setTimeout(() => {
      const brokerReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderName: activeThread.category === 'deal_room' ? 'Senthil Kumaran (Broker)' : 'NILVORA Property Concierge',
        senderRole: 'broker',
        content: `Got it! I have logged this request in the Deal Room audit ledger. SRO appointment and checklist updated.`,
        timestamp: 'Just now',
        isMe: false,
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              lastMessage: brokerReply.content,
              lastMessageTime: 'Just now',
              messages: [...t.messages, brokerReply],
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  const filteredThreads = threads.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (searchQuery) {
      return (
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              Unified Communications Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Encrypted messaging across Buyers, Sellers, TN RERA Brokers, and Legal Advisors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#172642] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden min-h-[640px]">
          {/* Threads Sidebar */}
          <div className="lg:col-span-4 border-r border-slate-700/80 bg-[#101B33] flex flex-col">
            {/* Search & Filter Header */}
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full bg-[#172642] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-1.5 bg-[#172642] p-1 rounded-xl">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                    filterCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({threads.length})
                </button>
                <button
                  onClick={() => setFilterCategory('deal_room')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                    filterCategory === 'deal_room' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Deal Rooms
                </button>
                <button
                  onClick={() => setFilterCategory('property')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                    filterCategory === 'property' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Enquiries
                </button>
              </div>
            </div>

            {/* Threads List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full p-4 text-left transition flex items-start gap-3 cursor-pointer ${
                    activeThreadId === thread.id
                      ? 'bg-[#172642] border-l-4 border-blue-500'
                      : 'hover:bg-[#172642]/50'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-700">
                    <Image
                      src={thread.avatar}
                      alt={thread.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-white truncate">{thread.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{thread.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mb-1.5">{thread.lastMessage}</p>

                    <div className="flex items-center gap-2">
                      {thread.verifiedBadge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {thread.verifiedBadge}
                        </span>
                      )}
                      {thread.dealRoomId && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Live Deal Room
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Column */}
          <div className="lg:col-span-8 flex flex-col bg-[#172642]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700/80 bg-[#172642] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-600 shrink-0">
                  <Image
                    src={activeThread.avatar}
                    alt={activeThread.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    {activeThread.title}
                    {activeThread.verifiedBadge && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">{activeThread.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeThread.dealRoomId && (
                  <Link
                    href={`/deal-room/${activeThread.dealRoomId}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold border border-blue-500/30 flex items-center gap-1.5 transition"
                  >
                    <span>Open Deal Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {activeThread.propertyId && (
                  <Link
                    href={`/property/${activeThread.propertyId}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    View Listing
                  </Link>
                )}
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              <div className="text-center my-2">
                <span className="text-[10px] text-slate-400 bg-[#101B33] px-3 py-1 rounded-full border border-slate-800">
                  End-to-End Logged under NILVORA Security & Audit Standards
                </span>
              </div>

              {activeThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-md'
                        : 'bg-[#101B33] text-slate-200 rounded-bl-xs border border-slate-800 shadow-md'
                    }`}
                  >
                    {msg.content}

                    {msg.attachmentName && (
                      <div className="mt-2.5 p-2 rounded-lg bg-black/20 border border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                          <span className="text-[11px] font-mono truncate">{msg.attachmentName}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/40 text-white font-medium shrink-0">
                          PDF View
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/80 bg-[#101B33] flex items-center gap-3">
              <button
                type="button"
                className="p-2.5 rounded-xl bg-[#172642] text-slate-400 hover:text-white border border-slate-700 transition"
                title="Attach Document or Photo"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message, query or counter-offer terms..."
                className="flex-1 bg-[#172642] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-white">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
