'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter & Search
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'stats'>('users');

  // Admin Quick Login Credentials for Demo
  const [adminEmail, setAdminEmail] = useState('admin@propertyhub.com');
  const [adminPassword, setAdminPassword] = useState('Admin@PropertyHub2026');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const checkAdminAuthAndLoad = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getAdminStats();
      setStats(statsRes.data);
      setIsAdmin(true);

      const [usersRes, logsRes] = await Promise.all([
        api.getAdminUsers(selectedRole, searchQuery),
        api.getAdminActivityLogs(),
      ]);
      setUsers(usersRes.data || []);
      setActivityLogs(logsRes.data || []);
    } catch (err) {
      console.warn('User not authenticated as admin');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuthAndLoad();
  }, [selectedRole]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const formData = new FormData();
      formData.append('username', adminEmail);
      formData.append('password', adminPassword);
      const res = await api.login(formData);
      if (res.access_token) {
        localStorage.setItem('propertyhub_token', res.access_token);
        await checkAdminAuthAndLoad();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleToggleVerify = async (userId: number) => {
    try {
      await api.toggleUserVerify(userId);
      const updated = await api.getAdminUsers(selectedRole, searchQuery);
      setUsers(updated.data || []);
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await api.toggleUserActive(userId);
      const updated = await api.getAdminUsers(selectedRole, searchQuery);
      setUsers(updated.data || []);
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await api.getAdminUsers(selectedRole, searchQuery);
    setUsers(updated.data || []);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-red-300 text-xs font-semibold mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>PropertyHub Master Administrator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Platform Administration & Audit Console
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Oversee marketplace participants, verify developer credentials, and monitor co-investment funds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkAdminAuthAndLoad}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If NOT authenticated as Admin: Show Quick Secure Admin Login */}
        {!isAdmin ? (
          <div className="max-w-md mx-auto my-16 bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center text-white mb-2">Admin Sign In Required</h2>
            <p className="text-xs text-gray-400 text-center mb-6">
              Please authenticate with administrator credentials to access platform controls.
            </p>

            {loginError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Master Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Log In as Administrator'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* KPI Metrics Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400">Total Users</span>
                    <Users className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{stats.users?.total || 0}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {stats.users?.developers || 0} Developers • {stats.users?.agents || 0} Agents
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400">Marketplace Listings</span>
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{stats.listings?.total || 0}</div>
                  <div className="text-[11px] text-blue-400 mt-1">
                    {stats.listings?.verified || 0} Title & Escrow Verified
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400">Co-Investment Funds</span>
                    <TrendingUp className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    ₦{(stats.investments?.funds_raised || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gold-400 mt-1">
                    {stats.investments?.active_projects || 0} Active Developer Projects
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400">System Health</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-emerald-400">100% Operational</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Resend OTP • FastAI Engine
                  </div>
                </div>
              </div>
            )}

            {/* Admin Tabs */}
            <div className="flex border-b border-gray-800 mb-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'users'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                User & Entity Management ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'activity'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Activity Audit Trail
              </button>
            </div>

            {/* TAB 1: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div>
                {/* Search & Role Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  {/* Role Chips */}
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'BUYER', 'SELLER', 'AGENT', 'DEVELOPER'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedRole === role
                            ? 'bg-brand-600 text-white'
                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, company, city..."
                      className="w-full bg-[#111827] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </form>
                </div>

                {/* Users Table */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0b0f19] border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Participant</th>
                          <th className="py-3 px-4">Role / Entity</th>
                          <th className="py-3 px-4">Contact & Location</th>
                          <th className="py-3 px-4">Verification</th>
                          <th className="py-3 px-4">Account Status</th>
                          <th className="py-3 px-4 text-right">Admin Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">
                                {u.company_name || `${u.first_name} ${u.last_name}`}
                              </div>
                              <div className="text-[11px] text-gray-400">{u.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-950 text-brand-300 border border-brand-500/30">
                                {u.entity_type || u.active_mode || 'Buyer'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-gray-300">{u.phone_number || 'N/A'}</div>
                              <div className="text-[11px] text-gray-500">{u.city}, {u.state} ({u.country})</div>
                            </td>
                            <td className="py-3 px-4">
                              {u.verification_badge === 'Verified' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                  <BadgeCheck className="w-4 h-4" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-gray-500 font-medium">Unverified</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.is_active ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                              }`}>
                                {u.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleVerify(u.id)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                                    u.verification_badge === 'Verified'
                                      ? 'border-gray-700 text-gray-400 hover:text-white'
                                      : 'border-emerald-600 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                                  }`}
                                >
                                  {u.verification_badge === 'Verified' ? 'Revoke Verify' : 'Approve Verify'}
                                </button>
                                <button
                                  onClick={() => handleToggleActive(u.id)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                                    u.is_active
                                      ? 'bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/50'
                                      : 'bg-emerald-950/40 border border-emerald-800 text-emerald-400'
                                  }`}
                                >
                                  {u.is_active ? 'Suspend' : 'Activate'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVITY LOGS */}
            {activeTab === 'activity' && (
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">Real-Time Platform Event Stream</h3>
                <div className="space-y-3">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#0b0f19] border border-gray-800 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-500 text-[10px]">{log.timestamp}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-950 text-brand-300 border border-brand-500/30">
                          {log.type}
                        </span>
                        <span className="text-gray-200">{log.event}</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[10px] font-bold">{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
