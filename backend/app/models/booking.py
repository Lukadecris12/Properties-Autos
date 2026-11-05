from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    JSON, Text, ForeignKey, Enum as SQLEnum, Numeric
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import BookingStatus, InspectionStatus, InspectionType

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    renter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Dates / Times
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Pricing Breakdown
    daily_rate = Column(Numeric(14, 2), nullable=False)
    total_days = Column(Integer, default=1)
    subtotal = Column(Numeric(14, 2), nullable=False)
    security_deposit = Column(Numeric(14, 2), default=0)
    service_fee = Column(Numeric(14, 2), default=0)
    total_amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), default="NGN")
    
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.REQUESTED, index=True, nullable=False)
    
    # Specific options: e.g. for vehicle: self_drive / chauffeur, delivery_requested
    booking_metadata = Column(JSON, default=dict)
    guest_notes = Column(Text, nullable=True)
    host_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    renter = relationship("User", back_populates="bookings", foreign_keys=[renter_id])

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    inspection_type = Column(SQLEnum(InspectionType), default=InspectionType.PHYSICAL, nullable=False)
    preferred_date = Column(DateTime, nullable=False)
    time_slot = Column(String(50), nullable=False)  # Morning (9am-12pm), Afternoon (12pm-3pm), Evening (3pm-6pm)
    
    status = Column(SQLEnum(InspectionStatus), default=InspectionStatus.PENDING, index=True, nullable=False)
    requester_notes = Column(Text, nullable=True)
    host_response = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    listing = relationship("Listing", back_populates="inspections")
    requester = relationship("User", foreign_keys=[requester_id])

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="SET NULL"), nullable=True)
    participant_1_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    participant_2_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    subject = Column(String(255), nullable=True)
    last_message_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at.asc()")
    listing = relationship("Listing")
    participant_1 = relationship("User", foreign_keys=[participant_1_id])
    participant_2 = relationship("User", foreign_keys=[participant_2_id])

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    content = Column(Text, nullable=False)
    attachment_url = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
