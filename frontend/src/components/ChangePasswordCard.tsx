'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';

interface ChangePasswordCardProps {
  className?: string;
}

export const ChangePasswordCard: React.FC<ChangePasswordCardProps> = ({ className = '' }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('propertyhub_token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      if (typeof window !== 'undefined') {
        localStorage.setItem('propertyhub_saved_password', newPassword);
      }
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    visible: boolean,
    onToggle: () => void,
    placeholder: string
  ) => (
    <div>
      <label className="block text-xs font-semibold text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type={visible ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password &amp; Account Security</span>
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">
            Update your account password anytime to keep your portfolio secure.
          </p>
        </div>
      </div>

      {!hasToken ? (
        <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400">Sign in to change your account password.</span>
          <Link
            href="/auth/login"
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shrink-0"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {renderPasswordInput(
            'Current Password',
            currentPassword,
            setCurrentPassword,
            showCurrent,
            () => setShowCurrent(!showCurrent),
            'Enter current password'
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderPasswordInput(
              'New Password',
              newPassword,
              setNewPassword,
              showNew,
              () => setShowNew(!showNew),
              'Min 6 characters'
            )}
            {renderPasswordInput(
              'Confirm New Password',
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              () => setShowConfirm(!showConfirm),
              'Re-enter new password'
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
};
