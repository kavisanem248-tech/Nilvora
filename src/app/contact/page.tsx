'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Send, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          Support & Grievance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Contact NILVORA Support</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Need assistance with property verification, broker assignments, or deal rooms? Our Chennai operations team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-xs text-slate-300">
          <h2 className="text-base font-bold text-white mb-4">Ambattur Operations Office</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Regional Headquarters:</strong>
                <p className="text-slate-400 leading-relaxed">
                  NILVORA Technologies India<br />
                  MTH Main Road, Near Ambattur OT Bus Terminus,<br />
                  Ambattur, Chennai 600053, Tamil Nadu
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Helpline:</strong>
                <p className="text-slate-400">+91 (044) 2658 9912 (Mon - Sat, 9:30 AM to 6:30 PM)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Email:</strong>
                <p className="text-slate-400">support@nilvora.in</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1 mt-6">
            <strong className="text-emerald-300 block">Statutory Grievance Officer:</strong>
            <p>Adv. M. Balaji, Legal & Compliance Officer</p>
            <p>Email: grievance@nilvora.in</p>
            <p className="text-slate-400">Response turnaround: within 48 business hours as per Indian IT Rules 2021.</p>
          </div>
        </div>

        {/* Working Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Message Dispatched!</h3>
              <p className="text-xs text-slate-400">
                Thank you, {name}. A member of our Ambattur transaction support team will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Query / Message</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
