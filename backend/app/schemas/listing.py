from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, model_validator
from decimal import Decimal

from app.models.enums import (
    TransactionType, AssetCategory, ListingStatus, 
    RentalPeriod, LocationPrivacy
)

class ListingBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    transaction_type: TransactionType
    asset_category: AssetCategory
    
    price: Decimal = Field(..., gt=0)
    currency: str = "NGN"
    is_negotiable: bool = False
    
    # Rental & Lease fields
    rental_period: Optional[RentalPeriod] = None
    security_deposit: Optional[Decimal] = None
    agency_fee: Optional[Decimal] = None
    legal_fee: Optional[Decimal] = None
    service_charge: Optional[Decimal] = None
    min_rental_duration: Optional[int] = None
    max_rental_duration: Optional[int] = None
    
    # Geography
    country: str = "Nigeria"
    state: str
    city: str
    neighbourhood: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_privacy: LocationPrivacy = LocationPrivacy.EXACT
    
    # Category Attributes
    attributes: Dict[str, Any] = Field(default_factory=dict)
    
    # Media
    images: List[Dict[str, Any]] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)
    virtual_tour_url: Optional[str] = None
    
    available_from: Optional[datetime] = None

    @model_validator(mode='after')
    def validate_transaction_pricing(self):
        # Rental and Lease MUST have a rental_period specified
        if self.transaction_type in [TransactionType.RENT, TransactionType.LEASE]:
            if not self.rental_period:
                raise ValueError("Rental period (e.g. per_night, per_day, per_month, per_year) is required for RENT and LEASE transactions.")
        elif self.transaction_type == TransactionType.SALE:
            # Sales do not have a periodic rental unit
            if self.rental_period is not None:
                raise ValueError("Sale listings cannot specify a recurring rental period.")
        return self

class ListingCreate(ListingBase):
    status: Optional[ListingStatus] = ListingStatus.PUBLISHED

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    is_negotiable: Optional[bool] = None
    rental_period: Optional[RentalPeriod] = None
    status: Optional[ListingStatus] = None
    neighbourhood: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    attributes: Optional[Dict[str, Any]] = None
    images: Optional[List[Dict[str, Any]]] = None
    videos: Optional[List[str]] = None
    available_from: Optional[datetime] = None

class ListingResponse(ListingBase):
    id: int
    user_id: int
    slug: Optional[str]
    status: ListingStatus
    is_featured: bool
    is_verified_asset: bool
    view_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

    class Config:
        from_attributes = True

class AvailabilityCreate(BaseModel):
    listing_id: int
    start_date: datetime
    end_date: datetime
    status: str = "BLOCKED"
    notes: Optional[str] = None

class AvailabilityResponse(BaseModel):
    id: int
    listing_id: int
    start_date: datetime
    end_date: datetime
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True
