'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Sparkles, 
  PlusCircle, 
  Menu, 
  X,
  FileText
} from 'lucide-react';

interface NavbarProps {
  onOpenAI: () => void;
  activeTransaction?: 'SALE' | 'RENT' | 'LEASE';
  onSelectTransaction?: (tx: 'SALE' | 'RENT' | 'LEASE') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAI, 
  activeTransaction = 'SALE', 
  onSelectTransaction 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMode, setUserMode] = useState<'buyer' | 'seller' | 'landlord' | 'dealer'>('buyer');

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-1">
                Property<span className="text-brand-500">Hub</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-gray-400 block -mt-1 font-semibold">
                Properties & Automobiles
              </span>
            </div>
          </Link>

          {/* Primary Transaction Navigation: BUY | RENT | LEASE */}
          <nav className="hidden md:flex items-center bg-gray-900/80 p-1.5 rounded-full border border-gray-800 shadow-inner">
            {(['SALE', 'RENT', 'LEASE'] as const).map((tx) => {
              const label = tx === 'SALE' ? 'BUY' : tx;
              const isActive = activeTransaction === tx;
              return (
                <button
                  key={tx}
                  onClick={() => onSelectTransaction?.(tx)}
                  className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & AI Launcher */}
          <div className="hidden lg:flex items-center gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-brand-950/60 border border-brand-500/30 hover:bg-brand-900/50 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
              <span>AI Concierge</span>
            </button>

            {/* Post Requirement Button */}
            <Link
              href="/requirements/new"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 transition-all"
            >
              <FileText className="w-4 h-4 text-gold-500" />
              <span>Post Requirement</span>
            </Link>

            {/* Post Listing CTA */}
            <Link
              href="/listings/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 transition-all shadow-lg shadow-brand-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Listing</span>
            </Link>

            {/* Account Mode Switcher */}
            <div className="relative border-l border-gray-800 pl-3">
              <select
                aria-label="Account Mode"
                value={userMode}
                onChange={(e) => setUserMode(e.target.value as any)}
                className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="buyer">Mode: Buyer / Tenant</option>
                <option value="seller">Mode: Property Seller</option>
                <option value="landlord">Mode: Landlord</option>
                <option value="dealer">Mode: Auto Dealer</option>
              </select>
            </div>
          </div>

          {/* Mobile hamburger & AI button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAI}
              className="p-2 rounded-lg bg-brand-950/60 border border-brand-500/30 text-brand-400"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-gray-800 px-4 pt-2 pb-6 space-y-4">
          <div className="flex justify-around bg-gray-900 p-1.5 rounded-xl border border-gray-800">
            {(['SALE', 'RENT', 'LEASE'] as const).map((tx) => (
              <button
                key={tx}
                onClick={() => {
                  onSelectTransaction?.(tx);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg ${
                  activeTransaction === tx ? 'bg-brand-600 text-white' : 'text-gray-400'
                }`}
              >
                {tx === 'SALE' ? 'BUY' : tx}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/requirements/new"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800 text-xs font-medium text-white border border-gray-700"
            >
              <FileText className="w-4 h-4 text-gold-500" />
              Post Requirement
            </Link>
            <Link
              href="/listings/new"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-brand-600 text-xs font-medium text-white"
            >
              <PlusCircle className="w-4 h-4" />
              Publish Listing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
