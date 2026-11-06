from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class MessageCreate(BaseModel):
    conversation_id: Optional[int] = None
    recipient_id: Optional[int] = None
    listing_id: Optional[int] = None
    content: str
    attachment_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    attachment_url: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ParticipantSummary(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    avatar_url: Optional[str] = None
    logo_url: Optional[str] = None
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True

class ListingSummary(BaseModel):
    id: int
    title: str
    price: Optional[float] = None
    currency: Optional[str] = "NGN"
    city: Optional[str] = None
    images: Optional[List[dict]] = []

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    listing_id: Optional[int] = None
    participant_1_id: int
    participant_2_id: int
    subject: Optional[str] = None
    last_message_at: datetime
    created_at: datetime
    messages: List[MessageResponse] = []
    participant_1: Optional[ParticipantSummary] = None
    participant_2: Optional[ParticipantSummary] = None
    listing: Optional[ListingSummary] = None

    class Config:
        from_attributes = True
