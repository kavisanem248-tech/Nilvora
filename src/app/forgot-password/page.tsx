'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  KeyRound, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  ArrowLeft 
} from 'lucide-react';

function ForgotPasswordContent() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      setOtpCode('512903');
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-2xl font-black tracking-wider text-white">NILVORA</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Chennai
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">Reset Password</h1>
          <p className="text-slate-400 text-xs mt-1">
            Recover access to your NILVORA real estate account.
          </p>
        </div>

        <div className="bg-[#172642] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {step === 'request' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Registered Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="name@chennaitech.in or +91 98409..."
                    className="w-full bg-[#101B33] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                {isLoading ? <span>Sending Code...</span> : <span>Send Recovery OTP</span>}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">6-Digit Recovery OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="512903"
                  className="w-full bg-[#101B33] border border-blue-500 rounded-xl py-2.5 text-white text-base tracking-widest text-center font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Simulated test code filled.</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">New Secure Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#101B33] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#101B33] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                {isLoading ? <span>Updating Password...</span> : <span>Update & Save Password</span>}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Password Updated!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your account password has been safely updated. You can now sign in using your new credentials.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-700 text-center">
            <Link href="/login" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-white">Loading recovery...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
