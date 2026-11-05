import { Listing, Requirement, AIMatch, User, Booking, TransactionType, AssetCategory } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('propertyhub_token');
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
      }
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  async getListings(params: {
    transaction_type?: TransactionType;
    asset_category?: AssetCategory;
    state?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    is_featured?: boolean;
    page?: number;
    page_size?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.transaction_type) query.append('transaction_type', params.transaction_type);
    if (params.asset_category) query.append('asset_category', params.asset_category);
    if (params.state) query.append('state', params.state);
    if (params.city) query.append('city', params.city);
    if (params.min_price) query.append('min_price', params.min_price.toString());
    if (params.max_price) query.append('max_price', params.max_price.toString());
    if (params.is_featured !== undefined) query.append('is_featured', String(params.is_featured));
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    const res = await fetch(`${API_BASE_URL}/listings/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch listings');
    return res.json();
  }

  async getListingById(id: number) {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch listing detail');
    return res.json();
  }

  async naturalLanguageSearch(query: string) {
    const res = await fetch(`${API_BASE_URL}/search/natural-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('NLP Search failed');
    return res.json();
  }

  async createRequirement(data: Partial<Requirement>) {
    const res = await fetch(`${API_BASE_URL}/requirements/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create requirement');
    return res.json();
  }

  async getMyMatches(): Promise<{ data: AIMatch[] }> {
    const res = await fetch(`${API_BASE_URL}/matching/my-matches`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  }

  async getListingMatches(listingId: number): Promise<{ data: AIMatch[] }> {
    const res = await fetch(`${API_BASE_URL}/matching/listing-matches/${listingId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch listing matches');
    return res.json();
  }

  async createBooking(data: {
    listing_id: number;
    start_date: string;
    end_date: string;
    guest_notes?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Booking failed');
    }
    return res.json();
  }

  async chatWithAI(message: string) {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('AI query failed');
    return res.json();
  }

  async login(formData: FormData) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  }

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  }

  async switchMode(mode: string) {
    const res = await fetch(`${API_BASE_URL}/auth/switch-mode`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error('Failed to switch mode');
    return res.json();
  }
}

export const api = new ApiClient();
