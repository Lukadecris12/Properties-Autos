'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck, 
  HelpCircle,
  ArrowRight,
  Headphones,
  UserCheck
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';

export default function ContactSupportPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('GENERAL_INQUIRY');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await api.getMe();
        if (me && me.data) {
          setCurrentUser(me.data);
          return;
        }
      } catch (_) {
        const cached = localStorage.getItem('propertyhub_user');
        if (cached) {
          try {
            setCurrentUser(JSON.parse(cached));
          } catch (_) {}
        }
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser && (!fullName.trim() || !email.trim())) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please provide a subject and message details.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        category,
        subject: subject.trim(),
        message: message.trim(),
      };

      if (currentUser) {
        const derivedName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.company_name || currentUser.email;
        payload.full_name = derivedName;
        payload.email = currentUser.email;
        if (currentUser.phone_number) payload.phone_number = currentUser.phone_number;
      } else {
        payload.full_name = fullName.trim();
        payload.email = email.trim();
        if (phone.trim()) payload.phone_number = phone.trim();
      }

      const res = await api.submitSupportTicket(payload);

      setSuccessTicket(res.data);
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit support ticket. Please try again or message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-4">
            <Headphones className="w-3.5 h-3.5 text-brand-400" />
            <span>24/7 Corporate Client Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Contact & Support
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed">
            Have questions about a property or vehicle listing, statutory title inspections, or platform subscriptions? 
            Our dedicated client relations and legal verification desk is here to assist.
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Direct Phone Hotline */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-950/80 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Telephone Hotline</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Speak directly with our client concierge and support coordinators.
            </p>
            <div className="pt-2">
              <a href="tel:+2348031234567" className="text-sm font-bold text-brand-400 hover:underline block">
                +234 803 123 4567
              </a>
              <span className="text-[11px] text-gray-500 block mt-0.5">Mon - Fri: 8:00 AM - 6:00 PM WAT</span>
            </div>
          </div>

          {/* Card 2: WhatsApp Concierge */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">WhatsApp Priority Desk</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fast-track responses for property viewings, inspections, and corporate inquiries.
            </p>
            <div className="pt-2">
              <a 
                href="https://wa.me/2348031234567?text=Hello%20Properties%20%26%20Autos%20Support,%20I%20need%20assistance%20with%20a%20listing." 
                target="_blank" 
                rel="noreferrer"
                className="text-sm font-bold text-emerald-400 hover:underline inline-flex items-center gap-1.5"
              >
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <span className="text-[11px] text-gray-500 block mt-0.5">Average reply time: Under 15 mins</span>
            </div>
          </div>

          {/* Card 3: Corporate Headquarters */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Physical Headquarters</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Visit our corporate office for statutory due diligence and offline execution.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-200 block">
                Plot 14, Admiralty Way, Lekki Phase 1
              </span>
              <span className="text-[11px] text-gray-400 block mt-0.5">Lagos State, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Main Support Form & Advisory Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-400" />
                  <span>Send a Support Ticket to Admin</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Fill in the details below. Your ticket is dispatched directly to the Admin Dashboard for review and prompt response.
                </p>
              </div>

              {/* Success Notification */}
              {successTicket && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Ticket #{successTicket.id} Submitted Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Our compliance and customer relations officers have received your inquiry. We will contact you at <strong>{successTicket.email}</strong> shortly.
                  </p>
                </div>
              )}

              {/* Error Notification */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Authenticated user profile auto-link badge */}
                {currentUser ? (
                  <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-sm">
                        {(currentUser.first_name || currentUser.company_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {currentUser.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}` : (currentUser.company_name || 'Valued User')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                            Signed In
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {currentUser.email} {currentUser.phone_number ? `• ${currentUser.phone_number}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-brand-400 hidden sm:inline-block">Profile auto-linked</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Babatunde Johnson"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-xs outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-xs outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Phone Number (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-xs outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Inquiry Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-xs outline-none transition-all"
                  >
                    <option value="GENERAL_INQUIRY">General Inquiry</option>
                    <option value="LISTING_ASSISTANCE">Listing & Publishing Assistance</option>
                    <option value="TITLE_DOCUMENTATION">Title Verification & Legal Due Diligence</option>
                    <option value="SUBSCRIPTION_MEMBERSHIP">Subscriptions & Corporate Plans</option>
                    <option value="TECHNICAL_SUPPORT">Technical & Account Support</option>
                    <option value="PARTNERSHIP">Developer & Dealership Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your inquiry"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-xs outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Message Details <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please provide full details, reference numbers, or asset queries..."
                    className="w-full p-3.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-xs outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Ticket...' : 'Dispatch Ticket to Support Desk'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Right Column: FAQ & Security Notice (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Verification & Offline Safety Policy</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Properties & Autos operates strictly as an asset listing and discovery directory. 
                All payments, statutory documentation signing, and legal title conveyancing must be conducted directly and offline at the developer or dealership registered corporate premises.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <HelpCircle className="w-5 h-5 text-gold-400" />
                  <span>Frequently Asked Questions</span>
                </div>
                <Link 
                  href="/faq" 
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                  <div className="font-bold text-white">How do I verify a seller or agent?</div>
                  <div className="text-gray-400">All certified partners display a green "Verified" badge indicating submitted CAC corporate registration or valid national ID documents.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                  <div className="font-bold text-white">Are listings free to post?</div>
                  <div className="text-gray-400">Users can publish starter listings for free. High-volume agents and corporate developers can upgrade to Pro plans.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                  <div className="font-bold text-white">How long does support take to reply?</div>
                  <div className="text-gray-400">All support tickets submitted via this form are responded to within 2 to 4 business hours.</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/faq"
                  className="w-full py-3 px-4 rounded-2xl bg-gray-900 hover:bg-gray-850 border border-gray-700/60 text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Browse Full FAQ Knowledgebase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
