'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Briefcase, 
  Home, 
  LandPlot, 
  Car, 
  Phone, 
  MapPin, 
  Upload, 
  Sparkles, 
  Search,
  ChevronDown,
  RefreshCw,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '@/lib/api';
import { COUNTRIES, CountryData } from '@/lib/geoData';

export default function RegisterPage() {
  const router = useRouter();

  // Step 1: Credentials
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = credentials, 2 = OTP modal, 3 = detailed onboarding
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: 6-Digit OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpDebug, setOtpDebug] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [resendingOtp, setResendingOtp] = useState(false);

  // Step 3: Detailed Onboarding State
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'owner' | 'agent' | 'developer' | 'dealer'>('seeker');
  const [assetInterests, setAssetInterests] = useState<string[]>(['residential', 'vehicle']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Phone & Geo
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]); // Default Nigeria
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [dialCodeSearch, setDialCodeSearch] = useState('');
  const [dialCodeDropdownOpen, setDialCodeDropdownOpen] = useState(false);

  const [selectedState, setSelectedState] = useState(COUNTRIES[0].states[0]); // Default Lagos
  const [stateSearch, setStateSearch] = useState('');
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Feedback & Loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Toggle asset interests
  const toggleAssetInterest = (asset: string) => {
    if (assetInterests.includes(asset)) {
      if (assetInterests.length > 1) {
        setAssetInterests(assetInterests.filter(a => a !== asset));
      }
    } else {
      setAssetInterests([...assetInterests, asset]);
    }
  };

  // Filtered Countries
  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Filtered Dial Codes
  const filteredDialCodes = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(dialCodeSearch.toLowerCase()) || 
      c.dialCode.includes(dialCodeSearch)
    );
  }, [dialCodeSearch]);

  // Filtered States based on selected country
  const filteredStates = useMemo(() => {
    return selectedCountry.states.filter(s => 
      s.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [selectedCountry, stateSearch]);

  // Select Country: Auto-updates available states & default state
  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    setSelectedState(country.states[0] || '');
    setCountryDropdownOpen(false);
    setCountrySearch('');
  };

  // --- STEP 1: INITIATE SIGNUP (SEND RESEND 6-DIGIT OTP) ---
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
      setSuccessMsg('Credentials confirmed! Please complete your onboarding details below.');
      setStep(3); // Direct transition to Onboarding profile, bypassing OTP
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate signup. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: HANDLE 6-DIGIT OTP INPUT ---
  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const updated = [...otpCode];
    updated[index] = val;
    setOtpCode(updated);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signupVerifyOtp(email, fullCode);
      setVerificationToken(res.verification_token);
      setSuccessMsg('Email verified successfully! Complete your onboarding profile.');
      setStep(3); // Proceed to detailed onboarding form
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired 6-digit code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    setErrorMsg('');
    try {
      const res = await api.resendOtp(email);
      if (res.otp_debug) setOtpDebug(res.otp_debug);
      setSuccessMsg('A fresh 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setResendingOtp(false);
    }
  };

  // --- STEP 3: COMPLETE ONBOARDING ---
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict validation based on selected role
    if (selectedRole === 'developer' || selectedRole === 'dealer') {
      if (!companyName.trim()) {
        setErrorMsg(selectedRole === 'developer' ? 'Development Company / Entity Name is required.' : 'Dealership / Showroom Name is required.');
        return;
      }
    } else {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg('First Name and Last Name are required.');
        return;
      }
    }

    if (!phoneNumber.trim()) {
      setErrorMsg('Please provide your authenticated phone number.');
      return;
    }

    if (!city.trim()) {
      setErrorMsg('Please specify your city or town.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        verification_token: verificationToken || 'direct_onboarding',
        user_type: selectedRole === 'seeker' ? 'buyer' : 'seller',
        entity_type: selectedRole,
        asset_interests: assetInterests,
        first_name: firstName.trim() || (companyName.trim() ? companyName.trim().split(' ')[0] : 'Member'),
        last_name: lastName.trim() || (companyName.trim() ? companyName.trim().split(' ').slice(1).join(' ') || 'User' : 'User'),
        company_name: companyName.trim() || undefined,
        country_code: selectedCountry.dialCode,
        phone_number: phoneNumber.trim(),
        country: selectedCountry.name,
        state: selectedState,
        city: city.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
      };

      const res = await api.onboardingComplete(payload);

      // Save token in localStorage
      if (res.access_token) {
        localStorage.setItem('propertyhub_token', res.access_token);
      }
      if (res.user) {
        localStorage.setItem('propertyhub_user', JSON.stringify(res.user));
      }

      // Immediately redirect to user dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete onboarding. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      {/* Top Bar */}
      <div className="h-16 border-b border-gray-800 bg-[#111827]/70 backdrop-blur-md px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-md shadow-brand-500/20 border border-brand-500/30 bg-black/40">
            <img src="/logo.png" alt="Properties & Autos" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Properties<span className="text-brand-400 ml-1">&amp; Autos</span>
          </span>
        </Link>
        <Link href="/auth/login" className="text-xs text-gray-400 hover:text-white transition-colors">
          Already have an account? <span className="text-brand-400 font-semibold underline">Sign In</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-10 relative">

          {/* Progress Tracker */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-brand-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                1
              </div>
              <span className={`text-xs font-semibold ${step === 1 ? 'text-white' : 'text-gray-400'}`}>1. Credentials</span>
            </div>
            <div className={`h-0.5 flex-1 mx-4 ${step === 3 ? 'bg-brand-600' : 'bg-gray-800'}`} />
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                2
              </div>
              <span className={`text-xs font-semibold ${step === 3 ? 'text-white' : 'text-gray-400'}`}>2. Onboarding Profile</span>
            </div>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: EMAIL & PASSWORD REGISTRATION */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Your Properties &amp; Autos Account</h1>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your email and password to begin creating your Properties &amp; Autos account.
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
                      <span>Continue to Onboarding Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: 6-DIGIT OTP POP-UP / MODAL */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-950 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-brand-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Enter 6-Digit Verification Code</h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                We sent a 6-digit confirmation code via Resend to <strong className="text-white">{email}</strong>. 
                Please enter the code to verify your human identity.
              </p>

              {/* Dev Bypass / Debug Box if running offline/simulation */}
              {otpDebug && (
                <div className="inline-block mb-6 px-4 py-2 rounded-xl bg-amber-950/50 border border-amber-600/40 text-amber-300 text-xs font-mono">
                  🔑 Simulation Code: <strong>{otpDebug}</strong>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && idx > 0) {
                        const prev = document.getElementById(`otp-input-${idx - 1}`);
                        if (prev) prev.focus();
                      }
                    }}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#0b0f19] border border-gray-700 rounded-xl focus:outline-none focus:border-brand-500 text-white font-mono transition-colors"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Verify & Continue to Onboarding</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp}
                    className="text-brand-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    {resendingOtp ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    <span>Resend Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DETAILED COMPREHENSIVE ONBOARDING FORM */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Verified</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Complete Your Onboarding Profile</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Configure your primary marketplace role, asset preferences, and geographic parameters.
                </p>
              </div>

              <form onSubmit={handleCompleteOnboarding} className="space-y-6">

                {/* 1. ROLE SELECTION */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    1. Select Your Role on Properties & Autos <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'seeker',
                        title: 'Property / Auto Seeker',
                        desc: 'Looking to buy, rent, or lease property or vehicles',
                        icon: User,
                      },
                      {
                        id: 'owner',
                        title: 'Property / Auto Owner',
                        desc: 'Private owner selling or leasing personal properties or cars',
                        icon: Home,
                      },
                      {
                        id: 'agent',
                        title: 'Property / Auto Agent',
                        desc: 'Licensed broker, agent, or representative managing listings',
                        icon: Briefcase,
                      },
                      {
                        id: 'developer',
                        title: 'Property Developer',
                        desc: 'Real estate developer, construction firm, or project sponsor',
                        icon: Building2,
                      },
                      {
                        id: 'dealer',
                        title: 'Auto Dealer',
                        desc: 'Automotive dealership, verified showroom, or leasing fleet',
                        icon: Car,
                      },
                    ].map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id as any)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-brand-950 border-brand-500 text-brand-300 shadow-md shadow-brand-500/20 ring-1 ring-brand-500'
                              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand-600/20 text-brand-400' : 'bg-gray-800 text-gray-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white">{role.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-tight">{role.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. ASSET INTERESTS (Houses, Land, Autos) */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    2. Primary Asset Focus <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'residential', label: 'Houses & Apartments', icon: Home },
                      { id: 'land', label: 'Land', icon: LandPlot },
                      { id: 'vehicle', label: 'Autos & Vehicles', icon: Car },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = assetInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAssetInterest(item.id)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            isSelected
                              ? 'bg-brand-950 border-brand-500 text-brand-300 shadow-md shadow-brand-500/20 ring-1 ring-brand-500'
                              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-brand-400' : 'text-gray-400'}`} />
                          <span className="text-xs font-bold text-white">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. NAME & IDENTIFICATION FIELDS */}
                {selectedRole === 'developer' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Development Company / Firm Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Horizon Urban Developers Ltd"
                        className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Primary Contact First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Primary Contact Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : selectedRole === 'dealer' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Dealership / Showroom Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Prestige Auto Gallery & Motors"
                        className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Showroom Representative First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Showroom Representative Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          First Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Last Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                    {selectedRole === 'agent' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Agency / Brokerage Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Apex Realty & Luxury Motors"
                          className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 5. PHONE NUMBER WITH SEARCHABLE COUNTRY CODE */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Authenticated Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    {/* Dialing Code Searchable Dropdown */}
                    <div className="relative w-36">
                      <button
                        type="button"
                        onClick={() => setDialCodeDropdownOpen(!dialCodeDropdownOpen)}
                        className="w-full h-10 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 flex items-center justify-between text-xs text-white"
                      >
                        <span>{selectedCountry.flag} {selectedCountry.dialCode}</span>
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
                                  setSelectedCountry(c);
                                  setSelectedState(c.states[0] || '');
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

                    {/* Phone Number Input */}
                    <div className="flex-1 relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="803 123 4567"
                        className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. SEARCHABLE COUNTRY & DYNAMICALLY POPULATED STATE & CITY */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Searchable Country Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {selectedRole === 'developer' || selectedRole === 'dealer' ? 'Operating Country' : 'Residence Country'} <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="w-full h-10 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 flex items-center justify-between text-xs text-white"
                    >
                      <span className="truncate">{selectedCountry.flag} {selectedCountry.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </button>

                    {countryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-gray-900 border border-gray-800 rounded-xl p-2 z-50 shadow-2xl">
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Type country name to search..."
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2 focus:outline-none"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => handleSelectCountry(c)}
                              className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                              <span>{c.flag} {c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Searchable State / Province Dropdown (Populated immediately) */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      State / Province / Region <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                      className="w-full h-10 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 flex items-center justify-between text-xs text-white"
                    >
                      <span className="truncate">{selectedState || 'Select State'}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </button>

                    {stateDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-gray-900 border border-gray-800 rounded-xl p-2 z-50 shadow-2xl">
                        <input
                          type="text"
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          placeholder="Search state/region..."
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

                  {/* City Text Input (Manual) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      City / Town <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lekki, Ikoyi, Ikeja"
                      className="w-full h-10 bg-[#0b0f19] border border-gray-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* 7. PROFILE PHOTO OR COMPANY LOGO (OPTIONAL) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {selectedRole === 'developer' || selectedRole === 'dealer' ? 'Company / Showroom Logo URL' : 'Profile Picture URL'} <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Upload className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={selectedRole === 'developer' || selectedRole === 'dealer' ? logoUrl : avatarUrl}
                      onChange={(e) => {
                        if (selectedRole === 'developer' || selectedRole === 'dealer') {
                          setLogoUrl(e.target.value);
                        } else {
                          setAvatarUrl(e.target.value);
                        }
                      }}
                      placeholder="https://images.unsplash.com/... or company logo link"
                      className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Complete Onboarding & Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
