'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  SlidersHorizontal,
  LandPlot,
  X,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Investment for Return Calculator Modal
  const [activeInvestment, setActiveInvestment] = useState<any | null>(null);
  const [calcAmount, setCalcAmount] = useState<number>(1000000);
  const [investing, setInvesting] = useState(false);
  const [investSuccess, setInvestSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadInvestments = async () => {
    setLoading(true);
    try {
      const res = await api.getInvestments(selectedCategory, searchQuery);
      setInvestments(res.data || []);
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvestments();
  };

  const openCalculator = (inv: any) => {
    setActiveInvestment(inv);
    setCalcAmount(inv.minimum_investment || 1000000);
    setInvestSuccess(false);
    setErrorMsg('');
  };

  const handleCommitInvestment = async () => {
    if (!activeInvestment) return;
    setInvesting(true);
    setErrorMsg('');
    try {
      await api.investInProperty(activeInvestment.id, calcAmount);
      setInvestSuccess(true);
      loadInvestments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Investment failed. Please ensure you are signed in.');
    } finally {
      setInvesting(false);
    }
  };

  // Financial return calculations
  const calculateReturns = () => {
    if (!activeInvestment) return { totalProfit: 0, maturityValue: 0, periodicPayout: 0 };
    const roiDec = activeInvestment.projected_roi_percentage / 100.0;
    const totalProfit = calcAmount * roiDec;
    const maturityValue = calcAmount + totalProfit;
    const cycles = activeInvestment.dividend_cycle === 'Quarterly' 
        ? Math.max(1, Math.floor(activeInvestment.tenure_months / 3))
        : activeInvestment.dividend_cycle === 'Bi-Annually'
        ? Math.max(1, Math.floor(activeInvestment.tenure_months / 6))
        : 1;
    const periodicPayout = totalProfit / cycles;
    return { totalProfit, maturityValue, periodicPayout };
  };

  const { totalProfit, maturityValue, periodicPayout } = calculateReturns();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-800 bg-gradient-to-b from-[#111827] to-[#0b0f19]">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-950/80 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real Estate Co-Investment & Yield Generation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Property Investment for <span className="bg-gradient-to-r from-gold-400 to-amber-500 bg-clip-text text-transparent">Developers & Investors</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Verified master property developers list prime infrastructure, residential towers, and land banking opportunities. Individuals and corporate entities co-invest, earn structured returns (ROI), and receive distributions backed by legal trust deeds.
            </p>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              {[
                { id: 'ALL', label: 'All Opportunities' },
                { id: 'RESIDENTIAL', label: 'Luxury Residential' },
                { id: 'LAND', label: 'Land Banking' },
                { id: 'COMMERCIAL', label: 'Commercial & Hospitality' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === tab.id
                      ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20'
                      : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Opportunities Feed */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/40 rounded-2xl border border-gray-800">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <div className="text-lg font-bold text-white mb-1">No Investment Projects Found</div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No active developer projects match your current filter. Try selecting "All Opportunities".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {investments.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all flex flex-col group shadow-xl"
                >
                  {/* Image with ROI Badge */}
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={inv.image_urls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'}
                      alt={inv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gold-500/40 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-gold-400" />
                      <span className="text-xs font-extrabold text-gold-400">{inv.projected_roi_percentage}% Annual ROI</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-300">
                      {inv.tenure_months} Months Tenure
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Developer Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="truncate">{inv.developer_name}</span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug">
                        {inv.title}
                      </h3>

                      <p className="text-xs text-gray-400 line-clamp-2 mb-6">
                        {inv.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-400">Funding Progress</span>
                          <span className="font-bold text-white">{inv.funding_progress_percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-gold-500 rounded-full"
                            style={{ width: `${inv.funding_progress_percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
                          <span>₦{(inv.raised_amount || 0).toLocaleString()} raised</span>
                          <span>Target: ₦{inv.target_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Key Parameters */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-800 mb-6 text-xs">
                        <div>
                          <div className="text-gray-500 text-[10px] uppercase font-bold">Min. Investment</div>
                          <div className="font-bold text-white">₦{inv.minimum_investment.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-[10px] uppercase font-bold">Dividend Cycle</div>
                          <div className="font-bold text-gold-400">{inv.dividend_cycle}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCalculator(inv)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-black font-bold text-xs shadow-lg shadow-gold-500/20 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>View Details &amp; Returns Calculator</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Investment Return Calculator & Commitment Modal */}
        {activeInvestment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              <button
                onClick={() => setActiveInvestment(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>ROI Return Calculator & Co-Investment</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-1 line-clamp-1">
                {activeInvestment.title}
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Developer: <span className="text-emerald-400 font-semibold">{activeInvestment.developer_name}</span>
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              {investSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Investment Confirmed!</h3>
                  <p className="text-xs text-gray-300 max-w-sm mx-auto mb-6">
                    You have committed ₦{calcAmount.toLocaleString()} to this project. Your investment deed of trust and returns schedule have been credited to your portfolio.
                  </p>
                  <button
                    onClick={() => setActiveInvestment(null)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <label className="font-semibold text-gray-300">Investment Amount (NGN)</label>
                      <span className="text-gray-400">Min: ₦{activeInvestment.minimum_investment.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                      <input
                        type="number"
                        min={activeInvestment.minimum_investment}
                        step={100000}
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(Number(e.target.value))}
                        className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Calculator Projections Table */}
                  <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Projected Financial Yield Breakdown
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Projected Annual ROI Rate:</span>
                      <span className="font-bold text-gold-400">{activeInvestment.projected_roi_percentage}% per annum</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Investment Tenure:</span>
                      <span className="font-bold text-white">{activeInvestment.tenure_months} Months</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{activeInvestment.dividend_cycle} Distribution Payout:</span>
                      <span className="font-bold text-emerald-400">₦{Math.round(periodicPayout).toLocaleString()} / cycle</span>
                    </div>
                    <div className="pt-2 border-t border-gray-800 flex justify-between text-sm">
                      <span className="font-bold text-white">Total Expected Return:</span>
                      <span className="font-extrabold text-gold-400">₦{Math.round(maturityValue).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Offline Store Compliance & Office Visit Notice */}
                  <div className="flex items-start gap-2 text-[11px] text-gray-300 bg-amber-950/40 p-3.5 rounded-xl border border-amber-500/40">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white block mb-0.5">Offline Inquiries Only:</strong>
                      No payments or financial transactions are processed in this app. Please contact the developer directly or visit their corporate office to conduct statutory due diligence, review title documents, and finalize participation offline.
                    </span>
                  </div>

                  {/* Office & Direct Contact Actions */}
                  <div className="p-4 rounded-xl bg-[#0b0f19] border border-gray-800 space-y-3">
                    <div className="text-xs font-bold text-gray-300">Developer Corporate Office:</div>
                    <p className="text-xs text-gray-400">
                      {activeInvestment.developer_name} Headquarters<br />
                      Plot 14, Admiralty Way, Lekki Phase 1, Lagos State, Nigeria
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://wa.me/2348031234567?text=${encodeURIComponent(`Hello ${activeInvestment.developer_name}, I am reviewing "${activeInvestment.title}" on Properties & Autos and would like to arrange an office consultation.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                      >
                        <span>WhatsApp Office</span>
                      </a>
                      <a
                        href="tel:+2348031234567"
                        className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-gray-700 transition-all"
                      >
                        <span>Call Developer</span>
                      </a>
                    </div>
                  </div>

                  {/* Close / Inquire Button */}
                  <button
                    onClick={() => setActiveInvestment(null)}
                    className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 transition-all"
                  >
                    Close Project Details
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
