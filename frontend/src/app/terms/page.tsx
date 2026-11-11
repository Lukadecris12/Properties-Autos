'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileText, AlertTriangle, CheckCircle2, ShieldAlert, CreditCard, Ban } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <FileText className="w-4 h-4" />
            Terms of Use &amp; End User License Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service &amp; EULA
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Last Updated: November 2026 • Applies to Web, iOS App Store, and Google Play Mobile Applications
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-gray-800 space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-brand-400" />
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the Properties &amp; Autos mobile applications, website, or APIs (collectively, the &quot;Platform&quot;), you agree to be bound by these Terms of Service and End User License Agreement (&quot;EULA&quot;). If you do not agree, do not access or use the Platform.
            </p>
          </section>

          {/* Critical Apple Guideline 1.2 UGC Section */}
          <section className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              2. User-Generated Content &amp; Zero Tolerance for Abuse (Apple EULA Requirement)
            </h2>
            <p className="text-gray-300">
              Properties &amp; Autos operates a community marketplace connecting buyers, renters, dealers, and agents. We enforce a <strong>strict zero-tolerance policy</strong> for objectionable content and abusive behavior:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
              <li>
                <strong className="text-white">Prohibited Content:</strong> You must not upload fraudulent listings, stolen vehicles, fake land deeds, explicit or pornographic photos, hate speech, harassment, impersonation, or defamatory content.
              </li>
              <li>
                <strong className="text-white">In-App Reporting:</strong> Any user may flag or report an objectionable listing or profile by tapping the <em>&quot;Report Listing&quot;</em> button. Our moderation team reviews flagged content and removes violations within 24 hours.
              </li>
              <li>
                <strong className="text-white">User Blocking:</strong> Users may immediately block abusive senders within chat or storefronts. Blocked users cannot message or contact you.
              </li>
              <li>
                <strong className="text-white">Immediate Account Termination:</strong> Properties &amp; Autos reserves the right to immediately suspend or permanently delete the account of any user who posts fraudulent or objectionable content.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-brand-400" />
              3. Subscriptions, In-App Purchases &amp; Renewals
            </h2>
            <p>
              Properties &amp; Autos offers tiered memberships (Standard, Business, Enterprise) providing increased listing allowances, featured slots, and 72-hour promotional boosts:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-200">Apple App Store &amp; Google Play Billing:</strong> Mobile subscriptions are billed through your Apple ID or Google Play account. Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current billing period.
              </li>
              <li>
                <strong className="text-gray-200">Managing &amp; Canceling:</strong> You can manage or cancel your subscription anytime via your Apple ID Subscriptions settings (iOS) or Google Play Subscriptions menu (Android).
              </li>
              <li>
                <strong className="text-gray-200">Restoring Purchases:</strong> If you reinstall the app or change devices, use the &quot;Restore&quot; button on the Plans screen to restore active entitlements.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Ban className="w-5 h-5 text-brand-400" />
              4. Listing Verification &amp; Accuracy Disclaimers
            </h2>
            <p>
              Agents, owners, and vehicle dealers are legally responsible for the accuracy of property dimensions, title documents (C of O, Governor&apos;s Consent, Survey plans), and vehicle VINs/chassis numbers. Properties &amp; Autos does not own physical inventory listed by third-party agents unless expressly verified.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-brand-400" />
              5. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, Properties &amp; Autos Technologies Ltd shall not be liable for any indirect, incidental, special, or consequential damages resulting from real estate or vehicle transactions arranged between third-party buyers and sellers.
            </p>
          </section>

        </div>

        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline text-xs font-semibold mr-6">
            View Privacy Policy
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white text-xs">
            Return to Marketplace Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
