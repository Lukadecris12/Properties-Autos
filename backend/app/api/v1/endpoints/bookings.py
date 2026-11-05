from datetime import datetime
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
from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingResponse
from app.schemas.common import ResponseModel
from app.services.booking_service import BookingService

router = APIRouter()

@router.post("/", response_model=ResponseModel[BookingResponse], status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    booking = await BookingService.create_booking_request(
        db=db,
        renter_id=current_user.id,
        listing_id=booking_in.listing_id,
        start_date=booking_in.start_date,
        end_date=booking_in.end_date,
        guest_notes=booking_in.guest_notes,
        booking_metadata=booking_in.booking_metadata
    )
    return ResponseModel(message="Booking requested successfully", data=booking)

@router.get("/my-bookings", response_model=ResponseModel[List[BookingResponse]])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Booking)
        .where(Booking.renter_id == current_user.id)
        .options(selectinload(Booking.listing))
        .order_by(desc(Booking.created_at))
    )
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.get("/host-bookings", response_model=ResponseModel[List[BookingResponse]])
async def get_host_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .where(Listing.user_id == current_user.id)
        .options(selectinload(Booking.listing))
        .order_by(desc(Booking.created_at))
    )
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.put("/{booking_id}/status", response_model=ResponseModel[BookingResponse])
async def update_booking_status(
    booking_id: int,
    status_in: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify owner of listing or admin
    booking_stmt = select(Booking).join(Listing).where(Booking.id == booking_id)
    b_res = await db.execute(booking_stmt)
    booking = b_res.scalars().first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    updated = await BookingService.update_booking_status(
        db=db,
        booking_id=booking_id,
        new_status=status_in.status,
        host_notes=status_in.host_notes
    )
    return ResponseModel(message=f"Booking status updated to {status_in.status.value}", data=updated)

@router.get("/check-availability")
async def check_availability(
    listing_id: int,
    start_date: datetime,
    end_date: datetime,
    db: AsyncSession = Depends(get_db)
):
    is_open = await BookingService.is_asset_available(db, listing_id, start_date, end_date)
    return {"listing_id": listing_id, "available": is_open}
