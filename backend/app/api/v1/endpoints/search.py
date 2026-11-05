from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.models.enums import TransactionType, AssetCategory, RentalPeriod
from app.schemas.listing import ListingResponse
from app.schemas.common import PaginatedResponse, ResponseModel
from app.services.search_service import SearchService

router = APIRouter()

class NLPSearchRequest(BaseModel):
    query: str

class NLPSearchResponse(BaseModel):
    parsed_intent: dict
    results: List[ListingResponse]
    total: int

@router.get("/", response_model=PaginatedResponse[ListingResponse])
async def search_listings(
    transaction_type: Optional[TransactionType] = None,
    asset_category: Optional[AssetCategory] = None,
    rental_period: Optional[RentalPeriod] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    keyword: Optional[str] = None,
    bedrooms: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    items, total = await SearchService.search_listings(
        db=db,
        transaction_type=transaction_type,
        asset_category=asset_category,
        rental_period=rental_period,
        state=state,
        city=city,
        min_price=min_price,
        max_price=max_price,
        keyword=keyword,
        bedrooms=bedrooms,
        page=page,
        page_size=page_size
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )

@router.post("/natural-language", response_model=ResponseModel[NLPSearchResponse])
async def natural_language_search(
    req: NLPSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    parsed = SearchService.parse_natural_language_query(req.query)
    
    items, total = await SearchService.search_listings(
        db=db,
        transaction_type=parsed.get("transaction_type"),
        asset_category=parsed.get("asset_category"),
        rental_period=parsed.get("rental_period"),
        city=parsed.get("city"),
        max_price=parsed.get("max_price"),
        bedrooms=parsed.get("bedrooms"),
        page=1,
        page_size=20
    )
    
    return ResponseModel(
        data=NLPSearchResponse(
            parsed_intent=parsed,
            results=items,
            total=total
        )
    )
