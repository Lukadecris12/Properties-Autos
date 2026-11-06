'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Home, 
  Car, 
  LandPlot, 
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { TransactionType, AssetCategory, RentalPeriod } from '@/lib/types';

export default function NewRequirementPage() {
  const router = useRouter();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [transactionType, setTransactionType] = useState<TransactionType>('RENT');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('RESIDENTIAL');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Budget
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('15000000');
  const [currency, setCurrency] = useState('NGN');
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('per_year');

  // Location
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Lagos');
  const [neighbourhoods, setNeighbourhoods] = useState('Victoria Island, Lekki Phase 1');

  // Category Criteria
  const [minBedrooms, setMinBedrooms] = useState('3');
  const [preferredFurnishing, setPreferredFurnishing] = useState('furnished');
  const [preferredBrand, setPreferredBrand] = useState('Mercedes-Benz');
  const [preferredVehicleType, setPreferredVehicleType] = useState('suv');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !maxBudget || !state || !city) {
      setError('Please provide a title, budget, and location.');
      return;
    }

    setSubmitting(true);
    setError(null);

    let criteria: Record<string, any> = {};
    if (assetCategory === 'RESIDENTIAL') {
      criteria = {
        min_bedrooms: Number(minBedrooms),
        furnishing: preferredFurnishing,
      };
    } else if (assetCategory === 'VEHICLE') {
      criteria = {
        brand: preferredBrand,
        vehicle_type: preferredVehicleType,
        rental_service_type: 'chauffeur_driven',
      };
    }

    const payload: any = {
      title,
      description,
      transaction_type: transactionType,
      asset_category: assetCategory,
      min_budget: minBudget ? Number(minBudget) : undefined,
      max_budget: Number(maxBudget),
      currency,
      preferred_state: state,
      preferred_city: city,
      preferred_neighbourhoods: neighbourhoods.split(',').map(n => n.trim()).filter(Boolean),
      criteria,
      status: 'ACTIVE'
    };

    if (transactionType === 'RENT' || transactionType === 'LEASE') {
      payload.rental_period = rentalPeriod;
    }

    try {
      // In development, ensure authenticated with seeker user if no token present
      let token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (!token) {
        const authRes = await fetch('http://localhost:8000/api/v1/auth/login', {
          method: 'POST',
          body: new URLSearchParams({
            username: 'seeker@gmail.com',
            password: 'SeekerPass123!'
          })
        });
        const authData = await authRes.json();
        if (authData.access_token) {
          headers['Authorization'] = `Bearer ${authData.access_token}`;
          localStorage.setItem('propertyhub_token', authData.access_token);
        }
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:8000/api/v1/requirements/', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to publish requirement.');
      }

      // Redirect to AI Matching Dashboard
      router.push('/requirements');
    } catch (err: any) {
      setError(err.message || 'An error occurred while publishing requirement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar onOpenAI={() => setAiModalOpen(true)} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/requirements" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AI Matching Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-500/40 text-brand-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-gold-400" />
            <span>Proactive AI Matching Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Post Request</h1>
          <p className="text-xs text-gray-400 max-w-lg mx-auto">
            Instead of manually browsing hundreds of listings, specify what you need. Our AI scans the entire market and notifies you as soon as a match is listed.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 border border-gray-800 shadow-2xl space-y-6">
          
          {/* 1. Transaction Type */}
          <div>
            <label className="block text-xs font-bold text-white mb-2">I am looking to:</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'SALE' as TransactionType, label: 'BUY (Outright)' },
                { type: 'RENT' as TransactionType, label: 'RENT (Residential / Cars)' },
                { type: 'LEASE' as TransactionType, label: 'LEASE (Commercial / Land)' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setTransactionType(item.type)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold text-center border transition-all ${
                    transactionType === item.type
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Asset Category */}
          <div>
            <label className="block text-xs font-bold text-white mb-2">Asset Category:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { cat: 'RESIDENTIAL' as AssetCategory, label: 'Houses & Flats', icon: Home },
                { cat: 'LAND' as AssetCategory, label: 'Land', icon: LandPlot },
                { cat: 'COMMERCIAL' as AssetCategory, label: 'Commercial', icon: Briefcase },
                { cat: 'VEHICLE' as AssetCategory, label: 'Cars & Autos', icon: Car },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = assetCategory === item.cat;
                return (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => setAssetCategory(item.cat)}
                    className={`p-3.5 rounded-2xl text-center border transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'bg-brand-950/60 border-brand-500 text-white shadow-md'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-400' : 'text-gray-500'}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Title & Description */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Requirement Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Seeking a 3-bedroom serviced apartment in Victoria Island or Lekki Phase 1"
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Specific Needs / Conditions (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Must have 24/7 electricity, good access road, swimming pool, and dedicated parking space."
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* 4. Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">Minimum Budget (Optional)</label>
              <input
                type="number"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                placeholder="e.g. 5000000"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">Maximum Budget (₦) *</label>
              <input
                type="number"
                required
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="e.g. 15000000"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Mandatory Rental Period (If RENT or LEASE) */}
          {(transactionType === 'RENT' || transactionType === 'LEASE') && (
            <div className="p-4 rounded-2xl bg-gray-950 border border-brand-500/30 space-y-2">
              <label className="block text-xs font-bold text-brand-400">Target Payment Frequency</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'per_night' as RentalPeriod, label: 'Nightly' },
                  { id: 'per_day' as RentalPeriod, label: 'Daily' },
                  { id: 'per_week' as RentalPeriod, label: 'Weekly' },
                  { id: 'per_month' as RentalPeriod, label: 'Monthly' },
                  { id: 'per_year' as RentalPeriod, label: 'Yearly' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRentalPeriod(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                      rentalPeriod === p.id
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Target Location */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Preferred Geographic Area</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Lagos, Abuja FCT"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">City / Hub *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lekki, Ikeja, Maitama"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Target Neighbourhoods (Comma-separated)</label>
                <input
                  type="text"
                  value={neighbourhoods}
                  onChange={(e) => setNeighbourhoods(e.target.value)}
                  placeholder="e.g. Victoria Island, Lekki Phase 1"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 6. Category Specifications */}
          {assetCategory === 'RESIDENTIAL' && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Minimum Bedrooms</label>
                <input
                  type="number"
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Furnishing Preference</label>
                <select
                  value={preferredFurnishing}
                  onChange={(e) => setPreferredFurnishing(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                >
                  <option value="furnished">Furnished</option>
                  <option value="semi_furnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
          )}

          {assetCategory === 'VEHICLE' && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Preferred Brand / Make</label>
                <input
                  type="text"
                  value={preferredBrand}
                  onChange={(e) => setPreferredBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Body Type</label>
                <select
                  value={preferredVehicleType}
                  onChange={(e) => setPreferredVehicleType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                >
                  <option value="suv">SUV / 4x4</option>
                  <option value="sedan">Sedan</option>
                  <option value="luxury">Luxury / VIP</option>
                  <option value="truck">Truck / Commercial</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-6 border-t border-gray-800">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-gold-400" />
              <span>{submitting ? 'Triggering AI Matching Algorithm...' : 'Post Request & Find Matches'}</span>
            </button>
            <p className="text-[11px] text-gray-500 text-center mt-2">
              Our matching engine will instantly scan published inventory and continuously alert you of new matches.
            </p>
          </div>

        </form>

      </main>

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
