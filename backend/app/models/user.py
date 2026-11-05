from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import UserRole, VerificationStatus

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Geography
    country = Column(String(100), default="Nigeria")
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    
    # Unified role support: list of allowed roles e.g. ["buyer", "landlord", "seller"]
    roles = Column(JSON, default=lambda: ["buyer", "tenant", "renter"])
    active_mode = Column(String(50), default="buyer")  # Active UX mode: buyer, seller, agent, dealer, etc.
    
    # Status flags
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    is_identity_verified = Column(Boolean, default=False)
    is_business_verified = Column(Boolean, default=False)
    
    # Verification level: Basic, ID_Verified, Business_Verified, Trusted_Partner
    verification_badge = Column(String(50), default="Unverified")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    listings = relationship("Listing", back_populates="owner", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="renter", cascade="all, delete-orphan")
    verification_documents = relationship("VerificationDocument", back_populates="user", cascade="all, delete-orphan", foreign_keys="VerificationDocument.user_id")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

class VerificationDocument(Base):
    __tablename__ = "verification_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)  # NATIONAL_ID, PASSPORT, CAC_CERTIFICATE, DRIVERS_LICENSE
    document_number = Column(String(100), nullable=True)
    file_url = Column(String(500), nullable=False)
    status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING)
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="verification_documents", foreign_keys=[user_id])
