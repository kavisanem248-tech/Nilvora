'use client';

import React, { useState } from 'react';
import { PropertyItem } from '@/types';
import { requireSignedInForAction } from '@/lib/auth/client-session';
import { Calendar, Clock, CheckCircle2, X, ShieldAlert } from 'lucide-react';

interface VisitModalProps {
  property: PropertyItem | null;
  onClose: () => void;
}

export const VisitModal: React.FC<VisitModalProps> = ({ property, onClose }) => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (!await requireSignedInForAction()) return;
      const scheduledTime = new Date(`${date}T${timeSlot}:00`).toISOString();
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, scheduledTime, notes }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to request this site visit.');
      setIsSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to request this site visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Site Visit Requested</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your request for <strong>{property.title}</strong> has been sent. The visit is not confirmed until the property representative responds.
            </p>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 inline-block text-left space-y-1">
              <div><strong>Date & Time:</strong> {date} at {timeSlot}</div>
              <div><strong>Locality:</strong> {property.locality}, Chennai</div>
            </div>
            <div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Broker-Coordinated Property Visit
              </span>
              <h3 className="text-lg font-bold text-white leading-snug">{property.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {property.locality}, Chennai • ₹{(property.price / 100000).toFixed(1)} Lakhs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Preferred Date</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preferred Time</label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                  >
                    <option value="10:00">10:00 AM (Morning)</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="16:30">04:30 PM (Evening)</option>
                    <option value="17:30">05:30 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-medium mb-1">
                Specific questions or instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-red-300">{error}</p>}
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Contact privacy:</strong> Your account contact details are used for this request and are not displayed to other visitors.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? 'Sending request…' : 'Request Site Visit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VisitModal;
