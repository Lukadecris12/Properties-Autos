from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.requirement import Requirement
from app.models.enums import TransactionType, AssetCategory, RequirementStatus, RentalPeriod
from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
    RequirementResponse
)
from app.schemas.common import ResponseModel, PaginatedResponse
from app.services.matching_engine import MatchingEngine

router = APIRouter()

@router.post("", response_model=ResponseModel[RequirementResponse], status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=ResponseModel[RequirementResponse], status_code=status.HTTP_201_CREATED)
async def create_requirement(
    req_in: RequirementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req_in.transaction_type in [TransactionType.RENT, TransactionType.LEASE]:
        if not req_in.rental_period:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rental and lease requirements must specify a rental_period."
            )

    req = Requirement(
        user_id=current_user.id,
        transaction_type=req_in.transaction_type,
        asset_category=req_in.asset_category,
        status=req_in.status or RequirementStatus.ACTIVE,
        title=req_in.title,
        description=req_in.description,
        min_budget=req_in.min_budget,
        max_budget=req_in.max_budget,
        currency=req_in.currency,
        rental_period=req_in.rental_period,
        desired_duration=req_in.desired_duration,
        move_in_date=req_in.move_in_date,
        preferred_country=req_in.preferred_country,
        preferred_state=req_in.preferred_state,
        preferred_city=req_in.preferred_city,
        preferred_neighbourhoods=req_in.preferred_neighbourhoods,
        max_distance_km=req_in.max_distance_km,
        criteria=req_in.criteria
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    # Direction A: Proactively match with existing published listings
    if req.status == RequirementStatus.ACTIVE:
        await MatchingEngine.match_requirement_to_listings(db, req)

    return ResponseModel(
        message="Requirement published successfully. AI matching triggered.",
        data=req
    )

@router.get("", response_model=PaginatedResponse[RequirementResponse], include_in_schema=False)
@router.get("/", response_model=PaginatedResponse[RequirementResponse])
async def list_requirements(
    transaction_type: Optional[TransactionType] = None,
    asset_category: Optional[AssetCategory] = None,
    rental_period: Optional[RentalPeriod] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Requirement).where(Requirement.status == RequirementStatus.ACTIVE)

    if transaction_type:
        query = query.where(Requirement.transaction_type == transaction_type)
    if asset_category:
        query = query.where(Requirement.asset_category == asset_category)
    if rental_period:
        query = query.where(Requirement.rental_period == rental_period)
    if state:
        query = query.where(Requirement.preferred_state.ilike(f"%{state}%"))
    if city:
        query = query.where(Requirement.preferred_city.ilike(f"%{city}%"))

    query = query.order_by(desc(Requirement.created_at))

    result = await db.execute(query)
    all_items = result.scalars().all()

    total = len(all_items)
    start_idx = (page - 1) * page_size
    items = all_items[start_idx : start_idx + page_size]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )

@router.get("/user/my-requirements", response_model=ResponseModel[List[RequirementResponse]])
async def get_my_requirements(
    transaction_type: Optional[TransactionType] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Requirement).where(Requirement.user_id == current_user.id)
    if transaction_type:
        query = query.where(Requirement.transaction_type == transaction_type)
    query = query.order_by(desc(Requirement.created_at))

    result = await db.execute(query)
    return ResponseModel(data=result.scalars().all())

@router.get("/{requirement_id}", response_model=ResponseModel[RequirementResponse])
async def get_requirement(
    requirement_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Requirement).where(Requirement.id == requirement_id)
    res = await db.execute(stmt)
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
    return ResponseModel(data=req)

@router.put("/{requirement_id}", response_model=ResponseModel[RequirementResponse])
async def update_requirement(
    requirement_id: int,
    req_in: RequirementUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Requirement).where(Requirement.id == requirement_id)
    res = await db.execute(stmt)
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
    if req.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_dict = req_in.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(req, k, v)

    await db.commit()
    await db.refresh(req)

    # Re-run matching after update
    if req.status == RequirementStatus.ACTIVE:
        await MatchingEngine.match_requirement_to_listings(db, req)

    return ResponseModel(message="Requirement updated", data=req)

@router.delete("/{requirement_id}", response_model=ResponseModel[bool])
async def delete_requirement(
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Requirement).where(Requirement.id == requirement_id)
    res = await db.execute(stmt)
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
    if req.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    await db.delete(req)
    await db.commit()
    return ResponseModel(message="Requirement deleted", data=True)
