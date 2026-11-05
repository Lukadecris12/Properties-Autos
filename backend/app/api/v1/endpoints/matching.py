from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.listing import Listing
from app.models.requirement import Requirement, AIMatch
from app.schemas.match import AIMatchResponse, MatchTriggerRequest
from app.schemas.common import ResponseModel
from app.services.matching_engine import MatchingEngine

router = APIRouter()

@router.get("/my-matches", response_model=ResponseModel[List[AIMatchResponse]])
async def get_my_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Direction A: Returns AI-matched listings for current user's active requirements.
    """
    stmt = (
        select(AIMatch)
        .join(Requirement, AIMatch.requirement_id == Requirement.id)
        .where(
            Requirement.user_id == current_user.id,
            AIMatch.is_dismissed == False
        )
        .options(
            selectinload(AIMatch.listing),
            selectinload(AIMatch.requirement)
        )
        .order_by(desc(AIMatch.compatibility_score))
    )
    res = await db.execute(stmt)
    matches = res.scalars().all()
    return ResponseModel(data=matches)

@router.get("/listing-matches/{listing_id}", response_model=ResponseModel[List[AIMatchResponse]])
async def get_listing_matches(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Direction B: Returns matched buyers, tenants or renters seeking this owner's listing.
    """
    # Verify ownership
    listing_stmt = select(Listing).where(Listing.id == listing_id)
    listing_res = await db.execute(listing_stmt)
    listing = listing_res.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    stmt = (
        select(AIMatch)
        .where(
            AIMatch.listing_id == listing_id,
            AIMatch.is_dismissed == False
        )
        .options(
            selectinload(AIMatch.requirement),
            selectinload(AIMatch.listing)
        )
        .order_by(desc(AIMatch.compatibility_score))
    )
    res = await db.execute(stmt)
    matches = res.scalars().all()
    return ResponseModel(data=matches)

@router.post("/trigger", response_model=ResponseModel[dict])
async def trigger_match(
    trigger_in: MatchTriggerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if trigger_in.target_type == "requirement":
        stmt = select(Requirement).where(Requirement.id == trigger_in.target_id)
        res = await db.execute(stmt)
        req = res.scalars().first()
        if not req:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
        matches = await MatchingEngine.match_requirement_to_listings(db, req)
        return ResponseModel(message=f"Matched {len(matches)} listings with requirement", data={"count": len(matches)})

    elif trigger_in.target_type == "listing":
        stmt = select(Listing).where(Listing.id == trigger_in.target_id)
        res = await db.execute(stmt)
        listing = res.scalars().first()
        if not listing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        matches = await MatchingEngine.match_listing_to_requirements(db, listing)
        return ResponseModel(message=f"Matched {len(matches)} requirements with listing", data={"count": len(matches)})

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target_type. Use 'requirement' or 'listing'.")

@router.put("/{match_id}/dismiss", response_model=ResponseModel[bool])
async def dismiss_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AIMatch).where(AIMatch.id == match_id)
    res = await db.execute(stmt)
    match = res.scalars().first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match record not found")

    match.is_dismissed = True
    await db.commit()
    return ResponseModel(message="Match dismissed", data=True)
