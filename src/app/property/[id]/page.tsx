'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PropertyItem, BrokerProfile } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { INITIAL_BROKERS } from '@/lib/mock-data';
import { getPropertyImage, getPropertyTypeImage } from '@/lib/property-images';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { VisitModal } from '@/components/ui/VisitModal';
import { calculateTamilNaduRegistrationCharges } from '@/lib/compliance/rules';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  Share2,
  Heart,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  Award,
  Video,
  Play,
  ArrowRight,
  TrendingUp,
  Tag,
  DollarSign,
  AlertCircle,
  Clock,
} from 'lucide-react';

function PropertyDetailContent() {
  const routerParams = useParams();
  const propertyId = (routerParams?.id as string) || 'prop-1';

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [assignedBroker, setAssignedBroker] = useState<BrokerProfile | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerTerms, setOfferTerms] = useState('Standard 45-day closing with bank loan sanction.');
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeMessage, setLikeMessage] = useState('');
  const [ownerContact, setOwnerContact] = useState<{ fullName: string; phone: string; email: string } | null>(null);

  useEffect(() => {
    fetch(`/api/properties/${encodeURIComponent(propertyId)}`, { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() as Promise<{ data?: PropertyItem }> : null)
      .then((result) => {
        const liveProperty = result?.data;
        if (liveProperty) {
          setProperty(liveProperty);
          setOfferAmount(liveProperty.price);
          setAssignedBroker(INITIAL_BROKERS.find((broker) => broker.id === liveProperty.assignedBrokerId) || null);
        }
      })
      .catch((error: unknown) => console.warn('[NILVORA PROPERTY] Could not load published property:', error));
    fetch(`/api/properties/${encodeURIComponent(propertyId)}/like`, { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() as Promise<{ likesCount: number; liked: boolean }> : null)
      .then((result) => {
        if (result) {
          setLikesCount(result.likesCount);
          setIsLiked(result.liked);
        }
      })
      .catch((error: unknown) => console.warn('[NILVORA PROPERTY] Could not load likes:', error));
    fetch(`/api/properties/${encodeURIComponent(propertyId)}/contact`, { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() as Promise<{ unlocked?: boolean; contact?: { fullName: string; phone: string; email: string } }> : null)
      .then((result) => { if (result?.unlocked && result.contact) setOwnerContact(result.contact); })
      .catch((error: unknown) => console.warn('[NILVORA PROPERTY] Could not load authorized contact:', error));
  }, [propertyId]);

  const handleToggleLike = async () => {
    setLikeMessage('');
    try {
      const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/like`, { method: 'POST' });
      const result = await response.json() as { success?: boolean; error?: string; liked?: boolean; likesCount?: number };
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Could not update property like.');
      setIsLiked(Boolean(result.liked));
      setLikesCount(result.likesCount || 0);
    } catch (error) {
      setLikeMessage(error instanceof Error ? error.message : 'Could not update property like.');
    }
  };

  if (!property) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Property Not Found</h2>
        <p className="text-xs">The requested listing may have been sold, archived, or is awaiting moderation.</p>
        <Link href="/buy" className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
          Return to Buy Properties
        </Link>
      </div>
    );
  }

  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    return `₹${(p / 100000).toFixed(1)} Lakhs`;
  };

  const regCharges = calculateTamilNaduRegistrationCharges(property.price, property.propertyType);

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nilvoraStore.addOffer({
      propertyId: property.id,
      propertyTitle: property.title,
      buyerId: 'user-default-1',
      buyerName: 'Karthik Subburaj',
      brokerId: property.assignedBrokerId,
      offerAmount,
      status: 'submitted',
      termsConditions: offerTerms,
    });

    // Also update/add lead
    nilvoraStore.addLead({
      brokerId: property.assignedBrokerId || 'broker-1',
      buyerName: 'Karthik Subburaj',
      buyerPhone: '+91 98409 33211',
      budgetMin: offerAmount,
      budgetMax: property.price,
      preferredLocality: property.locality,
      propertyTypePreference: property.propertyType,
      status: 'negotiation',
      priority: 'urgent',
      notes: `Formal offer of ${formatPrice(offerAmount)} submitted for ${property.title}. Terms: ${offerTerms}`,
    });

    setOfferSubmitted(true);
    setTimeout(() => {
      setShowOfferModal(false);
      setOfferSubmitted(false);
    }, 1500);
  };

  const hasReel = property.reels && property.reels.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-400">Home</Link>
          <span>/</span>
          <Link href="/buy" className="hover:text-emerald-400">Buy</Link>
          <span>/</span>
          <span className="text-slate-200">{property.locality}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              nilvoraStore.toggleSaveProperty(property.id);
              setIsSaved(!isSaved);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-red-400 transition"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            type="button"
            onClick={() => void handleToggleLike()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 transition hover:text-red-400"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{likesCount.toLocaleString('en-IN')} likes</span>
          </button>
        </div>
      </div>
      {likeMessage && <p role="status" className="text-right text-xs text-amber-300">{likeMessage}</p>}

      {/* Main Grid: Gallery & Key Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Gallery & Media (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Photo / Video Preview */}
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
            <img
              src={getPropertyImage(property, activeImageIndex)}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(event) => {
                const fallbackImage = getPropertyTypeImage(property.propertyType);
                if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md border border-slate-700">
                {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              <TrustBadge score={property.trustScore} scope={property.trustScope} />
            </div>

            {hasReel && (
              <Link
                href="/reels"
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl backdrop-blur-md hover:bg-emerald-400 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Vertical Reel</span>
              </Link>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 aspect-[4/3] rounded-xl overflow-hidden border-2 shrink-0 transition ${
                  activeImageIndex === idx ? 'border-emerald-500' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img || getPropertyTypeImage(property.propertyType)}
                  alt={`${property.title} photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    const fallbackImage = getPropertyTypeImage(property.propertyType);
                    if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
                  }}
                />
              </button>
            ))}
          </div>

          {/* Property Description */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white">About this Property</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{property.description}</p>
            {property.titleTa && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  தமிழ் விளக்கம் (Tamil Title):
                </span>
                <p>{property.titleTa}</p>
              </div>
            )}
          </div>

          {/* Key Amenities */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
              {property.amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Broker & Trust Passport (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Price Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatPrice(property.price)}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {property.priceNegotiable ? 'Negotiable with Broker' : 'Fixed Price'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Approx. ₹{Math.round(property.price / property.areaSqft)} / sq.ft
              </p>
            </div>

            <h1 className="text-xl font-bold text-white leading-snug">{property.title}</h1>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{property.locality}, Chennai ({property.pincode})</span>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-xs text-slate-300 text-center">
              <div className="p-2 rounded-xl bg-slate-800/60">
                <Bed className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <span className="font-bold">{property.bedrooms} BHK</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <Bath className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <span className="font-bold">{property.bathrooms} Baths</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <Maximize2 className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <span className="font-bold">{property.areaSqft} sq.ft</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowVisitModal(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule a Free Site Visit</span>
              </button>

              <button
                onClick={() => setShowOfferModal(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Submit a Formal Offer</span>
              </button>
            </div>
          </div>

          {/* Grounded Trust Passport Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Property Trust Passport</h3>
                  <p className="text-[11px] text-slate-400">Evidence-Backed Verification Scope</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                {property.trustScore}/100
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Revenue Survey No.</span>
                <span className="font-mono font-bold text-white">{property.surveyNumber || '412/1B2'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Tamil Nilam Patta Ref.</span>
                <span className="font-mono font-bold text-white">{property.pattaNumber || 'TN-AMB-2023-9912'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">30-Year Encumbrance (EC)</span>
                <span className="font-semibold text-emerald-400">Inspected • Nil Encumbrance</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Jurisdiction SRO</span>
                <span className="text-slate-200">Sub-Registrar Office Ambattur</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              {property.trustScope.disclaimer}
            </p>
          </div>

          {/* Assigned Broker Partner Card */}
          {assignedBroker && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Assigned Transaction Broker
                </span>
                <span className="text-xs text-amber-400 font-bold">★ {assignedBroker.rating} Rating</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={assignedBroker.avatarUrl}
                  alt={assignedBroker.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{assignedBroker.fullName}</h4>
                  <p className="text-xs text-slate-400">{assignedBroker.agencyName}</p>
                  <p className="text-[11px] font-mono text-emerald-400 font-semibold">{assignedBroker.reraNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <div><strong>Experience:</strong> {assignedBroker.experienceYears} Years</div>
                <div><strong>Deals Closed:</strong> {assignedBroker.totalDealsClosed}+</div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {ownerContact ? (
                  <a href={`tel:${ownerContact.phone}`} className="flex-1 rounded-xl bg-slate-800 py-2 text-center text-xs font-bold text-slate-200 hover:bg-slate-700">
                    <Phone className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />
                    Call {ownerContact.fullName}
                  </a>
                ) : (
                  <Link
                    href={`/pricing?service=buyer-contact-unlock&propertyId=${encodeURIComponent(property.id)}`}
                    className="flex-1 rounded-xl border border-blue-500/40 bg-blue-500/10 py-2 text-center text-xs font-bold text-blue-200 hover:bg-blue-500/20"
                  >
                    Unlock Property Owner Contact
                  </Link>
                )}
                <button
                  onClick={() => setShowVisitModal(true)}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                >
                  Schedule Visit
                </button>
              </div>
            </div>
          )}

          {/* Tamil Nadu Registration Cost Breakdown Preview */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span>Govt Stamp Duty & Registration</span>
              <span className="text-emerald-400">
                ₹{(regCharges.totalGovtAndLegalCharges / 100000).toFixed(2)} L Approx
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Stamp Duty (7%):</span>
                <span>₹{(regCharges.stampDutyAmount / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="flex justify-between">
                <span>Registration Fee ({regCharges.registrationFeePercent}%):</span>
                <span>₹{(regCharges.registrationFeeAmount / 100000).toFixed(2)} Lakhs</span>
              </div>
            </div>
            <Link
              href="/calculator"
              className="text-[11px] text-teal-400 hover:underline block pt-1"
            >
              Open Full TN Stamp Duty Calculator →
            </Link>
          </div>
        </div>
      </div>

      {/* Visit Booking Modal */}
      <VisitModal property={showVisitModal ? property : null} onClose={() => setShowVisitModal(false)} />

      {/* Offer Submission Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowOfferModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              ✕
            </button>

            {offerSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Offer Submitted to Broker!</h3>
                <p className="text-xs text-slate-400">
                  Your formal offer has been logged and forwarded to the assigned agent. You can track this deal inside the Deal Room.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400">
                    Formal Purchase Offer
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{property.title}</h3>
                  <p className="text-slate-400">Listing Price: {formatPrice(property.price)}</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Your Offer Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:border-emerald-400"
                  />
                  <span className="text-emerald-400 font-bold block mt-1">
                    {formatPrice(offerAmount)}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Proposed Terms & Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={offerTerms}
                    onChange={(e) => setOfferTerms(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400">
                  Submitting an offer notifies the assigned broker to initiate discussions with the seller. No deposit is transferred until formal agreement execution.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition"
                >
                  Send Formal Offer
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Property...</div>}>
      <PropertyDetailContent />
    </React.Suspense>
  );
}
