from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.listing import Listing, ListingAvailability
from app.models.enums import TransactionType, AssetCategory, ListingStatus, RentalPeriod
from app.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    AvailabilityCreate,
    AvailabilityResponse
)
from app.schemas.common import ResponseModel, PaginatedResponse
from app.services.matching_engine import MatchingEngine

router = APIRouter()

@router.post("/", response_model=ResponseModel[ListingResponse], status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_in: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify rental period rule
    if listing_in.transaction_type in [TransactionType.RENT, TransactionType.LEASE]:
        if not listing_in.rental_period:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rental and Lease listings must specify a rental_period (e.g. per_night, per_day, per_month, per_year)."
            )

    listing = Listing(
        user_id=current_user.id,
        transaction_type=listing_in.transaction_type,
        asset_category=listing_in.asset_category,
        status=listing_in.status or ListingStatus.PUBLISHED,
        title=listing_in.title,
        slug=f"{listing_in.title.lower().replace(' ', '-')[:50]}-{int(datetime.now(timezone.utc).timestamp())}",
        description=listing_in.description,
        price=listing_in.price,
        currency=listing_in.currency,
        is_negotiable=listing_in.is_negotiable,
        rental_period=listing_in.rental_period,
        security_deposit=listing_in.security_deposit,
        agency_fee=listing_in.agency_fee,
        legal_fee=listing_in.legal_fee,
        service_charge=listing_in.service_charge,
        min_rental_duration=listing_in.min_rental_duration,
        max_rental_duration=listing_in.max_rental_duration,
        country=listing_in.country,
        state=listing_in.state,
        city=listing_in.city,
        neighbourhood=listing_in.neighbourhood,
        address=listing_in.address,
        latitude=listing_in.latitude,
        longitude=listing_in.longitude,
        location_privacy=listing_in.location_privacy,
        attributes=listing_in.attributes,
        images=listing_in.images,
        videos=listing_in.videos,
        virtual_tour_url=listing_in.virtual_tour_url,
        available_from=listing_in.available_from,
        published_at=datetime.now(timezone.utc) if listing_in.status == ListingStatus.PUBLISHED else None
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)

    # If published, trigger Direction B matching in background/sync
    if listing.status == ListingStatus.PUBLISHED:
        await MatchingEngine.match_listing_to_requirements(db, listing)

    return ResponseModel(message="Listing created successfully", data=listing)

@router.get("/", response_model=PaginatedResponse[ListingResponse])
async def list_listings(
    transaction_type: Optional[TransactionType] = None,
    asset_category: Optional[AssetCategory] = None,
    rental_period: Optional[RentalPeriod] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    user_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Listing).where(Listing.status == ListingStatus.PUBLISHED)

    # Mandatory transaction separation: Never mix SALE with RENT/LEASE!
    if transaction_type:
        query = query.where(Listing.transaction_type == transaction_type)
    if asset_category:
        query = query.where(Listing.asset_category == asset_category)
    if rental_period:
        query = query.where(Listing.rental_period == rental_period)
    if state:
        query = query.where(Listing.state.ilike(f"%{state}%"))
    if city:
        query = query.where(Listing.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.where(Listing.price >= min_price)
    if max_price is not None:
        query = query.where(Listing.price <= max_price)
    if is_featured is not None:
        query = query.where(Listing.is_featured == is_featured)
    if user_id is not None:
        query = query.where(Listing.user_id == user_id)

    query = query.order_by(desc(Listing.is_featured), desc(Listing.created_at))

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

@router.get("/user/my-listings", response_model=ResponseModel[List[ListingResponse]])
async def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Listing).where(Listing.user_id == current_user.id).order_by(desc(Listing.created_at))
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.get("/{listing_id}", response_model=ResponseModel[ListingResponse])
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Listing).where(Listing.id == listing_id)
    res = await db.execute(stmt)
    listing = res.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    # Increment view count
    listing.view_count += 1
    await db.commit()
    await db.refresh(listing)

    return ResponseModel(data=listing)

@router.put("/{listing_id}", response_model=ResponseModel[ListingResponse])
async def update_listing(
    listing_id: int,
    listing_in: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Listing).where(Listing.id == listing_id)
    res = await db.execute(stmt)
    listing = res.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    # Ownership verification
    if listing.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this listing")

    update_dict = listing_in.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(listing, k, v)
        
    await db.commit()
    await db.refresh(listing)
    return ResponseModel(message="Listing updated successfully", data=listing)

@router.delete("/{listing_id}", response_model=ResponseModel[bool])
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Listing).where(Listing.id == listing_id)
    res = await db.execute(stmt)
    listing = res.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    if listing.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this listing")

    await db.delete(listing)
    await db.commit()
    return ResponseModel(message="Listing deleted successfully", data=True)

@router.post("/{listing_id}/availability", response_model=ResponseModel[AvailabilityResponse])
async def add_availability(
    listing_id: int,
    avail_in: AvailabilityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Listing).where(Listing.id == listing_id)
    res = await db.execute(stmt)
    listing = res.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    block = ListingAvailability(
        listing_id=listing_id,
        start_date=avail_in.start_date,
        end_date=avail_in.end_date,
        status=avail_in.status,
        notes=avail_in.notes
    )
    db.add(block)
    await db.commit()
    await db.refresh(block)
    return ResponseModel(message="Availability updated", data=block)

@router.get("/{listing_id}/availability", response_model=ResponseModel[List[AvailabilityResponse]])
async def get_availability(
    listing_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ListingAvailability).where(ListingAvailability.listing_id == listing_id)
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())
