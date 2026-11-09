'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Car, 
  LandPlot, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Lock,
  Compass
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-8 animate-in fade-in duration-700">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Next-Generation Real Estate, Auto & Investment Ecosystem</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight md:leading-[1.15] mb-6">
              Welcome to <span className="bg-gradient-to-r from-emerald-400 via-brand-400 to-gold-400 bg-clip-text text-transparent">Properties & Autos</span>
            </h1>

            <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
              The premier AI-powered marketplace where verified buyers, property developers, licensed agents, and corporate investors trade luxury properties, land, exotic autos, and participate in high-yield property co-investments.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Get Started / Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-700 font-semibold text-sm transition-all"
              >
                <Compass className="w-4 h-4 text-brand-400" />
                <span>Explore Marketplace</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 pt-12 border-t border-gray-800/80 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white">Title & Escrow Verified</div>
                  <div className="text-xs text-gray-400">C of O, Gov Consent & Custom papers inspected</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white">Co-Investment Portals</div>
                  <div className="text-xs text-gray-400">Earn 24% - 34% annual ROI with master developers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white">Unified Multi-Role</div>
                  <div className="text-xs text-gray-400">One account for Buyer, Seller, Agent & Developer</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white">6-Digit OTP Onboarding</div>
                  <div className="text-xs text-gray-400">Instant email verification via Resend service</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3 Pillars Section */}
        <section className="py-20 bg-gray-900/40 border-y border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                Everything You Need Under One Roof
              </h2>
              <p className="text-sm text-gray-400">
                Whether you are acquiring a waterfront villa, expanding land holdings, buying armored vehicles, or funding developer projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Buy & Rent */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 hover:border-brand-500/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-brand-950 border border-brand-500/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Buy & Rent Real Estate</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Browse vetted luxury duplexes, waterfront penthouses, serviced apartments, and industrial land plots across Lagos, Abuja, and international hubs.
                </p>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300">
                  <span>Browse Properties</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 2: Property Investment */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 hover:border-gold-500/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gold-950 border border-gold-500/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Developer Co-Investments</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Developers list prime projects for fractional investment. Earn guaranteed quarterly returns and capital growth backed by legal trust deeds.
                </p>
                <Link href="/investments" className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300">
                  <span>Explore Investments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 3: Autos & Vehicles */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Car className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Autos & Exotic Vehicles</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Buy or rent verified armored SUVs, executive sedans, and luxury trucks with authenticated VIN records and custom duty clearance.
                </p>
                <Link href="/?category=VEHICLE" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300">
                  <span>View Autos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Ready to Join Banner */}
        <section className="py-20 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Begin Your Premium Journey Today
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">
              Sign up in less than 2 minutes with verified 6-digit OTP security and access your dedicated investor or developer dashboard.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all"
            >
              <span>Create Account Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
