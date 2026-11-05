from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.dependencies import get_current_user
from app.models.user import User
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
