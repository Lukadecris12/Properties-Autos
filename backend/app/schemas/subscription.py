from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SubscriptionPlanBase(BaseModel):
    slug: str
    name: str
    tier_category: str
    price_ngn: float
    listing_allowance: int
    featured_allowance: int
    boost_allowance: int
    duration_days: int = 30
    is_active: bool = True
    display_order: int = 0
    tagline: Optional[str] = None
    badge: Optional[str] = None
    features: List[str] = []

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    price_ngn: Optional[float] = None
    listing_allowance: Optional[int] = None
    featured_allowance: Optional[int] = None
    boost_allowance: Optional[int] = None
    is_active: Optional[bool] = None
    tagline: Optional[str] = None
    badge: Optional[str] = None
    features: Optional[List[str]] = None

class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BoostTransactionResponse(BaseModel):
    id: int
    listing_id: int
    listing_title: Optional[str] = None
    started_at: datetime
    expires_at: datetime
    duration_hours: int
    is_active: bool

    class Config:
        from_attributes = True


class UserSubscriptionUsageResponse(BaseModel):
    plan_id: int
    plan_slug: str
    plan_name: str
    tier_category: str
    price_ngn: float
    status: str
    current_period_start: datetime
    current_period_end: datetime
    auto_renew: bool
    
    # Listings quota
    listing_allowance: int
    active_listings_count: int
    remaining_listings: int
    excess_listings_count: int
    
    # Featured quota
    featured_allowance: int
    used_featured_count: int
    remaining_featured: int
    
    # Boost credits quota
    monthly_boost_allowance: int
    remaining_boost_credits: int
    used_boost_credits: int
    active_boosts_count: int
    
    active_boosts: List[BoostTransactionResponse] = []


class SubscribeRequest(BaseModel):
    plan_slug: str
    payment_method: str = "PAYSTACK"  # PAYSTACK, FLUTTERWAVE, BANK_TRANSFER
    auto_renew: bool = False

class PaymentVerifyRequest(BaseModel):
    reference: str
    plan_slug: str
    provider: str = "PAYSTACK"
    gateway_response: Optional[Dict[str, Any]] = None

class FeatureListingRequest(BaseModel):
    is_featured: bool

class BoostListingRequest(BaseModel):
    duration_hours: Optional[int] = None  # None uses system default (72h)

class SystemSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class AdminAssignSubscriptionRequest(BaseModel):
    user_id: int
    plan_slug: str
    duration_days: int = 30
    notes: Optional[str] = None
