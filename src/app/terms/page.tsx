import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400 mt-1">Last Updated: February 2026 • Governed by the Laws of Tamil Nadu & India</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Nature of the NILVORA Platform</h2>
          <p>
            NILVORA is an online marketplace and transaction coordination platform facilitating discovery, vertical video reels preview, and communication between property sellers, prospective purchasers, and licensed real estate brokers. NILVORA is not an owner, lessor, or broker of listed properties unless explicitly identified in writing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Scope of Document Screening & Trust Passports</h2>
          <p>
            AI Document Intelligence reports, Patta extractions, and Trust Passport indicators are screening aids grounded in user-uploaded documents and public revenue formats. They do not constitute a formal title warranty or guarantee of ownership under the Indian Evidence Act or Transfer of Property Act 1882. All parties are required to obtain independent legal counsel before executing financial commitments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Broker Collaboration & Commission Accrual</h2>
          <p>
            Brokers operating on NILVORA must maintain valid registration with the Tamil Nadu Real Estate Regulatory Authority (TNRERA) where applicable. Commission entitlement arises solely from executed written agreements between the property seller, buyer, and broker. NILVORA charges subscription and facilitation fees independently of the underlying property consideration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Prohibited Conduct</h2>
          <p>
            Users shall not upload fraudulent revenue records, forge Patta/Chitta passbooks, post duplicate or unapproved plot layouts, or demand untraceable cash advances prior to legal document inspection.
          </p>
        </section>
      </div>
    </div>
  );
}
