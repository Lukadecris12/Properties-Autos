import re
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc

from sqlalchemy.orm import selectinload

from app.models.listing import Listing
from app.models.enums import TransactionType, AssetCategory, ListingStatus, RentalPeriod

class SearchService:
    """
    Search and discovery service supporting multi-criteria filtering,
    geospatial distance sorting, and Natural Language parsing.
    """

    @staticmethod
    def parse_natural_language_query(query_str: str) -> Dict[str, Any]:
        """
        Interprets natural-language queries to extract transaction intent,
        asset category, budget constraints, and locations.
        Examples:
        - 'Find a three-bedroom house in Abuja below 80 million'
        - 'Short-let apartment in Lagos for 5 nights'
        - 'Toyota Camry for rent in Ikeja'
        """
        query_lower = query_str.lower()
        extracted: Dict[str, Any] = {
            "query": query_str,
            "transaction_type": None,
            "asset_category": None,
            "max_price": None,
            "city": None,
            "bedrooms": None,
            "rental_period": None
        }

        # 1. Transaction Type Intent
        if any(w in query_lower for w in ["rent", "lease", "let", "short-let", "night", "monthly"]):
            if "lease" in query_lower:
                extracted["transaction_type"] = TransactionType.LEASE
            else:
                extracted["transaction_type"] = TransactionType.RENT
                if "short-let" in query_lower or "night" in query_lower:
                    extracted["rental_period"] = RentalPeriod.PER_NIGHT
                elif "month" in query_lower:
                    extracted["rental_period"] = RentalPeriod.PER_MONTH
                elif "year" in query_lower or "per annum" in query_lower:
                    extracted["rental_period"] = RentalPeriod.PER_YEAR
        elif any(w in query_lower for w in ["buy", "sale", "purchase", "for sale"]):
            extracted["transaction_type"] = TransactionType.SALE

        # 2. Asset Category Intent
        if any(w in query_lower for w in ["land", "plot", "acre", "hectare"]):
            extracted["asset_category"] = AssetCategory.LAND
        elif any(w in query_lower for w in ["car", "toyota", "lexus", "mercedes", "honda", "suv", "sedan", "vehicle", "truck"]):
            extracted["asset_category"] = AssetCategory.VEHICLE
        elif any(w in query_lower for w in ["office", "warehouse", "shop", "commercial", "factory", "complex"]):
            extracted["asset_category"] = AssetCategory.COMMERCIAL
        elif any(w in query_lower for w in ["house", "apartment", "duplex", "flat", "bedroom", "studio", "bungalow"]):
            extracted["asset_category"] = AssetCategory.RESIDENTIAL

        # 3. Bedrooms extraction
        bed_match = re.search(r'(\d+)\s*[- ]*(bed|bedroom)', query_lower)
        if bed_match:
            extracted["bedrooms"] = int(bed_match.group(1))
        elif "three-bedroom" in query_lower or "3-bedroom" in query_lower:
            extracted["bedrooms"] = 3
        elif "two-bedroom" in query_lower or "2-bedroom" in query_lower:
            extracted["bedrooms"] = 2
        elif "four-bedroom" in query_lower or "4-bedroom" in query_lower:
            extracted["bedrooms"] = 4
        elif "one-bedroom" in query_lower or "1-bedroom" in query_lower:
            extracted["bedrooms"] = 1

        # 4. Location extraction (Nigerian major hubs and global cities)
        common_cities = ["lagos", "abuja", "ibadan", "port harcourt", "lekki", "ikeja", "ikoyi", "kano", "enugu", "asaba", "london", "dubai", "accra"]
        for city in common_cities:
            if city in query_lower:
                extracted["city"] = city.title()
                break

        # 5. Budget extraction (supports million, k, numbers)
        # e.g., below 80 million, under 35 million, under 250k
        millions_match = re.search(r'(?:under|below|less than|max)\s*(?:₦|\$|n)?\s*(\d+(?:\.\d+)?)\s*(?:million|m)', query_lower)
        if millions_match:
            extracted["max_price"] = float(millions_match.group(1)) * 1_000_000
        else:
            k_match = re.search(r'(?:under|below|less than|max)\s*(?:₦|\$|n)?\s*(\d+(?:\.\d+)?)\s*(?:thousand|k)', query_lower)
            if k_match:
                extracted["max_price"] = float(k_match.group(1)) * 1_000

        return extracted

    @staticmethod
    async def search_listings(
        db: AsyncSession,
        transaction_type: Optional[TransactionType] = None,
        asset_category: Optional[AssetCategory] = None,
        rental_period: Optional[RentalPeriod] = None,
        state: Optional[str] = None,
        city: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        keyword: Optional[str] = None,
        bedrooms: Optional[int] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Listing], int]:
        query = select(Listing).options(selectinload(Listing.owner)).where(Listing.status == ListingStatus.PUBLISHED)

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
        if keyword:
            kw = f"%{keyword}%"
            query = query.where(or_(
                Listing.title.ilike(kw),
                Listing.description.ilike(kw),
                Listing.neighbourhood.ilike(kw),
                Listing.city.ilike(kw)
            ))

        # Order by featured first, then newest
        query = query.order_by(desc(Listing.is_featured), desc(Listing.created_at))

        # Execute
        result = await db.execute(query)
        all_items = result.scalars().all()

        # Post-filter on json attributes if bedrooms requested
        if bedrooms is not None:
            filtered = []
            for item in all_items:
                attrs = item.attributes or {}
                if attrs.get("bedrooms") == bedrooms or attrs.get("bedrooms", 0) >= bedrooms:
                    filtered.append(item)
            all_items = filtered

        total = len(all_items)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_items = all_items[start_idx:end_idx]

        return paged_items, total
