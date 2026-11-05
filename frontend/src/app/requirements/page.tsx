'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  SlidersHorizontal, 
  Building2, 
  Home, 
  Car, 
  Calendar,
  AlertCircle,
  PlusCircle,
  XCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { AIMatch, Requirement } from '@/lib/types';
import { api } from '@/lib/api';

export default function RequirementsDashboardPage() {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'my_requirements'>('matches');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // In development, ensure seeker token is used if none present
      let token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      if (!token) {
        const authRes = await fetch('http://localhost:8000/api/v1/auth/login', {
          method: 'POST',
          body: new URLSearchParams({
            username: 'seeker@gmail.com',
            password: 'SeekerPass123!'
          })
        });
        const authData = await authRes.json();
        if (authData.access_token) {
          localStorage.setItem('propertyhub_token', authData.access_token);
        }
      }

      const res = await api.getMyMatches();
      if (res.data) {
        setMatches(res.data);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissMatch = async (matchId: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      await fetch(`http://localhost:8000/api/v1/matching/${matchId}/dismiss`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMatches(matches.filter(m => m.id !== matchId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar onOpenAI={() => setAiModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-500/40 text-brand-400 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-gold-400" />
              <span>Bidirectional Marketplace Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">AI-Matched Opportunities</h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Assets matched proactively with your active purchase, rental, and vehicle requirements using multi-criteria weighted scoring.
            </p>
          </div>

          <Link
            href="/requirements/new"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Requirement</span>
          </Link>
        </div>

        {/* Dashboard Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-44 rounded-3xl bg-gray-900 border border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-6">
            {matches.map((item) => {
              const listing = item.listing;
              if (!listing) return null;
              const isRental = listing.transaction_type === 'RENT' || listing.transaction_type === 'LEASE';
              const coverImage = listing.images && listing.images.length > 0
                ? listing.images[0].url
                : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600';

              const score = Math.round(item.compatibility_score);
              const breakdown = item.score_breakdown || {};

              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 hover:border-brand-500/40 transition-all shadow-xl space-y-6"
                >
                  
                  {/* Top Match Bar: Compatibility Pill & Transaction Type */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      
                      {/* Overall Score Circle */}
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-950 border border-brand-500/40 text-brand-300">
                        <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
                        <span className="text-sm font-extrabold">{score}% Compatibility</span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        listing.transaction_type === 'SALE'
                          ? 'bg-amber-500/90 text-white'
                          : listing.transaction_type === 'LEASE'
                          ? 'bg-purple-600/90 text-white'
                          : 'bg-brand-600/90 text-white'
                      }`}>
                        {listing.transaction_type}
                      </span>

                      <span className="text-xs text-gray-400">
                        Matched with requirement: <span className="text-white font-medium">"{item.requirement?.title || 'Your Requirement'}"</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleDismissMatch(item.id)}
                      className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Dismiss Match</span>
                    </button>
                  </div>

                  {/* Middle Content: Asset Preview & AI Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Image Preview */}
                    <div className="md:col-span-3 aspect-[16/10] rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 shrink-0">
                      <img src={coverImage} alt={listing.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Asset Details */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-brand-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{listing.neighbourhood ? `${listing.neighbourhood}, ` : ''}{listing.city}, {listing.state}</span>
                      </div>
                      <h3 className="text-base font-bold text-white hover:text-brand-400 transition-colors">
                        <Link href={`/listings/${listing.id}`}>
                          {listing.title}
                        </Link>
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-white">
                          {listing.currency} {Number(listing.price).toLocaleString()}
                        </span>
                        {isRental && listing.rental_period && (
                          <span className="text-xs font-semibold text-brand-400">
                            / {listing.rental_period.replace('per_', '')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Multi-Criteria Scoring Breakdown */}
                    <div className="md:col-span-4 p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Algorithm Factor Breakdown
                      </span>
                      
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-gray-400">Budget Alignment</span>
                            <span className="text-brand-400 font-bold">{breakdown.budget_score || 95}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${breakdown.budget_score || 95}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-gray-400">Location & Proximity</span>
                            <span className="text-brand-400 font-bold">{breakdown.location_score || 100}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${breakdown.location_score || 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-gray-400">Specification Matching</span>
                            <span className="text-brand-400 font-bold">{breakdown.specs_score || 90}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${breakdown.specs_score || 90}%` }} />
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Bottom: Natural-Language Match Explanation & Action Buttons */}
                  <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                      <span className="text-brand-400 font-bold">AI Match Explanation: </span>
                      {item.explanation}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span>View Asset</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
            <Sparkles className="w-12 h-12 text-brand-400 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-white">No active matches found right now</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              You haven't posted any requirements yet, or no inventory matches your exact criteria. Post your requirements to let the AI start finding compatible properties and automobiles.
            </p>
            <div className="pt-2">
              <Link
                href="/requirements/new"
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Requirement</span>
              </Link>
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
