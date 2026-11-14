'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Briefcase,
  Phone,
  Upload,
  ChevronDown,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';
import { api } from '@/lib/api';
import { COUNTRIES, CountryData } from '@/lib/geoData';

type AssetOption = 'residential' | 'land' | 'vehicle';
type RoleOption = 'seeker' | 'owner' | 'agent' | 'developer' | 'dealer';

const ASSET_OPTIONS: Array<{ value: AssetOption; label: string }> = [
  { value: 'residential', label: 'Houses & Apartment' },
  { value: 'land', label: 'Land' },
  { value: 'vehicle', label: 'Vehicles (cars, trucks, buses, motorcycles)' },
];

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Multi-step onboarding state:
  // 1 = Email & Password
  // 2 = Seeker or Seller
  // 3 = Asset Category pull-down
  // 4 = Role / Type pull-down (based on Asset Category)
  // 5 = First & Last Names
  // 6 = Phone Code + Number, Country + State + City, Optional Profile Picture
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  // Step 2-4: Intent, Asset & Role
  const [accountIntent, setAccountIntent] = useState<'seeker' | 'seller'>('seeker');
  const [selectedAssets, setSelectedAssets] = useState<AssetOption[]>(['residential']);
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption>('seeker');

  // Step 5: Names
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Step 6: Phone, Geo & Profile Picture
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
  const [dialCountry, setDialCountry] = useState<CountryData>(COUNTRIES[0]);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [dialCodeSearch, setDialCodeSearch] = useState('');
  const [dialCodeDropdownOpen, setDialCodeDropdownOpen] = useState(false);

  const [selectedState, setSelectedState] = useState(COUNTRIES[0].states[0]);
  const [stateSearch, setStateSearch] = useState('');
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Feedback & Loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const roleOptions = useMemo<Array<{ value: RoleOption; label: string }>>(() => {
    const hasProperty = selectedAssets.includes('residential') || selectedAssets.includes('land');
    const hasVehicle = selectedAssets.includes('vehicle');
    const options: Array<{ value: RoleOption; label: string }> = [
      { value: 'seeker', label: 'Seeker' },
      { value: 'owner', label: 'Owner' },
      { value: 'agent', label: 'Agent' },
    ];
    if (hasProperty) {
      options.push({ value: 'developer', label: 'Property Developer' });
    }
    if (hasVehicle) {
      options.push({ value: 'dealer', label: 'Auto/Car Dealer' });
    }
    return options;
  }, [selectedAssets]);

  const toggleAssetOption = (asset: AssetOption) => {
    setErrorMsg('');
    setSelectedAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    );
  };

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const filteredDialCodes = useMemo(() => {
    const q = dialCodeSearch.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(dialCodeSearch) || c.code.toLowerCase().includes(q)
    );
  }, [dialCodeSearch]);

  const filteredStates = useMemo(() => {
    const q = stateSearch.toLowerCase();
    return selectedCountry.states.filter((s) => s.toLowerCase().includes(q));
  }, [selectedCountry, stateSearch]);

  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    setSelectedState(country.states[0] || '');
    setCountryDropdownOpen(false);
    setCountrySearch('');
  };

  // Step 1 submit
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signupInitiate(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('propertyhub_saved_email', email.trim());
        localStorage.setItem('propertyhub_saved_password', password);
      }
      if (res.verification_token) {
        setVerificationToken(res.verification_token);
      }
      setSuccessMsg('');
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate signup. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIntent = (intent: 'seeker' | 'seller') => {
    setErrorMsg('');
    setAccountIntent(intent);
    setSelectedRole(intent === 'seeker' ? 'seeker' : 'owner');
    setStep(3);
  };

  const handleAssetContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (selectedAssets.length === 0) {
      setErrorMsg('Please select at least one category.');
      return;
    }
    const validValues = roleOptions.map((r) => r.value);
    if (!validValues.includes(selectedRole)) {
      setSelectedRole(accountIntent === 'seeker' ? 'seeker' : 'owner');
    }
    setAssetDropdownOpen(false);
    setStep(4);
  };

  const handleRoleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStep(5);
  };

  const handleNamesContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter both your First Name and Last Name.');
      return;
    }
    setStep(6);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setUploadingAvatar(true);
    try {
      const res = await api.uploadMedia([file]);
      const uploadedUrl = res.images?.[0]?.url;
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your city or town.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        verification_token: verificationToken || 'direct_onboarding',
        user_type: selectedRole === 'seeker' ? 'buyer' : 'seller',
        entity_type: selectedRole,
        asset_interests: selectedAssets,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim() || undefined,
        country_code: dialCountry.dialCode,
        phone_number: phoneNumber.trim(),
        country: selectedCountry.name,
        state: selectedState,
        city: city.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      };

      const res = await api.onboardingComplete(payload);

      if (res.access_token) {
        localStorage.setItem('propertyhub_token', res.access_token);
      }
      if (res.user) {
        localStorage.setItem('propertyhub_user', JSON.stringify(res.user));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete onboarding. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <style>{`
        @keyframes flyInBox {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fly-in-box {
          animation: flyInBox 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">Properties &amp; Autos</span>
              <span className="block text-[10px] uppercase tracking-widest text-brand-400 font-semibold">Global Onboarding</span>
            </div>
          </Link>

          <Link href="/auth/login" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
            Already have an account? <span className="text-brand-400 font-bold">Sign In</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl">
          {/* Progress Bar (6 Steps) */}
          <div className="mb-7">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 mb-2">
              <span>Step {step} of 6</span>
              <span className="text-brand-400">
                {step === 1 && 'Account Credentials'}
                {step === 2 && 'Seeker or Seller'}
                {step === 3 && 'Category Selection'}
                {step === 4 && 'Account Type'}
                {step === 5 && 'Full Name'}
                {step === 6 && 'Phone, Location & Photo'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: EMAIL & PASSWORD */}
          {step === 1 && (
            <div key="step1" className="fly-in-box">
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Your Properties &amp; Autos Account</h1>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your email and password to begin onboarding.
                </p>
              </div>

              <form onSubmit={handleInitiateSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="investor@example.com"
                      className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SEEKER OR SELLER (FLY-IN BOXES) */}
          {step === 2 && (
            <div key="step2" className="fly-in-box space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Are you joining as a Seeker or a Seller?</h2>
                <p className="text-xs text-gray-400 mt-1">Select the option that describes how you will use Properties &amp; Autos.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSelectIntent('seeker')}
                  className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.01] ${
                    accountIntent === 'seeker'
                      ? 'bg-brand-950/60 border-brand-500 shadow-lg shadow-brand-500/15'
                      : 'bg-[#0b0f19] border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Seeker</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Looking to buy, rent, or lease houses, land, or vehicles.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectIntent('seller')}
                  className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.01] ${
                    accountIntent === 'seller'
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/15'
                      : 'bg-[#0b0f19] border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Seller</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Owner, agent, developer, or dealer listing properties or vehicles.
                  </p>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          )}

          {/* STEP 3: MULTI-SELECT CATEGORY PULL-DOWN LIST */}
          {step === 3 && (
            <form key="step3" onSubmit={handleAssetContinue} className="fly-in-box space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Select What You Are Interested In</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Open the pull-down list below to choose one, two, or all three categories.
                </p>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Categories (Select one or more) <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAssetDropdownOpen(!assetDropdownOpen)}
                  className="w-full min-h-[48px] bg-[#0b0f19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between gap-2 text-left focus:outline-none focus:border-brand-500"
                >
                  <span className="truncate">
                    {selectedAssets.length === 0
                      ? 'Select categories...'
                      : ASSET_OPTIONS.filter((o) => selectedAssets.includes(o.value))
                          .map((o) => o.label)
                          .join(', ')}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${assetDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {assetDropdownOpen && (
                  <div className="mt-2 bg-gray-900 border border-gray-700 rounded-xl p-2 space-y-1 shadow-2xl">
                    {ASSET_OPTIONS.map((opt) => {
                      const checked = selectedAssets.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleAssetOption(opt.value)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left transition-colors ${
                            checked ? 'bg-brand-950/70 text-white border border-brand-500/40' : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <span className="font-medium">{opt.label}</span>
                          <span className={`w-4 h-4 rounded flex items-center justify-center border ${
                            checked ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-600'
                          }`}>
                            {checked && <CheckCircle2 className="w-3 h-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedAssets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ASSET_OPTIONS.filter((o) => selectedAssets.includes(o.value)).map((o) => (
                      <span
                        key={o.value}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-950/70 border border-brand-500/40 text-brand-300 text-[11px] font-semibold"
                      >
                        <span>{o.label}</span>
                        <button
                          type="button"
                          onClick={() => toggleAssetOption(o.value)}
                          className="hover:text-white"
                          aria-label={`Remove ${o.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: ROLE PULL-DOWN LIST BASED ON STEP 3 */}
          {step === 4 && (
            <form key="step4" onSubmit={handleRoleContinue} className="fly-in-box space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Select Your Role</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Options tailored to{' '}
                  <span className="text-brand-400 font-semibold">
                    {ASSET_OPTIONS.filter((a) => selectedAssets.includes(a.value)).map((a) => a.label).join(', ')}
                  </span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Registration Type <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as RoleOption)}
                    className="w-full appearance-none bg-[#0b0f19] border border-gray-700 rounded-xl px-4 py-3.5 pr-10 text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: FIRST & LAST NAMES (FLY-IN TEXT BOXES) */}
          {step === 5 && (
            <form key="step5" onSubmit={handleNamesContinue} className="fly-in-box space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Your Personal Details</h2>
                <p className="text-xs text-gray-400 mt-1">Enter your first and last name as you want it displayed on your account.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {(selectedRole === 'agent' || selectedRole === 'developer' || selectedRole === 'dealer') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {selectedRole === 'dealer'
                      ? 'Dealership / Showroom Name (Optional)'
                      : selectedRole === 'developer'
                      ? 'Development Company Name (Optional)'
                      : 'Agency / Brokerage Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Properties & Autos Ltd"
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 6: PHONE CODE + NUMBER, COUNTRY + STATE + CITY, OPTIONAL PROFILE PICTURE */}
          {step === 6 && (
            <form key="step6" onSubmit={handleCompleteRegistration} className="fly-in-box space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Contact, Location &amp; Profile Photo</h2>
                <p className="text-xs text-gray-400 mt-1">Complete your phone number, location, and optional profile picture.</p>
              </div>

              {/* Phone Code + Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative w-36">
                    <button
                      type="button"
                      onClick={() => {
                        setDialCodeDropdownOpen(!dialCodeDropdownOpen);
                        setCountryDropdownOpen(false);
                        setStateDropdownOpen(false);
                      }}
                      className="w-full h-11 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 flex items-center justify-between text-xs text-white"
                    >
                      <span>{dialCountry.flag} {dialCountry.dialCode}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    {dialCodeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-gray-900 border border-gray-800 rounded-xl p-2 z-50 shadow-2xl">
                        <input
                          type="text"
                          value={dialCodeSearch}
                          onChange={(e) => setDialCodeSearch(e.target.value)}
                          placeholder="Search code or country..."
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2 focus:outline-none"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredDialCodes.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setDialCountry(c);
                                setDialCodeDropdownOpen(false);
                                setDialCodeSearch('');
                              }}
                              className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                              <span>{c.flag} {c.name}</span>
                              <span className="font-mono text-brand-400">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="803 123 4567"
                      className="w-full h-11 bg-[#0b0f19] border border-gray-800 rounded-xl pl-9 pr-3 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Country, State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Searchable Country */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCountryDropdownOpen(!countryDropdownOpen);
                      setStateDropdownOpen(false);
                      setDialCodeDropdownOpen(false);
                    }}
                    className="w-full h-11 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 flex items-center justify-between text-xs text-white"
                  >
                    <span className="truncate">{selectedCountry.flag} {selectedCountry.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-gray-900 border border-gray-800 rounded-xl p-2 z-50 shadow-2xl">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country..."
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2 focus:outline-none"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelectCountry(c)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                          >
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Searchable State */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    State / Region <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStateDropdownOpen(!stateDropdownOpen);
                      setCountryDropdownOpen(false);
                      setDialCodeDropdownOpen(false);
                    }}
                    className="w-full h-11 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 flex items-center justify-between text-xs text-white"
                  >
                    <span className="truncate">{selectedState || 'Select State'}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </button>

                  {stateDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-60 bg-gray-900 border border-gray-800 rounded-xl p-2 z-50 shadow-2xl">
                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        placeholder="Search state..."
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2 focus:outline-none"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredStates.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setSelectedState(st);
                              setStateDropdownOpen(false);
                              setStateSearch('');
                            }}
                            className="w-full px-2 py-1.5 rounded text-xs text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Manual City / Town */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    City / Town <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lekki, Ikeja"
                    className="w-full h-11 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Optional Profile Picture Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Profile Picture <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#0b0f19] border border-gray-800">
                  {avatarUrl ? (
                    <div className="relative">
                      <img src={avatarUrl} alt="Profile preview" className="w-14 h-14 rounded-xl object-cover border border-gray-700" />
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center"
                        aria-label="Remove profile picture"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-900 border border-dashed border-gray-700 flex items-center justify-center text-gray-500">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white inline-flex items-center gap-2 border border-gray-700"
                    >
                      {uploadingAvatar ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change Picture' : 'Upload Profile Picture'}</span>
                    </button>
                    <p className="text-[11px] text-gray-500 mt-1">PNG, JPG or WEBP (optional)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Complete Onboarding &amp; Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
