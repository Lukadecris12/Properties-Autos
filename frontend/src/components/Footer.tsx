'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, Globe, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/80 pt-16 pb-12 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center whitespace-nowrap leading-none">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Properties
                </span>
                <span className="text-xl font-extrabold tracking-tight text-brand-400 ml-1.5">
                  &amp;&nbsp;Autos
                </span>
              </div>
            </Link>
            
            <p className="text-gray-400 leading-relaxed max-w-sm">
              The premier global digital marketplace for properties and automobiles. 
              Connecting buyers, tenants, renters, landlords, sellers, and dealers with AI-powered matching and verified discovery.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-[11px] text-gray-300">
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Default: Nigeria (NGN)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-[11px] text-gray-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>NDPA / GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Quick Links: Properties */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Properties</h4>
            <ul className="space-y-2">
              <li><Link href="/?tx=SALE&cat=LAND" className="hover:text-white transition-colors">Land for Sale</Link></li>
              <li><Link href="/?tx=SALE&cat=RESIDENTIAL" className="hover:text-white transition-colors">Houses for Sale</Link></li>
              <li><Link href="/?tx=RENT&cat=RESIDENTIAL" className="hover:text-white transition-colors">Apartments for Rent</Link></li>
              <li><Link href="/?tx=RENT&cat=RESIDENTIAL&type=short_let" className="hover:text-white transition-colors">Serviced Short-lets</Link></li>
              <li><Link href="/?tx=LEASE&cat=COMMERCIAL" className="hover:text-white transition-colors">Commercial & Warehouses</Link></li>
            </ul>
          </div>

          {/* Quick Links: Automobiles */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Automobiles</h4>
            <ul className="space-y-2">
              <li><Link href="/?tx=SALE&cat=VEHICLE" className="hover:text-white transition-colors">Cars for Sale</Link></li>
              <li><Link href="/?tx=RENT&cat=VEHICLE" className="hover:text-white transition-colors">Car Rentals (Daily & Weekly)</Link></li>
              <li><Link href="/?tx=RENT&cat=VEHICLE&service=chauffeur" className="hover:text-white transition-colors">Chauffeur-Driven Luxury</Link></li>
              <li><Link href="/requirements/new" className="hover:text-white transition-colors">Post Vehicle Requirement</Link></li>
              <li><Link href="/listings/new" className="hover:text-white transition-colors">Register as Auto Dealer</Link></li>
            </ul>
          </div>

          {/* Trust, Safety & Compliance */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Trust & Safety</h4>
            <ul className="space-y-2">
              <li><Link href="/verification" className="hover:text-white transition-colors">Identity Verification</Link></li>
              <li><Link href="/verification" className="hover:text-white transition-colors">Business Verification</Link></li>
              <li><Link href="/verification" className="hover:text-white transition-colors">Title Document Reviews</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Anti-Fraud Protection</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy & Data Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Legal Notice */}
        <div className="pt-8 border-t border-gray-900 text-[11px] text-gray-500 space-y-2">
          <p>
            Regulatory Notice: PropertyHub is a technology marketplace platform connecting verified asset owners, landlords, agents, dealers, and seekers. Automated document extraction or AI compatibility scoring does not constitute legal title guarantee or statutory ownership transfer. All property transactions should be finalized with authoritative land registry searches and accredited legal representation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p>© {new Date().getFullYear()} PropertyHub Technologies Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
              <Link href="/security" className="hover:text-gray-400">Security Disclosures</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
