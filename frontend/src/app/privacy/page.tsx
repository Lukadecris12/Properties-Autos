'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Lock, Eye, Trash2, Smartphone, Database, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            Compliance &amp; Data Safety
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Last Updated: November 2026 • Effective Worldwide &amp; Nigeria (NDPA / GDPR / Google Play &amp; Apple App Store Compliant)
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-gray-800 space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-brand-400" />
              1. Information We Collect
            </h2>
            <p>
              Properties &amp; Autos Technologies Ltd (&quot;Properties &amp; Autos&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) values your privacy. We collect only information essential to providing our property, vehicle marketplace, and AI discovery services:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
              <li><strong className="text-gray-200">Account Information:</strong> Full name, email address, phone number, role (Seeker, Owner, Agent, Developer, Dealer), and optional profile image.</li>
              <li><strong className="text-gray-200">Listings &amp; Inquiries:</strong> Property and vehicle listings, photos, videos, pricing, geographic location, and communication between buyers and verified dealers.</li>
              <li><strong className="text-gray-200">Device &amp; Usage Data:</strong> IP address, operating system version, browser type, and anonymous crash telemetry to optimize performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-brand-400" />
              2. Mobile Device Permissions (Camera, Photos, Location)
            </h2>
            <p>Our mobile application requests the following device permissions only when actively needed:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-200">Camera &amp; Photo Library:</strong> Used solely to allow you to photograph or attach images/videos of houses, land, commercial properties, or vehicles you list for sale or rent. We never access your gallery without your explicit permission.
              </li>
              <li>
                <strong className="text-gray-200">Approximate Location:</strong> Used optionally to show nearby properties, land developments, and vehicle dealerships relevant to your current search.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-brand-400" />
              3. Payments &amp; Subscriptions
            </h2>
            <p>
              We process subscription payments and in-app upgrades with industry-standard compliance:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-200">Mobile In-App Purchases:</strong> Handled securely by the Apple App Store (StoreKit) and Google Play Billing via RevenueCat. We never collect or store your credit card numbers on mobile devices.
              </li>
              <li>
                <strong className="text-gray-200">Web Payments:</strong> Billed via PCI-DSS Level 1 certified gateway Paystack.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-brand-400" />
              4. Data Retention &amp; Security
            </h2>
            <p>
              Your personal data is encrypted in transit using TLS 1.3 and at rest with AES-256 encryption. We never sell, rent, or trade your personal contact details to third-party data brokers or advertisers.
            </p>
          </section>

          <section className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              5. Account &amp; Personal Data Deletion (Apple &amp; Google Compliant)
            </h2>
            <p className="text-gray-300">
              You retain full ownership of your data. You may delete your account and all associated data at any time:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
              <li><strong className="text-white">Inside the Mobile App:</strong> Go to Profile &gt; Account Settings &gt; Tap &quot;Delete Account&quot;. Your account, active listings, and personal credentials will be permanently erased.</li>
              <li><strong className="text-white">Online / Support Request:</strong> Email our Data Protection Officer at <a href="mailto:privacy@propertiesandautos.com" className="text-brand-400 underline">privacy@propertiesandautos.com</a> with subject &quot;Account Deletion Request&quot;. Deletion requests are processed within 24 to 48 hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-brand-400" />
              6. Contact Our Privacy Team
            </h2>
            <p>
              If you have any questions regarding this policy or wish to exercise your data rights, contact us:
            </p>
            <p className="mt-2 text-gray-400">
              Properties &amp; Autos Technologies Ltd<br />
              Email: <a href="mailto:privacy@propertiesandautos.com" className="text-brand-400">privacy@propertiesandautos.com</a><br />
              Support Desk: <a href="mailto:support@propertiesandautos.com" className="text-brand-400">support@propertiesandautos.com</a>
            </p>
          </section>

        </div>

        <div className="mt-8 text-center">
          <Link href="/terms" className="text-brand-400 hover:text-brand-300 underline text-xs font-semibold mr-6">
            View Terms of Service &amp; EULA
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
