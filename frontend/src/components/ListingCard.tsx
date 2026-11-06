'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  ShieldCheck, 
  Calendar, 
  Car, 
  Gauge, 
  Sparkles,
  ArrowRight,
  Heart
} from 'lucide-react';
import { Listing } from '@/lib/types';
import { isWishlistSaved, toggleWishlistId } from '@/lib/wishlist';

interface ListingCardProps {
  listing: Listing;
  onBookNow?: (listing: Listing) => void;
  onRequestInspection?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  onBookNow, 
  onRequestInspection 
}) => {
  const isRental = listing.transaction_type === 'RENT' || listing.transaction_type === 'LEASE';
  const coverImage = listing.images && listing.images.length > 0 
    ? listing.images[0].url 
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

  // Format currency (NGN, USD, etc)
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format rental period tag
  const formatRentalPeriod = (period?: string) => {
    switch (period) {
      case 'per_night': return '/ night';
      case 'per_day': return '/ day';
      case 'per_week': return '/ week';
      case 'per_month': return '/ month';
      case 'per_year': return '/ year';
      default: return '';
    }
  };

  const isShortLet = listing.rental_period === 'per_night' || listing.rental_period === 'per_day';
  const isVehicle = listing.asset_category === 'VEHICLE';

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isWishlistSaved(listing.id));
    const handleUpdate = () => setIsSaved(isWishlistSaved(listing.id));
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, [listing.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleWishlistId(listing.id);
    setIsSaved(newState);
  };

  return (
    <div className="group rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-brand-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-brand-500/10">
      
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
        <img
          src={coverImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/40" />

        {/* Top Tag Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Transaction Type Tag */}
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md ${
              listing.transaction_type === 'SALE'
                ? 'bg-amber-500/90 text-white'
                : listing.transaction_type === 'LEASE'
                ? 'bg-purple-600/90 text-white'
                : 'bg-brand-600/90 text-white'
            }`}>
              {listing.transaction_type}
            </span>

            {/* Verification Badge */}
            {listing.is_verified_asset && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified
              </span>
            )}
          </div>

          {/* Heart / Wishlist Toggle */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all hover:scale-110 shrink-0 shadow-lg"
            title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
          >
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white/80 hover:text-white'}`} />
          </button>
        </div>

        {/* Category Indicator */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-gray-300 backdrop-blur-sm border border-white/10 uppercase tracking-wider">
            {listing.asset_category}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate">
              {listing.neighbourhood ? `${listing.neighbourhood}, ` : ''}{listing.city}, {listing.state}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug mb-3">
            {listing.title}
          </h3>

          {/* Category-Specific Specifications */}
          <div className="flex items-center gap-4 text-xs text-gray-400 py-3 border-y border-gray-800/80 mb-4">
            {isVehicle ? (
              <>
                <span className="flex items-center gap-1">
                  <Car className="w-4 h-4 text-gray-500" />
                  {listing.attributes.year || 2023}
                </span>
                <span className="flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-gray-500" />
                  {listing.attributes.transmission || 'Automatic'}
                </span>
                {listing.attributes.condition && (
                  <span className="text-[11px] bg-gray-800 px-2 py-0.5 rounded text-gray-300">
                    {listing.attributes.condition}
                  </span>
                )}
              </>
            ) : listing.asset_category === 'LAND' ? (
              <>
                <span className="flex items-center gap-1 font-medium text-gray-300">
                  <Maximize2 className="w-4 h-4 text-brand-400" />
                  {listing.attributes.land_size ? `${listing.attributes.land_size.toLocaleString()} ${listing.attributes.land_unit || 'sqm'}` : 'Plot'}
                </span>
                {listing.attributes.title_document && (
                  <span className="text-[11px] bg-brand-950 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded">
                    {listing.attributes.title_document}
                  </span>
                )}
              </>
            ) : (
              <>
                {listing.attributes.bedrooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-gray-500" />
                    {listing.attributes.bedrooms} Beds
                  </span>
                )}
                {listing.attributes.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-gray-500" />
                    {listing.attributes.bathrooms} Baths
                  </span>
                )}
                {listing.attributes.furnishing_status && (
                  <span className="capitalize text-[11px] bg-gray-800 px-2 py-0.5 rounded text-gray-300">
                    {listing.attributes.furnishing_status.replace('_', ' ')}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mandatory Pricing & Action Buttons */}
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <div>
              <span className="text-xl font-bold text-white tracking-tight">
                {formatPrice(listing.price, listing.currency)}
              </span>
              {/* Mandatory rental price period display */}
              {isRental && (
                <span className="text-xs font-semibold text-brand-400 ml-1">
                  {formatRentalPeriod(listing.rental_period)}
                </span>
              )}
            </div>

            {listing.is_negotiable && (
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                Negotiable
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
            {isShortLet || isVehicle ? (
              <button
                onClick={() => onBookNow?.(listing)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Now</span>
              </button>
            ) : (
              <button
                onClick={() => onRequestInspection?.(listing)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>Book Viewing</span>
              </button>
            )}

            <Link
              href={`/listings/${listing.id}`}
              className="w-full flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-all"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
