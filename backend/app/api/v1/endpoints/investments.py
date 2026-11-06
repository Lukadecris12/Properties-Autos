from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.investment import InvestmentProperty, UserInvestment
from app.schemas.investment import (
    InvestmentCreate,
    InvestmentResponse,
    InvestOrderRequest,
    UserInvestmentResponse
)
from app.schemas.common import ResponseModel

router = APIRouter()

SEED_INVESTMENTS = [
    {
        "developer_name": "Eko Atlantic Horizon Developments Ltd",
        "title": "Eko Atlantic Oceanfront Luxury Towers — Phase II Co-Investment",
        "description": "High-yield commercial and luxury residential real estate development overlooking the Atlantic oceanfront in Victoria Island, Lagos. Fully secured by deed of trust and Governor's Consent with quarterly dividend distributions.",
        "asset_category": "RESIDENTIAL",
        "location": "Eko Atlantic City, Victoria Island, Lagos",
        "target_amount": 750000000.0,
        "raised_amount": 540000000.0,
        "minimum_investment": 1000000.0,
        "projected_roi_percentage": 28.5,
        "tenure_months": 18,
        "dividend_cycle": "Quarterly",
        "investors_count": 64,
        "image_urls": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000"
        ],
        "documents": [{"name": "Investment Prospectus & Deed of Trust", "url": "#"}],
        "status": "active",
        "is_approved": True
    },
    {
        "developer_name": "Highland Urban Infrastructure Consortium",
        "title": "Lekki Smart Green Eco-Estate — Land Banking & Infrastructure Fund",
        "description": "Participate in fractional commercial and residential land development along the booming Lekki-Epe corridor. Capital appreciation plus structured guaranteed buy-back upon project handover.",
        "asset_category": "LAND",
        "location": "Lekki Phase 2 / Alaro City Corridor, Lagos",
        "target_amount": 400000000.0,
        "raised_amount": 290000000.0,
        "minimum_investment": 500000.0,
        "projected_roi_percentage": 34.0,
        "tenure_months": 24,
        "dividend_cycle": "Bi-Annually",
        "investors_count": 82,
        "image_urls": [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000"
        ],
        "documents": [{"name": "Certificate of Occupancy & Master Plan", "url": "#"}],
        "status": "active",
        "is_approved": True
    },
    {
        "developer_name": "Apex Prime Properties & Hospitality",
        "title": "Ikoyi Diplomatic Residences & Serviced Executive Penthouses",
        "description": "Premium short-let luxury suites generating high-frequency dollarized rental returns from expatriate corporations and embassies in Old Ikoyi. Quarterly rental yield payouts directly to investor accounts.",
        "asset_category": "COMMERCIAL",
        "location": "Old Ikoyi Waterfront, Lagos",
        "target_amount": 600000000.0,
        "raised_amount": 480000000.0,
        "minimum_investment": 2000000.0,
        "projected_roi_percentage": 24.0,
        "tenure_months": 12,
        "dividend_cycle": "Quarterly",
        "investors_count": 39,
        "image_urls": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000"
        ],
        "documents": [{"name": "Audited Hospitality Yield Schedule", "url": "#"}],
        "status": "active",
        "is_approved": True
    }
]

async def ensure_seed_investments(db: AsyncSession):
    stmt = select(InvestmentProperty)
    res = await db.execute(stmt)
    if not res.scalars().first():
        for item in SEED_INVESTMENTS:
            obj = InvestmentProperty(**item)
            db.add(obj)
        await db.commit()

@router.get("/", response_model=ResponseModel[List[InvestmentResponse]])
async def list_investments(
    category: Optional[str] = Query(None, description="Filter by asset category"),
    search: Optional[str] = Query(None, description="Search keyword in title/location"),
    db: AsyncSession = Depends(get_db)
):
    """List all open real estate investment opportunities."""
    await ensure_seed_investments(db)

    stmt = select(InvestmentProperty).where(InvestmentProperty.is_approved == True)
    if category:
        stmt = stmt.where(InvestmentProperty.asset_category == category.upper())
    
    result = await db.execute(stmt)
    items = result.scalars().all()

    if search:
        s = search.lower()
        items = [i for i in items if s in i.title.lower() or s in i.location.lower() or s in i.developer_name.lower()]

    return ResponseModel(data=items)

