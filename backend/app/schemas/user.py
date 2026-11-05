from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole, VerificationStatus

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    country: str = "Nigeria"
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None

class UserRegister(UserBase):
    password: str
    selected_role: Optional[str] = "buyer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

class ModeSwitch(BaseModel):
    mode: str  # e.g., buyer, seller, landlord, agent, dealer, renter

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    roles: List[str]
    active_mode: str
    is_active: bool
    is_superuser: bool
    is_identity_verified: bool
    is_business_verified: bool
    verification_badge: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class VerificationDocumentCreate(BaseModel):
    document_type: str
    document_number: Optional[str] = None
    file_url: str

class VerificationDocumentResponse(BaseModel):
    id: int
    user_id: int
    document_type: str
    document_number: Optional[str]
    file_url: str
    status: VerificationStatus
    reviewer_notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
