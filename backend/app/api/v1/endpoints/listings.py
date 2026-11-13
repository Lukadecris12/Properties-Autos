from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, or_, case
from sqlalchemy.orm import selectinload

from app.core.database import get_db, utc_now
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
from app.services.subscription_service import SubscriptionService

router = APIRouter()

@router.post("", response_model=ResponseModel[ListingResponse], status_code=status.HTTP_201_CREATED, include_in_schema=False)
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

    target_status = listing_in.status or ListingStatus.PUBLISHED
    if target_status == ListingStatus.PUBLISHED:
        can_pub, reason, usage = await SubscriptionService.can_publish_listing(db, current_user.id)
        if not can_pub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=reason
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
        published_at=utc_now()
    )
    db.add(listing)

    # Automatically grant seller role to lister so they appear in Directory & Seller dashboard
    current_roles = [r.lower() for r in (current_user.roles or [])]
    if "seller" not in current_roles and "agent" not in current_roles and "developer" not in current_roles and "dealer" not in current_roles:
        updated_roles = list(current_user.roles or [])
        updated_roles.append("seller")
        current_user.roles = updated_roles
        db.add(current_user)

    await db.commit()
    await db.refresh(listing)

    # If published, trigger Direction B matching in background/sync
    if listing.status == ListingStatus.PUBLISHED:
        await MatchingEngine.match_listing_to_requirements(db, listing)

    return ResponseModel(message="Listing created successfully", data=listing)

