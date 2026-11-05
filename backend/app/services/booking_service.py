from datetime import datetime
from decimal import Decimal
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.models.listing import Listing, ListingAvailability
from app.models.booking import Booking
from app.models.enums import BookingStatus, TransactionType

class BookingService:
    """
    Handles Short-let and Vehicle Rental booking workflows with strict
    concurrency controls and overlapping-date prevention.
    """

    @staticmethod
    async def is_asset_available(
        db: AsyncSession,
        listing_id: int,
        start_date: datetime,
        end_date: datetime,
        exclude_booking_id: Optional[int] = None
    ) -> bool:
        if start_date >= end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking start date must be strictly before end date."
            )

        # 1. Check for overlapping confirmed or active bookings
        booking_query = select(Booking).where(
            Booking.listing_id == listing_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.REQUESTED]),
            or_(
                # Overlap condition: (StartA <= EndB) and (EndA >= StartB)
                and_(Booking.start_date < end_date, Booking.end_date > start_date)
            )
        )
        if exclude_booking_id:
            booking_query = booking_query.where(Booking.id != exclude_booking_id)

        booking_res = await db.execute(booking_query)
        if booking_res.scalars().first():
            return False

        # 2. Check for manual blocked dates on the availability calendar
        avail_query = select(ListingAvailability).where(
            ListingAvailability.listing_id == listing_id,
            ListingAvailability.status.in_(["BLOCKED", "BOOKED", "MAINTENANCE"]),
            and_(ListingAvailability.start_date < end_date, ListingAvailability.end_date > start_date)
        )
        avail_res = await db.execute(avail_query)
        if avail_res.scalars().first():
            return False

        return True

    @classmethod
    async def create_booking_request(
        cls,
        db: AsyncSession,
        renter_id: int,
        listing_id: int,
        start_date: datetime,
        end_date: datetime,
        guest_notes: Optional[str] = None,
        booking_metadata: Optional[dict] = None
    ) -> Booking:
        # Fetch listing
        stmt = select(Listing).where(Listing.id == listing_id)
        res = await db.execute(stmt)
        listing = res.scalars().first()
        if not listing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

        # Ensure listing supports rentals
        if listing.transaction_type not in [TransactionType.RENT, TransactionType.LEASE]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This listing is listed for SALE and does not accept date-based rental bookings."
            )

        # Verify availability
        available = await cls.is_asset_available(db, listing_id, start_date, end_date)
        if not available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The requested dates are no longer available for this asset. Please select alternative dates."
            )

        # Calculate duration in days/nights
        duration = (end_date - start_date).days
        if duration <= 0:
            duration = 1

        daily_rate = listing.price
        subtotal = daily_rate * Decimal(duration)
        deposit = listing.security_deposit or Decimal(0)
        service_fee = round(subtotal * Decimal("0.05"), 2)  # 5% platform fee
        total_amount = subtotal + deposit + service_fee

        booking = Booking(
            listing_id=listing_id,
            renter_id=renter_id,
            start_date=start_date,
            end_date=end_date,
            daily_rate=daily_rate,
            total_days=duration,
            subtotal=subtotal,
            security_deposit=deposit,
            service_fee=service_fee,
            total_amount=total_amount,
            currency=listing.currency,
            status=BookingStatus.REQUESTED,
            guest_notes=guest_notes,
            booking_metadata=booking_metadata or {}
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        return booking

    @classmethod
    async def update_booking_status(
        cls,
        db: AsyncSession,
        booking_id: int,
        new_status: BookingStatus,
        host_notes: Optional[str] = None
    ) -> Booking:
        stmt = select(Booking).where(Booking.id == booking_id)
        res = await db.execute(stmt)
        booking = res.scalars().first()
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

        if new_status == BookingStatus.CONFIRMED:
            # Recheck availability atomically before confirmation
            available = await cls.is_asset_available(
                db, booking.listing_id, booking.start_date, booking.end_date, exclude_booking_id=booking.id
            )
            if not available:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Cannot confirm booking: dates have conflicting confirmed reservations."
                )
            
            # Create a corresponding calendar block
            block = ListingAvailability(
                listing_id=booking.listing_id,
                start_date=booking.start_date,
                end_date=booking.end_date,
                status="BOOKED",
                notes=f"Confirmed Booking #{booking.id}"
            )
            db.add(block)

        booking.status = new_status
        if host_notes:
            booking.host_notes = host_notes
            
        await db.commit()
        await db.refresh(booking)
        return booking
