from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    JSON, Text, ForeignKey, Enum as SQLEnum, Numeric
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import (
    TransactionType, AssetCategory, ListingStatus, 
    RentalPeriod, LocationPrivacy
)

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Core Classification (Strictly Enforced)
    transaction_type = Column(SQLEnum(TransactionType), index=True, nullable=False)
    asset_category = Column(SQLEnum(AssetCategory), index=True, nullable=False)
    status = Column(SQLEnum(ListingStatus), default=ListingStatus.DRAFT, index=True, nullable=False)
    
    title = Column(String(255), index=True, nullable=False)
    slug = Column(String(300), unique=True, index=True, nullable=True)
    description = Column(Text, nullable=False)

    # Pricing details
    price = Column(Numeric(14, 2), nullable=False)  # Base sale price or rental rate
    currency = Column(String(10), default="NGN", nullable=False)
    is_negotiable = Column(Boolean, default=False)
    
    # Rental / Lease Specifics (Required for RENT & LEASE, Null for SALE)
    rental_period = Column(SQLEnum(RentalPeriod), nullable=True)
    security_deposit = Column(Numeric(14, 2), nullable=True)
    agency_fee = Column(Numeric(14, 2), nullable=True)
    legal_fee = Column(Numeric(14, 2), nullable=True)
    service_charge = Column(Numeric(14, 2), nullable=True)
    min_rental_duration = Column(Integer, nullable=True)  # e.g., minimum nights or months
    max_rental_duration = Column(Integer, nullable=True)
    
    # Geographic Location
    country = Column(String(100), default="Nigeria", index=True, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    neighbourhood = Column(String(150), index=True, nullable=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_privacy = Column(SQLEnum(LocationPrivacy), default=LocationPrivacy.EXACT)

    # Category Specific Attributes stored as strongly-typed JSON schemas
    # For LAND: land_size, land_unit, permitted_use, topography, road_access, utilities, title_document (C of O, Deed, Survey)
    # For RESIDENTIAL: property_type, bedrooms, bathrooms, toilets, parking_spaces, building_size, furnishing, condition, amenities
    # For COMMERCIAL: commercial_type, floor_area, total_floors, intended_use, facilities
    # For VEHICLE: vehicle_type, brand, model, year, mileage, transmission, fuel_type, condition, self_drive/chauffeur, pickup_options
    attributes = Column(JSON, default=dict)
    
    # Media
    images = Column(JSON, default=list)  # list of URLs [{"url": "...", "caption": "...", "is_cover": True}]
    videos = Column(JSON, default=list)  # list of video URLs
    virtual_tour_url = Column(String(500), nullable=True)
    
    # Verification & Highlights
    is_featured = Column(Boolean, default=False)
    is_verified_asset = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    
    # Dates
    available_from = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    published_at = Column(DateTime, nullable=True)

    # Relationships
    owner = relationship("User", back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="listing", cascade="all, delete-orphan")
    availabilities = relationship("ListingAvailability", back_populates="listing", cascade="all, delete-orphan")

class ListingAvailability(Base):
    __tablename__ = "listing_availabilities"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="BLOCKED")  # BLOCKED, BOOKED, MAINTENANCE
    notes = Column(String(255), nullable=True)

    listing = relationship("Listing", back_populates="availabilities")
