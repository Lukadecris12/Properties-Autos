'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Crown, 
  Zap, 
  HelpCircle, 
  FileText, 
  MessageCircle, 
  Phone, 
  ArrowRight,
  X
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PricingSubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter Member',
      tagline: 'Ideal for individual seekers, tenants & single-asset owners',
      badge: 'Free Tier',
      badgeColor: 'bg-gray-800 text-gray-300',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Up to 2 active property or auto listings',
        'Standard search & AI matching engine',
        'Direct inquiry messaging with verified owners',
        'Standard customer support via helpdesk',
        'Up to 5 high-resolution photos per listing',
      ],
      ctaText: 'Current Active Tier',
      popular: false,
    },
    {
      id: 'agent_pro',
      name: 'Verified Agent Pro',
      tagline: 'Designed for licensed property brokers & independent auto merchants',
      badge: 'Most Popular',
      badgeColor: 'bg-brand-600 text-white shadow-md shadow-brand-600/40',
      monthlyPrice: 25000,
      annualPrice: 250000,
      features: [
        'Up to 25 active property & vehicle listings',
        'Official green "Verified Agent" trust badge',
        'Featured placement in Marketplace search results',
        'AI Buyer Lead Matching & instant inquiries',
        'Direct WhatsApp click-to-chat on listing cards',
        'Priority offline inspection coordination',
        'Storefront profile in Agents & Developers Directory',
      ],
      ctaText: 'Subscribe to Agent Pro',
      popular: true,
    },
    {
      id: 'developer_enterprise',
      name: 'Corporate Developer & Dealer',
      tagline: 'For master estate developers, construction firms & major dealerships',
      badge: 'Enterprise Gold',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      monthlyPrice: 85000,
      annualPrice: 850000,
      features: [
        'Unlimited active listings & development phases',
        'Dedicated Corporate Storefront in Directory',
        'Official "Enterprise Developer / Dealer" gold seal',
        'Top-tier featured banner across homepage & categories',
        'Multi-unit inventory & phase release management',
        'Dedicated Corporate Account Concierge',
        'Physical due diligence & title audit support',
        'Custom corporate branding & promotional badges',
      ],
      ctaText: 'Activate Corporate Plan',
      popular: false,
    },
    {
      id: 'hni_vip',
      name: 'HNI VIP Concierge',
      tagline: 'Exclusive private advisory for institutional buyers & high-net-worth investors',
      badge: 'VIP Club',
      badgeColor: 'bg-purple-950/80 text-purple-300 border border-purple-500/30',
      monthlyPrice: 250000,
      annualPrice: 2500000,
      features: [
        'Private off-market luxury estate & exotic auto access',
        'Discreet corporate acquisitions concierge',
        'Statutory title verification priority processing',
        'In-person due diligence & title search coordination',
        'Direct consultation with senior real estate legal counsel',
        'Private airport & inspection transport arrangements',
      ],
      ctaText: 'Request VIP Concierge',
      popular: false,
    },
  ];

  const handleSelectPlan = (plan: any) => {
    if (plan.id === 'starter') return;
    setSelectedPlan(plan);
    setInvoiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-4">
            <Crown className="w-3.5 h-3.5 text-brand-400" />
            <span>Professional Membership & Verification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Transparent, High-Yield Plans for Every Real Estate & Auto Leader
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed">
            Boost your market visibility, establish verified institutional trust, and connect directly with qualified buyers across Nigeria and the diaspora.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-gray-900 border border-gray-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const formattedPrice = price === 0 ? 'Free' : `₦${price.toLocaleString()}`;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.popular
                    ? 'bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border-2 border-brand-500 shadow-2xl shadow-brand-500/15 scale-[1.02]'
                    : 'bg-gray-900/80 border border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    {plan.popular && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-brand-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        Recommended
                      </span>
                    )}
                  </div>

                  {/* Plan Name & Tagline */}
                  <h3 className="text-xl font-bold text-white mb-1.5">{plan.name}</h3>
                  <p className="text-xs text-gray-400 min-h-[36px] leading-relaxed mb-6">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        {formattedPrice}
                      </span>
                      {price > 0 && (
                        <span className="text-xs text-gray-400 font-medium">
                          / {billingCycle === 'annual' ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'annual' && price > 0 && (
                      <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                        Billed annually • 2 months free
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                      Included Capabilities
                    </div>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action Button */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.id === 'starter'}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                    plan.id === 'starter'
                      ? 'bg-gray-800 text-gray-400 cursor-default'
                      : plan.popular
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 hover:scale-[1.02]'
                      : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:scale-[1.02]'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  {plan.id !== 'starter' && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Offline Corporate Policy Notice */}
        <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline Corporate Payment & Due Diligence Policy</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              In full compliance with international app store review standards, no card processing or in-app financial holds are executed through this app. 
              Subscriptions are activated via official corporate bank invoices and verified by our finance desk at our corporate office.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-bold text-white shrink-0 transition-all"
          >
            Contact Billing Desk
          </Link>
        </div>

      </main>

      {/* Corporate Bank Invoice & Activation Modal */}
      {invoiceModalOpen && selectedPlan && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInvoiceModalOpen(false)}
        >
          <div 
            className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setInvoiceModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Corporate Pro-Forma Invoice</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {selectedPlan.name} Subscription
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Billing Cycle: {billingCycle === 'annual' ? 'Annual (12 Months)' : 'Monthly'}
              </p>
            </div>

            {/* Total Due */}
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Payable Amount</span>
              <span className="text-2xl font-extrabold text-brand-400">
                ₦{(billingCycle === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice).toLocaleString()}
              </span>
            </div>

            {/* Bank Transfer Details */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Designated Corporate Settlement Accounts
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Bank Name:</span>
                  <span className="text-white font-bold">Stanbic IBTC Bank Plc</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Account Name:</span>
                  <span className="text-white font-bold">Properties & Autos Tech Ltd</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Account Number:</span>
                  <span className="text-brand-400 font-mono font-bold text-sm">0048921849</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Bank Name:</span>
                  <span className="text-white font-bold">Zenith Bank Plc</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Account Name:</span>
                  <span className="text-white font-bold">Properties & Autos Tech Ltd</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Account Number:</span>
                  <span className="text-brand-400 font-mono font-bold text-sm">1018942103</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/2348031234567?text=${encodeURIComponent(
                  `Hello! I want to activate the ${selectedPlan.name} (${billingCycle}) on Properties & Autos. Please assist with verification of our payment transfer.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify Finance Desk on WhatsApp</span>
              </a>

              <Link
                href="/contact"
                className="w-full py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Proof via Contact Desk</span>
              </Link>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
