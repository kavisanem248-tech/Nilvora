'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PublicRegistrationRole } from '@/lib/auth/rbac';
import { nilvoraStore } from '@/lib/store';
import { dashboardPathForRole } from '@/lib/auth/role-routes';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Briefcase, 
  Building2, 
  ArrowRight,
  KeyRound
} from 'lucide-react';

const REGISTRATION_ROLES: { role: PublicRegistrationRole; label: string; icon: typeof User }[] = [
  { role: 'buyer', label: 'Buyer / Investor', icon: User },
  { role: 'seller', label: 'Property Owner', icon: Building2 },
  { role: 'broker', label: 'TN RERA Broker', icon: Briefcase },
];

function RegisterContent() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<PublicRegistrationRole>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [locality, setLocality] = useState('Ambattur');
  
  // Role specific fields
  const [agencyName, setAgencyName] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);

  // OTP State
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentDpdp, setConsentDpdp] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentDpdp) {
      alert('Please accept the Digital Personal Data Protection (DPDP) Act 2023 terms to proceed.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setOtpCode('924810'); // simulated code
    }, 500);
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          otpCode,
          role: selectedRole,
          locality,
          preferredLanguage: 'en',
          consentDpdp,
          agencyName,
          reraNumber,
          experienceYears,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.user) {
        alert(result.error || 'Account registration failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
      nilvoraStore.setRole(result.user.role);
      setIsSubmitting(false);
      router.push(dashboardPathForRole(result.user.role));
    } catch {
      alert('Could not connect to the registration service. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-2xl font-black tracking-wider text-slate-900">NILVORA</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Chennai
            </span>
          </Link>
          <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
            Your Dream Property. Our Priority.
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-3">
            Create Verified NILVORA Account
          </h1>
          <p className="text-slate-600 text-xs md:text-sm mt-1">
            Join Chennai&apos;s verified real estate ecosystem with DPDP Act 2023 compliance.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg">
          {step === 'form' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {REGISTRATION_ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setSelectedRole(r.role)}
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                          selectedRole === r.role
                            ? 'bg-blue-50 border-blue-500 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${selectedRole === r.role ? 'text-blue-600' : 'text-slate-500'}`} />
                        <span className="text-xs">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anand Murugan"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Password (minimum 8 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anand@chennai.in"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Mobile Number (For OTP)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98401 23456"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Primary Locality</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="Ambattur">Ambattur, Chennai</option>
                      <option value="Mogappair">Mogappair (East / West)</option>
                      <option value="Anna Nagar">Anna Nagar West Extn</option>
                      <option value="Korattur">Korattur</option>
                      <option value="Avadi">Avadi / Pattabiram</option>
                      <option value="Poonamallee">Poonamallee / Thirumazhisai</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conditional Role Fields */}
              {selectedRole === 'broker' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    TN RERA Professional Registration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">TNRERA Agent No.</label>
                      <input
                        type="text"
                        required
                        value={reraNumber}
                        onChange={(e) => setReraNumber(e.target.value)}
                        placeholder="TN/AGENT/0912/2023"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">Realty Agency Name</label>
                      <input
                        type="text"
                        required
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="Ambattur Prime Realtors"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-700 block mb-1">Years of experience</label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">RERA registration is recorded as unverified until reviewed by NILVORA.</p>
                </div>
              )}

              {/* DPDP Act 2023 Statutory Consent Checkbox */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="dpdp"
                  required
                  checked={consentDpdp}
                  onChange={(e) => setConsentDpdp(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="dpdp" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                  I give explicit consent under India&apos;s <strong className="text-slate-900">Digital Personal Data Protection (DPDP) Act 2023</strong> for NILVORA to collect and process my contact information solely for real estate search, appointment coordination, Deal Room notifications, and legal document verification.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Generating SMS OTP...</span>
                ) : (
                  <>
                    <span>Verify Phone Number & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Enter Verification Code</h3>
                <p className="text-xs text-slate-600 mt-1">
                  We sent a 6-digit SMS verification code to <span className="font-mono text-slate-900">{phone || '+91 98401 23456'}</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="924810"
                  className="w-full bg-white border border-blue-500 rounded-xl py-3 text-slate-900 text-xl tracking-widest text-center font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 text-center block mt-1.5">
                  Simulated OTP pre-filled for test mode.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Edit Details
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  {isSubmitting ? <span>Creating Account...</span> : <span>Confirm & Enter Workspace</span>}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-700 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-900">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
