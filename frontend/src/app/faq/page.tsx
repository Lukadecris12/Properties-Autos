'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Home, 
  Car, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  Headphones
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // General & Safety
  {
    category: 'Safety & Verification',
    question: 'How does Properties & Autos ensure safety and prevent real estate fraud?',
    answer: 'Properties & Autos operates strictly as an asset discovery and advertising directory. We enforce physical offline conveyancing: all funds transfer, statutory document signing, and deed exchanges must happen directly at the verified developer or dealership corporate offices. Never transfer funds online without prior physical inspection and statutory due diligence.'
  },
  {
    category: 'Safety & Verification',
    question: 'How do I identify a certified Agent or Corporate Developer?',
    answer: 'Certified partners feature an official green "Verified Agent" or gold "Enterprise Developer" trust badge. These badges indicate that corporate CAC registrations, statutory licenses, and identity credentials have been vetted by our administration.'
  },
  {
    category: 'Safety & Verification',
    question: 'Can I pay for a property or vehicle directly through the app or website?',
    answer: 'No. To protect all parties and comply with financial trade regulations, our platform has zero in-app card gateways or digital escrow wallets. All monetary settlements must be executed offline directly between the transacting parties after satisfactory legal inspection.'
  },

  // Listing Properties & Autos
  {
    category: 'Listing & Publishing',
    question: 'Is it free to list properties and vehicles on Properties & Autos?',
    answer: 'Yes! Every registered member can list up to 2 active properties or autos for free on our Starter Member tier. Professional brokers, high-volume dealerships, and corporate estate builders can subscribe to our Pro or Enterprise plans for higher listing volumes and featured placement.'
  },
  {
    category: 'Listing & Publishing',
    question: 'How many images can I upload per listing?',
    answer: 'You can upload up to 5 high-resolution photos per listing or supply direct image URLs. Images are automatically framed and rendered to fit every screen seamlessly without distortion.'
  },
  {
    category: 'Listing & Publishing',
    question: 'How soon does my listing appear on the marketplace?',
    answer: 'All eligible listings published by registered users are automatically displayed on the Landing Page and Marketplace search immediately upon publication.'
  },

  // Subscriptions & Plans
  {
    category: 'Plans & Subscriptions',
    question: 'What subscription plans are available for agents and corporate builders?',
    answer: 'We provide four distinct membership tiers: Starter Member (Free), Verified Agent Pro (₦25,000/mo or ₦250,000/yr), Corporate Developer & Dealer (₦85,000/mo or ₦850,000/yr), and HNI VIP Concierge (₦250,000/mo or ₦2,500,000/yr). Each tier includes elevated listing capacity and dedicated directory placement.'
  },
  {
    category: 'Plans & Subscriptions',
    question: 'How do I pay for my subscription plan?',
    answer: 'When you select an upgraded membership tier, the platform generates a formal corporate pro-forma invoice detailing our designated corporate bank accounts. Upon direct transfer and receipt notification, our administrative desk verifies the remittance and upgrades your account credentials immediately.'
  },

  // Inspections & Contact
  {
    category: 'Inspections & Support',
    question: 'How do I arrange a physical inspection of a property or vehicle?',
    answer: 'Every listing card and detail page features direct contact buttons to Call or Chat via WhatsApp with the listing owner, agent, or dealership. You can agree on inspection timing directly with the authorized representative.'
  },
  {
    category: 'Inspections & Support',
    question: 'How do I contact customer support if I have an issue?',
    answer: 'You can visit our Contact & Support page to submit a direct ticket into the Admin Dashboard. Our client desk responds to support inquiries within 2 to 4 business hours. You may also contact our WhatsApp desk for fast-track questions.'
  },

  // Legal & Documents
  {
    category: 'Legal & Title Documents',
    question: 'What land titles are standard for Nigerian real estate listings?',
    answer: 'Common statutory documents displayed on listings include Certificate of Occupancy (C of O), Governor\'s Consent, Gazette, Court Judgment, and Registered Survey. We strongly advise engaging a certified legal practitioner to conduct a search at the state Land Registry prior to finalizing any land or property purchase.'
  },
  {
    category: 'Legal & Title Documents',
    question: 'What papers should I verify before purchasing an imported vehicle?',
    answer: 'Verify the vehicle VIN, Nigeria Customs Duty documentation, statutory registration papers, and original proof of ownership. Ensure the engine and chassis numbers correspond exactly with the customs papers.'
  }
];

const CATEGORIES = [
  'All Categories',
  'Safety & Verification',
  'Listing & Publishing',
  'Plans & Subscriptions',
  'Inspections & Support',
  'Legal & Title Documents'
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]); // first two open by default

  const toggleIndex = (idx: number) => {
    setOpenIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const filteredFAQs = FAQ_DATA.filter(item => {
    const matchCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchSearch = searchQuery.trim() === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
            <span>Help Center & Knowledgebase</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed">
            Find answers to common questions about properties & autos listings, statutory verification, membership tiers, and offline transaction policies.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, e.g. 'verification', 'inspection', 'c of o'..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-xs sm:text-sm outline-none transition-all shadow-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar justify-start sm:justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 mb-16">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, idx) => {
              const isOpen = openIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl border border-gray-800 overflow-hidden transition-colors hover:border-gray-700"
                >
                  <button
                    type="button"
                    onClick={() => toggleIndex(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                        {faq.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`p-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-400 border-brand-500/40' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-gray-800/60 bg-black/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center rounded-2xl glass-panel border border-gray-800">
              <HelpCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No questions matched your search</h3>
              <p className="text-xs text-gray-400 mt-1">Try another keyword or select "All Categories".</p>
            </div>
          )}
        </div>

        {/* Still have questions CTA card */}
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-950/80 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
            <Headphones className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Still have unanswered questions?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Our corporate support desk and verified legal consultants are ready to answer your specific property and auto questions directly.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>Submit Support Ticket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="https://wa.me/2348031234567?text=Hello%20Properties%20%26%20Autos%20Support,%20I%20have%20a%20question."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>Chat on WhatsApp Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
