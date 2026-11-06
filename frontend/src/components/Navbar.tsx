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
  User as UserIcon
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
    { id: 'RESIDENTIAL', label: 'Houses & Apartments', icon: Home, desc: 'Luxury duplexes, villas, flats' },
    { id: 'LAND', label: 'Land', icon: LandPlot, desc: 'Dry residential & mixed plots' },
    { id: 'VEHICLE', label: 'Autos & Vehicles', icon: Car, desc: 'SUVs, sedans, trucks, luxury cars' },
  ];

  const handleSubmenuSelect = (tx: 'SALE' | 'RENT', cat: AssetCategory) => {
    if (onSelectTransaction) onSelectTransaction(tx);
    if (onSelectCategory) onSelectCategory(cat);
    setBuyDropdownOpen(false);
    setRentDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1">
                Property<span className="text-brand-500">Hub</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-gray-400 block -mt-1 font-semibold">
                Properties & Autos
              </span>
            </div>
          </Link>

          {/* Primary Transaction Navigation with Dropdowns: BUY | RENT */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/80 p-1.5 rounded-full border border-gray-800 shadow-inner relative">
            
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
                className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 ${
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
                className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 ${
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

          {/* Directory Links: Property Investments, Agents & Developers, Admin */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-gray-300">
            <Link 
              href="/investments" 
              className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-gray-800/50"
            >
              <TrendingUp className="w-4 h-4 text-gold-400" />
              <span>Investments</span>
            </Link>
            <Link 
              href="/agents" 
              className="flex items-center gap-1.5 hover:text-brand-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-gray-800/50"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Agents & Developers</span>
            </Link>
            {currentUser?.is_superuser && (
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-gray-800/50"
              >
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Quick Actions & Auth */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Post a Request (Renamed from Post Requirement) */}
            <Link
              href="/requirements/new"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 transition-all"
            >
              <FileText className="w-4 h-4 text-gold-500" />
              <span>Post a Request</span>
            </Link>

            {/* Post Listing CTA */}
            <Link
              href="/listings/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 transition-all shadow-lg shadow-brand-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Listing</span>
            </Link>

            {/* Authentication Buttons (Sign In / Sign Up or User Dropdown) */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500/50 text-xs text-white transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                  <span className="font-medium max-w-[100px] truncate">{currentUser.first_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-300 bg-brand-950/80 border border-brand-500/40 hover:bg-brand-900/60 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

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

          {/* Directory Links on Mobile */}
          <div className="border-t border-gray-800 pt-3 space-y-2">
            <Link
              href="/investments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gold-400 border border-gray-800"
            >
              <TrendingUp className="w-4 h-4 text-gold-400" />
              <span>Property Investments (Co-Investment)</span>
            </Link>
            <Link
              href="/agents"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 text-xs font-medium text-gray-200 border border-gray-800"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Property Agents & Developers Directory</span>
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
              Post a Request
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
