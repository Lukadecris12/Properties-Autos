'use client';

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  SlidersHorizontal, 
  Building, 
  Home, 
  Car, 
  LandPlot, 
  Briefcase
} from 'lucide-react';
import { TransactionType, AssetCategory } from '@/lib/types';

interface SearchHeroProps {
  selectedTransaction: TransactionType;
  onSelectTransaction: (tx: TransactionType) => void;
  selectedCategory: AssetCategory;
  onSelectCategory: (cat: AssetCategory) => void;
  onSearch: (params: { keyword?: string; state?: string; min_price?: number; max_price?: number }) => void;
  onNLPSearch: (query: string) => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  selectedTransaction,
  onSelectTransaction,
  selectedCategory,
  onSelectCategory,
  onSearch,
  onNLPSearch,
}) => {
  const [isAIMode, setIsAIMode] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      state: location || undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const handleNLPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlpQuery.trim()) {
      onNLPSearch(nlpQuery);
    }
  };

  const categories = [
    { id: 'LAND' as AssetCategory, label: 'Land', icon: LandPlot },
    { id: 'RESIDENTIAL' as AssetCategory, label: 'Houses & Apartments', icon: Home },
    { id: 'COMMERCIAL' as AssetCategory, label: 'Commercial', icon: Briefcase },
    { id: 'VEHICLE' as AssetCategory, label: 'Cars & Vehicles', icon: Car },
  ];

  return (
    <div className="relative pt-12 pb-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-gold-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900/90 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-6 shadow-md backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
          <span>Global AI-Powered Property & Automobile Marketplace</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Find, Rent & Lease <br className="hidden sm:inline" />
          <span className="emerald-gradient">Properties</span> & <span className="gold-gradient">Automobiles</span> with AI
        </h1>

        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
          Nigeria's most advanced digital marketplace. Proactively connects buyers, tenants, and renters with owners, verified agents, and dealers.
        </p>

        {/* Central Search Card */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-800 text-left">
          
          {/* Header Row: BUY | RENT | LEASE & AI Mode Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-gray-800">
            
            {/* 1. Transaction Type Selector */}
            <div className="flex items-center bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800">
              {(['SALE', 'RENT', 'LEASE'] as const).map((tx) => {
                const label = tx === 'SALE' ? 'BUY' : tx;
                const isActive = selectedTransaction === tx;
                return (
                  <button
                    key={tx}
                    type="button"
                    onClick={() => onSelectTransaction(tx)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 tracking-wider ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* AI Natural Language Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsAIMode(!isAIMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isAIMode
                  ? 'bg-brand-950 text-brand-300 border-brand-500 shadow-md shadow-brand-500/20'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAIMode ? 'text-brand-400' : 'text-gray-500'}`} />
              <span>{isAIMode ? 'AI Natural Search: Active' : 'Switch to AI Sentence Search'}</span>
            </button>

          </div>

          {/* 2. Asset Category Selector (Only shown in standard mode) */}
          {!isAIMode && (
            <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-all ${
                      isActive
                        ? 'bg-gray-800 text-brand-400 border border-brand-500/40 shadow-sm'
                        : 'bg-gray-950/40 text-gray-400 hover:text-white border border-gray-800/80 hover:bg-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. Search Input Form */}
          {isAIMode ? (
            /* AI Natural Language Search Form */
            <form onSubmit={handleNLPSubmit} className="pt-4 space-y-3">
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type="text"
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  placeholder="Type anything naturally, e.g., 'Find a 3-bedroom house in Lekki under 100m' or 'Short-let apartment in Lagos for 5 nights'"
                  className="w-full pl-12 pr-32 py-4 rounded-2xl bg-gray-950 border border-brand-500/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  AI Search
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                <span>Try examples:</span>
                <button
                  type="button"
                  onClick={() => setNlpQuery("3-bedroom apartment for rent in Victoria Island under 15 million")}
                  className="text-gray-400 hover:text-brand-400 underline"
                >
                  3-bed rent in VI under 15m
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setNlpQuery("Toyota Prado SUV for rent in Ikeja")}
                  className="text-gray-400 hover:text-brand-400 underline"
                >
                  Toyota Prado for rent in Ikeja
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setNlpQuery("Plots of land in Lekki Phase 1 with C of O")}
                  className="text-gray-400 hover:text-brand-400 underline"
                >
                  Land in Lekki with C of O
                </button>
              </div>
            </form>
          ) : (
            /* Standard Multi-Filter Search Form */
            <form onSubmit={handleStandardSubmit} className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              
              {/* Location Input */}
              <div className="sm:col-span-5 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, or Area (e.g., Lekki, Lagos, Abuja)"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Price / Budget Filter */}
              <div className="sm:col-span-4 relative">
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={
                    selectedTransaction === 'SALE'
                      ? 'Max Budget (₦)'
                      : 'Max Budget / Period (₦)'
                  }
                  className="w-full px-3.5 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Search Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
