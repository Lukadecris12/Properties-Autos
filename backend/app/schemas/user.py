from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole, VerificationStatus

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    country_code: Optional[str] = "+234"
    country: str = "Nigeria"
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    user_type: Optional[str] = "buyer"
    entity_type: Optional[str] = None

class UserRegister(UserBase):
    password: str
    selected_role: Optional[str] = "buyer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    logo_url: Optional[str] = None
    roles: List[str]
    active_mode: str
    asset_interests: Optional[List[str]] = None
    is_active: bool
    is_superuser: bool
    is_email_verified: bool = False
    is_identity_verified: bool = False
    is_business_verified: bool = False
    verification_badge: str = "Unverified"
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

class ModeSwitch(BaseModel):
    mode: str  # e.g., buyer, seller, landlord, agent, dealer, renter

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
