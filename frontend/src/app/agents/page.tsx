'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  UserCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Building,
  CheckCircle,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ListingCard } from '@/components/ListingCard';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [agentListings, setAgentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'agent' | 'developer'>('all');

  useEffect(() => {
    fetchAgents();
  }, [filterRole]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const roleParam = filterRole === 'all' ? undefined : filterRole;
      const res = await api.getAgentsAndDevelopers(roleParam);
      const list = res.data || [];
      setAgents(list);
      if (list.length > 0 && !selectedAgent) {
        selectAgent(list[0]);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectAgent = async (agent: any) => {
    setSelectedAgent(agent);
    setListingsLoading(true);
    try {
      const res = await api.getListings({
        user_id: agent.id,
        page_size: 20,
      });
      setAgentListings(res.items || []);
    } catch (err) {
      console.error('Failed to load agent listings:', err);
      setAgentListings([]);
    } finally {
      setListingsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-3">
            <UserCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Verified Professionals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Property Agents & Developers Directory
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Browse verified real estate agents and property developers. Click on any professional to inspect their full inventory of properties and listings.
          </p>

          {/* Role Filter Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: 'all', label: 'All Professionals' },
              { id: 'agent', label: 'Property Agents' },
              { id: 'developer', label: 'Property Developers & Companies' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterRole(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterRole === tab.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: List of Agents / Developers */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Verified Partners ({agents.length})
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 text-center text-xs text-gray-400">
                No verified agents found in this category.
              </div>
            ) : (
              agents.map((ag) => {
                const isSelected = selectedAgent?.id === ag.id;
                const displayName = ag.company_name || `${ag.first_name || ''} ${ag.last_name || ''}`.trim() || 'Verified Partner';
                const initial = (ag.company_name || ag.first_name || 'P')[0]?.toUpperCase();
                return (
                  <div
                    key={ag.id}
                    onClick={() => selectAgent(ag)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-950/60 border-brand-500/60 shadow-lg shadow-brand-500/10'
                        : 'bg-gray-900/80 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-800 flex items-center justify-center font-bold text-white text-base shrink-0 shadow-md">
                          {initial}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white">
                              {displayName}
                            </h3>
                            {ag.is_identity_verified && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-brand-400 font-medium capitalize">
                            {ag.verification_badge || ag.active_mode}
                          </p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span>{ag.city ? `${ag.city}, ` : ''}{ag.state || 'Nigeria'}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400'
                      }`}>
                        View
                      </span>
                    </div>

                    {ag.bio && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-2.5 pt-2 border-t border-gray-800/80">
                        {ag.bio}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Agent Inventory */}
          <div className="lg:col-span-7">
            {selectedAgent ? (
              <div className="space-y-6">
                
                {/* Agent Detail Profile Box */}
                {(() => {
                  const agentTitle = selectedAgent.company_name || `${selectedAgent.first_name || ''} ${selectedAgent.last_name || ''}`.trim() || 'Verified Partner';
                  const initial = (selectedAgent.company_name || selectedAgent.first_name || 'P')[0]?.toUpperCase();
                  const phone = selectedAgent.phone_number || '+234 803 123 4567';
                  const cleanPhone = phone.replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : (cleanPhone || '2348031234567');
                  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${agentTitle}, I am viewing your storefront on Properties & Autos and would like to inquire about your available listings.`)}`;

                  return (
                    <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-brand-500/20">
                            {initial}
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                              {agentTitle}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                {selectedAgent.verification_badge || 'Verified'}
                              </span>
                            </h2>
                            <p className="text-xs text-gray-400 capitalize">{selectedAgent.active_mode || 'Accredited Partner'}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/* WhatsApp 1-Click Connect */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                            </svg>
                            <span>WhatsApp</span>
                          </a>

                          {/* Direct Phone Call */}
                          {selectedAgent.phone_number && (
                            <a
                              href={`tel:${selectedAgent.phone_number}`}
                              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 flex items-center gap-1.5 transition-all"
                            >
                              <Phone className="w-3.5 h-3.5 text-brand-400" />
                              <span>Call</span>
                            </a>
                          )}

                          {/* In-App Messages */}
                          <Link
                            href="/messages"
                            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-brand-600/20"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Message</span>
                          </Link>
                        </div>
                      </div>

                      {selectedAgent.bio && (
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {selectedAgent.bio}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Agent Properties Title */}
                <div className="flex items-center justify-between pt-2">
                  <h3 className="text-base font-bold text-white">
                    Listings by {selectedAgent.company_name || `${selectedAgent.first_name || ''} ${selectedAgent.last_name || ''}`.trim()} ({agentListings.length})
                  </h3>
                  <span className="text-xs text-gray-500">Live Portfolio</span>
                </div>

                {/* Listings Grid */}
                {listingsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-64 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
                    ))}
                  </div>
                ) : agentListings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 text-center text-xs text-gray-400">
                    This professional has no active public listings currently.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {agentListings.map((item) => (
                      <ListingCard key={item.id} listing={item} />
                    ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400">
                Select a property agent or developer on the left to view their profile and live properties.
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
