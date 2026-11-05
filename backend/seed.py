import asyncio
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy.future import select

from app.core.database import AsyncSessionLocal, async_engine, Base
from app.core.security import get_password_hash
from app.models.enums import (
    TransactionType, AssetCategory, ListingStatus, RentalPeriod, 
    LocationPrivacy, RequirementStatus
)
from app.models.user import User
from app.models.listing import Listing, ListingAvailability
from app.models.requirement import Requirement
from app.services.matching_engine import MatchingEngine

async def seed_data():
    print("Initializing Database tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(User).where(User.email == "admin@propertyhub.ng"))
        if res.scalars().first():
            print("Database already contains seed data. Skipping.")
            return

        print("Seeding initial users...")
        # 1. Super Admin
        admin = User(
            email="admin@propertyhub.ng",
            phone_number="+2348011112222",
            hashed_password=get_password_hash("AdminPass123!"),
            first_name="Babajide",
            last_name="Alabi",
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            roles=["admin", "super_admin", "buyer", "seller", "agent"],
            active_mode="admin",
            is_active=True,
            is_superuser=True,
            is_identity_verified=True,
            is_business_verified=True,
            verification_badge="Platform Administrator"
        )
        db.add(admin)

        # 2. Verified Real Estate Agent / Developer
        agent = User(
            email="agent@apexproperties.ng",
            phone_number="+2348033334444",
            hashed_password=get_password_hash("AgentPass123!"),
            first_name="Chiamaka",
            last_name="Okonkwo",
            country="Nigeria",
            state="Lagos",
            city="Lekki",
            roles=["agent", "seller", "landlord", "buyer"],
            active_mode="agent",
            is_active=True,
            is_identity_verified=True,
            is_business_verified=True,
            verification_badge="Trusted Agent"
        )
        db.add(agent)

        # 3. Automobile Dealer & Fleet Operator
        dealer = User(
            email="dealer@autoworx.ng",
            phone_number="+2348055556666",
            hashed_password=get_password_hash("DealerPass123!"),
            first_name="Tunde",
            last_name="Balogun",
            country="Nigeria",
            state="Lagos",
            city="Ikeja",
            roles=["dealer", "rental_company", "seller"],
            active_mode="dealer",
            is_active=True,
            is_identity_verified=True,
            is_business_verified=True,
            verification_badge="Verified Automobile Dealer"
        )
        db.add(dealer)

        # 4. Buyer / Tenant / Renter
        buyer = User(
            email="seeker@gmail.com",
            phone_number="+2348077778888",
            hashed_password=get_password_hash("SeekerPass123!"),
            first_name="Emeka",
            last_name="Nnamdi",
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            roles=["buyer", "tenant", "renter"],
            active_mode="buyer",
            is_active=True,
            is_identity_verified=True,
            verification_badge="Identity Verified"
        )
        db.add(buyer)

        await db.commit()
        await db.refresh(agent)
        await db.refresh(dealer)
        await db.refresh(buyer)

        print("Seeding premium marketplace listings...")
        listings = []

        # 1. Land for SALE in Lekki Phase 1
        listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="Prime 1,000 sqm Dry Residential Land with Governor's Consent",
            slug="prime-1000-sqm-dry-residential-land-lekki-1",
            description="Rare corner-piece residential plot in a gated, fully developed estate. Dry ground with direct tarred road access, central drainage, and 24/7 security. Ready for immediate development.",
            price=Decimal("180000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Lekki Phase 1",
            address="Admiralty Way, Lekki Phase 1",
            latitude=6.4474,
            longitude=3.4731,
            attributes={
                "land_size": 1000,
                "land_unit": "sqm",
                "permitted_use": "Residential",
                "title_document": "Governors Consent",
                "topography": "Dry Table Land",
                "road_access": "Tarred Road",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800", "caption": "Aerial view of plot", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2. Luxury House for SALE in Ikoyi
        listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Contemporary 5-Bedroom Fully Detached Luxury Duplex with Pool & BQ",
            slug="contemporary-5-bedroom-fully-detached-luxury-duplex-ikoyi",
            description="Architectural masterpiece featuring smart automation, private swimming pool, Italian fitted kitchen, cinema room, elevator, and 2-room staff quarters. Located in high-security Old Ikoyi.",
            price=Decimal("650000000.00"),
            currency="NGN",
            is_negotiable=False,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ikoyi",
            address="Alexander Road, Old Ikoyi",
            latitude=6.4520,
            longitude=3.4350,
            attributes={
                "property_type": "detached_duplex",
                "bedrooms": 5,
                "bathrooms": 6,
                "toilets": 7,
                "parking_spaces": 5,
                "building_size": 650,
                "furnishing_status": "semi_furnished",
                "condition": "newly_built",
                "amenities": ["Swimming Pool", "Private Elevator", "Cinema Room", "Smart Home Automation", "Gym", "Fitted Kitchen", "CCTV", "24/7 Power"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "caption": "Front exterior", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "caption": "Living area", "is_cover": False}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3. Serviced Apartment for RENT in Victoria Island
        listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Luxury 3-Bedroom Serviced Apartment with Ocean View",
            slug="luxury-3-bedroom-serviced-apartment-ocean-view-vi",
            description="Exquisitely finished luxury apartment offering panoramic ocean views. Fully serviced with round-the-clock power, dedicated facility management, Olympic pool, and gym.",
            price=Decimal("12000000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_YEAR,
            security_deposit=Decimal("1200000.00"),
            service_charge=Decimal("2500000.00"),
            agency_fee=Decimal("1200000.00"),
            legal_fee=Decimal("600000.00"),
            min_rental_duration=12,
            max_rental_duration=36,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Victoria Island",
            address="Ahmadu Bello Way, Victoria Island",
            latitude=6.4281,
            longitude=3.4219,
            attributes={
                "property_type": "apartment",
                "bedrooms": 3,
                "bathrooms": 3,
                "toilets": 4,
                "parking_spaces": 2,
                "furnishing_status": "furnished",
                "amenities": ["24/7 Electricity", "Ocean View", "Gym", "Swimming Pool", "High Speed Elevator", "Security"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "caption": "Apartment view", "is_cover": True}
            ],
            is_featured=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 4. Short-let Serviced Studio for RENT in Lekki
        listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Modern Minimalist 1-Bedroom Short-let Apartment (24/7 Power & WiFi)",
            slug="modern-minimalist-1-bedroom-shortlet-lekki",
            description="Perfect for business travelers, vacationers, and romantic getaways. High-speed fiber internet, Netflix, smart locks, daily housekeeping, and 24/7 electricity.",
            price=Decimal("65000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_NIGHT,
            security_deposit=Decimal("30000.00"),
            min_rental_duration=2,
            max_rental_duration=30,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Lekki Phase 1",
            address="Fola Osibo, Lekki Phase 1",
            latitude=6.4490,
            longitude=3.4750,
            attributes={
                "property_type": "short_let",
                "bedrooms": 1,
                "bathrooms": 1,
                "furnishing_status": "fully_furnished",
                "guest_capacity": 2,
                "amenities": ["24/7 Light", "Fast WiFi", "Smart TV", "Equipped Kitchenette", "Housekeeping", "Security"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "caption": "Living room", "is_cover": True}
            ],
            is_featured=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 5. Commercial Warehouse for LEASE in Ikeja
        listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.LEASE,
            asset_category=AssetCategory.COMMERCIAL,
            status=ListingStatus.PUBLISHED,
            title="2,500 sqm Industrial Warehouse with High Clearance and Loading Docks",
            slug="2500-sqm-industrial-warehouse-ikeja",
            description="Heavy-duty warehouse facility inside Ikeja Industrial Scheme. Features 12m roof clearance, 4 hydraulic container loading bays, 3-phase industrial power substation, and administrative office annex.",
            price=Decimal("25000000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_YEAR,
            min_rental_duration=24,
            max_rental_duration=60,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ikeja Industrial Estate",
            address="Acme Road, Ogba / Ikeja",
            latitude=6.6180,
            longitude=3.3370,
            attributes={
                "commercial_type": "warehouse",
                "floor_area": 2500,
                "total_floors": 1,
                "loading_docks": 4,
                "power_substation": True,
                "intended_use": "Storage, Logistics, Light Manufacturing"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800", "caption": "Warehouse Interior", "is_cover": True}
            ],
            published_at=datetime.now(timezone.utc)
        ))

        # 6. Automobile for SALE (Toyota Land Cruiser Prado TX-L 2022)
        listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2022 Toyota Land Cruiser Prado TX-L (Foreign Used, Pristine)",
            slug="2022-toyota-land-cruiser-prado-tx-l",
            description="Spotless condition with complete customs duty papers. 2.7L Petrol, automatic transmission, pearl white exterior, black leather interior, 3-row seating, reverse camera, keyless push-to-start.",
            price=Decimal("78000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ikeja GRA",
            address="Isaac John Street, Ikeja GRA",
            latitude=6.5880,
            longitude=3.3570,
            attributes={
                "vehicle_type": "suv",
                "brand": "Toyota",
                "model": "Land Cruiser Prado TX-L",
                "year": 2022,
                "mileage": 24000,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Foreign Used",
                "color": "Pearl White"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", "caption": "SUV Front Angle", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 7. Automobile for RENT (Mercedes-Benz GLE 450 2023)
        listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Mercedes-Benz GLE 450 4MATIC Luxury SUV (Chauffeur-Driven)",
            slug="2023-mercedes-benz-gle-450-luxury-rental",
            description="Experience ultimate luxury mobility. Available for VIP airport protocol, corporate meetings, weddings, and executive interstate transport. Includes professional uniformed chauffeur.",
            price=Decimal("120000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_DAY,
            security_deposit=Decimal("50000.00"),
            min_rental_duration=1,
            max_rental_duration=30,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Victoria Island",
            address="Ozumba Mbadiwe, Victoria Island",
            latitude=6.4310,
            longitude=3.4150,
            attributes={
                "vehicle_type": "luxury_suv",
                "brand": "Mercedes-Benz",
                "model": "GLE 450",
                "year": 2023,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "rental_service_type": "chauffeur_driven",
                "pickup_options": "both"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", "caption": "Mercedes-Benz Luxury", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        for l in listings:
            db.add(l)
        await db.commit()

        print("Seeding active user requirements to demonstrate AI matching...")
        reqs = []

        # Req 1: Seeking 3-bedroom apartment for RENT in VI/Lekki
        reqs.append(Requirement(
            user_id=buyer.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.RESIDENTIAL,
            status=RequirementStatus.ACTIVE,
            title="Seeking Luxury 3-Bedroom Serviced Apartment in Victoria Island or Lekki",
            description="Looking for an executive serviced apartment with reliable 24/7 electricity, gym, and security for a 1-year corporate lease.",
            min_budget=Decimal("10000000.00"),
            max_budget=Decimal("15000000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_YEAR,
            desired_duration=12,
            preferred_country="Nigeria",
            preferred_state="Lagos",
            preferred_city="Lagos",
            preferred_neighbourhoods=["Victoria Island", "Lekki Phase 1"],
            criteria={
                "min_bedrooms": 3,
                "min_bathrooms": 3,
                "furnishing": "furnished"
            }
        ))

        # Req 2: Seeking Luxury SUV to RENT
        reqs.append(Requirement(
            user_id=buyer.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.VEHICLE,
            status=RequirementStatus.ACTIVE,
            title="Require Chauffeur-driven Mercedes or Luxury SUV for 3 Days in Lagos",
            description="Need an executive SUV with a seasoned driver for international delegate visits around Victoria Island and Ikoyi.",
            min_budget=Decimal("100000.00"),
            max_budget=Decimal("150000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_DAY,
            desired_duration=3,
            preferred_country="Nigeria",
            preferred_state="Lagos",
            preferred_city="Lagos",
            preferred_neighbourhoods=["Victoria Island", "Ikoyi"],
            criteria={
                "brand": "Mercedes-Benz",
                "rental_service_type": "chauffeur_driven"
            }
        ))

        for r in reqs:
            db.add(r)
        await db.commit()

        # Trigger Bidirectional Matching
        print("Executing bidirectional AI matching engine across seeded items...")
        for r in reqs:
            await db.refresh(r)
            matches = await MatchingEngine.match_requirement_to_listings(db, r)
            print(f"Generated {len(matches)} AI matches for requirement: '{r.title}'")

        print("Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
