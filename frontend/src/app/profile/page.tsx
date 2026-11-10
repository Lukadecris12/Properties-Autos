'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Calendar, 
  DollarSign, 
  Globe, 
  Headphones, 
  LogOut, 
  Edit3, 
  Lock, 
  PlusCircle, 
  Car, 
  Home, 
  Briefcase, 
  Sparkles, 
  ExternalLink, 
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIAssistantModal } from '@/components/AIAssistantModal';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<string>('BUYER');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN (₦)');
  const [savedCurrencyNotice, setSavedCurrencyNotice] = useState<string | null>(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadUserData();
    const storedCurr = localStorage.getItem('properties_autos_currency');
    if (storedCurr) setSelectedCurrency(storedCurr);
    const storedMode = localStorage.getItem('properties_autos_mode');
    if (storedMode) setActiveMode(storedMode);
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
      if (token) {
        const res = await api.getMe();
        if (res?.data) {
          setCurrentUser(res.data);
          setEditFirstName(res.data.first_name || '');
          setEditLastName(res.data.last_name || '');
          setEditPhone(res.data.phone_number || '');
          setEditCity(res.data.city || 'Lagos');
          setEditState(res.data.state || 'Lagos');
          if (res.data.active_mode) {
            setActiveMode(res.data.active_mode.toUpperCase());
          }
        }
      } else {
        // Fallback demo user if not logged in
        setCurrentUser({
          id: 1,
          email: 'investor.prime@propertyhub.ng',
          first_name: 'David',
          last_name: 'Adeleke',
          company_name: 'Apex Horizon Estates & Motors Ltd',
          phone_number: '+234 803 123 4567',
          city: 'Ikoyi, Lagos',
          state: 'Lagos',
          is_verified: true,
          roles: ['buyer', 'seller', 'agent', 'developer'],
          active_mode: 'buyer'
        });
        setEditFirstName('David');
        setEditLastName('Adeleke');
        setEditPhone('+234 803 123 4567');
        setEditCity('Ikoyi, Lagos');
        setEditState('Lagos');
      }
    } catch (_) {
      // Demo fallback
      setCurrentUser({
        id: 1,
        email: 'investor.prime@propertyhub.ng',
        first_name: 'David',
        last_name: 'Adeleke',
        company_name: 'Apex Horizon Estates & Motors Ltd',
        phone_number: '+234 803 123 4567',
        city: 'Ikoyi, Lagos',
        state: 'Lagos',
        is_verified: true,
        roles: ['buyer', 'seller', 'agent'],
        active_mode: 'buyer'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    localStorage.setItem('properties_autos_mode', mode);
  };

  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    localStorage.setItem('properties_autos_currency', curr);
    setSavedCurrencyNotice(`Marketplace currency switched to ${curr}`);
    setTimeout(() => setSavedCurrencyNotice(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      const updated = {
        ...currentUser,
        first_name: editFirstName,
        last_name: editLastName,
        phone_number: editPhone,
        city: editCity,
        state: editState,
      };
      setCurrentUser(updated);
      localStorage.setItem('propertyhub_user', JSON.stringify(updated));
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('propertyhub_token');
      localStorage.removeItem('propertyhub_user');
      router.push('/auth/login');
    }
  };

  const userInitial = (currentUser?.first_name || currentUser?.company_name || 'U')[0]?.toUpperCase();
  const displayName = currentUser?.company_name || `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Valued Member';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar onOpenAI={() => setAiModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Unified Member Account Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              My Profile &amp; Preferences
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Switch unified marketplace roles, manage escrow settlements, and configure platform settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-brand-400" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/50 border border-red-900/50 hover:bg-red-900/50 text-xs font-bold text-red-300 transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Currency Notice Toast */}
        {savedCurrencyNotice && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{savedCurrencyNotice}</span>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* Main Grid: Left Profile Card + Right Unified Menu Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: User Card & Role Switcher */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Identity Card */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-2xl rounded-full pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 via-emerald-600 to-teal-800 flex items-center justify-center font-extrabold text-white text-2xl shadow-xl shadow-brand-500/20 shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white truncate">
                      {displayName}
                    </h2>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{currentUser?.email}</p>
                  
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Tier 3 Verified Escrow Member</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="mt-6 pt-5 border-t border-gray-800 space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone
                  </span>
                  <span className="font-semibold text-white">{currentUser?.phone_number || '+234 803 123 4567'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location
                  </span>
                  <span className="font-semibold text-white">{currentUser?.city || 'Lagos'}, {currentUser?.state || 'Nigeria'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gray-400" /> Currency
                  </span>
                  <span className="font-semibold text-gold-400">{selectedCurrency}</span>
                </div>
              </div>

              {/* Mode Switcher: Exactly as Mobile App */}
              <div className="mt-6 pt-5 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-400" />
                    Unified Account Mode
                  </span>
                  <span className="text-[10px] bg-brand-950 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30 font-bold">
                    {activeMode}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                  One unified account. Switch roles anytime to buy, list, broker, or develop assets without logging out.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BUYER', label: 'Buyer / Seeker', icon: UserIcon },
                    { id: 'SELLER', label: 'Seller / Landlord', icon: Home },
                    { id: 'AGENT', label: 'Property Agent', icon: Briefcase },
                    { id: 'DEVELOPER', label: 'Property Developer', icon: Building2 },
                    { id: 'DEALER', label: 'Auto Dealer', icon: Car },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleModeChange(item.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-xs font-bold truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick Metrics Card */}
            <div className="glass-panel p-5 rounded-3xl border border-gray-800">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Portfolio Snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                  <div className="text-[11px] text-gray-400">Active Listings</div>
                  <div className="text-xl font-extrabold text-white mt-1">4</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">2 Real Estate • 2 Autos</div>
                </div>
                <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                  <div className="text-[11px] text-gray-400">Escrow Balance</div>
                  <div className="text-xl font-extrabold text-gold-400 mt-1">₦42.5M</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Protected Funds</div>
                </div>
                <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                  <div className="text-[11px] text-gray-400">Inquiries Received</div>
                  <div className="text-xl font-extrabold text-white mt-1">18</div>
                  <div className="text-[10px] text-brand-400 mt-0.5">AI Matched</div>
                </div>
                <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                  <div className="text-[11px] text-gray-400">Trust Score</div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-1">99.4%</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Verified Partner</div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Profile Menus Matching Mobile App */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-6">

            {/* EDIT PROFILE FORM (Toggled by "Edit Profile" Button) */}
            {isEditing && (
              <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-3xl border border-brand-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-brand-400" />
                    Edit Personal &amp; Organization Details
                  </h3>
                  <span className="text-[11px] text-gray-400">Changes reflect immediately</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* SECTION 1: CORE PORTFOLIO & MARKETPLACE MENUS */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
              <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                Marketplace Management &amp; Inquiries
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Dashboard */}
                <Link
                  href="/dashboard"
                  className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 hover:border-brand-500/50 hover:bg-gray-900/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-brand-950/80 border border-brand-500/30 text-brand-400 group-hover:scale-105 transition-transform">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                        My Dashboard &amp; Listings
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Oversee active listings, inspect inquiries, and manage short-let bookings.
                    </p>
                  </div>
                </Link>

                {/* 2. Direct Messages */}
                <Link
                  href="/messages"
                  className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 hover:border-brand-500/50 hover:bg-gray-900/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Direct Messages Inbox
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Chat directly with verified sellers, car dealers, brokers, and developers.
                    </p>
                  </div>
                </Link>

                {/* 3. Saved Listings */}
                <Link
                  href="/saved"
                  className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 hover:border-brand-500/50 hover:bg-gray-900/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-400 group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                        Saved Listings &amp; Wishlist
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Bookmarked luxury houses, plots of land, and exotic vehicles.
                    </p>
                  </div>
                </Link>

                {/* 4. Post New Listing */}
                <Link
                  href="/listings/new"
                  className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 hover:border-brand-500/50 hover:bg-gray-900/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-brand-600/20 border border-brand-500/40 text-brand-300 group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                        Publish Property or Auto
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      List assets with up to 5 device photos or links for instant AI matching.
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* SECTION 2: HIGH-YIELD INVESTMENTS & DIRECTORY */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
              <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                High-Yield Investments &amp; Ecosystem
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Property Co-Investments */}
                <Link
                  href="/investments"
                  className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 hover:border-gold-500/50 hover:bg-gray-900/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-gold-950/80 border border-gold-500/30 text-gold-400 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-gold-300 transition-colors">
                        Property Co-Investments
                      </span>
                      <span className="text-[10px] bg-gold-950 text-gold-400 px-2 py-0.5 rounded-full font-bold">
                        24% - 34% ROI
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Participate in funded real estate developments with accredited master builders.
                    </p>
                  </div>
                </Link>

                {/* 2. Agents & Developers Directory */}
                <Link
                  href="/agents"
                  className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Agents &amp; Developers Directory
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Discover licensed brokers, realtors, dealerships, and accredited construction sponsors.
                    </p>
                  </div>
                </Link>

                {/* 3. AI Escrow & Title Verification */}
                <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Title Verification &amp; Escrow</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Automated legal title scanning (C of O, Governor&apos;s Consent, Custom Duty papers).
                    </p>
                  </div>
                </div>

                {/* 4. VIP WhatsApp Concierge */}
                <a
                  href="https://wa.me/2348031234567?text=Hello%20Properties%20%26%20Autos%20VIP%20Concierge%20Desk%2C%20I%20would%20like%20assistance%20with%20a%20transaction."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        24/7 VIP Concierge &amp; WhatsApp Desk
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Personal concierge support for high-value acquisitions and private viewings.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* SECTION 3: MARKETPLACE CURRENCY & PLATFORM PREFERENCES */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
              <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                Display Currency Preference
              </h3>
              <p className="text-[11px] text-gray-400">
                Choose your preferred price display format. Values are automatically converted in real-time.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'NGN (₦)', label: 'Nigerian Naira', symbol: '₦' },
                  { code: 'USD ($)', label: 'US Dollars', symbol: '$' },
                  { code: 'GBP (£)', label: 'British Pounds', symbol: '£' },
                ].map((curr) => {
                  const isSelected = selectedCurrency.startsWith(curr.code.split(' ')[0]);
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-brand-950/90 border-brand-500 text-brand-300 shadow-lg shadow-brand-500/20 ring-1 ring-brand-500'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="text-lg font-extrabold text-white">{curr.symbol}</div>
                      <div className="text-xs font-bold mt-1">{curr.code}</div>
                      <div className="text-[10px] text-gray-500">{curr.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Master Admin Console link if superuser */}
            {currentUser?.is_superuser && (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-950 border border-red-500/40 text-red-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Master Administration &amp; Moderation Console</h4>
                    <p className="text-[11px] text-gray-400">Review pending developer verifications, user audits, and escrow transactions.</p>
                  </div>
                </div>
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Open Console</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
}
