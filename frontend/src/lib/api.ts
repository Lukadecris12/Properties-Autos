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
    user_id?: number;
    subtype?: string;
    brand?: string;
    model?: string;
    condition?: string;
    year?: number;
    bedrooms?: number;
    keyword?: string;
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
    if (params.user_id !== undefined) query.append('user_id', params.user_id.toString());
    if (params.subtype) query.append('subtype', params.subtype);
    if (params.brand) query.append('brand', params.brand);
    if (params.model) query.append('model', params.model);
    if (params.condition) query.append('condition', params.condition);
    if (params.year) query.append('year', params.year.toString());
    if (params.bedrooms) query.append('bedrooms', params.bedrooms.toString());
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    const queryString = query.toString();
    const url = queryString ? `${API_BASE_URL}/listings?${queryString}` : `${API_BASE_URL}/listings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch listings');
    return res.json();
  }

  async getListingById(id: number) {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch listing detail');
    return res.json();
  }

  async createListing(data: any) {
    const res = await fetch(`${API_BASE_URL}/listings/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errMsg = await this.parseErrorResponse(res, 'Failed to create listing');
      throw new Error(errMsg);
    }
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

  private async parseErrorResponse(res: Response, defaultMessage: string): Promise<string> {
    try {
      const err = await res.json();
      return err.detail || err.message || defaultMessage;
    } catch (_) {
      try {
        const text = await res.text();
        if (text && !text.includes('<!DOCTYPE') && !text.includes('Internal Server Error')) {
          return text;
        }
      } catch (_) {}
      return defaultMessage;
    }
  }

  async login(formData: FormData) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const msg = await this.parseErrorResponse(res, 'Invalid email or password. Please verify your credentials.');
      throw new Error(msg);
    }
    return res.json();
  }

  async register(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = await this.parseErrorResponse(res, 'Registration failed. Please check your details.');
      throw new Error(msg);
    }
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

  async getAgentsAndDevelopers(role?: string) {
    const query = role ? `?role=${role}` : '';
    const res = await fetch(`${API_BASE_URL}/auth/agents-developers${query}`);
    if (!res.ok) throw new Error('Failed to fetch agents and developers');
    return res.json();
  }

  // --- Onboarding & OTP ---
  async signupInitiate(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/signup-initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const msg = await this.parseErrorResponse(res, 'Failed to initiate signup. Please check your connection.');
      throw new Error(msg);
    }
    return res.json();
  }

  async signupVerifyOtp(email: string, otp_code: string) {
    const res = await fetch(`${API_BASE_URL}/auth/signup-verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp_code }),
    });
    if (!res.ok) {
      const msg = await this.parseErrorResponse(res, 'Invalid or expired verification code.');
      throw new Error(msg);
    }
    return res.json();
  }

  async resendOtp(email: string) {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const msg = await this.parseErrorResponse(res, 'Failed to resend code.');
      throw new Error(msg);
    }
    return res.json();
  }

  async onboardingComplete(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/onboarding-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = await this.parseErrorResponse(res, 'Failed to complete onboarding. Please check all required fields.');
      throw new Error(msg);
    }
    return res.json();
  }

  // --- Property Investments ---
  async getInvestments(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE_URL}/investments/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch investments');
    return res.json();
  }

  async getInvestmentDetail(id: number) {
    const res = await fetch(`${API_BASE_URL}/investments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch investment details');
    return res.json();
  }

  async investInProperty(id: number, amount: number) {
    const res = await fetch(`${API_BASE_URL}/investments/${id}/invest`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Investment processing failed');
    }
    return res.json();
  }

  async getMyInvestments() {
    const res = await fetch(`${API_BASE_URL}/investments/user/my-investments`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch active investments');
    return res.json();
  }

  // --- Admin Console ---
  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats. Ensure admin privileges.');
    return res.json();
  }

  async getAdminUsers(role?: string, search?: string) {
    const params = new URLSearchParams();
    if (role && role !== 'ALL') params.append('role', role);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  async toggleUserVerify(userId: number) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-verify`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle user verification');
    return res.json();
  }

  async toggleUserActive(userId: number) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-active`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle user active status');
    return res.json();
  }

  async getAdminActivityLogs() {
    const res = await fetch(`${API_BASE_URL}/admin/activity-logs`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  }

  // --- Direct In-App Messaging ---
  async sendMessage(data: { conversation_id?: number; recipient_id?: number; listing_id?: number; content: string }) {
    const res = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to send message');
    }
    return res.json();
  }

  async getMyConversations() {
    const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  }

  async getConversationMessages(conversationId: number) {
    const res = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  }

  // --- Media & File Uploads ---
  async uploadMedia(files: File[]): Promise<{ images: Array<{ url: string; filename: string; original_name: string; size: number }>; message: string }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errMsg = await this.parseErrorResponse(res, 'Failed to upload image(s)');
      throw new Error(errMsg);
    }
    return res.json();
  }
}

export const api = new ApiClient();
