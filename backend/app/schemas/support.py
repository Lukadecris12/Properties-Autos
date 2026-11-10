from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class SupportTicketCreate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    category: str = "GENERAL_INQUIRY"
    subject: str
    message: str

class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None

class SupportTicketResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    full_name: str
    email: str
    phone_number: Optional[str] = None
    category: str
    subject: str
    message: str
    status: str
    admin_response: Optional[str] = None
    responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
