from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    JSON, Text, ForeignKey, Enum as SQLEnum, Numeric
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import (
    TransactionType, AssetCategory, RequirementStatus, RentalPeriod
)

class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Core Classification (Strictly Enforced)
    transaction_type = Column(SQLEnum(TransactionType), index=True, nullable=False)
    asset_category = Column(SQLEnum(AssetCategory), index=True, nullable=False)
    status = Column(SQLEnum(RequirementStatus), default=RequirementStatus.ACTIVE, index=True, nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Budget Range
    min_budget = Column(Numeric(14, 2), nullable=True)
    max_budget = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), default="NGN", nullable=False)
    
    # Rental / Lease Specifics
    rental_period = Column(SQLEnum(RentalPeriod), nullable=True)
    desired_duration = Column(Integer, nullable=True)  # number of nights/months
    move_in_date = Column(DateTime, nullable=True)

    # Preferred Geography
    preferred_country = Column(String(100), default="Nigeria")
    preferred_state = Column(String(100), index=True, nullable=False)
    preferred_city = Column(String(100), index=True, nullable=False)
    preferred_neighbourhoods = Column(JSON, default=list)  # ["Lekki Phase 1", "Ikoyi", "Victoria Island"]
    max_distance_km = Column(Float, default=20.0)

    # Specific Criteria / Filters
    # For LAND: min_size, max_size, unit, preferred_titles, road_access
    # For RESIDENTIAL: property_types, min_bedrooms, min_bathrooms, furnishing, amenities
    # For COMMERCIAL: commercial_types, min_floor_area, facilities
    # For VEHICLE: vehicle_types, brands, models, min_year, max_mileage, transmission, fuel_type, rental_service_type
    criteria = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="requirements")
    matches = relationship("AIMatch", back_populates="requirement", cascade="all, delete-orphan")

class AIMatch(Base):
    __tablename__ = "ai_matches"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    
    compatibility_score = Column(Float, nullable=False)  # 0 to 100
    
    # Score breakdown: {"budget_score": 95, "location_score": 100, "specs_score": 90, "timing_score": 85}
    score_breakdown = Column(JSON, default=dict)
    
    # Natural language AI explanation of the match
    explanation = Column(Text, nullable=False)
    
    is_viewed = Column(Boolean, default=False)
    is_contacted = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    requirement = relationship("Requirement", back_populates="matches")
    listing = relationship("Listing")
