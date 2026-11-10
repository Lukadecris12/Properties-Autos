export type TransactionType = 'SALE' | 'RENT' | 'LEASE';
export type AssetCategory = 'LAND' | 'RESIDENTIAL' | 'COMMERCIAL' | 'VEHICLE';
export type RentalPeriod = 'per_night' | 'per_day' | 'per_week' | 'per_month' | 'per_year';
export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'SOLD' | 'RENTED' | 'LEASED' | 'UNAVAILABLE';
export type RequirementStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FULFILLED' | 'EXPIRED';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar_url?: string;
  country: string;
  state?: string;
  city?: string;
  address?: string;
  roles: string[];
  active_mode: string;
  is_identity_verified: boolean;
  is_business_verified: boolean;
  verification_badge: string;
}

export interface OwnerContact {
  id: number;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone_number?: string;
  country_code?: string;
  avatar_url?: string;
  logo_url?: string;
  verification_badge?: string;
  active_mode?: string;
}

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  slug?: string;
  description: string;
  transaction_type: TransactionType;
  asset_category: AssetCategory;
  price: number;
  currency: string;
  is_negotiable: boolean;
  rental_period?: RentalPeriod;
  security_deposit?: number;
  agency_fee?: number;
  legal_fee?: number;
  service_charge?: number;
  country: string;
  state: string;
  city: string;
  neighbourhood?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  attributes: Record<string, any>;
  images: Array<{ url: string; caption?: string; is_cover?: boolean }>;
  videos: string[];
  virtual_tour_url?: string;
  is_featured: boolean;
  is_boosted?: boolean;
  boosted_until?: string | null;
  featured_at?: string | null;
  is_verified_asset: boolean;
  view_count: number;
  published_at?: string;
  owner?: OwnerContact;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  listing_id?: number;
  participant_1_id: number;
  participant_2_id: number;
  subject?: string;
  last_message_at: string;
  created_at: string;
  messages: ChatMessage[];
  participant_1?: OwnerContact;
  participant_2?: OwnerContact;
  listing?: {
    id: number;
    title: string;
    price?: number;
    currency?: string;
    city?: string;
    images?: Array<{ url: string }>;
  };
}

export interface Requirement {
  id: number;
  user_id: number;
  transaction_type: TransactionType;
  asset_category: AssetCategory;
  title: string;
  description?: string;
  min_budget?: number;
  max_budget: number;
  currency: string;
  rental_period?: RentalPeriod;
  preferred_country: string;
  preferred_state: string;
  preferred_city: string;
  preferred_neighbourhoods: string[];
  criteria: Record<string, any>;
  status: RequirementStatus;
  created_at: string;
}

export interface AIMatch {
  id: number;
  requirement_id: number;
  listing_id: number;
  compatibility_score: number;
  score_breakdown: {
    budget_score?: number;
    location_score?: number;
    specs_score?: number;
    timing_score?: number;
  };
  explanation: string;
  is_viewed: boolean;
  is_contacted: boolean;
  listing?: Listing;
  requirement?: Requirement;
}

export interface Booking {
  id: number;
  listing_id: number;
  renter_id: number;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_days: number;
  subtotal: number;
  security_deposit: number;
  total_amount: number;
  currency: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  guest_notes?: string;
  listing?: Listing;
}