@router.get("/{investment_id}", response_model=ResponseModel[InvestmentResponse])
async def get_investment_detail(investment_id: int, db: AsyncSession = Depends(get_db)):
    """Get detailed information on an investment project."""
    await ensure_seed_investments(db)
    stmt = select(InvestmentProperty).where(InvestmentProperty.id == investment_id)
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Investment opportunity not found")
    return ResponseModel(data=item)

@router.post("/", response_model=ResponseModel[InvestmentResponse], status_code=status.HTTP_201_CREATED)
async def create_investment_opportunity(
    inv_in: InvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Allows verified property developers or admin to list a property for crowd/co-investment."""
    if not (current_user.is_superuser or "developer" in (current_user.roles or []) or current_user.active_mode == "developer"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified Property Developers or Administrators can publish investment opportunities."
        )

    dev_name = current_user.company_name or current_user.full_name or "Verified Developer"

    new_investment = InvestmentProperty(
        developer_id=current_user.id,
        developer_name=dev_name,
        title=inv_in.title,
        description=inv_in.description,
        asset_category=inv_in.asset_category.upper(),
        location=inv_in.location,
        target_amount=inv_in.target_amount,
        raised_amount=0.0,
        minimum_investment=inv_in.minimum_investment,
        projected_roi_percentage=inv_in.projected_roi_percentage,
        tenure_months=inv_in.tenure_months,
        dividend_cycle=inv_in.dividend_cycle,
        image_urls=inv_in.image_urls or ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000"],
        documents=inv_in.documents or [],
        status="active",
        is_approved=True
    )
    db.add(new_investment)
    await db.commit()
    await db.refresh(new_investment)

    return ResponseModel(
        message="Property investment opportunity published successfully.",
        data=new_investment
    )

@router.post("/{investment_id}/invest", response_model=ResponseModel[UserInvestmentResponse])
async def invest_in_property(
    investment_id: int,
    order: InvestOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """User commits an investment amount into a developer's property project."""
    stmt = select(InvestmentProperty).where(InvestmentProperty.id == investment_id)
    inv = (await db.execute(stmt)).scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment opportunity not found")

    if order.amount < inv.minimum_investment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum investment amount is ₦{inv.minimum_investment:,.2f}"
        )

    # Calculate projected total return
    projected_return = order.amount + (order.amount * (inv.projected_roi_percentage / 100.0))

    user_investment = UserInvestment(
        user_id=current_user.id,
        investment_id=inv.id,
        amount_invested=order.amount,
        projected_return=projected_return,
        status="active"
    )
    db.add(user_investment)

    # Update project raised amount and investor count
    inv.raised_amount += order.amount
    inv.investors_count += 1
    if inv.raised_amount >= inv.target_amount:
        inv.status = "fully_funded"

    await db.commit()
    await db.refresh(user_investment)

    return ResponseModel(
        message=f"Successfully invested ₦{order.amount:,.2f} in {inv.title}. Your projected return is ₦{projected_return:,.2f}.",
        data=user_investment
    )

@router.get("/user/my-investments", response_model=ResponseModel[List[UserInvestmentResponse]])
async def get_my_investments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the logged-in user's active investment portfolio."""
    stmt = (
        select(UserInvestment)
        .where(UserInvestment.user_id == current_user.id)
        .options(selectinload(UserInvestment.property))
        .order_by(UserInvestment.invested_at.desc())
    )
    result = await db.execute(stmt)
    investments = result.scalars().all()
    return ResponseModel(data=investments)
