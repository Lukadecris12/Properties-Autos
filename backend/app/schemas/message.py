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

class ConversationResponse(BaseModel):
    id: int
    listing_id: Optional[int]
    participant_1_id: int
    participant_2_id: int
    subject: Optional[str]
    last_message_at: datetime
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
