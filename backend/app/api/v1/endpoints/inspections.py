from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.listing import Listing
from app.models.booking import Inspection
from app.models.enums import InspectionStatus
from app.schemas.booking import InspectionCreate, InspectionStatusUpdate, InspectionResponse
from app.schemas.common import ResponseModel

router = APIRouter()

@router.post("/", response_model=ResponseModel[InspectionResponse], status_code=status.HTTP_201_CREATED)
async def request_inspection(
    insp_in: InspectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify listing exists
    stmt = select(Listing).where(Listing.id == insp_in.listing_id)
    res = await db.execute(stmt)
    listing = res.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    inspection = Inspection(
        listing_id=insp_in.listing_id,
        requester_id=current_user.id,
        inspection_type=insp_in.inspection_type,
        preferred_date=insp_in.preferred_date,
        time_slot=insp_in.time_slot,
        requester_notes=insp_in.requester_notes,
        status=InspectionStatus.PENDING
    )
    db.add(inspection)
    await db.commit()
    await db.refresh(inspection)
    return ResponseModel(message="Inspection requested successfully", data=inspection)

@router.get("/my-inspections", response_model=ResponseModel[List[InspectionResponse]])
async def get_my_inspections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Inspection)
        .where(Inspection.requester_id == current_user.id)
        .options(selectinload(Inspection.listing))
        .order_by(desc(Inspection.created_at))
    )
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.get("/host-inspections", response_model=ResponseModel[List[InspectionResponse]])
async def get_host_inspections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Inspection)
        .join(Listing, Inspection.listing_id == Listing.id)
        .where(Listing.user_id == current_user.id)
        .options(selectinload(Inspection.listing))
        .order_by(desc(Inspection.created_at))
    )
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.put("/{inspection_id}/status", response_model=ResponseModel[InspectionResponse])
async def update_inspection_status(
    inspection_id: int,
    status_in: InspectionStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Inspection).where(Inspection.id == inspection_id)
    res = await db.execute(stmt)
    insp = res.scalars().first()
    if not insp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")

    insp.status = status_in.status
    if status_in.host_response:
        insp.host_response = status_in.host_response

    await db.commit()
    await db.refresh(insp)
    return ResponseModel(message=f"Inspection status updated to {status_in.status.value}", data=insp)
