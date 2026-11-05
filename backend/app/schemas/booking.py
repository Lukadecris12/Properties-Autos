from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from decimal import Decimal

from app.models.enums import BookingStatus, InspectionStatus, InspectionType
from app.schemas.listing import ListingResponse

class BookingCreate(BaseModel):
    listing_id: int
    start_date: datetime
    end_date: datetime
    booking_metadata: Dict[str, Any] = Field(default_factory=dict)
    guest_notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    host_notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    listing_id: int
    renter_id: int
    start_date: datetime
    end_date: datetime
    daily_rate: Decimal
    total_days: int
    subtotal: Decimal
    security_deposit: Decimal
    service_fee: Decimal
    total_amount: Decimal
    currency: str
    status: BookingStatus
    booking_metadata: Dict[str, Any]
    guest_notes: Optional[str]
    host_notes: Optional[str]
    created_at: datetime
    listing: Optional[ListingResponse] = None

    class Config:
        from_attributes = True

class InspectionCreate(BaseModel):
    listing_id: int
    inspection_type: InspectionType = InspectionType.PHYSICAL
    preferred_date: datetime
    time_slot: str
    requester_notes: Optional[str] = None

class InspectionStatusUpdate(BaseModel):
    status: InspectionStatus
    host_response: Optional[str] = None

class InspectionResponse(BaseModel):
    id: int
    listing_id: int
    requester_id: int
    inspection_type: InspectionType
    preferred_date: datetime
    time_slot: str
    status: InspectionStatus
    requester_notes: Optional[str]
    host_response: Optional[str]
    created_at: datetime
    listing: Optional[ListingResponse] = None

    class Config:
        from_attributes = True
