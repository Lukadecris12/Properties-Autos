'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  FileCheck, 
  AlertTriangle, 
  Bug, 
  Cpu, 
  CreditCard,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function SecurityDisclosuresPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            Security Disclosures &amp; Platform Safeguards
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Security &amp; Regulatory Disclosures
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Properties &amp; Autos Technologies Ltd • Infrastructure, Financial &amp; Statutory Title Disclosures
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-gray-800 space-y-8 text-sm leading-relaxed text-gray-300">
          
          {/* Section 1: Data Encryption & Infrastructure */}
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-brand-400" />
              1. Multi-Layer Encryption &amp; Cloud Security
            </h2>
            <p>
              Properties &amp; Autos employs defense-in-depth architectural safeguards to protect client communications, ownership records, and transactional documents:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs">
                  <Server className="w-4 h-4 text-emerald-400" /> Data in Transit
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Enforced TLS 1.3 with Perfect Forward Secrecy across all mobile, API, and web connections with strict HTTP Strict Transport Security (HSTS).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Data at Rest
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Databases, storage buckets, and user archives are protected using military-grade AES-256 bit encryption with rotated keys.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Payment Gateway & In-App Security */}
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-brand-400" />
              2. PCI-DSS Level 1 &amp; In-App Billing Compliance
            </h2>
            <p>
              Properties &amp; Autos never stores, processes, or captures raw credit card numbers or banking passwords on its servers:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-400">
              <li>
                <strong className="text-gray-200">Web Checkout:</strong> Handled through PCI-DSS Level 1 certified processor Paystack with end-to-end tokenization and 3D Secure 2.0 (3DS) authentication.
              </li>
              <li>
                <strong className="text-gray-200">Mobile In-App Billing:</strong> Processed exclusively through Apple StoreKit and Google Play Billing infrastructure (via RevenueCat). Cardholder details remain strictly with Apple and Google.
              </li>
            </ul>
          </section>

          {/* Section 3: Statutory Real Estate & Vehicle Title Disclosures */}
          <section className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <FileCheck className="w-5 h-5 text-amber-400" />
              3. Statutory Title &amp; Real Estate Legal Disclosures
            </h2>
            <p className="text-gray-300">
              Properties &amp; Autos is a technology marketplace and digital matching engine. Please note the following statutory regulatory notices:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
              <li>
                <strong className="text-white">Title Verification Requirement:</strong> While our platform conducts AI document analysis and agent identity verification, an online badge does not replace statutory title searches at the appropriate State Lands Bureau (e.g. Lagos State Lands Bureau, Alausa, or relevant Ministry of Lands).
              </li>
              <li>
                <strong className="text-white">Governor&apos;s Consent &amp; C of O:</strong> Buyers are strongly advised to conduct legal due diligence with an accredited legal practitioner (solicitor) to inspect original Certificates of Occupancy (C of O), Governor&apos;s Consents, Gazettes, and Survey Plans prior to disbursing funds.
              </li>
              <li>
                <strong className="text-white">Automobile Physical Inspection:</strong> Vehicle buyers must physically inspect vehicles, verify Vehicle Identification Numbers (VINs), engine block numbers, and Custom duty papers before finalizing sales.
              </li>
            </ul>
          </section>

          {/* Section 4: AI Matching & Transparency */}
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-brand-400" />
              4. Responsible AI &amp; Matching Engine Transparency
            </h2>
            <p>
              Our bidirectional matching algorithm pairs buyers and sellers based on stated criteria (budget, location, square meters, vehicle transmission, and year). We do not manipulate organic search results based on race, religion, gender, or protected demographics.
            </p>
          </section>

          {/* Section 5: Vulnerability Disclosure & Contact */}
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Bug className="w-5 h-5 text-brand-400" />
              5. Responsible Vulnerability Disclosure Program
            </h2>
            <p>
              We welcome security researchers and ethical hackers to report suspected security vulnerabilities. If you believe you have discovered a vulnerability in our web or mobile application, please contact our security team:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300">
              <p><strong className="text-white">Security Contact:</strong> <a href="mailto:security@propertiesandautos.com" className="text-brand-400 underline">security@propertiesandautos.com</a></p>
              <p className="mt-1 text-gray-400">Please include detailed steps to reproduce, HTTP requests/responses, and allow our team reasonable time to remediate before public disclosure.</p>
            </div>
          </section>

        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-6 text-xs">
          <Link href="/terms" className="text-brand-400 hover:text-brand-300 underline font-semibold">
            Terms of Service &amp; EULA
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline font-semibold">
            Privacy Policy
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
