import pytest
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from httpx import AsyncClient

from app.models.enums import TransactionType, AssetCategory, RentalPeriod, ListingStatus
from app.services.matching_engine import MatchingEngine
from app.services.search_service import SearchService
from app.services.booking_service import BookingService
from app.models.listing import Listing
from app.models.requirement import Requirement
from app.models.user import User
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_transaction_separation_in_matching(db_session):
    """
    CRITICAL MARKETPLACE RULE:
    - SALE buyer requirements must NEVER match RENT or LEASE listings.
    - RENT seeker requirements must NEVER match SALE listings.
    """
    # 1. Create a user
    user1 = User(
        email="owner1@test.com",
        first_name="Owner",
        last_name="One",
        hashed_password=get_password_hash("Secret123!"),
        roles=["seller", "landlord"]
    )
    user2 = User(
        email="buyer1@test.com",
        first_name="Buyer",
        last_name="Two",
        hashed_password=get_password_hash("Secret123!"),
        roles=["buyer", "tenant"]
    )
    db_session.add_all([user1, user2])
    await db_session.commit()
    await db_session.refresh(user1)
    await db_session.refresh(user2)

    # 2. Create a SALE listing: House for sale in Lekki
    sale_listing = Listing(
        user_id=user1.id,
        transaction_type=TransactionType.SALE,
        asset_category=AssetCategory.RESIDENTIAL,
        status=ListingStatus.PUBLISHED,
        title="4 Bedroom Terrace for Sale in Lekki",
        description="Brand new terrace duplex for outright purchase",
        price=Decimal("95000000.00"),
        country="Nigeria",
        state="Lagos",
        city="Lagos",
        neighbourhood="Lekki Phase 1",
        attributes={"bedrooms": 4, "bathrooms": 4}
    )

    # 3. Create a RENT listing: Apartment for rent in Lekki
    rent_listing = Listing(
        user_id=user1.id,
        transaction_type=TransactionType.RENT,
        asset_category=AssetCategory.RESIDENTIAL,
        status=ListingStatus.PUBLISHED,
        title="4 Bedroom Duplex for Rent in Lekki",
        description="Annual rental duplex",
        price=Decimal("8000000.00"),
        rental_period=RentalPeriod.PER_YEAR,
        country="Nigeria",
        state="Lagos",
        city="Lagos",
        neighbourhood="Lekki Phase 1",
        attributes={"bedrooms": 4, "bathrooms": 4}
    )
    db_session.add_all([sale_listing, rent_listing])
    await db_session.commit()
    await db_session.refresh(sale_listing)
    await db_session.refresh(rent_listing)

    # 4. Requirement A: Buyer looking to BUY a house in Lekki (SALE)
    buy_req = Requirement(
        user_id=user2.id,
        transaction_type=TransactionType.SALE,
        asset_category=AssetCategory.RESIDENTIAL,
        title="Looking to buy a 4-bedroom house in Lekki",
        min_budget=Decimal("80000000.00"),
        max_budget=Decimal("110000000.00"),
        preferred_country="Nigeria",
        preferred_state="Lagos",
        preferred_city="Lagos",
        preferred_neighbourhoods=["Lekki Phase 1"],
        criteria={"min_bedrooms": 4}
    )
    db_session.add(buy_req)
    await db_session.commit()
    await db_session.refresh(buy_req)

    # Execute matching
    matches_for_buyer = await MatchingEngine.match_requirement_to_listings(db_session, buy_req)

    # VERIFICATION:
    # 1. Matches must NOT be empty
    assert len(matches_for_buyer) >= 1
    # 2. Every single match MUST be a SALE listing, NEVER a RENT listing!
    for m in matches_for_buyer:
        assert m.listing.transaction_type == TransactionType.SALE
        assert m.listing.id == sale_listing.id
        assert m.listing.id != rent_listing.id
        assert m.compatibility_score >= 80.0
        assert "compatibility score" in m.explanation.lower()

@pytest.mark.asyncio
async def test_anti_double_booking_prevention(db_session):
    """
    CRITICAL AVAILABILITY RULE:
    - Prevent two confirmed bookings from occupying the same asset for overlapping dates.
    """
    user1 = User(
        email="host@test.com",
        first_name="Host",
        last_name="User",
        hashed_password=get_password_hash("Secret123!")
    )
    user2 = User(
        email="guest1@test.com",
        first_name="Guest",
        last_name="One",
        hashed_password=get_password_hash("Secret123!")
    )
    user3 = User(
        email="guest2@test.com",
        first_name="Guest",
        last_name="Two",
        hashed_password=get_password_hash("Secret123!")
    )
    db_session.add_all([user1, user2, user3])
    await db_session.commit()
    await db_session.refresh(user1)
    await db_session.refresh(user2)
    await db_session.refresh(user3)

    # Create short-let listing
    listing = Listing(
        user_id=user1.id,
        transaction_type=TransactionType.RENT,
        asset_category=AssetCategory.RESIDENTIAL,
        status=ListingStatus.PUBLISHED,
        title="Luxury Lekki Short-let Apartment",
        description="Nightly serviced short-let",
        price=Decimal("50000.00"),
        rental_period=RentalPeriod.PER_NIGHT,
        country="Nigeria",
        state="Lagos",
        city="Lagos"
    )
    db_session.add(listing)
    await db_session.commit()
    await db_session.refresh(listing)

    now = datetime.now(timezone.utc)
    day_1 = now + timedelta(days=2)
    day_5 = now + timedelta(days=6)

    # 1. Guest 1 books from day 2 to day 6
    booking1 = await BookingService.create_booking_request(
        db=db_session,
        renter_id=user2.id,
        listing_id=listing.id,
        start_date=day_1,
        end_date=day_5
    )
    assert booking1.id is not None

    # 2. Guest 2 tries to book overlapping dates: day 3 to day 7
    day_3 = now + timedelta(days=4)
    day_7 = now + timedelta(days=8)

    # Availability check should return False
    is_available = await BookingService.is_asset_available(db_session, listing.id, day_3, day_7)
    assert is_available is False

@pytest.mark.asyncio
def test_nlp_search_intent_parsing():
    """
    CRITICAL NLP DISCOVERY RULE:
    - Extracts transaction_type, asset_category, city, budget from human query.
    """
    query1 = "Find a three-bedroom house in Abuja below 80 million"
    parsed1 = SearchService.parse_natural_language_query(query1)
    assert parsed1["transaction_type"] == TransactionType.SALE or parsed1["transaction_type"] is None
    assert parsed1["asset_category"] == AssetCategory.RESIDENTIAL
    assert parsed1["city"] == "Abuja"
    assert parsed1["bedrooms"] == 3
    assert parsed1["max_price"] == 80000000.0

    query2 = "Find a furnished short-let apartment in Lagos for 5 nights under 70k"
    parsed2 = SearchService.parse_natural_language_query(query2)
    assert parsed2["transaction_type"] == TransactionType.RENT
    assert parsed2["rental_period"] == RentalPeriod.PER_NIGHT
    assert parsed2["asset_category"] == AssetCategory.RESIDENTIAL
    assert parsed2["city"] == "Lagos"
    assert parsed2["max_price"] == 70000.0

    query3 = "Show me a Toyota SUV for rent in Ikeja under 150k"
    parsed3 = SearchService.parse_natural_language_query(query3)
    assert parsed3["transaction_type"] == TransactionType.RENT
    assert parsed3["asset_category"] == AssetCategory.VEHICLE
    assert parsed3["city"] == "Ikeja"
    assert parsed3["max_price"] == 150000.0