@router.get("", response_model=PaginatedResponse[ListingResponse], include_in_schema=False)
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
    subtype: Optional[str] = None,
    brand: Optional[str] = None,
    model: Optional[str] = None,
    condition: Optional[str] = None,
    year: Optional[int] = None,
    bedrooms: Optional[int] = None,
    keyword: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Listing).where(Listing.status == ListingStatus.PUBLISHED)

    # Mandatory transaction separation: Never mix SALE with RENT/LEASE!
    if transaction_type:
        if transaction_type == TransactionType.RENT:
            query = query.where(Listing.transaction_type.in_([TransactionType.RENT, TransactionType.LEASE]))
        else:
            query = query.where(Listing.transaction_type == transaction_type)
    if asset_category:
        query = query.where(Listing.asset_category == asset_category)
    if rental_period:
        query = query.where(Listing.rental_period == rental_period)
    if state:
        loc_term = f"%{state.strip()}%"
        query = query.where(
            or_(
                Listing.state.ilike(loc_term),
                Listing.city.ilike(loc_term),
                Listing.neighbourhood.ilike(loc_term),
                Listing.address.ilike(loc_term),
            )
        )
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

    await SubscriptionService.process_expired_boosts(db)

    is_boost_active = case(
        (Listing.is_boosted == True, 1),
        else_=0
    )
    is_feat_active = case(
        (Listing.is_featured == True, 1),
        else_=0
    )

    query = query.options(selectinload(Listing.owner)).order_by(
        desc(is_boost_active),
        desc(is_feat_active),
        desc(Listing.created_at)
    )

    result = await db.execute(query)
    all_items = list(result.scalars().all())

    # 1. Keyword search
    if keyword and keyword.strip():
        kw = keyword.lower().strip()
        all_items = [
            i for i in all_items
            if kw in (i.title or "").lower()
            or kw in (i.description or "").lower()
            or kw in (i.neighbourhood or "").lower()
            or kw in (i.city or "").lower()
            or kw in (i.state or "").lower()
            or any(kw in str(v).lower() for v in (i.attributes or {}).values())
        ]

    # 2. Specific Subtype filtering (Houses: duplex, bungalow, mini flat; Commercial: warehouse, office, mall; Land: residential, commercial, farm)
    if subtype and subtype.strip() and subtype.lower() != "all":
        st = subtype.lower().replace("_", " ").replace("-", " ").strip()
        # Extract individual options if slash-separated (e.g. "Plaza / Complex / Mall" -> ["plaza", "complex", "mall"])
        st_options = [part.strip() for part in st.split("/") if part.strip()]
        # Also remove generic suffix like "land" when matching permitted_use (e.g. "residential land" -> "residential")
        st_tokens = set(st_options)
        for opt in list(st_options):
            if opt.endswith(" land"):
                st_tokens.add(opt[:-5].strip())
            if opt == "mixed used":
                st_tokens.add("mixed")

        filtered = []
        for i in all_items:
            attrs = i.attributes or {}
            prop_type = str(attrs.get("property_type", "")).lower().replace("_", " ").replace("-", " ")
            comm_type = str(attrs.get("commercial_type", "")).lower().replace("_", " ").replace("-", " ")
            perm_use = str(attrs.get("permitted_use", "")).lower().replace("_", " ").replace("-", " ")
            intended_use = str(attrs.get("intended_use", "")).lower().replace("_", " ").replace("-", " ")
            title = (i.title or "").lower().replace("_", " ").replace("-", " ")
            desc = (i.description or "").lower().replace("_", " ").replace("-", " ")
            
            matched = False
            for tok in st_tokens:
                if not tok:
                    continue
                if (
                    tok in prop_type or (prop_type and prop_type in tok) or
                    tok in comm_type or (comm_type and comm_type in tok) or
                    tok in perm_use or (perm_use and perm_use in tok) or
                    tok in intended_use or
                    tok in title or
                    tok in desc
                ):
                    matched = True
                    break
            if matched:
                filtered.append(i)
        all_items = filtered

    # 3. Vehicle Condition filtering (Brand New, Fairly Used/Foreign Used/Tokunbo, Nigerian Used)
    if condition and condition.strip() and condition.lower() != "all":
        c_norm = condition.lower().strip()
        filtered = []
        for i in all_items:
            cond = str((i.attributes or {}).get("condition", "")).lower().strip()
            title = (i.title or "").lower()
            if "new" in c_norm and ("new" in cond or "brand new" in title):
                filtered.append(i)
            elif ("foreign" in c_norm or "fairly" in c_norm or "tokunbo" in c_norm) and ("foreign" in cond or "pre-owned" in cond or "fairly" in cond or "foreign" in title):
                filtered.append(i)
            elif "nigerian" in c_norm and ("nigerian" in cond or "local" in cond or "nigerian" in title):
                filtered.append(i)
            elif c_norm in cond or cond in c_norm:
                filtered.append(i)
        all_items = filtered

    # 4. Vehicle Brand / Make
    if brand and brand.strip() and brand.lower() != "all":
        b_norm = brand.lower().strip()
        all_items = [
            i for i in all_items
            if b_norm in str((i.attributes or {}).get("brand", "")).lower()
            or b_norm in (i.title or "").lower()
        ]

    # 5. Vehicle Model
    if model and model.strip():
        m_norm = model.lower().strip()
        all_items = [
            i for i in all_items
            if m_norm in str((i.attributes or {}).get("model", "")).lower()
            or m_norm in (i.title or "").lower()
        ]

    # 6. Vehicle Year
    if year is not None:
        all_items = [
            i for i in all_items
            if (i.attributes or {}).get("year") == year
            or str(year) in (i.title or "")
        ]

    # 7. Bedrooms
    if bedrooms is not None:
        all_items = [
            i for i in all_items
            if (i.attributes or {}).get("bedrooms") == bedrooms
            or ((i.attributes or {}).get("bedrooms", 0) >= bedrooms if bedrooms >= 5 else False)
        ]
    
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
    stmt = select(Listing).where(Listing.user_id == current_user.id).options(selectinload(Listing.owner)).order_by(desc(Listing.created_at))
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.get("/{listing_id}", response_model=ResponseModel[ListingResponse])
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Listing).where(Listing.id == listing_id).options(selectinload(Listing.owner))
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

    if listing_in.status == ListingStatus.PUBLISHED and listing.status != ListingStatus.PUBLISHED:
        can_pub, reason, _ = await SubscriptionService.can_publish_listing(db, current_user.id)
        if not can_pub:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=reason)

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

class ReportListingRequest(BaseModel):
    reason: str
    details: Optional[str] = None

@router.post("/{listing_id}/report", response_model=ResponseModel[dict])
async def report_listing(
    listing_id: int,
    report: ReportListingRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mandatory Apple Guideline 1.2 User Generated Content reporting mechanism.
    Flags listing for administrator review and removal within 24 hours.
    """
    stmt = select(Listing).where(Listing.id == listing_id)
    res = await db.execute(stmt)
    listing = res.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    # Flag listing attributes
    attrs = dict(listing.attributes or {})
    attrs["reported"] = True
    attrs["report_reason"] = report.reason
    attrs["report_details"] = report.details
    attrs["reported_at"] = datetime.now(timezone.utc).isoformat()
    if current_user:
        attrs["reported_by_user_id"] = current_user.id
    listing.attributes = attrs

    await db.commit()
    return ResponseModel(
        message="Thank you for reporting this listing. Our safety and moderation team will review it within 24 hours and remove any objectionable or fraudulent material.",
        data={"listing_id": listing_id, "status": "REPORTED", "reason": report.reason}
    )
