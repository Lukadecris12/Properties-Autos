'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  DollarSign
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { Listing, Booking, AIMatch, User } from '@/lib/types';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'buyer' | 'seller' | 'landlord' | 'dealer'>('buyer');
  const [activeTab, setActiveTab] = useState<'overview' | 'my_listings' | 'bookings' | 'inspections' | 'verification'>('overview');

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myMatches, setMyMatches] = useState<AIMatch[]>([]);
  const [myInspections, setMyInspections] = useState<any[]>([]);

  // Verification document upload
  const [docType, setDocType] = useState('NATIONAL_ID');
  const [docNumber, setDocNumber] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docUploading, setDocUploading] = useState(false);
  const [docSuccess, setDocSuccess] = useState(false);
  const [myDocs, setMyDocs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [activeMode]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In development, ensure we have an active token
      let token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      if (!token) {
        const loginUsername = (activeMode === 'seller' || activeMode === 'landlord') 
          ? 'agent@apexproperties.ng' 
          : activeMode === 'dealer'
          ? 'dealer@autoworx.ng'
          : 'seeker@gmail.com';

        const loginPassword = (activeMode === 'seller' || activeMode === 'landlord')
          ? 'AgentPass123!'
          : activeMode === 'dealer'
          ? 'DealerPass123!'
          : 'SeekerPass123!';

        const authRes = await fetch('http://localhost:8000/api/v1/auth/login', {
          method: 'POST',
          body: new URLSearchParams({ username: loginUsername, password: loginPassword })
        });
        const authData = await authRes.json();
        if (authData.access_token) {
          localStorage.setItem('propertyhub_token', authData.access_token);
          token = authData.access_token;
        }
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch User Profile
      const meRes = await fetch('http://localhost:8000/api/v1/auth/me', { headers });
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.data);
      }

      // 2. Fetch User's Listings
      const listRes = await fetch('http://localhost:8000/api/v1/listings/user/my-listings', { headers });
      if (listRes.ok) {
        const listData = await listRes.json();
        setMyListings(listData.data || []);
      }

      // 3. Fetch Bookings
      const bookRes = await fetch('http://localhost:8000/api/v1/bookings/my-bookings', { headers });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setMyBookings(bookData.data || []);
      }

      // 4. Fetch Inspections
      const inspRes = await fetch('http://localhost:8000/api/v1/inspections/my-inspections', { headers });
      if (inspRes.ok) {
        const inspData = await inspRes.json();
        setMyInspections(inspData.data || []);
      }

      // 5. Fetch AI Matches
      const matchRes = await api.getMyMatches();
      if (matchRes.data) {
        setMyMatches(matchRes.data);
      }

      // 6. Fetch Verification Docs
      const docRes = await fetch('http://localhost:8000/api/v1/verification/my-documents', { headers });
      if (docRes.ok) {
        const dData = await docRes.json();
        setMyDocs(dData.data || []);
      }

    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = async (mode: 'buyer' | 'seller' | 'landlord' | 'dealer') => {
    setActiveMode(mode);
    localStorage.removeItem('propertyhub_token'); // Refresh token according to role in dev
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFileUrl.trim()) return;

    setDocUploading(true);
    try {
      const token = localStorage.getItem('propertyhub_token');
      const res = await fetch('http://localhost:8000/api/v1/verification/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_type: docType,
          document_number: docNumber || undefined,
          file_url: docFileUrl.trim()
        })
      });

      if (res.ok) {
        setDocSuccess(true);
        setDocFileUrl('');
        setDocNumber('');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-800 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-600/30">
              {currentUser?.first_name ? currentUser.first_name[0] : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Marketplace User'}
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-brand-950 text-brand-300 border border-brand-500/40 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  {currentUser?.verification_badge || 'Identity Verified'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {currentUser?.email} • Unified Account • {currentUser?.city || 'Lagos'}, {currentUser?.country || 'Nigeria'}
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
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Activity' },
            { id: 'my_listings', label: `My Inventory (${myListings.length})` },
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

              <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Published Assets</span>
                <div className="text-2xl font-extrabold text-white">{myListings.length}</div>
                <span className="text-[11px] text-gray-500">Live in marketplace</span>
              </div>

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
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-950 mb-3">
                        <img
                          src={l.images && l.images.length > 0 ? l.images[0].url : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'}
                          alt={l.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-600 text-white">
                          {l.transaction_type}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2">{l.title}</h3>
                      <p className="text-xs text-brand-400 font-bold mt-1">
                        {l.currency} {Number(l.price).toLocaleString()} {l.rental_period ? `/ ${l.rental_period.replace('per_', '')}` : ''}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                      <span className="text-gray-400">{l.city}, {l.state}</span>
                      <Link href={`/listings/${l.id}`} className="text-brand-400 font-semibold hover:underline flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>
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
                Unlock the <strong className="text-white">Identity Verified</strong> or <strong className="text-white">Trusted Agent</strong> badge. Verified accounts receive up to 4× more inquiries and priority placement in AI matching.
              </p>

              {docSuccess && (
                <div className="p-3.5 rounded-xl bg-brand-950/60 border border-brand-500/40 text-brand-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-400" />
                  <span>Document submitted successfully. Status: Under review by verification officers.</span>
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
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Document Identification Number</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. NIN-12345678901 or RC-987654"
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Secure Document Image / PDF URL *</label>
                  <input
                    type="url"
                    required
                    value={docFileUrl}
                    onChange={(e) => setDocFileUrl(e.target.value)}
                    placeholder="https://... (Cloud storage or verified S3 upload link)"
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={docUploading}
                  className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition-all"
                >
                  {docUploading ? 'Submitting to Review Queue...' : 'Submit Document for Review'}
                </button>
              </form>
            </div>

            <div className="md:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-4">
              <h2 className="text-base font-bold text-white">Verification Status History</h2>
              
              {myDocs.length > 0 ? (
                <div className="space-y-3">
                  {myDocs.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{doc.document_type.replace('_', ' ')}</span>
                        <span className="text-gray-500 text-[11px]">Submitted {new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        doc.status === 'APPROVED' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 text-center text-xs text-gray-400">
                  No documents submitted yet. Submit your ID or business CAC to unlock verified partner privileges.
                </div>
              )}

              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800/60 text-[11px] text-gray-400 space-y-1.5">
                <span className="font-bold text-white block">Trust & Verification Policy:</span>
                <p>
                  Identity and corporate documents are encrypted at rest and reviewed strictly by accredited verification officers. Document uploads do not constitute transfer of title or statutory conveyance.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
