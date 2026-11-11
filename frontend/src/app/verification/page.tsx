'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { UserCheck, Building2, FileCheck, ShieldCheck, CheckCircle2, Award, ArrowRight } from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Award className="w-4 h-4" />
            Trust &amp; Verification Framework
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verification &amp; Due Diligence Standards
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            How Properties &amp; Autos verifies agents, property developers, automobile dealerships, and title records.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-gray-800 space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-brand-400" />
              1. Individual Agent &amp; Owner Verification
            </h2>
            <p>
              Individual listers and real estate agents must undergo identity verification before receiving the &quot;Verified Agent&quot; badge:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-400">
              <li>Government-issued photo identification (NIN, Driver&apos;s License, or International Passport).</li>
              <li>Two-factor phone number and email validation with one-time security codes (OTP).</li>
              <li>Physical office verification or proof of agency accreditation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-brand-400" />
              2. Corporate Developer &amp; Auto Dealership Accreditation
            </h2>
            <p>
              Property development firms and authorized car dealerships undergo enhanced business screening:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-400">
              <li>Corporate Affairs Commission (CAC) certificate of incorporation and status report.</li>
              <li>Tax Identification Number (TIN) and active corporate bank clearing account.</li>
              <li>Dealership showroom or estate development site physical address verification.</li>
            </ul>
          </section>

          <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              3. Land Title &amp; Vehicle Document Guidelines
            </h2>
            <p className="text-gray-300">
              We encourage all buyers to verify title documents through independent accredited solicitors:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                <span className="font-bold text-brand-400">Properties &amp; Land Titles</span>
                <p className="text-gray-400 mt-1">Certificate of Occupancy (C of O), Governor&apos;s Consent, Gazette, Excision, Registered Survey, Deed of Assignment.</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                <span className="font-bold text-emerald-400">Automobile Documentation</span>
                <p className="text-gray-400 mt-1">Vehicle Identification Number (VIN) check, Nigeria Customs Duty Papers, Original Vehicle License, Proof of Ownership Certificate.</p>
              </div>
            </div>
          </section>

        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-6 text-xs">
          <Link href="/security" className="text-brand-400 hover:text-brand-300 underline font-semibold">
            Security Disclosures
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/safety" className="text-brand-400 hover:text-brand-300 underline font-semibold">
            Anti-Fraud Protection
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/" className="text-gray-400 hover:text-white">
            Return to Marketplace Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
