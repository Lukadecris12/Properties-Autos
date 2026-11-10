'use client';

import React, { useState, useEffect } from 'react';
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
  X,
  CreditCard,
  Rocket,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';

export default function PricingSubscriptionPage() {
  const [activeTab, setActiveTab] = useState<'STANDARD' | 'BUSINESS' | 'ENTERPRISE'>('STANDARD');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  // Selected plan for checkout modal
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [invoiceData, setInvoiceData] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load plans from backend
      const plansRes = await api.getSubscriptionPlans();
      if (plansRes && plansRes.data) {
        setPlans(plansRes.data);
      }

      // 2. Load authenticated user subscription if logged in
      try {
        const meRes = await api.getMe();
        if (meRes && meRes.data) {
          setCurrentUser(meRes.data);
          const subRes = await api.getMySubscription();
          if (subRes && subRes.data) {
            setUserSubscription(subRes.data);
          }
        }
      } catch (_) {
        // Not logged in
      }
    } catch (err: any) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const standardPlans = plans.filter(p => ['free', 'explorer', 'starter', 'growth'].includes(p.slug));
  const businessPlans = plans.filter(p => p.tier_category === 'BUSINESS');
  const enterprisePlans = plans.filter(p => p.tier_category === 'ENTERPRISE');

  const handleSelectPlan = async (plan: any) => {
    setSelectedPlan(plan);
    setErrorMsg('');
    setCheckoutStep('DETAILS');

    // Initiate invoice from backend
    try {
      setProcessing(true);
      const res = await api.subscribeToPlan({ plan_slug: plan.slug });
      setInvoiceData(res.data);
      setCheckoutStep('PAYMENT');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate plan checkout');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmActivation = async () => {
    if (!invoiceData || !selectedPlan) return;
    setProcessing(true);
    setErrorMsg('');
    try {
      const res = await api.verifySubscriptionPayment({
        reference: invoiceData.reference,
        plan_slug: selectedPlan.slug,
        provider: invoiceData.provider || 'PAYSTACK'
      });
      setUserSubscription(res.data);
      setCheckoutStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment verification failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span>Marketplace Subscriptions &amp; Boost Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Plans Built for Sellers, Agents &amp; Developers
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed">
            Manage your listing allowances, featured placements, and promotional 72-hour search boost credits.
            Direct backend quota enforcement ensuring transparency and maximum exposure.
          </p>

          {/* Current plan banner if logged in */}
          {userSubscription && (
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-brand-950/60 border border-brand-500/40 text-xs">
              <span className="text-gray-400">Current Plan:</span>
              <span className="font-bold text-white uppercase text-brand-400">{userSubscription.plan_name}</span>
              <span className="text-gray-500">•</span>
              <span className="text-emerald-400 font-semibold">{userSubscription.active_listings_count} / {userSubscription.listing_allowance} Listings</span>
              <span className="text-gray-500">•</span>
              <span className="text-amber-400 font-semibold">{userSubscription.remaining_boost_credits} Boosts Left</span>
            </div>
          )}
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="p-1 rounded-2xl bg-gray-900 border border-gray-800 flex gap-1 shadow-xl">
            <button
              onClick={() => setActiveTab('STANDARD')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'STANDARD'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Free &amp; Growth Tiers
            </button>
            <button
              onClick={() => setActiveTab('BUSINESS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'BUSINESS'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Business Plans (100 – 2,500)
            </button>
            <button
              onClick={() => setActiveTab('ENTERPRISE')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ENTERPRISE'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Enterprise Plans (2,750 – 6,000)
            </button>
          </div>
        </div>

        {/* Tab 1: Standard Plans (Free, Explorer, Starter, Growth) */}
        {activeTab === 'STANDARD' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {standardPlans.map((plan) => {
              const isCurrent = userSubscription?.plan_slug === plan.slug;
              const isPopular = plan.slug === 'growth';

              return (
                <div
                  key={plan.id}
                  className={`glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                    isPopular
                      ? 'border-2 border-brand-500/80 shadow-2xl shadow-brand-500/10'
                      : 'border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-white text-[10px] font-bold tracking-wide uppercase shadow-lg shadow-brand-500/40">
                      Best Marketplace Value
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                        {plan.badge || plan.tier_category}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-gray-400 mt-1.5 min-h-[32px] leading-relaxed">
                      {plan.tagline}
                    </p>

                    {/* Pricing */}
                    <div className="my-6 pb-6 border-b border-gray-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          ₦{Number(plan.price_ngn).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">/ month</span>
                      </div>
                    </div>

                    {/* Allowance Metrics */}
                    <div className="space-y-2.5 mb-6 text-xs bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Listings Capacity:</span>
                        <span className="font-bold text-white">{plan.listing_allowance} active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Featured Slots:</span>
                        <span className="font-bold text-amber-400">{plan.featured_allowance} ads</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Monthly Boosts:</span>
                        <span className="font-bold text-brand-400">{plan.boost_allowance} credits (72h)</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2.5 text-xs text-gray-300 mb-8">
                      {plan.features?.map((feat: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : isPopular
                        ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 hover:scale-[1.02]'
                        : 'bg-gray-800 hover:bg-gray-750 text-white border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span>{isCurrent ? 'Current Tier' : plan.price_ngn === 0 ? 'Select Free Plan' : `Upgrade to ${plan.name}`}</span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Business Plans Table / Cards (100 - 2,500) */}
        {activeTab === 'BUSINESS' && (
          <div className="mb-16 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 text-center max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-white">Agency &amp; Brokerage Volume Plans</h2>
              <p className="text-xs text-gray-400 mt-1">
                From Business 100 up to Business 2,500 in increments of 50 listings. 
                Includes featured listing slots and recurring 72-hour search boost credits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {businessPlans.map((plan) => {
                const isCurrent = userSubscription?.plan_slug === plan.slug;
                return (
                  <div
                    key={plan.id}
                    className="glass-panel rounded-2xl p-5 border border-gray-800 hover:border-brand-500/50 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-base text-white">{plan.name}</span>
                        <span className="text-sm font-bold text-brand-400">
                          ₦{Number(plan.price_ngn).toLocaleString()}<span className="text-[10px] text-gray-500 font-normal">/mo</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-4 text-center text-xs">
                        <div className="p-2 rounded-xl bg-gray-900 border border-gray-800">
                          <div className="text-[10px] text-gray-500">Listings</div>
                          <div className="font-bold text-white mt-0.5">{plan.listing_allowance.toLocaleString()}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-900 border border-gray-800">
                          <div className="text-[10px] text-gray-500">Featured</div>
                          <div className="font-bold text-amber-400 mt-0.5">{plan.featured_allowance}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-900 border border-gray-800">
                          <div className="text-[10px] text-gray-500">Boosts</div>
                          <div className="font-bold text-brand-400 mt-0.5">{plan.boost_allowance}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-brand-600/90 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20'
                      }`}
                    >
                      <span>{isCurrent ? 'Active Plan' : `Select ${plan.name}`}</span>
                      {!isCurrent && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Enterprise Plans (2,750 - 6,000) */}
        {activeTab === 'ENTERPRISE' && (
          <div className="mb-16 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 text-center max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-white">Master Developers &amp; Dealership Networks</h2>
              <p className="text-xs text-gray-400 mt-1">
                Institutional-scale allowances up to 6,000 listings, 1,200 featured placements, and 600 monthly boost credits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {enterprisePlans.map((plan) => {
                const isCurrent = userSubscription?.plan_slug === plan.slug;
                return (
                  <div
                    key={plan.id}
                    className="glass-panel rounded-3xl p-6 border border-gray-800 hover:border-amber-500/50 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                          {plan.badge || 'Enterprise'}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            Current
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      <div className="text-2xl font-extrabold text-white my-3">
                        ₦{Number(plan.price_ngn).toLocaleString()}<span className="text-xs text-gray-500 font-normal"> / month</span>
                      </div>

                      <div className="space-y-2 text-xs bg-gray-900/60 p-3 rounded-xl border border-gray-800 my-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Listings:</span>
                          <span className="font-bold text-white">{plan.listing_allowance.toLocaleString()} slots</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Featured Ads:</span>
                          <span className="font-bold text-amber-400">{plan.featured_allowance.toLocaleString()} slots</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Boosts:</span>
                          <span className="font-bold text-brand-400">{plan.boost_allowance.toLocaleString()} credits (72h)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                      }`}
                    >
                      <span>{isCurrent ? 'Active Tier' : `Select ${plan.name}`}</span>
                      {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature Comparison & Boost Engine Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-950 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Listing Allowance Engine</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every listing published is linked to your active subscription. Once your plan capacity is reached, you are notified with an instant upgrade option. Editing an ad never consumes an additional slot.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Featured Placement</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Designate listings as Featured within your plan's allowance. Featured listings display a gold trust badge and earn premium placement in category search results without mixing vehicle and property categories.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">72-Hour Search Boosts</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Boost credits temporarily elevate chosen advertisements to top positions in relevant keyword and location searches. Each boost runs for 72 hours with automatic expiry and real-time dashboard countdowns.
            </p>
          </div>
        </div>

      </main>

      {/* Checkout / Pro-forma Invoice Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-gray-700 p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutStep === 'PAYMENT' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                    Official Pro-Forma Invoice &amp; Checkout
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Subscribe to {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Transaction Reference: <code className="text-brand-300 font-mono">{invoiceData?.reference}</code>
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan:</span>
                    <span className="font-bold text-white">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Total:</span>
                    <span className="font-extrabold text-brand-400 text-sm">₦{Number(selectedPlan.price_ngn).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Listings Capacity:</span>
                    <span className="font-semibold text-white">{selectedPlan.listing_allowance.toLocaleString()} active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Featured Ads:</span>
                    <span className="font-semibold text-amber-400">{selectedPlan.featured_allowance} slots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Boosts:</span>
                    <span className="font-semibold text-brand-400">{selectedPlan.boost_allowance} credits (72h)</span>
                  </div>
                </div>

                {/* Designated Bank Clearing Details */}
                <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/30 space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Designated Corporate Bank Account:</span>
                  </div>
                  <div className="text-gray-300 space-y-1 text-[11px]">
                    <div>Bank: <strong>{invoiceData?.designated_bank?.bank_name || 'Zenith Bank PLC'}</strong></div>
                    <div>Account Name: <strong>{invoiceData?.designated_bank?.account_name || 'Properties & Autos Technologies Ltd'}</strong></div>
                    <div>Account Number: <strong className="text-brand-300 font-mono text-xs">1018899223</strong></div>
                    <div>Narration: <strong className="text-amber-300 font-mono text-[10px]">{invoiceData?.reference}</strong></div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleConfirmActivation}
                    className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{processing ? 'Verifying...' : 'Confirm Payment & Activate'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="px-5 py-3.5 rounded-2xl bg-gray-800 hover:bg-gray-750 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'SUCCESS' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Subscription Activated!</h3>
                <p className="text-xs text-gray-300 max-w-sm mx-auto">
                  Your account has been upgraded to <strong>{selectedPlan.name}</strong>. Your listing allowance is now {selectedPlan.listing_allowance.toLocaleString()} with {selectedPlan.boost_allowance} promotional boost credits ready to use.
                </p>
                <div className="pt-4 flex gap-3 justify-center">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30"
                  >
                    Go to Dashboard &amp; Boost Ads
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="px-5 py-3 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
