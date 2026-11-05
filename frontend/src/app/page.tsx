'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Car, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  SlidersHorizontal,
  Smartphone,
  Calendar,
  Zap,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { SearchHero } from '@/components/SearchHero';
import { ListingCard } from '@/components/ListingCard';
import { AIMatchingBanner } from '@/components/AIMatchingBanner';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { BookingModal } from '@/components/BookingModal';
import { Footer } from '@/components/Footer';

import { Listing, TransactionType, AssetCategory } from '@/lib/types';
import { api } from '@/lib/api';

export default function HomePage() {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType>('SALE');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('RESIDENTIAL');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedBookingListing, setSelectedBookingListing] = useState<Listing | null>(null);

  // Fetch listings from backend
  const fetchMarketplaceListings = async (tx: TransactionType, cat?: AssetCategory) => {
    setLoading(true);
    try {
      const res = await api.getListings({
        transaction_type: tx,
        asset_category: cat,
        page_size: 12,
      });
      setListings(res.items || []);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceListings(selectedTransaction, selectedCategory);
  }, [selectedTransaction, selectedCategory]);

  const handleTransactionChange = (tx: TransactionType) => {
    setSelectedTransaction(tx);
  };

  const handleCategoryChange = (cat: AssetCategory) => {
    setSelectedCategory(cat);
  };

  const handleNLPSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await api.naturalLanguageSearch(query);
      if (res.data?.results) {
        setListings(res.data.results);
      }
    } catch (err) {
      console.error("NLP Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSearch = async (params: { keyword?: string; state?: string; max_price?: number }) => {
    setLoading(true);
    try {
      const res = await api.getListings({
        transaction_type: selectedTransaction,
        asset_category: selectedCategory,
        state: params.state,
        max_price: params.max_price,
        page_size: 12,
      });
      setListings(res.items || []);
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      
      {/* 1. Header & Navigation */}
      <Navbar
        onOpenAI={() => setAiModalOpen(true)}
        activeTransaction={selectedTransaction}
        onSelectTransaction={handleTransactionChange}
      />

      <main className="flex-1">
        
        {/* 2. Hero Section & Powerful Search (BUY | RENT | LEASE + Category Pills + AI NLP Search) */}
        <SearchHero
          selectedTransaction={selectedTransaction}
          onSelectTransaction={handleTransactionChange}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          onSearch={handleStandardSearch}
          onNLPSearch={handleNLPSearch}
        />

        {/* 3. Live Marketplace Listings Feed */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
                <span>Verified Marketplace</span>
                <span>•</span>
                <span className="text-gray-400">{selectedTransaction} Listings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Featured {selectedCategory.replace('_', ' ').toLowerCase()} for {selectedTransaction.toLowerCase()}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                Showing {listings.length} live {listings.length === 1 ? 'asset' : 'assets'}
              </span>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl bg-gray-900 border border-gray-800 p-4 h-96 animate-pulse" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onBookNow={(l) => setSelectedBookingListing(l)}
                  onRequestInspection={() => setAiModalOpen(true)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-gray-900/60 border border-gray-800 space-y-4">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No active listings match this filter yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Be the first to publish an asset in this category, or publish a requirement and let our AI notify you when matching assets appear.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/listings/new"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-all"
                >
                  Publish Listing
                </Link>
                <Link
                  href="/requirements/new"
                  className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 transition-all"
                >
                  Publish Requirement
                </Link>
              </div>
            </div>
          )}

        </section>

        {/* 4. AI-Powered Matching Engine Banner */}
        <AIMatchingBanner />

        {/* 5. How It Works (Bidirectional AI Marketplace) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-800/80">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">How It Works</h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              An Intelligent Marketplace That Works In Both Directions
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-3">
              Traditional platforms make seekers spend weeks searching. PropertyHub proactively connects demand with supply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-900/80 border border-gray-800 hover:border-brand-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-lg">
                1
              </div>
              <h4 className="text-base font-bold text-white">Publish What You Want</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Specify whether you want to Buy, Rent, or Lease. Set your target budget, desired neighbourhood, and required asset attributes.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-900/80 border border-gray-800 hover:border-brand-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-950/80 border border-gold-500/40 flex items-center justify-center text-gold-400 font-bold text-lg">
                2
              </div>
              <h4 className="text-base font-bold text-white">Proactive AI Matching</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our AI engine calculates multi-factor compatibility scores (0-100%) and explains exactly why an asset meets your criteria.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-900/80 border border-gray-800 hover:border-brand-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg">
                3
              </div>
              <h4 className="text-base font-bold text-white">Direct Deal Execution</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Schedule physical viewings, book short-lets or vehicle rentals instantly with anti-double-booking locks, and exchange inquiries securely.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Popular High-Demand Hubs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-800/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-1">Prime Locations</h3>
              <h4 className="text-2xl font-bold text-white">Explore High-Demand Nigerian & International Hubs</h4>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Lekki Phase 1', state: 'Lagos', count: '140+ Properties & Cars' },
              { name: 'Ikoyi & Victoria Island', state: 'Lagos', count: '95+ Luxury Assets' },
              { name: 'Ikeja & GRA', state: 'Lagos', count: '110+ Commercial & Rentals' },
              { name: 'Maitama & Asokoro', state: 'Abuja', count: '85+ Executive Homes' },
            ].map((loc, idx) => (
              <button
                key={idx}
                onClick={() => handleStandardSearch({ state: loc.name })}
                className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-brand-500/40 text-left transition-all hover:bg-gray-800/60"
              >
                <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{loc.state}</span>
                </div>
                <h5 className="text-sm font-bold text-white">{loc.name}</h5>
                <p className="text-[11px] text-gray-400 mt-1">{loc.count}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 7. Mobile App Download CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-800/80">
          <div className="rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-brand-950 border border-gray-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400">
                <Smartphone className="w-4 h-4" />
                <span>Unified Cross-Platform Experience</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                One Account. Web, Android & iOS Powered by Shared FastAPI Services.
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Access your real-time matches, inspection appointments, chat messages, and booking notifications anywhere. Built with Flutter for iOS & Android.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => alert("Mobile App APK build is available in /mobile codebase!")}
                className="px-6 py-3.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Download for Android</span>
              </button>
              <button
                onClick={() => alert("iOS build configuration is ready in /mobile codebase!")}
                className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Download for iOS</span>
              </button>
            </div>
          </div>
        </section>

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

      {/* Interactive AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      {/* Interactive Booking Modal for Short-lets & Car Rentals */}
      <BookingModal
        listing={selectedBookingListing}
        isOpen={!!selectedBookingListing}
        onClose={() => setSelectedBookingListing(null)}
        onSuccess={() => fetchMarketplaceListings(selectedTransaction, selectedCategory)}
      />

      {/* Professional Footer */}
      <Footer />

    </div>
  );
}
