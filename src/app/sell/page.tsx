'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PropertyItem, PropertyType, ListingType } from '@/types';
import { nilvoraStore } from '@/lib/store';
import { INITIAL_BROKERS } from '@/lib/mock-data';
import { checkListingCompliance } from '@/lib/compliance/rules';
import { requireSignedInForAction } from '@/lib/auth/client-session';
import {
  Check,
  Building,
  Upload,
  FileText,
  Eye,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Video,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Owner & Broker', desc: 'Declaration & agent assignment' },
  { id: 2, title: 'Property Specs', desc: 'Type, locality, price & survey' },
  { id: 3, title: 'Photos & Reels', desc: 'Visual media & video tour' },
  { id: 4, title: 'Documents', desc: 'Patta, EC & compliance' },
  { id: 5, title: 'Preview & Publish', desc: 'Final review & submit' },
];

export default function SellPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [canListProperty, setCanListProperty] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => {
        const role = result.session?.primaryRole;
        setCanListProperty(
          Boolean(result.authenticated && ['seller', 'broker', 'admin'].includes(role))
        );
      })
      .catch(() => setCanListProperty(false));
  }, []);

  // Form State
  const [ownerDeclaration, setOwnerDeclaration] = useState<'sole_owner' | 'joint_owner' | 'authorized_rep'>('sole_owner');
  const [assignedBrokerId, setAssignedBrokerId] = useState<string>('broker-1');
  const [agreedCommissionPercent, setAgreedCommissionPercent] = useState<number>(1.5);

  // Property details
  const [title, setTitle] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [locality, setLocality] = useState('Ambattur');
  const [subLocality, setSubLocality] = useState('Ambattur OT');
  const [pincode, setPincode] = useState('600053');
  const [price, setPrice] = useState<number>(6500000);
  const [priceNegotiable, setPriceNegotiable] = useState(true);
  const [areaSqft, setAreaSqft] = useState<number>(1150);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [surveyNumber, setSurveyNumber] = useState('');
  const [pattaNumber, setPattaNumber] = useState('');
  const [furnishingStatus, setFurnishingStatus] = useState<'semi-furnished' | 'fully-furnished' | 'unfurnished'>('semi-furnished');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Covered Car Parking',
    'Borewell Water',
    'CCTV Security',
  ]);

  // Media & Reel
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
  ]);
  const [reelUrl, setReelUrl] = useState(
    'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-modern-furniture-and-plants-41659-large.mp4'
  );
  const [reelCaption, setReelCaption] = useState('');

  // Documents
  const [docSaleDeedAttached, setDocSaleDeedAttached] = useState(true);
  const [docPattaAttached, setDocPattaAttached] = useState(true);
  const [docEcAttached, setDocEcAttached] = useState(true);

  // Errors / Warnings
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleNext = () => {
    setValidationErrors([]);
    if (currentStep === 2) {
      if (!title.trim()) {
        setValidationErrors(['Please enter a descriptive property title.']);
        return;
      }
      if (price <= 0) {
        setValidationErrors(['Please enter a valid price.']);
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!await requireSignedInForAction()) return;
    setIsSubmitting(true);

    const newPropertyId = `prop-${Date.now()}`;
    const newProperty: PropertyItem = {
      id: newPropertyId,
      ownerId: 'user-default-1',
      assignedBrokerId,
      title: title || 'Modern Property in Ambattur',
      titleTa: titleTa || 'அம்பத்தூரில் புதிய மனை',
      description: description || 'Well-maintained property with verified revenue documents.',
      propertyType,
      listingType,
      status: 'published',
      price,
      priceNegotiable,
      state: 'Tamil Nadu',
      district: 'Chennai',
      locality,
      subLocality,
      pincode,
      surveyNumber: surveyNumber || 'Survey 384/2A',
      pattaNumber: pattaNumber || 'TN-AMB-2026-REG',
      areaSqft,
      bedrooms,
      bathrooms,
      furnishingStatus,
      amenities: selectedAmenities,
      images: photos,
      reels: reelUrl
        ? [
            {
              id: `reel-${Date.now()}`,
              propertyId: newPropertyId,
              mediaType: 'video_reel',
              url: reelUrl,
              thumbnailUrl: photos[0],
              caption: reelCaption || title,
              durationSeconds: 30,
              isCover: true,
            },
          ]
        : [],
      trustScore: 92,
      trustScope: {
        sellerDeclaration: true,
        docChecked: docPattaAttached && docEcAttached,
        legalReviewed: false,
        reraVerified: true,
        ecVerified: docEcAttached,
        pattaVerified: docPattaAttached,
        lastCheckedDate: new Date().toISOString().split('T')[0],
        reviewerName: 'NILVORA Compliance & Broker Validation',
        disclaimer: 'Seller declaration and revenue records submitted. Pending advocate title search.',
      },
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty),
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        setValidationErrors([result.error || 'Could not submit this listing.']);
        setIsSubmitting(false);
        return;
      }

      nilvoraStore.addProperty(result.data, false);
      setIsSubmitting(false);
      router.push(`/property/${result.data.id}`);
    } catch {
      setValidationErrors(['Could not connect to the listing service. Please try again.']);
      setIsSubmitting(false);
    }
  };

  const compliance = checkListingCompliance({
    title,
    price,
    locality,
    areaSqft,
    surveyNumber,
    propertyType,
  });

  if (canListProperty === null) {
    return <div className="p-8 text-center text-black/60">Checking listing permissions...</div>;
  }

  if (!canListProperty) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="surface-3d space-y-4 p-8">
          <h1 className="text-2xl font-black text-black">Sign in to list a property</h1>
          <p className="text-sm text-black/65">Property owners, brokers, and admins can create listings.</p>
          <Link href={`/login?returnTo=${encodeURIComponent('/sell')}`} className="inline-flex rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-black shadow-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Heading */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          5-Step Seller Listing Wizard
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Post Your Property on NILVORA</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Reach genuine buyers across Ambattur & Chennai. Connect with a registered TN RERA broker to coordinate inquiries safely.
        </p>
      </div>

      {/* Wizard Step Indicator */}
      <div className="grid grid-cols-5 gap-2 border-b border-slate-800 pb-4">
        {STEPS.map((s) => (
          <div key={s.id} className="text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition mb-1 ${
                currentStep === s.id
                  ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                  : currentStep > s.id
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {currentStep > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <p className="text-[11px] font-bold text-slate-200 hidden sm:block">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 space-y-1">
          {validationErrors.map((err, i) => (
            <p key={i}>• {err}</p>
          ))}
        </div>
      )}

      {/* Form Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* STEP 1: OWNER & BROKER */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 1: Ownership Authority & Broker Partner</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Declare your legal capacity to list and select a verified broker for transaction assistance.
              </p>
            </div>

            {/* Declaration options */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Authority to List Property
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { key: 'sole_owner', title: 'Sole Title Owner', desc: 'Registered in my sole name on Sale Deed' },
                  { key: 'joint_owner', title: 'Joint Co-Owner', desc: 'Co-owners have granted written consent' },
                  { key: 'authorized_rep', title: 'Power of Attorney / Rep', desc: 'Registered GPA holder or builder rep' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setOwnerDeclaration(opt.key as any)}
                    className={`p-3.5 rounded-xl text-left border transition ${
                      ownerDeclaration === opt.key
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <p className="font-bold text-white mb-1">{opt.title}</p>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Broker */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Area Broker for Inquiries & Visit Coordination
              </label>
              <div className="space-y-2">
                {INITIAL_BROKERS.map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      assignedBrokerId === b.id
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="broker"
                        checked={assignedBrokerId === b.id}
                        onChange={() => setAssignedBrokerId(b.id)}
                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-xs">{b.fullName}</p>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                            {b.reraNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{b.agencyName} • {b.serviceAreas.join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">{b.defaultCommissionPercent}%</span>
                      <span className="text-[10px] text-slate-500 block">Commission on close</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROPERTY SPECS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 2: Property Details & Location</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide accurate dimensions, survey identifiers, and pricing for Ambattur / Chennai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Property Title (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 BHK Apartment near Ambattur TI Cycles"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Title in Tamil (Optional)</label>
                <input
                  type="text"
                  placeholder="அம்பத்தூரில் 2 BHK அடுக்குமாடி வீடு"
                  value={titleTa}
                  onChange={(e) => setTitleTa(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                >
                  <option value="apartment">Apartment / Flat</option>
                  <option value="villa">Independent Villa</option>
                  <option value="plot">Plot / Land (CMDA)</option>
                  <option value="independent_house">Independent House</option>
                  <option value="commercial">Commercial Space</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Listing Type</label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                >
                  <option value="sale">For Sale (Outright)</option>
                  <option value="rent">For Rent (Monthly)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Locality</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                >
                  <option value="Ambattur">Ambattur</option>
                  <option value="Mogappair">Mogappair</option>
                  <option value="Anna Nagar">Anna Nagar West</option>
                  <option value="Korattur">Korattur</option>
                  <option value="Avadi">Avadi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Expected Price (₹)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                />
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  ₹{(price / 100000).toFixed(1)} Lakhs
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Built-up Area (Sq.ft)</label>
                <input
                  type="number"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Bedrooms / BHK</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                >
                  <option value={0}>0 (Plot / Land)</option>
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4+ BHK</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Town Survey / Revenue Survey Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 412/1B2 or TSLR Ward B Block 14"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Patta Number (Tamil Nilam)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TN-AMB-2023-9912"
                  value={pattaNumber}
                  onChange={(e) => setPattaNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-2 pt-2 text-xs">
              <label className="block font-semibold text-slate-300 uppercase tracking-wider">
                Select Key Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Covered Car Parking',
                  'Elevator / Lift',
                  'Borewell Water',
                  'Metro Water Line',
                  '24/7 Security & CCTV',
                  '100% Power Backup',
                  'Solar Water Heater',
                  'Gated Enclave',
                ].map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2 rounded-lg text-left text-xs font-medium border transition ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    {selectedAmenities.includes(amenity) ? '✓ ' : '+ '}
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTOS & REELS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 3: Property Photos & Vertical Video Reel</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Listings with vertical video Reels receive 3.4x higher engagement and serious buyer visits.
              </p>
            </div>

            {/* Photo Previews */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-300 uppercase tracking-wider">
                Listing Photos (Exterior & Living)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((src, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-700 relative">
                    <img src={src} alt="Upload" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-bold text-white">
                      Photo {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Video Reel */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200 uppercase tracking-wider">
                  NILVORA Property Reel (Walkthrough MP4)
                </span>
              </div>
              <input
                type="text"
                placeholder="Video URL (e.g. MP4 video link or Reel upload)"
                value={reelUrl}
                onChange={(e) => setReelUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
              />

              <div>
                <label className="block text-slate-400 mb-1">Reel Caption (English & Tamil)</label>
                <input
                  type="text"
                  placeholder="e.g. 2150 sq.ft 3BHK Villa in Ambattur OT Walkthrough"
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENTS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 4: Title Documents & Trust Passport Declarations</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Attach available revenue records to unlock the verified Trust Passport badge.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer">
                <div>
                  <p className="font-bold text-white">Registered Sale Deed Copy</p>
                  <p className="text-[11px] text-slate-400">Proves vendor chain of title at Sub-Registrar Office</p>
                </div>
                <input
                  type="checkbox"
                  checked={docSaleDeedAttached}
                  onChange={(e) => setDocSaleDeedAttached(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer">
                <div>
                  <p className="font-bold text-white">Tamil Nilam Patta / Chitta Passbook</p>
                  <p className="text-[11px] text-slate-400">Verifies revenue mutation in Ambattur Taluk records</p>
                </div>
                <input
                  type="checkbox"
                  checked={docPattaAttached}
                  onChange={(e) => setDocPattaAttached(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer">
                <div>
                  <p className="font-bold text-white">30-Year Encumbrance Certificate (EC)</p>
                  <p className="text-[11px] text-slate-400">Inspected for nil active mortgages or attachments</p>
                </div>
                <input
                  type="checkbox"
                  checked={docEcAttached}
                  onChange={(e) => setDocEcAttached(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4"
                />
              </label>
            </div>

            {/* Compliance Engine Feedback */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>TN RERA Compliance Analysis</span>
              </div>
              {compliance.warnings.map((w, i) => (
                <p key={i} className="text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{w}</span>
                </p>
              ))}
              {compliance.recommendations.map((r, i) => (
                <p key={i} className="text-slate-300">
                  • {r}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: PREVIEW & PUBLISH */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Step 5: Review & Publish Listing</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify the public presentation before publishing live to the Ambattur marketplace.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {propertyType.toUpperCase()} • {listingType.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{title || 'Untitled Property'}</h3>
                  <p className="text-xs text-slate-400">{locality}, Chennai ({pincode})</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">₹{(price / 100000).toFixed(1)} Lakhs</p>
                  <p className="text-[11px] text-emerald-400">
                    {priceNegotiable ? 'Negotiable' : 'Fixed'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs text-slate-300 border-y border-slate-700 py-3">
                <div><strong>Area:</strong> {areaSqft} sq.ft</div>
                <div><strong>BHK:</strong> {bedrooms} Bedrooms</div>
                <div><strong>Survey:</strong> {surveyNumber || 'Pending'}</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                <strong>Assigned Broker:</strong> Senthil Kumaran (Ambattur Prime Realty Services • TN/AGENT/0491/2021)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800 text-[11px] text-slate-400 leading-relaxed">
              By clicking Publish, you confirm that you possess the lawful right to convey or market this property and accept NILVORA’s Terms of Service and broker coordination standards.
            </div>
          </div>
        )}

        {/* Bottom Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 text-sm font-extrabold transition shadow-xl shadow-emerald-500/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Listing...' : 'Publish Property Live'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
