'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserRole } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { dashboardPathForRole } from '@/lib/auth/role-routes';
import { 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Building, 
  Briefcase, 
  KeyRound
} from 'lucide-react';

const DEMO_PROFILES: { role: UserRole; label: string; desc: string; icon: typeof User }[] = [
  {
    role: 'buyer',
    label: 'Verified Buyer',
    desc: 'Browse Sites, save listings, and manage enquiries',
    icon: User,
  },
  {
    role: 'seller',
    label: 'Individual Seller',
    desc: 'Manage properties and upload site reels',
    icon: Building,
  },
  {
    role: 'broker',
    label: 'TN RERA Broker',
    desc: 'Manage assigned properties and enquiries',
    icon: Briefcase,
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const initialRole = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRole && ['buyer', 'seller', 'broker', 'builder', 'legal_pro', 'admin'].includes(initialRole)
      ? initialRole as UserRole
      : 'buyer'
  );
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleQuickDemoLogin = async (profile: typeof DEMO_PROFILES[0]) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemoMode: true, demoRole: profile.role, requestedRole: profile.role }),
      });
      const result = await response.json();
      if (!response.ok || !result.user) {
        setMessage(result.error || 'Demo sign-in failed.');
        setIsLoading(false);
        return;
      }
      nilvoraStore.setRole(result.user.role);
      setIsLoading(false);
      redirectToDashboard(result.user.role);
    } catch {
      setMessage('Could not connect to the sign-in service. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtpCode('849201'); // simulated OTP
      setMessage('SMS OTP sent to your registered mobile number! (Simulated Code: 849201)');
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password, otpCode, authMode, requestedRole: selectedRole }),
      });
      const result = await response.json();
      if (!response.ok || !result.user) {
        setMessage(result.error || 'Sign-in failed. Please try again.');
        setIsLoading(false);
        return;
      }
      nilvoraStore.setRole(result.user.role);
      setIsLoading(false);
      redirectToDashboard(result.user.role);
    } catch {
      setMessage('Could not connect to the sign-in service. Please try again.');
      setIsLoading(false);
    }
  };

  const redirectToDashboard = (role: UserRole) => {
    router.push(dashboardPathForRole(role));
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-2xl font-black tracking-wider text-white">NILVORA</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Chennai
            </span>
          </Link>
          <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            Your Dream Property. Our Priority.
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-3">
            Sign In to NILVORA Portal
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Access your personalized real estate workspace, Deal Rooms, and verified listings.
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-8 items-start ${process.env.NODE_ENV === 'production' ? 'lg:grid-cols-1' : 'lg:grid-cols-12'}`}>
          {/* Form Card */}
          <div className={`${process.env.NODE_ENV === 'production' ? '' : 'lg:col-span-7'} bg-[#172642] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl`}>
            {/* Auth Mode Tabs */}
            <div className="flex rounded-xl bg-[#101B33] p-1 mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => { setAuthMode('password'); setOtpSent(false); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  authMode === 'password'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                disabled={selectedRole === 'admin'}
                onClick={() => setAuthMode('otp')}
                title={selectedRole === 'admin' ? 'Admin accounts must use password sign-in.' : undefined}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  authMode === 'otp'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Phone OTP Login
              </button>
            </div>

            {message && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={authMode === 'otp' && !otpSent ? handleSendOtp : handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="account-role" className="text-xs font-medium text-slate-300 block mb-1">
                  Sign in as
                </label>
                <select
                  id="account-role"
                  value={selectedRole}
                  onChange={(event) => {
                    const role = event.target.value as UserRole;
                    setSelectedRole(role);
                    if (role === 'admin') {
                      setAuthMode('password');
                      setOtpSent(false);
                      setOtpCode('');
                    }
                  }}
                  className="w-full bg-[#101B33] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="broker">Broker</option>
                  <option value="builder">Builder / Developer</option>
                  <option value="legal_pro">Legal Professional</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {selectedRole === 'admin' && process.env.NODE_ENV !== 'production' && (
                <p className="text-[11px] text-amber-300">
                  Local development only: the admin username and password must be configured in the ignored .env.local file.
                </p>
              )}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {authMode === 'password'
                    ? selectedRole === 'admin' && process.env.NODE_ENV !== 'production'
                      ? 'Local admin username or email'
                      : 'Email Address or Mobile Number'
                    : 'Registered 10-Digit Mobile Number'}
                </label>
                <div className="relative">
                  {authMode === 'password' ? (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  ) : (
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  )}
                  <input
                    type={authMode === 'password' ? 'text' : 'tel'}
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={authMode === 'password'
                      ? selectedRole === 'admin' && process.env.NODE_ENV !== 'production' ? 'admin' : 'name@chennaitech.in'
                      : '+91 98409 33211'}
                    className="w-full bg-[#101B33] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {authMode === 'password' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <Link href="/forgot-password" className="text-xs text-blue-400 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#101B33] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {authMode === 'otp' && otpSent && (
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Enter 6-Digit SMS OTP</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full bg-[#101B33] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-base tracking-widest text-center focus:outline-none focus:border-blue-500 font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">SMS delivered in test mode. Simulated OTP auto-filled.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition mt-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === 'otp' && !otpSent ? 'Send OTP Code' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700 text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have a NILVORA account yet?{' '}
                <Link href="/register" className="text-blue-400 font-semibold hover:underline">
                  Create Role Account
                </Link>
              </p>
            </div>
          </div>

          {process.env.NODE_ENV !== 'production' && (
          <div className="lg:col-span-5 bg-[#172642]/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="font-bold text-white text-sm">One-Click Demo Switcher</h3>
                <p className="text-[11px] text-slate-400">Preview buyer, seller, or broker portals</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {DEMO_PROFILES.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(p)}
                    className="w-full p-3 rounded-xl bg-[#101B33] hover:bg-[#101B33]/60 border border-slate-800 hover:border-blue-500/50 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-white">{p.label}</strong>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                            {p.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-300">
              🔒 <strong className="text-blue-300">RBAC Enforced:</strong> Each portal runs with role-specific views and data synchronization across the shared state.
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-white">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
