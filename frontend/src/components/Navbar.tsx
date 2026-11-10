'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ChevronDown, 
  PlusCircle, 
  Menu, 
  X,
  FileText,
  UserCheck,
  Home,
  LandPlot,
  Car,
  Briefcase,
  LogIn,
  LogOut,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  Heart,
  User as UserIcon,
  Award,
  SlidersHorizontal,
  Headphones,
  Crown,
  HelpCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { AssetCategory } from '@/lib/types';

interface NavbarProps {
  onOpenAI?: () => void;
  activeTransaction?: 'SALE' | 'RENT';
  onSelectTransaction?: (tx: 'SALE' | 'RENT') => void;
  activeCategory?: AssetCategory;
  onSelectCategory?: (cat: AssetCategory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTransaction = 'SALE', 
  onSelectTransaction,
  activeCategory = 'RESIDENTIAL',
  onSelectCategory
}) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false);
  const [rentDropdownOpen, setRentDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('propertyhub_token') : null;
    if (token) {
      try {
        const res = await api.getMe();
        if (res?.data) {
          setCurrentUser(res.data);
        }
      } catch (_) {
        // Token expired or invalid
        localStorage.removeItem('propertyhub_token');
        setCurrentUser(null);
      }
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('propertyhub_token');
      setCurrentUser(null);
      router.push('/');
    }
  };

  const submenus: { id: AssetCategory; label: string; icon: any; desc: string }[] = [
    { id: 'RESIDENTIAL', label: 'Houses & Apartments', icon: Home, desc: 'Duplexes, bungalows, mini flats, apartments' },
    { id: 'COMMERCIAL', label: 'Commercial Property', icon: Briefcase, desc: 'Offices, warehouses, malls, hotels, shops' },
    { id: 'LAND', label: 'Land', icon: LandPlot, desc: 'Residential, commercial, industrial & farm land' },
    { id: 'VEHICLE', label: 'Cars & Vehicles', icon: Car, desc: 'Brand new, foreign used & Nigerian used cars' },
  ];

  const handleSubmenuSelect = (tx: 'SALE' | 'RENT', cat: AssetCategory) => {
    if (onSelectTransaction) onSelectTransaction(tx);
    if (onSelectCategory) onSelectCategory(cat);
    setBuyDropdownOpen(false);
    setRentDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 lg:gap-3 h-20">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 select-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center whitespace-nowrap leading-none">
                <span className="text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-white">
                  Properties
                </span>
                <span className="text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-brand-400 ml-1.5">
                  &amp;&nbsp;Autos
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] tracking-widest uppercase text-gray-400 font-semibold whitespace-nowrap mt-1 leading-none">
                Luxury Real Estate &amp; Vehicles
              </span>
            </div>
          </Link>

          {/* Primary Transaction Navigation with Dropdowns: BUY | RENT */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/80 p-1 sm:p-1.5 rounded-full border border-gray-800 shadow-inner relative shrink-0">
            
            {/* BUY Menu with Submenu */}
            <div 
              className="relative"
              onMouseEnter={() => setBuyDropdownOpen(true)}
              onMouseLeave={() => setBuyDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  if (onSelectTransaction) onSelectTransaction('SALE');
                  setBuyDropdownOpen(!buyDropdownOpen);
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                  activeTransaction === 'SALE'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <span>BUY</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {buyDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      Buy Category
                    </div>
                    {submenus.map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTransaction === 'SALE' && activeCategory === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSubmenuSelect('SALE', item.id)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-brand-950/80 text-brand-300 border border-brand-500/30'
                              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold">{item.label}</div>
                            <div className="text-[10px] text-gray-500">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RENT Menu with Submenu (includes commercial leases) */}
            <div 
              className="relative"
              onMouseEnter={() => setRentDropdownOpen(true)}
              onMouseLeave={() => setRentDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  if (onSelectTransaction) onSelectTransaction('RENT');
                  setRentDropdownOpen(!rentDropdownOpen);
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                  activeTransaction === 'RENT'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <span>RENT</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {rentDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      Rent Category
                    </div>
                    {submenus.map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTransaction === 'RENT' && activeCategory === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSubmenuSelect('RENT', item.id)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-brand-950/80 text-brand-300 border border-brand-500/30'
                              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold">{item.label}</div>
                            <div className="text-[10px] text-gray-500">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </nav>

          {/* Directory Links: Agents & Developers, Messages, Saved, Plans, Support, FAQ */}
          <div className="hidden xl:flex items-center gap-1 2xl:gap-1.5 text-xs font-medium text-gray-300 shrink min-w-0">
            <Link 
              href="/agents" 
              className="flex items-center gap-1 hover:text-brand-400 transition-colors py-1 px-2 rounded-lg hover:bg-gray-800/50 whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Agents<span className="hidden 2xl:inline">&nbsp;&amp;&nbsp;Developers</span></span>
            </Link>
            <Link 
              href="/messages" 
              className="flex items-center gap-1 hover:text-brand-400 transition-colors py-1 px-2 rounded-lg hover:bg-gray-800/50 whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>Messages</span>
            </Link>
            <Link 
              href="/saved" 
              className="flex items-center gap-1 hover:text-rose-400 transition-colors py-1 px-2 rounded-lg hover:bg-gray-800/50 text-gray-300 whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Saved</span>
            </Link>
            <Link 
              href="/pricing" 
              className="flex items-center gap-1 hover:text-brand-400 transition-colors py-1 px-2 rounded-lg hover:bg-gray-800/50 whitespace-nowrap"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Plans</span>
            </Link>
            <Link 
              href="/contact" 
              className="flex items-center gap-1 hover:text-brand-400 transition-colors py-1 px-2 rounded-lg hover:bg-gray-800/50 whitespace-nowrap"
            >
              <Headphones className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>Support</span>
            </Link>
            <Link 
              href="/faq" 
              className="flex items-center gap-1 hover:text-brand-400 transition-colors py-1 px-2 rounded-lg hover:bg-gray-800/50 whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>FAQ</span>
            </Link>
            {currentUser?.is_superuser && (
              <Link 
                href="/admin" 
                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors py-1 px-2 rounded-lg hover:bg-gray-800/50 whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Quick Actions & Auth */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Post Request */}
            <Link
              href="/requirements/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 transition-all shrink-0 whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Post Request</span>
            </Link>

            {/* Post Listing CTA */}
            <Link
              href="/listings/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 transition-all shadow-md shadow-brand-600/20 shrink-0 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Publish Listing</span>
            </Link>

            {/* Unified Profile Menu Dropdown */}
            <div className="relative border-l border-gray-800 pl-2 sm:pl-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setBuyDropdownOpen(false);
                  setRentDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-2xl border transition-all shrink-0 ${
                  profileDropdownOpen
                    ? 'bg-brand-950/90 border-brand-500 text-white shadow-lg shadow-brand-500/20 ring-1 ring-brand-500'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-brand-500/25 shrink-0">
                  {currentUser ? (currentUser.first_name || currentUser.company_name || 'U')[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left hidden 2xl:block">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                    <span className="max-w-[85px] truncate">
                      {currentUser ? (currentUser.first_name || currentUser.company_name) : 'Profile'}
                    </span>
                    {currentUser?.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">
                    {currentUser ? `${currentUser.active_mode || 'Member'}` : 'Sign In'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 shrink-0 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu Card */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-gray-900/95 border border-gray-800 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl divide-y divide-gray-800/80">
                    
                    {/* User Header */}
                    <div className="pb-3 px-1">
                      {currentUser ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate max-w-[170px]">
                              {currentUser.first_name} {currentUser.last_name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{currentUser.email}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-brand-300 font-semibold bg-brand-950/80 px-2 py-1 rounded-lg border border-brand-500/30">
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-brand-400" />
                              <span>Role Mode:</span>
                            </span>
                            <span className="font-bold text-white uppercase">{currentUser.active_mode || 'BUYER'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-1">
                          <p className="text-xs font-bold text-white">Properties &amp; Autos Profile</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Sign in to access your unified portfolio &amp; AI matches.</p>
                          <div className="grid grid-cols-2 gap-2 mt-2.5">
                            <Link
                              href="/auth/login"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold text-center transition-all shadow-sm"
                            >
                              Sign In
                            </Link>
                            <Link
                              href="/auth/register"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-brand-300 text-xs font-bold text-center border border-gray-700 transition-all"
                            >
                              Sign Up
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Menu Group 1: Profile & Core Hub */}
                    <div className="py-2 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <UserIcon className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">My Profile &amp; Account Settings</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">My Dashboard &amp; Listings</span>
                      </Link>
                      <Link
                        href="/messages"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Direct Messages Inbox</span>
                      </Link>
                      <Link
                        href="/saved"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Saved Listings &amp; Wishlist</span>
                      </Link>
                    </div>

                    {/* Menu Group 2: High Value Ecosystem */}
                    <div className="py-2 space-y-1">
                      <Link
                        href="/agents"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <UserCheck className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Agents &amp; Developers Directory</span>
                      </Link>
                      <a
                        href="https://wa.me/2348031234567?text=Hello%20Properties%20%26%20Autos%20VIP%20Concierge%20Desk%2C%20I%20need%20assistance."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <Headphones className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">24/7 VIP Concierge Desk</span>
                      </a>
                      <Link 
                        href="/pricing" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Plans &amp; Subscriptions</span>
                      </Link>
                      <Link 
                        href="/contact" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <Headphones className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Client Support Desk</span>
                      </Link>
                      <Link 
                        href="/faq" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-gray-800/70 transition-all group"
                      >
                        <HelpCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Frequently Asked Questions</span>
                      </Link>
            {currentUser?.is_superuser && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-red-300 hover:text-red-200 hover:bg-red-950/40 transition-all group"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                          <span className="font-semibold">Admin Audit Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Menu Group 3: Logout if signed in */}
                    {currentUser && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-semibold">Sign Out</span>
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-gray-800 px-4 pt-2 pb-6 space-y-4">
          
          {/* BUY / RENT Selector on Mobile */}
          <div className="flex justify-around bg-gray-900 p-1.5 rounded-xl border border-gray-800">
            {(['SALE', 'RENT'] as const).map((tx) => (
              <button
                key={tx}
                onClick={() => {
                  if (onSelectTransaction) onSelectTransaction(tx);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTransaction === tx ? 'bg-brand-600 text-white' : 'text-gray-400'
                }`}
              >
                {tx === 'SALE' ? 'BUY' : 'RENT'}
              </button>
            ))}
          </div>

          {/* Houses, Land, Autos Category Selector on Mobile */}
          <div className="grid grid-cols-3 gap-2">
            {submenus.map((item) => {
              const Icon = item.icon;
              const isSelected = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'bg-brand-950 text-brand-300 border-brand-500/50'
                      : 'bg-gray-900 text-gray-400 border-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-[11px] font-semibold truncate w-full">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Profile Card */}
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-brand-950/90 to-gray-900 border border-brand-500/40 text-white shadow-md shadow-brand-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                {currentUser ? (currentUser.first_name || currentUser.company_name || 'U')[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>{currentUser ? `${currentUser.first_name} ${currentUser.last_name || ''}` : 'My Profile & Preferences'}</span>
                  {currentUser?.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-brand-300 capitalize">
                  {currentUser ? `Active Mode: ${currentUser.active_mode || 'Buyer'}` : 'Tap to view profile & roles'}
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-600 text-white font-bold">View</span>
          </Link>

          {/* Directory Links on Mobile */}
          <div className="border-t border-gray-800 pt-3 space-y-2">
            <Link
              href="/agents"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gray-200 border border-gray-800"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Property Agents & Developers Directory</span>
            </Link>
            <Link
              href="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gray-200 border border-gray-800"
            >
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Direct Messages Inbox</span>
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gray-200 border border-gray-800"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Membership Plans & Subscriptions</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gray-200 border border-gray-800"
            >
              <Headphones className="w-4 h-4 text-brand-400" />
              <span>Contact & Client Support Desk</span>
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gray-200 border border-gray-800"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Frequently Asked Questions (FAQ)</span>
            </Link>
            <Link
              href="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gray-200 border border-gray-800"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Saved Listings & Wishlist</span>
            </Link>
          </div>

          {/* Actions & Auth on Mobile */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
            <Link
              href="/requirements/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800 text-xs font-medium text-white border border-gray-700"
            >
              <FileText className="w-4 h-4 text-gold-500" />
              Post Request
            </Link>
            <Link
              href="/listings/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-brand-600 text-xs font-medium text-white"
            >
              <PlusCircle className="w-4 h-4" />
              Publish Listing
            </Link>
          </div>

          <div className="pt-2">
            {currentUser ? (
              <div className="flex gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white"
                >
                  <UserIcon className="w-4 h-4 text-brand-400" />
                  <span>Dashboard ({currentUser.first_name})</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-900/40 text-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-900 text-xs font-semibold text-white border border-gray-800"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl bg-brand-950 text-xs font-semibold text-brand-300 border border-brand-500/40"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
