import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400 mt-1">
          Compliant with the Digital Personal Data Protection Act (DPDP Act 2023) of India
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Data Fiduciary & Collection Principles</h2>
          <p>
            NILVORA adheres to data minimization. We collect only information necessary to authenticate accounts, coordinate site visits, and facilitate property conveyances. We do not solicit Aadhaar numbers, biometric data, or bank credentials by default.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Consent-Based Document Sharing</h2>
          <p>
            Property documents uploaded to private storage (such as parent deeds or draft sale agreements) are protected by Row Level Security and are shared only with explicitly authorized Deal Room participants (assigned broker, advocate, and buyer).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Phone Number & Contact Protection</h2>
          <p>
            Buyer phone numbers are not published on public web pages. Contact details are transferred solely to the designated TN RERA broker when a buyer requests an accompanied site visit or submits an offer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Data Principal Rights & Grievance Contact</h2>
          <p>
            You have the right to request access, correction, or deletion of your personal data. Inquiries and grievance escalation may be directed to our Grievance Officer: Adv. M. Balaji (Email: grievance@nilvora.in).
          </p>
        </section>
      </div>
    </div>
  );
}
