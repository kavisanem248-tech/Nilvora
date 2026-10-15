'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PropertyItem } from '@/types';
import { requireSignedInForAction } from '@/lib/auth/client-session';
import { getPropertyImage, getPropertyTypeImage } from '@/lib/property-images';
import { TrustBadge } from './TrustBadge';
import { nilvoraStore } from '@/lib/store';
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Play,
  UserCheck,
  Calendar,
  Share2,
} from 'lucide-react';

interface PropertyCardProps {
  property: PropertyItem;
  onQuickVisit?: (property: PropertyItem) => void;
  isDemo?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onQuickVisit, isDemo = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(1)} Lakhs`;
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!await requireSignedInForAction()) return;
    nilvoraStore.toggleSaveProperty(property.id);
    setIsSaved(!isSaved);
  };

  const handleQuickVisit = async () => {
    if (!await requireSignedInForAction()) return;
    onQuickVisit?.(property);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!await requireSignedInForAction()) return;
    setShareError('');
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setShareError('Could not copy the link. Check browser clipboard permissions.');
      }
    }
  };

  const hasReel = property.reels && property.reels.length > 0;
  const primaryImage = getPropertyImage(property);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_4px_0_#e1e1e1,0_18px_38px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_6px_0_#d8d8d8,0_24px_44px_rgba(0,0,0,0.16)]">
      {/* Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f3f3f1]">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
          onError={(event) => {
            const fallbackImage = getPropertyTypeImage(property.propertyType);
            if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black text-white backdrop-blur-md border border-white/20">
            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          {property.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black text-white shadow-md">
              Featured
            </span>
          )}
          {isDemo && (
            <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Demo
            </span>
          )}
        </div>

        {/* Top Right Quick Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={handleShare}
            className="rounded-full border border-black/10 bg-white p-2 text-black shadow-md transition hover:-translate-y-0.5"
            title="Copy share link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleSave}
            className={`rounded-full border border-black/10 bg-white p-2 shadow-md transition hover:-translate-y-0.5 ${
              isSaved ? 'text-red-500 fill-red-500' : 'text-slate-200 hover:text-red-400'
            }`}
            title="Save to favourites"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Video Reel Badge */}
        {hasReel && (
          <Link
            href="/reels"
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Watch Reel</span>
          </Link>
        )}

        {/* Copied notification */}
        {(copied || shareError) && (
          <div role={shareError ? 'alert' : 'status'} className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 px-4 text-center text-xs font-bold text-white backdrop-blur-sm">
            {shareError || 'Link copied to clipboard!'}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Price & Trust Badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="text-2xl font-black tracking-tight text-black">
                {formatPrice(property.price)}
                {property.listingType === 'rent' && <span className="text-xs font-normal text-black/55">/mo</span>}
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                {property.priceNegotiable ? 'Negotiable with Broker' : 'Fixed Price'}
              </p>
            </div>
            <TrustBadge score={property.trustScore} scope={property.trustScope} />
          </div>

          {/* Title */}
          <Link href={`/property/${property.id}`} className="block group-hover:text-emerald-700 transition">
            <h3 className="font-bold text-base text-slate-900 line-clamp-1 leading-snug">
              {property.title}
            </h3>
            {property.titleTa && (
              <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                {property.titleTa}
              </p>
            )}
          </Link>

          {/* Locality */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-black/60">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="line-clamp-1">
              {property.subLocality ? `${property.subLocality}, ` : ''}{property.locality}, Chennai ({property.pincode})
            </span>
          </div>

          {/* Attributes row */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-200 text-xs text-slate-700">
            {property.bedrooms > 0 ? (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-slate-500" />
                <span>{property.bedrooms} Beds</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-slate-500" />
                <span>Open Land</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-slate-500" />
              <span>{property.bathrooms} Baths</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-slate-500" />
              <span>{property.areaSqft} sq.ft</span>
            </div>
          </div>
        </div>

        {/* Bottom Broker Coordination Row & CTA */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-black bg-black text-xs font-bold text-white">
              <UserCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-[11px] leading-tight">
              <p className="text-slate-700 font-medium">{isDemo ? 'Sample listing' : 'Assigned Broker'}</p>
              {!isDemo && <p className="text-slate-500">Verified Partner</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onQuickVisit && (
              <button
                type="button"
                onClick={() => void handleQuickVisit()}
                className="rounded-lg border border-black/10 bg-white p-2 text-black shadow-sm transition hover:-translate-y-0.5"
                title="Schedule a Site Visit"
              >
                <Calendar className="w-4 h-4 text-teal-400" />
              </button>
            )}
            <Link
              href={`/property/${property.id}`}
              className="rounded-lg bg-black px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_3px_0_#555,0_8px_12px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
            >
              View Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
