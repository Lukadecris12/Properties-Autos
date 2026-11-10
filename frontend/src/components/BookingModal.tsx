'use client';

import React, { useState } from 'react';
import { Calendar, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Listing } from '@/lib/types';
import { api } from '@/lib/api';

interface BookingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ listing, isOpen, onClose, onSuccess }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !listing) return null;

  // Calculate days & totals
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const diffDays = start && end && end > start 
    ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
    : 0;

  const dailyRate = Number(listing.price);
  const subtotal = dailyRate * (diffDays || 1);
  const deposit = Number(listing.security_deposit || 0);
  const serviceFee = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + deposit + serviceFee;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || diffDays <= 0) {
      setError('Please select a valid date range (end date must be after start date).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createBooking({
        listing_id: listing.id,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        guest_notes: notes || undefined,
      });
      setConfirmed(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to request booking. Dates may be conflicting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              {listing.asset_category === 'VEHICLE' ? 'Reserve Vehicle Rental' : 'Book Short-let Stay'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{listing.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-brand-950 border border-brand-500/40 text-brand-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Booking Request Submitted!</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              The host has been notified. Availability is held while confirmation is finalized.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Date range pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  {listing.asset_category === 'VEHICLE' ? 'Pickup Date' : 'Check-in'}
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  {listing.asset_category === 'VEHICLE' ? 'Return Date' : 'Check-out'}
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., flight arrival time, chauffeur instructions..."
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Pricing Breakdown Card */}
            {diffDays > 0 && (
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>₦{dailyRate.toLocaleString()} × {diffDays} {diffDays === 1 ? 'day/night' : 'days/nights'}</span>
                  <span className="text-white font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Refundable Security Deposit</span>
                    <span className="text-white font-medium">₦{deposit.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Reservation Handling</span>
                  <span className="text-emerald-400 font-medium">Free (Pay Host Directly)</span>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-sm text-white">
                  <span>Estimated Total (Pay Offline)</span>
                  <span className="text-brand-400">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all"
              >
                {loading ? 'Processing...' : 'Confirm Reservation Request'}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Anti-double-booking verified. Reservation confirmed directly with host; pay offline upon check-in.</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
