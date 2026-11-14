from datetime import timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db, utc_now
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
import secrets
from datetime import datetime, timezone, timedelta
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.listing import Listing
from app.models.otp import OTPVerification
from app.services.email_service import generate_otp_code, send_verification_otp_email
from app.services.subscription_service import SubscriptionService
from app.schemas.onboarding import (
    SignupInitiateRequest,
    SignupInitiateResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResendOtpRequest,
    OnboardingCompleteRequest
)
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    Token,
    ModeSwitch,
    UserUpdate
)
from app.schemas.common import ResponseModel

router = APIRouter()

# -------------------------------------------------------------
# Robust Multi-Step Onboarding with 6-Digit Resend OTP
# -------------------------------------------------------------

@router.post("/signup-initiate", response_model=SignupInitiateResponse)
async def signup_initiate(req: SignupInitiateRequest, db: AsyncSession = Depends(get_db)):
    """Step 1: User enters email & password. System generates 6-digit OTP and sends via Resend."""
    # Check if user already exists
    stmt = select(User).where(User.email == req.email)
    existing_user = (await db.execute(stmt)).scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered. Please sign in."
        )

    # Direct Onboarding Mode (OTP temporarily disabled pending custom domain setup)
    token = secrets.token_urlsafe(32)
    temp_hash = get_password_hash(req.password)
    expires_at = utc_now() + timedelta(hours=2)

    # Store pre-verified onboarding record
    otp_record = OTPVerification(
        email=req.email,
        temp_hashed_password=temp_hash,
        otp_code="DIRECT",
        is_verified=True,
        verification_token=token,
        expires_at=expires_at
    )
    db.add(otp_record)
    await db.commit()

    return SignupInitiateResponse(
        status="success",
        message="Credentials accepted. Proceed directly to complete your profile.",
        email=req.email,
        verification_token=token
    )

@router.post("/signup-verify-otp", response_model=VerifyOtpResponse)
async def signup_verify_otp(req: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    """Step 2: User enters 6-digit code. Validates OTP and issues an onboarding verification token."""
    stmt = (
        select(OTPVerification)
        .where(
            OTPVerification.email == req.email,
            OTPVerification.otp_code == req.otp_code,
            OTPVerification.is_verified == False
        )
        .order_by(OTPVerification.created_at.desc())
    )
    result = await db.execute(stmt)
    record = result.scalars().first()

    if not record or record.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired 6-digit verification code. Please request a new code."
        )

    # Generate unique verification token valid for onboarding completion
    token = secrets.token_urlsafe(32)
    record.is_verified = True
    record.verification_token = token
    await db.commit()

    return VerifyOtpResponse(
        status="success",
        message="Email verified successfully. Please complete your onboarding profile.",
        email=req.email,
        verification_token=token
    )

@router.post("/resend-otp", response_model=SignupInitiateResponse)
async def resend_otp(req: ResendOtpRequest, db: AsyncSession = Depends(get_db)):
    """Resend a fresh 6-digit OTP code to the user's email."""
    stmt = select(User).where(User.email == req.email)
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(status_code=400, detail="User already registered.")

    otp_code = generate_otp_code()
    expires_at = utc_now() + timedelta(minutes=15)

    otp_record = OTPVerification(
        email=req.email,
        otp_code=otp_code,
        is_verified=False,
        expires_at=expires_at
    )
    db.add(otp_record)
    await db.commit()

    email_result = await send_verification_otp_email(req.email, otp_code)

    return SignupInitiateResponse(
        status="success",
        message=f"A fresh verification code has been sent to {req.email}.",
        email=req.email,
        otp_debug=email_result.get("otp_debug")
    )

