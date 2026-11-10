'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw,
  Lock,
  ExternalLink,
  ChevronRight,
  FileText,
  BadgeCheck,
  Headphones,
  Mail,
  Phone,
  Clock,
  Send,
  MessageSquare,
  Check,
  X,
  Crown,
  Flame,
  Rocket,
  Zap,
  CreditCard,
  Settings
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'plans_settings' | 'support' | 'activity' | 'stats'>('users');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Support Tickets filter
  const [ticketStatus, setTicketStatus] = useState('ALL');
  const [ticketSearch, setTicketSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Subscriptions & Boost Engine state
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subStats, setSubStats] = useState<any>(null);
  const [adminPlans, setAdminPlans] = useState<any[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatus, setSubscriberStatus] = useState('ALL');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState<number | ''>('');
  const [assignPlanSlug, setAssignPlanSlug] = useState('growth');
  const [assignDuration, setAssignDuration] = useState(30);
  const [assignNotes, setAssignNotes] = useState('');
  const [boostDurationSetting, setBoostDurationSetting] = useState('72');
  const [savingSetting, setSavingSetting] = useState(false);

  // Admin Credentials
  const [adminEmail, setAdminEmail] = useState('admin@propertyhub.ng');
  const [adminPassword, setAdminPassword] = useState('AdminPass123!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const checkAdminAuthAndLoad = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getAdminStats();
      setStats(statsRes.data);
      setIsAdmin(true);

      const [usersRes, logsRes, ticketsRes, subStatsRes, subRes, plansRes, settingsRes] = await Promise.all([
        api.getAdminUsers(selectedRole, searchQuery),
        api.getAdminActivityLogs(),
        api.getAdminSupportTickets(ticketStatus, ticketSearch).catch(() => ({ data: [] })),
        api.getAdminSubscriptionStats().catch(() => ({ data: null })),
        api.getAdminSubscribers(subscriberStatus, subscriberSearch).catch(() => ({ data: [] })),
        api.adminGetPlans().catch(() => ({ data: [] })),
        api.adminGetSettings().catch(() => ({ data: {} })),
      ]);
      setUsers(usersRes.data || []);
      setActivityLogs(logsRes.data || []);
      setTickets(ticketsRes.data || []);
      setSubStats(subStatsRes.data);
      setSubscribers(subRes.data || []);
      setAdminPlans(plansRes.data || []);
      if (settingsRes.data?.default_boost_duration_hours) {
        setBoostDurationSetting(settingsRes.data.default_boost_duration_hours);
      }
    } catch (err) {
      console.warn('User not authenticated as admin');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuthAndLoad();
  }, [selectedRole, ticketStatus]);

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

  const handleTicketSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.getAdminSupportTickets(ticketStatus, ticketSearch);
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to search tickets:', err);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      await api.updateAdminSupportTicket(ticketId, { status: newStatus });
      const res = await api.getAdminSupportTickets(ticketStatus, ticketSearch);
      setTickets(res.data || []);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const handleSendTicketResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminResponseText.trim()) return;

    setUpdatingTicket(true);
    try {
      await api.updateAdminSupportTicket(selectedTicket.id, {
        status: 'RESOLVED',
        admin_response: adminResponseText.trim(),
      });
      const res = await api.getAdminSupportTickets(ticketStatus, ticketSearch);
      setTickets(res.data || []);
      setSelectedTicket(null);
      setAdminResponseText('');
    } catch (err) {
      console.error('Failed to respond to ticket:', err);
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleAssignSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) return;
    try {
      await api.adminAssignSubscription({
        user_id: Number(assignUserId),
        plan_slug: assignPlanSlug,
        duration_days: assignDuration,
        notes: assignNotes || undefined,
      });
      setAssignModalOpen(false);
      setAssignNotes('');
      await checkAdminAuthAndLoad();
    } catch (err: any) {
      alert(err.message || 'Failed to assign subscription');
    }
  };

  const handleRevokeSubscription = async (userId: number) => {
    if (!confirm('Are you sure you want to revoke this user subscription and downgrade to Free Plan?')) return;
    try {
      await api.adminRevokeSubscription(userId);
      await checkAdminAuthAndLoad();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke subscription');
    }
  };

  const handleUpdateBoostDuration = async (val: string) => {
    setSavingSetting(true);
    try {
      await api.adminUpdateSettings('default_boost_duration_hours', val, 'Default boost duration in hours');
      setBoostDurationSetting(val);
      await checkAdminAuthAndLoad();
    } catch (err: any) {
      alert(err.message || 'Failed to update setting');
    } finally {
      setSavingSetting(false);
    }
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
              <span>Properties &amp; Autos Master Administrator Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Platform Administration &amp; Moderation
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Oversee marketplace users, manage support inquiries, verify broker credentials, and inspect system audit streams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkAdminAuthAndLoad}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If NOT authenticated as Admin: Show Secure Admin Login Form */}
        {!isAdmin ? (
          <div className="max-w-md mx-auto my-16 bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center text-white mb-2">Admin Sign In Required</h2>
            <p className="text-xs text-gray-400 text-center mb-6">
              Please authenticate with administrator credentials to access platform controls.
            </p>

            {/* Display Credentials for user convenience */}
            <div className="p-3.5 mb-5 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Login Credentials:</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Email:</span>
                <span className="text-brand-300 font-mono font-semibold">admin@propertyhub.ng</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Password:</span>
                <span className="text-brand-300 font-mono font-semibold">AdminPass123!</span>
              </div>
            </div>

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
                    <span className="text-xs font-semibold text-gray-400">Live Listings</span>
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{stats.listings?.total || 0}</div>
                  <div className="text-[11px] text-blue-400 mt-1">
                    {stats.listings?.verified || 0} Title &amp; Document Verified
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400">Support Inquiries</span>
                    <Headphones className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{tickets.length}</div>
                  <div className="text-[11px] text-purple-300 mt-1">
                    {tickets.filter(t => t.status === 'PENDING').length} Pending Review
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
            <div className="flex border-b border-gray-800 mb-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  activeTab === 'users'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                User &amp; Entity Management ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'support'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>Support &amp; Contact Inquiries</span>
                {tickets.filter(t => t.status === 'PENDING').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                    {tickets.filter(t => t.status === 'PENDING').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'subscriptions'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Subscribers &amp; Quotas ({subscribers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('plans_settings')}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'plans_settings'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Plans &amp; Boost Settings ({adminPlans.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all shrink-0 ${
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
                    {['ALL', 'BUYER', 'SELLER', 'AGENT', 'DEVELOPER', 'DEALER', 'ADMIN'].map((role) => (
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
                      placeholder="Search name, email, company, city..."
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
                          <th className="py-3 px-4">Assigned Roles</th>
                          <th className="py-3 px-4">Contact &amp; Location</th>
                          <th className="py-3 px-4">Verification</th>
                          <th className="py-3 px-4">Account Access</th>
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
                              <div className="text-[10px] text-gray-500 mt-0.5">User ID: #{u.id}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {(u.roles || ['buyer']).map((r: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-950 text-brand-300 border border-brand-500/30">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-gray-300 font-medium">{u.phone_number || 'N/A'}</div>
                              <div className="text-[11px] text-gray-500">{u.city || 'Lagos'}, {u.state || 'Lagos'}</div>
                            </td>
                            <td className="py-3 px-4">
                              {u.verification_badge === 'Verified' || u.is_identity_verified ? (
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
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                                    u.verification_badge === 'Verified' || u.is_identity_verified
                                      ? 'border-gray-700 text-gray-400 hover:text-white'
                                      : 'border-emerald-600 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                                  }`}
                                >
                                  {u.verification_badge === 'Verified' || u.is_identity_verified ? 'Revoke Verify' : 'Approve Verify'}
                                </button>
                                <button
                                  onClick={() => handleToggleActive(u.id)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                                    u.is_active
                                      ? 'bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/50'
                                      : 'bg-emerald-950/40 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/50'
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

            {/* TAB 2: SUPPORT & CONTACT INQUIRIES */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                
                {/* Search & Status Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setTicketStatus(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          ticketStatus === st
                            ? 'bg-brand-600 text-white'
                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleTicketSearchSubmit} className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      placeholder="Search tickets by name, subject..."
                      className="w-full bg-[#111827] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </form>
                </div>

                {/* Tickets Grid */}
                {tickets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className={`glass-panel p-5 rounded-2xl border transition-all space-y-4 ${
                          t.status === 'PENDING'
                            ? 'border-amber-500/40 bg-amber-950/10'
                            : t.status === 'RESOLVED'
                            ? 'border-emerald-500/30 bg-emerald-950/10'
                            : 'border-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">#{t.id} {t.subject}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <span>From: <strong>{t.full_name}</strong></span>
                              <span>•</span>
                              <span>{t.email}</span>
                              {t.phone_number && (
                                <>
                                  <span>•</span>
                                  <span>{t.phone_number}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : t.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}>
                            {t.status}
                          </span>
                        </div>

                        {/* Customer Message */}
                        <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/80 text-xs text-gray-300 leading-relaxed">
                          {t.message}
                        </div>

                        {/* Admin Response Note */}
                        {t.admin_response && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                            <div className="font-bold text-[11px] text-emerald-400 mb-1">Official Admin Resolution:</div>
                            <div>{t.admin_response}</div>
                          </div>
                        )}

                        {/* Ticket Actions */}
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-800/80">
                          <span className="text-[10px] text-gray-500">
                            Category: {t.category?.replace(/_/g, ' ')}
                          </span>

                          <div className="flex items-center gap-2">
                            {t.status !== 'RESOLVED' && (
                              <button
                                onClick={() => {
                                  setSelectedTicket(t);
                                  setAdminResponseText('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all shadow-md"
                              >
                                Respond &amp; Resolve
                              </button>
                            )}
                            {t.status === 'RESOLVED' && (
                              <button
                                onClick={() => handleUpdateTicketStatus(t.id, 'IN_PROGRESS')}
                                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-all"
                              >
                                Re-open
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
                    <Headphones className="w-10 h-10 text-gray-600 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No Support Tickets Found</h3>
                    <p className="text-xs text-gray-500">Customer inquiries submitted from the Contact page will appear here.</p>
                  </div>
                )}

              </div>
            )}

            {/* TAB: SUBSCRIBERS & QUOTA ENGINE */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                
                {/* Subscription KPIs */}
                {subStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
                      <span className="text-xs text-gray-400 font-semibold">Total Revenue</span>
                      <div className="text-2xl font-extrabold text-emerald-400">
                        ₦{Number(subStats.total_revenue_ngn || 0).toLocaleString()}
                      </div>
                      <span className="text-[11px] text-gray-500">Verified platform payments</span>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
                      <span className="text-xs text-gray-400 font-semibold">Active Subscribers</span>
                      <div className="text-2xl font-extrabold text-white">
                        {subStats.active_subscribers}
                      </div>
                      <span className="text-[11px] text-brand-400">Current billing cycles</span>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
                      <span className="text-xs text-gray-400 font-semibold">Active 72h Boosts</span>
                      <div className="text-2xl font-extrabold text-rose-400 flex items-center gap-1.5">
                        <Flame className="w-5 h-5" />
                        <span>{subStats.active_boosts}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">Elevated search rankings</span>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
                      <span className="text-xs text-gray-400 font-semibold">Active Featured Ads</span>
                      <div className="text-2xl font-extrabold text-amber-400 flex items-center gap-1.5">
                        <Crown className="w-5 h-5" />
                        <span>{subStats.active_featured}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">Gold badge placements</span>
                    </div>
                  </div>
                )}

                {/* Filter and Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {['ALL', 'ACTIVE', 'EXPIRED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setSubscriberStatus(st);
                          api.getAdminSubscribers(st, subscriberSearch).then(res => setSubscribers(res.data || []));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          subscriberStatus === st
                            ? 'bg-brand-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-600/30"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Assign Plan to User</span>
                  </button>
                </div>

                {/* Subscribers Table */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800 tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">User</th>
                          <th className="py-3.5 px-4">Current Plan</th>
                          <th className="py-3.5 px-4">Listing Allowance</th>
                          <th className="py-3.5 px-4">Boost Credits</th>
                          <th className="py-3.5 px-4">Period End</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/80">
                        {subscribers.length > 0 ? (
                          subscribers.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-800/30 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white">{sub.user_name}</div>
                                <div className="text-[11px] text-gray-500">{sub.user_email} (ID #{sub.user_id})</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-white">{sub.plan_name}</span>
                                <span className="text-[10px] text-gray-500 block uppercase">{sub.tier_category}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-semibold text-white">
                                {sub.listing_allowance?.toLocaleString()} ads
                              </td>
                              <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">
                                {sub.remaining_boost_credits} left ({sub.used_boost_credits} used)
                              </td>
                              <td className="py-3.5 px-4 text-gray-400">
                                {new Date(sub.current_period_end).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  sub.status === 'ACTIVE'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-gray-800 text-gray-400'
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAssignUserId(sub.user_id);
                                      setAssignModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
                                  >
                                    Modify
                                  </button>
                                  {sub.plan_name !== 'Free Plan' && sub.status === 'ACTIVE' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeSubscription(sub.user_id)}
                                      className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold"
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500">
                              No subscribers found matching the criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: PLANS & BOOST ENGINE SETTINGS */}
            {activeTab === 'plans_settings' && (
              <div className="space-y-6">
                
                {/* System Settings Card: Boost Duration */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-400" />
                        <span>Promotional Boost Duration Configuration</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Change the promotional lifespan of each boost without altering application code.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {['24', '72', '168'].map((hrs) => (
                        <button
                          key={hrs}
                          disabled={savingSetting}
                          onClick={() => handleUpdateBoostDuration(hrs)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            boostDurationSetting === hrs
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {hrs === '24' ? '24 Hours (1 Day)' : hrs === '72' ? '72 Hours (3 Days)' : '168 Hours (7 Days)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Plans Catalogue Overview */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Seeded Subscription Catalogue ({adminPlans.length} Plans)
                    </h3>
                  </div>

                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800 sticky top-0">
                        <tr>
                          <th className="py-3 px-4">Plan Name</th>
                          <th className="py-3 px-4">Tier</th>
                          <th className="py-3 px-4">Monthly Price</th>
                          <th className="py-3 px-4">Listings Allowance</th>
                          <th className="py-3 px-4">Featured Slots</th>
                          <th className="py-3 px-4">Boost Credits</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/80">
                        {adminPlans.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-800/20">
                            <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                            <td className="py-3 px-4 text-gray-400 uppercase text-[10px]">{p.tier_category}</td>
                            <td className="py-3 px-4 font-mono font-semibold text-brand-300">
                              ₦{Number(p.price_ngn).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-mono text-white">{p.listing_allowance.toLocaleString()}</td>
                            <td className="py-3 px-4 font-mono text-amber-400">{p.featured_allowance.toLocaleString()}</td>
                            <td className="py-3 px-4 font-mono text-rose-400">{p.boost_allowance.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: ACTIVITY LOGS */}
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

        {/* Modal: Respond to Support Ticket */}
        {selectedTicket && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <div 
              className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-brand-950 text-brand-400 border border-brand-500/30">
                  Ticket #{selectedTicket.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-400">
                  Submitted by {selectedTicket.full_name} ({selectedTicket.email})
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-300">
                <span className="text-gray-500 font-medium block mb-1">User Inquiry:</span>
                {selectedTicket.message}
              </div>

              <form onSubmit={handleSendTicketResponse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Official Admin Response &amp; Resolution Notes
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={adminResponseText}
                    onChange={(e) => setAdminResponseText(e.target.value)}
                    placeholder="Enter resolution details, action taken, or direct guidance provided to the user..."
                    className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingTicket || !adminResponseText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{updatingTicket ? 'Saving...' : 'Mark as Resolved'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Manually Assign / Upgrade User Subscription */}
        {assignModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setAssignModalOpen(false)}
          >
            <div 
              className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setAssignModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Assign Subscription Plan</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Override or grant active listing, featured and boost allowances to a user account.
                </p>
              </div>

              <form onSubmit={handleAssignSubscription} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Target User ID *</label>
                  <input
                    type="number"
                    required
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter user numeric ID (e.g. 1)"
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Plan Tier *</label>
                  <select
                    value={assignPlanSlug}
                    onChange={(e) => setAssignPlanSlug(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <optgroup label="Standard Tiers">
                      <option value="free">Free Plan (1 listing, 0 featured, 0 boosts)</option>
                      <option value="explorer">Explorer (5 listings, 1 featured, 0 boosts)</option>
                      <option value="starter">Starter (10 listings, 3 featured, 1 boost)</option>
                      <option value="growth">Growth (40 listings, 10 featured, 5 boosts)</option>
                    </optgroup>
                    <optgroup label="Business Tiers">
                      <option value="business-100">Business 100 (100 listings, 20 featured, 10 boosts)</option>
                      <option value="business-250">Business 250 (250 listings, 50 featured, 25 boosts)</option>
                      <option value="business-500">Business 500 (500 listings, 100 featured, 50 boosts)</option>
                      <option value="business-1000">Business 1,000 (1,000 listings, 200 featured, 100 boosts)</option>
                      <option value="business-2500">Business 2,500 (2,500 listings, 500 featured, 250 boosts)</option>
                    </optgroup>
                    <optgroup label="Enterprise Tiers">
                      <option value="enterprise-3000">Enterprise 3,000 (3,000 listings, 600 featured, 300 boosts)</option>
                      <option value="enterprise-5000">Enterprise 5,000 (5,000 listings, 1,000 featured, 500 boosts)</option>
                      <option value="enterprise-6000">Enterprise 6,000 (6,000 listings, 1,200 featured, 600 boosts)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={assignDuration}
                    onChange={(e) => setAssignDuration(Number(e.target.value))}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Audit Notes</label>
                  <input
                    type="text"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Reason for manual assignment (e.g. Bank transfer verified offline)"
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30"
                  >
                    Confirm &amp; Assign Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
