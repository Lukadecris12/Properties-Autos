'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, X, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [resetOtpDebug, setResetOtpDebug] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('propertyhub_saved_email') || '';
      const savedPassword = localStorage.getItem('propertyhub_saved_password') || '';
      if (savedEmail) {
        setEmail(savedEmail);
        setResetEmail(savedEmail);
      }
      if (savedPassword) {
        setPassword(savedPassword);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email.trim());
      formData.append('password', password);

      const res = await api.login(formData);
      if (res?.access_token) {
        localStorage.setItem('propertyhub_token', res.access_token);
        localStorage.setItem('propertyhub_saved_email', email.trim());
        localStorage.setItem('propertyhub_saved_password', password);
        let targetRoute = '/dashboard';
        try {
          const me = await api.getMe();
          if (me?.data?.is_superuser) {
            targetRoute = '/admin';
          }
        } catch (_) {}
        setSuccess(true);
        setTimeout(() => {
          router.push(targetRoute);
        }, 800);
      } else {
        throw new Error('Login failed: Token not received');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    try {
      const res = await api.forgotPassword(resetEmail.trim());
      setResetOtpDebug(res?.data?.otp_debug || null);
      setResetStep(2);
      setResetSuccess('A 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setResetError(err.message || 'Could not send reset code.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (resetNewPass.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }
    setResetLoading(true);
    try {
      await api.resetPassword(resetEmail.trim(), resetOtp.trim(), resetNewPass);
      localStorage.setItem('propertyhub_saved_email', resetEmail.trim());
      localStorage.setItem('propertyhub_saved_password', resetNewPass);
      setEmail(resetEmail.trim());
      setPassword(resetNewPass);
      setResetSuccess('Password reset successfully! Your new password is ready to sign in.');
      setTimeout(() => {
        setForgotOpen(false);
        setResetStep(1);
        setResetOtp('');
        setResetNewPass('');
        setResetOtpDebug(null);
      }, 1200);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-lg shadow-brand-500/20 border border-brand-500/30 bg-black/40">
            <img src="/logo.png" alt="Properties & Autos" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Properties <span className="text-brand-500">& Autos</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs text-gray-400">
          Access your listings, short-let bookings, vehicle rentals, and AI matching
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Sign in successful! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || '');
                    setResetStep(1);
                    setResetError('');
                    setResetSuccess('');
                    setForgotOpen(true);
                  }}
                  className="text-[11px] text-brand-400 hover:text-brand-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Seed demo credentials helper */}
          <div className="p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800 text-[11px] space-y-1.5">
            <div className="font-semibold text-gray-300">Demo Accounts Available:</div>
            <div className="text-gray-400 flex justify-between">
              <span>Agent: <strong className="text-emerald-400">agent@apexproperties.ng</strong></span>
              <button
                type="button"
                onClick={() => {
                  setEmail('agent@apexproperties.ng');
                  setPassword('AgentPass123!');
                }}
                className="text-brand-400 hover:underline"
              >
                Autofill
              </button>
            </div>
            <div className="text-gray-400 flex justify-between">
              <span>Seeker: <strong className="text-gold-400">seeker@gmail.com</strong></span>
              <button
                type="button"
                onClick={() => {
                  setEmail('seeker@gmail.com');
                  setPassword('SeekerPass123!');
                }}
                className="text-brand-400 hover:underline"
              >
                Autofill
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 border-t border-gray-800 pt-4">
            Don't have an account yet?{' '}
            <Link href="/auth/register" className="font-semibold text-brand-400 hover:text-brand-300 underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-gray-900 border border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-brand-400" />
                <span>Reset Your Password</span>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{resetError}</span>
              </div>
            )}
            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <p className="text-xs text-gray-400">
                  Enter your registered email address and we will send a 6-digit code to create a new password.
                </p>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {resetLoading ? 'Sending Code...' : 'Send 6-Digit Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-3">
                {resetOtpDebug && (
                  <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-[11px]">
                    Reset Code: <strong className="font-mono">{resetOtpDebug}</strong>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs tracking-widest font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showResetPass ? 'text' : 'password'}
                      required
                      value={resetNewPass}
                      onChange={(e) => setResetNewPass(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPass(!showResetPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {resetLoading ? 'Resetting Password...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