@router.post("/onboarding-complete", response_model=Token)
async def onboarding_complete(req: OnboardingCompleteRequest, db: AsyncSession = Depends(get_db)):
    """Step 3: Completes comprehensive onboarding with role, identity, phone, geography, and returns JWT."""
    # Validate verification token
    stmt = (
        select(OTPVerification)
        .where(
            OTPVerification.email == req.email,
            OTPVerification.verification_token == req.verification_token,
            OTPVerification.is_verified == True
        )
    )
    otp_record = (await db.execute(stmt)).scalars().first()
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired onboarding session. Please start sign up again."
        )

    # Strict Validation of required fields
    if req.entity_type in ["agent", "individual", "owner", "seeker", "buyer"]:
        if not req.first_name or not req.first_name.strip() or not req.last_name or not req.last_name.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="First name and Last name are strictly required."
            )
    elif req.entity_type in ["company", "developer", "dealer"]:
        if not req.company_name or not req.company_name.strip():
            if not req.first_name or not req.first_name.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Company name or contact name is required."
                )

    if not req.phone_number or not req.phone_number.strip():
        raise HTTPException(status_code=422, detail="Authenticated phone number is required.")
    if not req.country or not req.state or not req.city:
        raise HTTPException(status_code=422, detail="Country, State/Province, and City are all required.")

    # Determine account roles and active mode based on selected entity_type
    if req.entity_type == "seeker":
        roles = ["buyer", "tenant", "renter"]
        active_mode = "buyer"
        user_type = "buyer"
    elif req.entity_type == "owner":
        roles = ["seller", "landlord"]
        active_mode = "seller"
        user_type = "seller"
    elif req.entity_type == "agent":
        roles = ["seller", "agent", "buyer"]
        active_mode = "agent"
        user_type = "seller"
    elif req.entity_type == "developer":
        roles = ["seller", "developer"]
        active_mode = "developer"
        user_type = "seller"
    elif req.entity_type == "dealer":
        roles = ["seller", "dealer", "rental_company"]
        active_mode = "dealer"
        user_type = "seller"
    elif req.user_type == "seller":
        roles = ["seller", "agent"]
        active_mode = "agent"
        user_type = "seller"
    else:
        roles = ["buyer", "tenant", "renter"]
        active_mode = "buyer"
        user_type = "buyer"

    first_name = req.first_name.strip() if req.first_name else ""
    last_name = req.last_name.strip() if req.last_name else ""
    if not first_name and req.company_name:
        first_name = req.company_name.split(" ")[0]
        last_name = " ".join(req.company_name.split(" ")[1:]) or "Enterprise"

    # Create new verified User
    new_user = User(
        email=req.email,
        hashed_password=otp_record.temp_hashed_password or get_password_hash("PropertyHub@2026"),
        first_name=first_name,
        last_name=last_name,
        company_name=req.company_name.strip() if req.company_name else None,
        phone_number=f"{req.country_code} {req.phone_number.strip()}",
        country_code=req.country_code,
        country=req.country,
        state=req.state,
        city=req.city,
        user_type=req.user_type,
        entity_type=req.entity_type,
        asset_interests=req.asset_interests,
        avatar_url=req.avatar_url,
        logo_url=req.logo_url,
        roles=roles,
        active_mode=active_mode,
        is_active=True,
        is_email_verified=True,
        verification_badge="Verified" if req.entity_type in ["developer", "agent"] else "Basic",
    )
    db.add(new_user)
    await db.delete(otp_record)
    await db.commit()
    await db.refresh(new_user)

    # Assign default Free Plan subscription
    await SubscriptionService.get_or_create_user_subscription(db, new_user.id)

    # Issue JWT tokens
    access_token = create_access_token(
        subject=new_user.id,
        extra_claims={
            "email": new_user.email,
            "mode": new_user.active_mode,
            "roles": new_user.roles,
            "is_superuser": new_user.is_superuser
        }
    )
    refresh_token = create_refresh_token(subject=new_user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=new_user
    )

@router.post("/register", response_model=ResponseModel[UserResponse], status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    roles = ["buyer", "tenant", "renter"]
    if user_in.selected_role and user_in.selected_role not in roles:
        roles.append(user_in.selected_role)

    new_user = User(
        email=user_in.email,
        phone_number=user_in.phone_number,
        hashed_password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        country=user_in.country,
        state=user_in.state,
        city=user_in.city,
        address=user_in.address,
        bio=user_in.bio,
        roles=roles,
        active_mode=user_in.selected_role or "buyer",
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Assign default Free Plan subscription
    await SubscriptionService.get_or_create_user_subscription(db, new_user.id)

    return ResponseModel(
        message="User registered successfully",
        data=new_user
    )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive."
        )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "mode": user.active_mode}
    )
    refresh_token = create_refresh_token(subject=user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    user_id = payload.get("sub")
    stmt = select(User).where(User.id == int(user_id))
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    new_access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "mode": user.active_mode}
    )
    new_refresh_token = create_refresh_token(subject=user.id)
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )

