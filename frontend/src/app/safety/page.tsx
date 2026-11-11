'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldAlert, AlertTriangle, Eye, CheckCircle2, Lock, Flag } from 'lucide-react';

export default function AntiFraudSafetyPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldAlert className="w-4 h-4" />
            Safety &amp; Scam Prevention
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Anti-Fraud Protection &amp; Safety Guidelines
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Essential safety rules for buyers, renters, landlords, and automobile purchasers.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-gray-800 space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Golden Rules for Safe Transactions
            </h2>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
              <li><strong className="text-white">Never Send Money Prior to Physical Inspection:</strong> Never transfer &quot;inspection fees&quot;, deposits, or booking retainers for properties or vehicles you have not physically inspected with the verified agent or dealership.</li>
              <li><strong className="text-white">Verify Seller Identity:</strong> Always verify that the agent or dealership matches their accredited profile badge on Properties &amp; Autos.</li>
              <li><strong className="text-white">Pay to Corporate Bank Accounts:</strong> Where possible, pay directly into verified corporate clearing accounts or legal escrow rather than untraceable personal accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-brand-400" />
              Real Estate Inspection Safety
            </h2>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-400">
              <li>Meet in public or populated areas during daylight hours.</li>
              <li>Have an accredited surveyor verify boundary beacons and land coordinates.</li>
              <li>Conduct an official search at the State Land Registry before paying for land or property.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-brand-400" />
              Automobile Purchase Safety
            </h2>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-400">
              <li>Test drive the vehicle with a trusted professional mechanic.</li>
              <li>Match the VIN stamped on the chassis and dashboard with the vehicle logbook and Customs single goods declaration.</li>
              <li>Ensure the vehicle does not have active police liens or outstanding finance encumbrances.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-brand-400" />
              How to Report Suspicious Behavior
            </h2>
            <p>
              If an agent or dealer requests suspicious payments, exhibits aggressive behavior, or posts inaccurate photos, tap the <strong>&quot;Report Listing&quot;</strong> button on the listing page or email our safety team immediately at <a href="mailto:safety@propertiesandautos.com" className="text-brand-400 underline">safety@propertiesandautos.com</a>.
            </p>
          </section>

        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-6 text-xs">
          <Link href="/security" className="text-brand-400 hover:text-brand-300 underline font-semibold">
            Security Disclosures
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/verification" className="text-brand-400 hover:text-brand-300 underline font-semibold">
            Verification Standards
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
