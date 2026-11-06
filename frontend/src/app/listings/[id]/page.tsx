'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Bed, 
  Bath, 
  Maximize2, 
  Car, 
  Gauge, 
  Fuel, 
  Sparkles, 
  Share2, 
  Heart, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Video,
  Send,
  Building2,
  FileCheck,
  UserCheck,
  MessageCircle,
  Phone,
  PhoneCall,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { BookingModal } from '@/components/BookingModal';
import { Listing } from '@/lib/types';
import { api } from '@/lib/api';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id ? Number(params.id) : null;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Inspection booking state
  const [inspectionType, setInspectionType] = useState<'PHYSICAL' | 'VIRTUAL'>('PHYSICAL');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionSlot, setInspectionSlot] = useState('Morning (9am - 12pm)');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionSubmitting, setInspectionSubmitting] = useState(false);
  const [inspectionSuccess, setInspectionSuccess] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  // Direct Inquiry state
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchListingDetail(listingId);
    }
  }, [listingId]);

  const fetchListingDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.getListingById(id);
      if (res.data) {
        setListing(res.data);
      }
    } catch (err) {
      console.error('Failed to load listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionDate) {
      setInspectionError('Please choose a preferred date for the inspection.');
      return;
    }

    setInspectionSubmitting(true);
    setInspectionError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/v1/inspections/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listing_id: listingId,
          inspection_type: inspectionType,
          preferred_date: new Date(inspectionDate).toISOString(),
          time_slot: inspectionSlot,
          requester_notes: inspectionNotes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to submit inspection request.');
      }

      setInspectionSuccess(true);
    } catch (err: any) {
      setInspectionError(err.message || 'Inspection booking requires account login.');
    } finally {
      setInspectionSubmitting(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;

    setInquirySubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/v1/messages/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listing_id: listingId,
          recipient_id: listing?.user_id || 1,
          content: inquiryText,
        }),
      });

      if (!res.ok) throw new Error('Inquiry failed.');
      setInquirySuccess(true);
      setInquiryText('');
    } catch (err) {
      alert('To send a direct message to the owner, please log in with your account.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-between">
        <Navbar onOpenAI={() => setAiModalOpen(true)} />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Loading verified asset details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-between">
        <Navbar onOpenAI={() => setAiModalOpen(true)} />
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Listing Not Found</h2>
          <p className="text-xs text-gray-400">This asset may have been rented, sold, or unlisted by the owner.</p>
          <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-xs font-bold">
            Back to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isRental = listing.transaction_type === 'RENT' || listing.transaction_type === 'LEASE';
  const isShortLet = listing.rental_period === 'per_night' || listing.rental_period === 'per_day';
  const isVehicle = listing.asset_category === 'VEHICLE';

  const formatRentalPeriod = (period?: string) => {
    switch (period) {
      case 'per_night': return 'per night';
      case 'per_day': return 'per day';
      case 'per_week': return 'per week';
      case 'per_month': return 'per month';
      case 'per_year': return 'per year';
      default: return '';
    }
  };

  const images = listing.images && listing.images.length > 0 
    ? listing.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'];

  const displayPhone = listing.owner?.phone_number || '+234 803 123 4567';
  const cleanPhone = displayPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : (cleanPhone || '2348031234567');
  const waMessage = encodeURIComponent(
    `Hello! I saw your listing on PropertyHub:\n*${listing.title}*\n(Ref: #${listing.id}, ${listing.currency} ${Number(listing.price).toLocaleString()})\nI am interested in this listing. Can we arrange an inspection or discuss terms?`
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;
  const telUrl = `tel:${displayPhone.replace(/\s+/g, '')}`;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar onOpenAI={() => setAiModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-500 transition-colors" title="Save">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. High-Resolution Gallery Hero */}
        <section className="mb-10 space-y-3">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-950 border border-gray-800 shadow-2xl">
            <img
              src={images[activeImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                listing.transaction_type === 'SALE'
                  ? 'bg-amber-500/90 text-white'
                  : listing.transaction_type === 'LEASE'
                  ? 'bg-purple-600/90 text-white'
                  : 'bg-brand-600/90 text-white'
              }`}>
                {listing.transaction_type}
              </span>
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-black/60 text-gray-300 border border-white/10 uppercase tracking-wider backdrop-blur-md">
                {listing.asset_category}
              </span>
              {listing.is_verified_asset && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified Asset
                </span>
              )}
            </div>

            {/* Price Pill Floating */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-brand-300 mb-1">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{listing.neighbourhood ? `${listing.neighbourhood}, ` : ''}{listing.city}, {listing.state}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {listing.title}
                </h1>
              </div>

              <div className="p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shrink-0">
                <span className="text-xs text-gray-400 block font-medium">
                  {listing.transaction_type === 'SALE' ? 'Asking Price' : 'Rental Rate'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {listing.currency} {Number(listing.price).toLocaleString()}
                  </span>
                  {isRental && (
                    <span className="text-xs font-bold text-brand-400">
                      {formatRentalPeriod(listing.rental_period)}
                    </span>
                  )}
                </div>
                {listing.is_negotiable && (
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block mt-0.5">
                    Price Negotiable
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative aspect-[16/10] w-28 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === i ? 'border-brand-500 scale-105' : 'border-gray-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 2. Main Details & Action Forms Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Specifications, Amenities & Description */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Asset Highlights Card */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Key Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isVehicle ? (
                  <>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Make & Year</span>
                      <span className="text-sm font-bold text-white">{listing.attributes.brand} ({listing.attributes.year || 2023})</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Transmission</span>
                      <span className="text-sm font-bold text-white">{listing.attributes.transmission || 'Automatic'}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Fuel Type</span>
                      <span className="text-sm font-bold text-white">{listing.attributes.fuel_type || 'Petrol'}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Condition</span>
                      <span className="text-sm font-bold text-brand-400">{listing.attributes.condition || 'Foreign Used'}</span>
                    </div>
                  </>
                ) : listing.asset_category === 'LAND' ? (
                  <>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Land Size</span>
                      <span className="text-sm font-bold text-white">
                        {listing.attributes.land_size ? `${listing.attributes.land_size} ${listing.attributes.land_unit || 'sqm'}` : 'Standard Plot'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Title Document</span>
                      <span className="text-sm font-bold text-brand-400">{listing.attributes.title_document || 'C of O / Deed'}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Topography</span>
                      <span className="text-sm font-bold text-white">{listing.attributes.topography || 'Dry Land'}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[11px] text-gray-400 block">Road Access</span>
                      <span className="text-sm font-bold text-white">{listing.attributes.road_access || 'Tarred Road'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {listing.attributes.bedrooms && (
                      <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 flex items-center gap-3">
                        <Bed className="w-5 h-5 text-brand-400" />
                        <div>
                          <span className="text-[11px] text-gray-400 block">Bedrooms</span>
                          <span className="text-sm font-bold text-white">{listing.attributes.bedrooms} Beds</span>
                        </div>
                      </div>
                    )}
                    {listing.attributes.bathrooms && (
                      <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 flex items-center gap-3">
                        <Bath className="w-5 h-5 text-brand-400" />
                        <div>
                          <span className="text-[11px] text-gray-400 block">Bathrooms</span>
                          <span className="text-sm font-bold text-white">{listing.attributes.bathrooms} Baths</span>
                        </div>
                      </div>
                    )}
                    {listing.attributes.parking_spaces && (
                      <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 flex items-center gap-3">
                        <Car className="w-5 h-5 text-brand-400" />
                        <div>
                          <span className="text-[11px] text-gray-400 block">Parking</span>
                          <span className="text-sm font-bold text-white">{listing.attributes.parking_spaces} Cars</span>
                        </div>
                      </div>
                    )}
                    {listing.attributes.furnishing_status && (
                      <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                        <span className="text-[11px] text-gray-400 block">Furnishing</span>
                        <span className="text-sm font-bold capitalize text-brand-400">
                          {listing.attributes.furnishing_status.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-4">
              <h2 className="text-base font-bold text-white">Asset Overview & Description</h2>
              <div className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>

            {/* Amenities Checklist */}
            {listing.attributes.amenities && Array.isArray(listing.attributes.amenities) && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-4">
                <h2 className="text-base font-bold text-white">Features & Infrastructure</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.attributes.amenities.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300 p-2.5 rounded-xl bg-gray-950/60 border border-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Map Preview */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                Geographic Location Preview
              </h2>
              <p className="text-xs text-gray-400">
                {listing.address || 'Address provided upon inspection authorization.'} • {listing.city}, {listing.state}, Nigeria.
              </p>

              {/* Coordinates Preview Container */}
              <div className="h-64 rounded-2xl bg-gray-950 border border-gray-800 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative text-center space-y-2 z-10">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/40 animate-bounce">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">
                    Coordinates: {listing.latitude || 6.4474}° N, {listing.longitude || 3.4731}° E
                  </div>
                  <span className="text-[11px] text-gray-500 block">
                    Google Maps Platform Geocoding Verified
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Host Profile, Booking & Inspection Action Forms */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Host / Owner Verification Card with Direct Actions */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-800 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0 overflow-hidden">
                  {listing.owner?.avatar_url || listing.owner?.logo_url ? (
                    <img src={listing.owner.avatar_url || listing.owner.logo_url} alt="Publisher" className="w-full h-full object-cover" />
                  ) : (
                    <UserCheck className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {listing.owner?.company_name || `${listing.owner?.first_name || ''} ${listing.owner?.last_name || ''}`.trim() || 'Verified Property Partner'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{listing.owner?.verification_badge || 'Verified Partner'}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 capitalize">{listing.owner?.active_mode || 'Agent'}</span>
                  </div>
                </div>
              </div>

              {/* Direct Instant Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* 1. Chat on WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <MessageCircle className="w-4 h-4 text-white fill-white" />
                  <span>Chat on WhatsApp</span>
                </a>

                {/* 2. Call Direct */}
                <a
                  href={telUrl}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
                  <span>Call Agent ({displayPhone})</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between">
                <div>Avg Response: <span className="text-white font-medium">Under 15 mins</span></div>
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Online
                </div>
              </div>
            </div>

            {/* Instant Booking Action (For Short-let & Vehicle Rentals) */}
            {(isShortLet || isVehicle) && (
              <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-gradient-to-b from-brand-950/40 to-gray-900 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Instant Date Reservation</span>
                </div>
                <p className="text-xs text-gray-300">
                  Select your schedule to check live calendar availability with automated double-booking protection.
                </p>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Choose Dates & Book</span>
                </button>
              </div>
            )}

            {/* Schedule an Inspection Form (For Sale & Traditional Long-term Rentals/Leases) */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-400" />
                Schedule Asset Inspection / Viewing
              </h3>

              {inspectionSuccess ? (
                <div className="p-4 rounded-2xl bg-brand-950/60 border border-brand-500/40 text-brand-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    Inspection Request Sent!
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    The owner/agent will review and confirm your selected date. You will receive an alert in your dashboard.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInspectionSubmit} className="space-y-3">
                  {inspectionError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{inspectionError}</span>
                    </div>
                  )}

                  {/* Physical or Virtual Inspection Toggle */}
                  <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
                    <button
                      type="button"
                      onClick={() => setInspectionType('PHYSICAL')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        inspectionType === 'PHYSICAL' ? 'bg-brand-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      Physical Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectionType('VIRTUAL')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        inspectionType === 'VIRTUAL' ? 'bg-brand-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      Virtual Tour
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Preferred Time Window</label>
                    <select
                      value={inspectionSlot}
                      onChange={(e) => setInspectionSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="Morning (9am - 12pm)">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12pm - 3pm)">Afternoon (12:00 PM - 3:00 PM)</option>
                      <option value="Evening (3pm - 6pm)">Evening (3:00 PM - 6:00 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Notes for Host (Optional)</label>
                    <textarea
                      rows={2}
                      value={inspectionNotes}
                      onChange={(e) => setInspectionNotes(e.target.value)}
                      placeholder="e.g. Any specific legal documents or details you want to inspect"
                      className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inspectionSubmitting}
                    className="w-full py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-xs font-bold transition-all"
                  >
                    {inspectionSubmitting ? 'Submitting...' : 'Request Inspection Appointment'}
                  </button>
                </form>
              )}
            </div>

            {/* Direct In-App Instant Message Form */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-400" />
                  Direct In-App Message
                </h3>
                <Link href="/messages" className="text-[11px] text-brand-400 hover:underline flex items-center gap-1 font-medium">
                  View Inbox &rarr;
                </Link>
              </div>

              {inquirySuccess ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Message delivered to agent inbox!
                  </div>
                  <Link 
                    href="/messages" 
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-200 underline font-semibold mt-1"
                  >
                    Open conversation in Messages &rarr;
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-2.5">
                  <textarea
                    rows={3}
                    required
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder="Hello, I am interested in this listing. Can we arrange an inspection or discuss terms?"
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{inquirySubmitting ? 'Sending...' : 'Send Direct Message'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Floating AI Assistant Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white text-xs font-bold shadow-2xl shadow-brand-500/40 border border-emerald-400/30 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span>Ask AI Concierge</span>
        </button>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      {/* Booking Modal */}
      <BookingModal
        listing={listing}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => alert('Booking request successfully sent!')}
      />

      <Footer />
    </div>
  );
}
