'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, Zap, Users, Compass } from 'lucide-react';

export const AIMatchingBanner: React.FC = () => {
  return (
    <div className="my-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-950 via-gray-900 to-black border border-brand-500/30 p-8 sm:p-12 shadow-2xl">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/60 border border-brand-500/40 text-brand-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-gold-400" />
              <span>Core Marketplace Differentiator</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Don't spend hours searching. <br />
              Let the <span className="emerald-gradient">AI Matching Engine</span> find it for you.
            </h2>

            <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Post your exact property or vehicle requirements (buying budget, rental term, or lease preference).
              Our bidirectional matching algorithm continuously scans published listings and instantly alerts both
              seekers and verified owners when high-compatibility matches appear.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Strict transaction separation (Sale vs Rent vs Lease)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Transparent 0-100% compatibility scores</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Natural-language match explanations</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <Link
              href="/requirements/new"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all text-center"
            >
              <span>Post Request</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/listings/new"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-700 font-semibold text-sm transition-all text-center"
            >
              <Users className="w-4 h-4 text-gold-400" />
              <span>I Have an Asset to Offer</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
