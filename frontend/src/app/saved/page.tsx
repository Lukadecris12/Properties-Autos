'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Building2, 
  Car, 
  ArrowLeft, 
  Bookmark, 
  Sparkles,
  SlidersHorizontal 
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ListingCard } from '@/components/ListingCard';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';
import { getWishlistIds } from '@/lib/wishlist';

export default function SavedListingsPage() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'PROPERTIES' | 'AUTOS'>('ALL');

  useEffect(() => {
    loadSavedData();
    const handleUpdate = () => {
      setSavedIds(getWishlistIds());
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, []);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const ids = getWishlistIds();
      setSavedIds(ids);

      // Fetch all published listings
      const res = await api.getListings({ page_size: 50 });
      setAllListings(res.items || []);
    } catch (err) {
      console.error('Failed to load listings for wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter listings to only those in the wishlist
  const savedListings = allListings.filter((item) => savedIds.includes(item.id));

  // Category filter
  const filteredListings = savedListings.filter((item) => {
    if (filterType === 'PROPERTIES') return item.asset_category !== 'VEHICLE';
    if (filterType === 'AUTOS') return item.asset_category === 'VEHICLE';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Personalized Wishlist</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Saved Properties & Automobiles
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl">
              Keep track of luxury residences, strategic land investments, and exotic vehicles you've saved for direct contact or viewing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300">
              {savedListings.length} {savedListings.length === 1 ? 'Asset Saved' : 'Assets Saved'}
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { id: 'ALL', label: 'All Saved Assets' },
            { id: 'PROPERTIES', label: 'Luxury Real Estate' },
            { id: 'AUTOS', label: 'Exotic Automobiles' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterType === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wishlist Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl bg-gray-900 border border-gray-800 p-4 h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-gray-900/60 border border-gray-800 max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tap the heart icon on any luxury villa, penthouse, land plot, or automobile to save it here for instant access anytime.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-all shadow-lg shadow-brand-600/20"
              >
                <span>Explore Luxury Marketplace</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