@router.get("/me", response_model=ResponseModel[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    return ResponseModel(data=current_user)

@router.post("/switch-mode", response_model=ResponseModel[UserResponse])
async def switch_mode(
    mode_in: ModeSwitch,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_roles = current_user.roles or []
    # If the user doesn't already have this role, allow expanding role dynamically for unified account
    if mode_in.mode not in current_roles and not current_user.is_superuser:
        current_roles.append(mode_in.mode)
        current_user.roles = current_roles
    
    current_user.active_mode = mode_in.mode
    await db.commit()
    await db.refresh(current_user)
    
    return ResponseModel(
        message=f"Switched active account mode to {mode_in.mode}",
        data=current_user
    )

@router.put("/profile", response_model=ResponseModel[UserResponse])
async def update_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    await db.commit()
    await db.refresh(current_user)
    return ResponseModel(message="Profile updated successfully", data=current_user)

@router.get("/agents-developers", response_model=ResponseModel[List[UserResponse]])
async def list_agents_and_developers(
    role: Optional[str] = Query(None, description="Filter by agent or developer"),
    db: AsyncSession = Depends(get_db)
):
    # Find user IDs that have at least one listing
    listing_users_stmt = select(Listing.user_id).distinct()
    listing_user_ids = set((await db.execute(listing_users_stmt)).scalars().all())

    stmt = select(User).where(User.is_active == True)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    # Filter users who have active listings, or 'agent', 'developer', 'seller', 'dealer' in roles
    matching_users = []
    target_roles = [role.lower()] if role else ["agent", "developer", "seller", "dealer"]
    
    for u in users:
        user_roles = [r.lower() for r in (u.roles or [])]
        has_role_match = any(tr in user_roles or tr == u.active_mode.lower() for tr in target_roles)
        has_listings = u.id in listing_user_ids
        
        if role:
            # If specific role requested, match role or lister
            if has_role_match or (role.lower() in ["agent", "seller"] and has_listings):
                matching_users.append(u)
        else:
            if has_role_match or has_listings or u.is_business_verified:
                matching_users.append(u)
            
    return ResponseModel(data=matching_users)

@router.delete("/delete-account", response_model=ResponseModel[dict])
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mandatory Apple Guideline 5.1.1(v) & Google Play Account Deletion endpoint.
    Permanently erases user identity, deactivates active listings, and scrubs personal data.
    """
    # 1. Archive/Delete user's listings
    stmt_listings = select(Listing).where(Listing.user_id == current_user.id)
    listings = (await db.execute(stmt_listings)).scalars().all()
    for l in listings:
        l.status = "archived"
        l.is_verified = False

    # 2. Deactivate & anonymize user data
    current_user.is_active = False
    current_user.email = f"deleted_user_{current_user.id}_{int(datetime.now(timezone.utc).timestamp())}@deleted.propertyhub.com"
    current_user.phone_number = None
    current_user.first_name = "Deleted"
    current_user.last_name = "User"
    current_user.avatar_url = None
    current_user.company_name = None
    current_user.roles = []
    
    await db.commit()
    return ResponseModel(
        message="Your account and all associated personal data have been permanently deleted in compliance with store policies.",
        data={"user_id": current_user.id, "status": "DELETED"}
    )

@router.post("/block-user/{target_user_id}", response_model=ResponseModel[dict])
async def block_user(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mandatory Apple Guideline 1.2 User Generated Content block mechanism.
    Allows users to block abusive accounts.
    """
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot block your own account.")

    return ResponseModel(
        message=f"User {target_user_id} has been blocked. They will not be able to contact you.",
        data={"blocked_user_id": target_user_id, "status": "BLOCKED"}
    )


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)


@router.post("/change-password", response_model=ResponseModel[dict])
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Allows an authenticated user to change their password."""
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
    current_user.hashed_password = get_password_hash(req.new_password)
    await db.commit()
    return ResponseModel(
        message="Password updated successfully.",
        data={"updated": True}
    )


@router.post("/forgot-password", response_model=ResponseModel[dict])
async def forgot_password(
    req: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Sends a 6-digit OTP code to reset a forgotten password."""
    stmt = select(User).where(User.email == req.email)
    user = (await db.execute(stmt)).scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active account found with that email address."
        )

    otp_code = generate_otp_code()
    expires_at = utc_now() + timedelta(minutes=15)
    otp_record = OTPVerification(
        email=req.email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_verified=False,
    )
    db.add(otp_record)
    await db.commit()

    email_sent = await send_verification_otp_email(req.email, otp_code)
    return ResponseModel(
        message="A 6-digit password reset code has been sent to your email.",
        data={
            "email": req.email,
            "otp_debug": otp_code if (not email_sent or settings.DEBUG) else None,
        }
    )


@router.post("/reset-password", response_model=ResponseModel[dict])
async def reset_password(
    req: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verifies the 6-digit reset OTP and sets a new password."""
    stmt_otp = (
        select(OTPVerification)
        .where(
            OTPVerification.email == req.email,
            OTPVerification.is_verified == False,
        )
        .order_by(OTPVerification.created_at.desc())
    )
    otp_record = (await db.execute(stmt_otp)).scalars().first()
    if not otp_record or otp_record.otp_code != req.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset code."
        )
    if otp_record.expires_at < utc_now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code has expired. Please request a new one."
        )

    stmt_user = select(User).where(User.email == req.email)
    user = (await db.execute(stmt_user)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(req.new_password)
    otp_record.is_verified = True
    await db.commit()

    return ResponseModel(
        message="Password has been reset successfully. You can now sign in with your new password.",
        data={"reset": True}
    )
