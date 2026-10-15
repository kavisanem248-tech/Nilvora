import React, { useState } from 'react';
import { PropertyTrustScope } from '@/types';
import { ShieldCheck, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  scope: PropertyTrustScope;
  showModalOnClick?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ score, scope, showModalOnClick = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => showModalOnClick && setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-black shadow-[0_2px_0_#d8d8d8,0_6px_12px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
        title="Click to view verified Trust Scope"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-black" />
        <span>Trust Passport {score}/100</span>
        <Info className="w-3 h-3 text-black/55" />
      </button>

      {/* Scope Breakdown Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="surface-3d relative w-full max-w-md p-6 text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl border border-black/10 bg-[#f3f3f1] p-2 text-black">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">NILVORA Trust Passport</h3>
                  <p className="text-xs text-black/60">Evidence & Verification Scope Breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-black shadow-sm"
              >
                ✕
              </button>
            </div>

            <div className="mb-5 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-black/10 bg-[#f6f6f6] p-2.5">
                <span className="flex items-center gap-2">
                  {scope.sellerDeclaration ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Seller Authority Declaration</span>
                </span>
                <span className={`font-semibold ${scope.sellerDeclaration ? 'text-emerald-300' : 'text-amber-400'}`}>
                  {scope.sellerDeclaration ? 'Confirmed' : 'Not verified'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-black/10 bg-[#f6f6f6] p-2.5">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Patta / Chitta Revenue Match</span>
                </span>
                <span className="font-semibold text-emerald-300">
                  {scope.pattaVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-black/10 bg-[#f6f6f6] p-2.5">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>30-Year Encumbrance Cert. (EC)</span>
                </span>
                <span className="font-semibold text-emerald-300">
                  {scope.ecVerified ? 'Inspected (Nil Encumbrance)' : 'In Progress'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-black/10 bg-[#f6f6f6] p-2.5">
                <span className="flex items-center gap-2">
                  {scope.legalReviewed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Advocate Title Search Report</span>
                </span>
                <span
                  className={`font-semibold ${
                    scope.legalReviewed ? 'text-emerald-300' : 'text-amber-400'
                  }`}
                >
                  {scope.legalReviewed ? 'Completed' : 'Optional / Self-Check'}
                </span>
              </div>
            </div>

            {scope.reviewerName && (
              <div className="mb-4 rounded-lg border border-black/10 bg-[#f6f6f6] p-3 text-[11px] text-black/75">
                <strong>Assigned Reviewer:</strong> {scope.reviewerName}
                <br />
                <strong>Last Validated:</strong> {scope.lastCheckedDate}
              </div>
            )}

            <div className="mb-4 rounded-lg border border-black/10 bg-[#f6f6f6] p-3 text-[11px] leading-relaxed text-black/70">
              <strong>Transparent Legal Disclosure:</strong> {scope.disclaimer}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-lg bg-black py-2 text-xs font-bold text-white shadow-[0_3px_0_#555,0_8px_12px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
            >
              Close Trust Breakdown
            </button>
          </div>
        </div>
      )}
    </>
  );
};
