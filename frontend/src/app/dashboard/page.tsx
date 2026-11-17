'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Building2, 
  Car, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  PlusCircle, 
  UserCheck, 
  FileText, 
  SlidersHorizontal,
  ArrowRight,
  Upload,
  AlertCircle,
  Eye,
  Trash2,
  DollarSign,
  Crown,
  Flame,
  Rocket,
  Zap,
  Pencil,
  X
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { Listing, Booking, AIMatch, User } from '@/lib/types';
import { api } from '@/lib/api';
import { detectCurrencyFromCountry, formatSubscriptionPrice } from '@/lib/currency';
import { getCoverImageUrl, getFallbackImage } from '@/lib/media';

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'buyer' | 'seller' | 'landlord' | 'dealer'>('buyer');
  const [activeTab, setActiveTab] = useState<'overview' | 'my_listings' | 'subscription' | 'bookings' | 'inspections' | 'verification'>('overview');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam === 'my_listings' ||
      tabParam === 'subscription' ||
      tabParam === 'bookings' ||
      tabParam === 'inspections' ||
      tabParam === 'verification' ||
      tabParam === 'overview'
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myMatches, setMyMatches] = useState<AIMatch[]>([]);
  const [myInspections, setMyInspections] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit listing modal state
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('PUBLISHED');
  const [editNeighbourhood, setEditNeighbourhood] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Verification document upload
  const [docType, setDocType] = useState('NATIONAL_ID');
  const [docNumber, setDocNumber] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docUploading, setDocUploading] = useState(false);
  const [docFileUploading, setDocFileUploading] = useState(false);
  const [docFeedback, setDocFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [myDocs, setMyDocs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Retrieve the user's authenticated token
      const token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Fetch User Profile
      const meRes = await fetch('/api/v1/auth/me', { headers });
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.data);
      }

      // 2. Fetch User's Listings
      const listRes = await fetch('/api/v1/listings/user/my-listings', { headers });
      if (listRes.ok) {
        const listData = await listRes.json();
        setMyListings(listData.data || []);
      }

      // 3. Fetch Bookings
      const bookRes = await fetch('/api/v1/bookings/my-bookings', { headers });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setMyBookings(bookData.data || []);
      }

      // 4. Fetch Inspections
      const inspRes = await fetch('/api/v1/inspections/my-inspections', { headers });
      if (inspRes.ok) {
        const inspData = await inspRes.json();
        setMyInspections(inspData.data || []);
      }

      // 5. Fetch AI Matches
      try {
        const matchRes = await api.getMyMatches();
        if (matchRes.data) {
          setMyMatches(matchRes.data);
        }
      } catch (_) {}

      // 6. Fetch Verification Docs
      const docRes = await fetch('/api/v1/verification/my-documents', { headers });
      if (docRes.ok) {
        const dData = await docRes.json();
        setMyDocs(dData.data || []);
      }

      // 7. Fetch Real-Time Subscription & Boost Quotas
      try {
        const subRes = await api.getMySubscription();
        if (subRes && subRes.data) {
          setUserSubscription(subRes.data);
        }
      } catch (_) {}

    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (listingId: number, currentFeatured: boolean) => {
    setActionFeedback(null);
    try {
      const res = await api.toggleListingFeatured(listingId, !currentFeatured);
      setActionFeedback({ type: 'success', text: res.message || 'Featured status updated.' });
      await loadDashboardData();
    } catch (err: any) {
      setActionFeedback({ type: 'error', text: err.message || 'Failed to update featured status.' });
    }
  };

  const handleBoostListing = async (listingId: number) => {
    setActionFeedback(null);
    try {
      const res = await api.boostListing(listingId);
      setActionFeedback({ type: 'success', text: res.message || 'Listing boosted for 72 hours!' });
      await loadDashboardData();
    } catch (err: any) {
      setActionFeedback({ type: 'error', text: err.message || 'Failed to boost listing.' });
    }
  };

  const openEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setEditTitle(listing.title || '');
    setEditPrice(String(listing.price ?? ''));
    setEditDescription(listing.description || '');
    setEditStatus(listing.status || 'PUBLISHED');
    setEditNeighbourhood(listing.neighbourhood || '');
  };

  const handleSaveListingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    setEditSaving(true);
    setActionFeedback(null);
    try {
      await api.updateListing(editingListing.id, {
        title: editTitle.trim(),
        price: Number(editPrice),
        description: editDescription.trim(),
        status: editStatus,
        neighbourhood: editNeighbourhood.trim() || undefined,
      });
      setEditingListing(null);
      setActionFeedback({ type: 'success', text: 'Listing updated successfully!' });
      await loadDashboardData();
    } catch (err: any) {
      setActionFeedback({ type: 'error', text: err.message || 'Failed to update listing.' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteListing = async (listingId: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setActionFeedback(null);
    try {
      await api.deleteListing(listingId);
      setActionFeedback({ type: 'success', text: 'Listing deleted successfully.' });
      await loadDashboardData();
    } catch (err: any) {
      setActionFeedback({ type: 'error', text: err.message || 'Failed to delete listing.' });
    }
  };

  const handleModeSwitch = (mode: 'buyer' | 'seller' | 'landlord' | 'dealer') => {
    setActiveMode(mode);
  };

  const getRegistrationRoleLabel = (user: User | null): string => {
    const entity = (user?.entity_type || '').toLowerCase();
    const roleMap: Record<string, string> = {
      agent: 'Agent',
      owner: 'Owner',
      developer: 'Property Developer',
      dealer: 'Auto/Car Dealer',
      company: 'Company / Agency',
      seeker: 'Seeker',
      individual: user?.user_type === 'seller' ? 'Owner / Seller' : 'Seeker',
    };
    if (entity && roleMap[entity]) return roleMap[entity];
    return user?.user_type === 'seller' ? 'Seller' : 'Seeker';
  };

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFileUploading(true);
    setDocFeedback(null);
    try {
      const res = await api.uploadMedia([file]);
      const uploadedUrl = res?.images?.[0]?.url;
      if (uploadedUrl) {
        setDocFileUrl(uploadedUrl);
      }
    } catch (err: any) {
      setDocFeedback({ type: 'error', text: err.message || 'Failed to upload document image.' });
    } finally {
      setDocFileUploading(false);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      setDocFeedback({ type: 'error', text: 'Please enter the document identification number.' });
      return;
    }
    if (!docFileUrl.trim()) {
      setDocFeedback({ type: 'error', text: 'Please upload a clear photo of your document first.' });
      return;
    }

    setDocUploading(true);
    setDocFeedback(null);
    try {
      const res = await api.submitVerificationDocument({
        document_type: docType,
        document_number: docNumber.trim(),
        file_url: docFileUrl.trim(),
      });
      const statusVal = res?.data?.status;
      setDocFeedback({
        type: statusVal === 'APPROVED' ? 'success' : statusVal === 'REJECTED' ? 'error' : 'info',
        text: res?.message || 'Document processed by AI verification.',
      });
      if (statusVal === 'APPROVED') {
        setDocFileUrl('');
        setDocNumber('');
      }
      await loadDashboardData();
    } catch (err: any) {
      setDocFeedback({ type: 'error', text: err.message || 'Failed to verify document.' });
    } finally {
      setDocUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar onOpenAI={() => setAiModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Top Header Card with Dynamic Account Mode Switcher */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            {(currentUser?.avatar_url || currentUser?.logo_url) ? (
              <img
                src={currentUser.avatar_url || currentUser.logo_url}
                alt={currentUser.first_name || 'User'}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-brand-600/30 border border-gray-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-800 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-600/30">
                {currentUser?.first_name ? currentUser.first_name[0] : 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Marketplace User'}
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-brand-950 text-brand-300 border border-brand-500/40 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  {currentUser?.verification_badge || 'Identity Verified'}
                </span>
              </div>
              <p className="text-xs font-semibold text-brand-400 mt-1">
                {getRegistrationRoleLabel(currentUser)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {currentUser?.email} • {currentUser?.city || 'Lagos'}, {currentUser?.country || 'Nigeria'}
              </p>
            </div>
          </div>

          {/* Unified Mode Switcher Pill */}
          <div className="flex items-center gap-2 bg-gray-950 p-1.5 rounded-2xl border border-gray-800 self-stretch md:self-auto overflow-x-auto">
            {[
              { id: 'buyer', label: 'Buyer / Renter' },
              { id: 'seller', label: 'Property Seller' },
              { id: 'landlord', label: 'Landlord' },
              { id: 'dealer', label: 'Auto Dealer' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSwitch(m.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeMode === m.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Activity' },
            { id: 'my_listings', label: `My Inventory (${myListings.length})` },
            { id: 'subscription', label: `Subscription & Boosts` },
            { id: 'bookings', label: `Reservations & Bookings (${myBookings.length})` },
            { id: 'inspections', label: `Inspections & Viewings (${myInspections.length})` },
            { id: 'verification', label: 'Verification & Badges' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-brand-400 border border-brand-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Action Feedback Notification */}
        {actionFeedback && (
          <div className={`p-4 rounded-2xl mb-6 flex items-center justify-between text-xs border ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{actionFeedback.text}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-gray-400 hover:text-white text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Real-Time Subscription & Quota Engine Card */}
        {userSubscription && (
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-gray-800 mb-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 uppercase">
                    Active Subscription
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    Renewal: {new Date(userSubscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>{userSubscription.plan_name}</span>
                  <span className="text-sm font-semibold text-gray-400">
                    ({formatSubscriptionPrice(Number(userSubscription.price_ngn), detectCurrencyFromCountry(currentUser?.country)).display}/mo)
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Upgrade Plan</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab('subscription')}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs border border-gray-700"
                >
                  Manage Boosts
                </button>
              </div>
            </div>

            {/* Visual Quota Usage Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              
              {/* Listings Quota */}
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-2">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-400" />
                    <span>Listing Allowance</span>
                  </span>
                  <span className="font-bold text-white">
                    {userSubscription.active_listings_count} / {userSubscription.listing_allowance}
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      userSubscription.active_listings_count >= userSubscription.listing_allowance
                        ? 'bg-rose-500'
                        : 'bg-brand-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (userSubscription.active_listings_count / Math.max(1, userSubscription.listing_allowance)) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>{userSubscription.remaining_listings} remaining</span>
                  {userSubscription.excess_listings_count > 0 && (
                    <span className="text-red-400 font-bold">{userSubscription.excess_listings_count} excess</span>
                  )}
                </div>
              </div>

              {/* Featured Quota */}
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-2">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Featured Slots</span>
                  </span>
                  <span className="font-bold text-white">
                    {userSubscription.used_featured_count} / {userSubscription.featured_allowance}
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{
                      width: `${Math.min(100, (userSubscription.used_featured_count / Math.max(1, userSubscription.featured_allowance)) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>{userSubscription.remaining_featured} slots open</span>
                  <span className="text-amber-400 font-medium">Top Search</span>
                </div>
              </div>

              {/* Boost Credits Quota */}
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-2">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Promotional Boosts</span>
                  </span>
                  <span className="font-bold text-white">
                    {userSubscription.remaining_boost_credits} credits left
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all"
                    style={{
                      width: `${Math.min(100, (userSubscription.used_boost_credits / Math.max(1, userSubscription.monthly_boost_allowance)) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>{userSubscription.used_boost_credits} used this cycle</span>
                  <span className="text-rose-400 font-semibold">{userSubscription.active_boosts_count} active (72h)</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">AI Match Score</span>
                <div className="text-2xl font-extrabold text-brand-400 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
                  <span>96% Top</span>
                </div>
                <span className="text-[11px] text-gray-500">{myMatches.length} active matches</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('my_listings')}
                className="glass-panel p-5 rounded-2xl border border-gray-800 hover:border-brand-500/50 space-y-1 text-left transition-all"
              >
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Published Assets</span>
                <div className="text-2xl font-extrabold text-white">{myListings.length}</div>
                <span className="text-[11px] text-brand-400">Click to view my listings →</span>
              </button>

              <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Bookings</span>
                <div className="text-2xl font-extrabold text-white">{myBookings.length}</div>
                <span className="text-[11px] text-emerald-400">Anti-conflict confirmed</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Inspections</span>
                <div className="text-2xl font-extrabold text-white">{myInspections.length}</div>
                <span className="text-[11px] text-gold-400">Scheduled appointments</span>
              </div>
            </div>

            {/* AI Matches Highlights Feed */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    Proactive AI Matches
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Matched with your active requirements</p>
                </div>
                <Link href="/requirements" className="text-xs font-semibold text-brand-400 hover:underline">
                  View Full Match Engine →
                </Link>
              </div>

              {myMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myMatches.slice(0, 2).map((m) => (
                    <div key={m.id} className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-950 text-brand-300 border border-brand-500/40">
                          {Math.round(m.compatibility_score)}% Compatibility
                        </span>
                        <span className="text-[11px] text-gray-400 capitalize">{m.listing?.transaction_type}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{m.listing?.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{m.explanation}</p>
                      <Link
                        href={`/listings/${m.listing?.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
                      >
                        <span>View Matched Asset</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Post your requirement to activate automated AI match discovery.</p>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: MY INVENTORY (PUBLISHED LISTINGS) */}
        {activeTab === 'my_listings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Your Marketplace Listings</h2>
              <Link
                href="/listings/new"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish New Asset</span>
              </Link>
            </div>

            {myListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((l) => (
                  <div key={l.id} className="glass-panel rounded-2xl p-4 border border-gray-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-950 mb-3 flex items-center justify-center">
                        <img
                          src={getCoverImageUrl(l)}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-20 pointer-events-none"
                        />
                        <img
                          src={getCoverImageUrl(l)}
                          alt={l.title}
                          onError={(e) => {
                            e.currentTarget.src = getFallbackImage(l.asset_category);
                          }}
                          className="relative w-full h-full object-cover object-center"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-600 text-white shadow-md">
                          {l.transaction_type}
                        </span>
                        
                        {/* Boost & Featured Badges */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          {l.is_boosted && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-md flex items-center gap-1 animate-pulse">
                              <Flame className="w-3 h-3 text-amber-300" />
                              <span>Boosted</span>
                            </span>
                          )}
                          {l.is_featured && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white shadow-md flex items-center gap-1">
                              <Crown className="w-3 h-3 text-white" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>

                        {l.images && l.images.length > 1 && (
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-gray-200 border border-white/10">
                            {l.images.length} Photos
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2">{l.title}</h3>
                      <p className="text-xs text-brand-400 font-bold mt-1">
                        {l.currency} {Number(l.price).toLocaleString()} {l.rental_period ? `/ ${l.rental_period.replace('per_', '')}` : ''}
                      </p>
                    </div>

                    {/* Promotional Boost & Featured Controls */}
                    <div className="pt-3 border-t border-gray-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(l.id, !!l.is_featured)}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            l.is_featured
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700'
                          }`}
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{l.is_featured ? 'Remove Featured' : 'Feature Ad'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBoostListing(l.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02]"
                          title="Elevate search rankings for 72 hours"
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-200" />
                          <span>Boost (72h)</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                        <span className="truncate">{l.city}, {l.state}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditListing(l)}
                            className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(l.id, l.title)}
                            className="text-red-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                          <Link href={`/listings/${l.id}`} className="text-brand-400 font-semibold hover:underline flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-gray-900 border border-gray-800 space-y-3">
                <Building2 className="w-10 h-10 text-gray-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No listings published yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Click below to publish a land plot, residential home, commercial warehouse, or automobile.
                </p>
                <Link
                  href="/listings/new"
                  className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Publish Asset
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2.5: SUBSCRIPTION & BOOST MANAGEMENT */}
        {activeTab === 'subscription' && (
          <div className="space-y-8">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
                    <Zap className="w-3.5 h-3.5 text-brand-400" />
                    <span>Promotional Engine &amp; Quotas</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Your Marketplace Membership</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage your listing allowance, active featured advertisements, and promotional search boosts.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/pricing"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Change or Upgrade Plan</span>
                  </Link>
                </div>
              </div>

              {/* Plan metrics cards */}
              {userSubscription && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Plan Name</span>
                    <div className="text-xl font-extrabold text-white">{userSubscription.plan_name}</div>
                    <span className="text-[11px] text-brand-400 font-semibold">{formatSubscriptionPrice(Number(userSubscription.price_ngn), detectCurrencyFromCountry(currentUser?.country)).display} / month</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Current Period End</span>
                    <div className="text-xl font-extrabold text-white">
                      {new Date(userSubscription.current_period_end).toLocaleDateString()}
                    </div>
                    <span className="text-[11px] text-gray-400">Monthly recurring cycle</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Available Boost Credits</span>
                    <div className="text-xl font-extrabold text-amber-400 flex items-center gap-1.5">
                      <Flame className="w-5 h-5 text-rose-500" />
                      <span>{userSubscription.remaining_boost_credits} Credits</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{userSubscription.used_boost_credits} used this cycle</span>
                  </div>
                </div>
              )}
            </div>

            {/* Active Promotional Boosts Section */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Currently Active 72-Hour Boosts</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Advertisements elevated to top search placements
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('my_listings')}
                  className="text-xs font-semibold text-brand-400 hover:underline"
                >
                  Boost An Advertisement →
                </button>
              </div>

              {userSubscription?.active_boosts && userSubscription.active_boosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userSubscription.active_boosts.map((b: any) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>Active Boost</span>
                        </span>
                        <span className="text-[11px] text-amber-400 font-mono">
                          Expires: {new Date(b.expires_at).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{b.listing_title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                        <span>Duration: {b.duration_hours} hours</span>
                        <Link href={`/listings/${b.listing_id}`} className="text-brand-400 font-semibold hover:underline">
                          View Listing →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-gray-950 border border-gray-800/80 space-y-2">
                  <Flame className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">
                    No active boosts running. Boost any of your published listings to elevate its search placement for 72 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('my_listings')}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-block mt-2"
                  >
                    Go to My Inventory
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS & RESERVATIONS */}
        {activeTab === 'bookings' && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
            <h2 className="text-base font-bold text-white">Short-let & Vehicle Rental Reservations</h2>
            
            {myBookings.length > 0 ? (
              <div className="space-y-4">
                {myBookings.map((b) => (
                  <div key={b.id} className="p-5 rounded-2xl bg-gray-950 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Reservation #{b.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-950 text-brand-300 border border-brand-500/40">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()} ({b.total_days} {b.total_days === 1 ? 'day' : 'days'})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-white block">
                        {b.currency} {Number(b.total_amount).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500">Includes deposit & service charges</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 space-y-2">
                <Calendar className="w-8 h-8 text-gray-600 mx-auto" />
                <p>No active reservations or bookings found.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INSPECTIONS & VIEWINGS */}
        {activeTab === 'inspections' && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
            <h2 className="text-base font-bold text-white">Physical & Virtual Inspection Schedule</h2>

            {myInspections.length > 0 ? (
              <div className="space-y-4">
                {myInspections.map((insp: any) => (
                  <div key={insp.id} className="p-5 rounded-2xl bg-gray-950 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{insp.inspection_type} Inspection #{insp.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-950 text-brand-300 border border-brand-500/40">
                          {insp.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-400" />
                        <span>{new Date(insp.preferred_date).toLocaleDateString()} • {insp.time_slot}</span>
                      </p>
                    </div>
                    <Link
                      href={`/listings/${insp.listing_id}`}
                      className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white"
                    >
                      View Asset
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 space-y-2">
                <Clock className="w-8 h-8 text-gray-600 mx-auto" />
                <p>No upcoming inspections scheduled.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: VERIFICATION & TRUST BADGES */}
        {activeTab === 'verification' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            <div className="md:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
                Submit Verification Documents
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upload your government ID or CAC certificate for <strong className="text-white">instant autonomous AI verification</strong>. Verified accounts receive up to 4× more inquiries and priority placement in AI matching.
              </p>

              {docFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                  docFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : docFeedback.type === 'error'
                    ? 'bg-red-950/60 border-red-500/40 text-red-300'
                    : 'bg-brand-950/60 border-brand-500/40 text-brand-300'
                }`}>
                  {docFeedback.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  )}
                  <span>{docFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleDocumentSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Document Type *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs cursor-pointer"
                  >
                    <option value="NATIONAL_ID">National Identity Card (NIN / National e-ID)</option>
                    <option value="PASSPORT">International Passport</option>
                    <option value="DRIVERS_LICENSE">FRSC Driver's License</option>
                    <option value="CAC_CERTIFICATE">CAC Business Registration (Corporate)</option>
                    <option value="BUSINESS_REG">Business Registration Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Document Identification Number *</label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. NIN-12345678901 or RC-987654"
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">Upload Clear Document Photo *</label>
                  <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gray-950 border border-dashed border-gray-700 hover:border-brand-500 text-xs text-gray-300 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-brand-400" />
                    <span>{docFileUploading ? 'Uploading Photo...' : docFileUrl ? 'Photo Uploaded — Click to Replace' : 'Choose Document Image (JPG, PNG, WEBP)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDocFileUpload}
                      className="hidden"
                    />
                  </label>
                  {docFileUrl && (
                    <p className="text-[11px] text-emerald-400 mt-1.5 truncate">Ready: {docFileUrl}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={docUploading || docFileUploading}
                  className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition-all"
                >
                  {docUploading ? 'AI Verifying Document...' : 'Submit for Instant AI Verification'}
                </button>
              </form>
            </div>

            <div className="md:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-4">
              <h2 className="text-base font-bold text-white">Verification Status History</h2>
              
              {myDocs.length > 0 ? (
                <div className="space-y-3">
                  {myDocs.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block">{doc.document_type.replace(/_/g, ' ')}</span>
                          <span className="text-gray-500 text-[11px]">Submitted {new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          doc.status === 'APPROVED' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : doc.status === 'REJECTED'
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      {doc.reviewer_notes && (
                        <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-800/70">
                          {doc.reviewer_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 text-center text-xs text-gray-400">
                  No documents submitted yet. Upload your ID or business CAC to get verified instantly by AI.
                </div>
              )}

              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800/60 text-[11px] text-gray-400 space-y-1.5">
                <span className="font-bold text-white block">Autonomous AI Verification Policy:</span>
                <p>
                  Our AI KYC engine checks document authenticity, legibility, and cross-matches the name and ID number against your registered profile automatically — no manual waiting required.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#111827] border border-gray-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Listing</h3>
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveListingEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Price ({editingListing.currency || 'NGN'}) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="PAUSED">Paused</option>
                    <option value="SOLD">Sold</option>
                    <option value="RENTED">Rented</option>
                    <option value="LEASED">Leased</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Neighbourhood / Area</label>
                <input
                  type="text"
                  value={editNeighbourhood}
                  onChange={(e) => setEditNeighbourhood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0f19]" />}>
      <DashboardPageContent />
    </Suspense>
  );
}
