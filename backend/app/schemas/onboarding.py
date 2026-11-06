from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class SignupInitiateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class SignupInitiateResponse(BaseModel):
    status: str = "success"
    message: str
    email: str
    otp_debug: Optional[str] = None  # Included in development / simulation mode
    verification_token: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")

class VerifyOtpResponse(BaseModel):
    status: str = "success"
    message: str
    email: str
    verification_token: str

class ResendOtpRequest(BaseModel):
    email: EmailStr

class OnboardingCompleteRequest(BaseModel):
    email: EmailStr
    verification_token: Optional[str] = "direct_onboarding"
    
    # 1. Buyer vs Seller
    user_type: str = Field(..., description="'buyer' or 'seller'")
    
    # 2. Entity Type
    # If seller: 'agent', 'company', 'developer'
    # If buyer: 'individual', 'company'
    entity_type: str = Field(..., description="'agent', 'company', 'developer', or 'individual'")
    
    # 3. Asset Offerings / Interests
    # 'residential', 'land', 'vehicle'
    asset_interests: List[str] = Field(default_factory=lambda: ["residential", "land", "vehicle"])
    
    # 4. Identity
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    
    # 5. Phone with Country Code
    country_code: str = Field(default="+234", description="Dialing code e.g. +234, +1, +44")
    phone_number: str = Field(..., description="Phone number without dialing code")
    
    # 6. Geography
    country: str = Field(..., description="Residence or Operating country")
    state: str = Field(..., description="State / Province / Region")
    city: str = Field(..., description="City or Town")
    
    # 7. Optional Media
    avatar_url: Optional[str] = None
    logo_url: Optional[str] = None
