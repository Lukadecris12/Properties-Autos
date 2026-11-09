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
        print("Checking/Seeding initial users...")
        
        # 1. Super Admin
        admin_res = await db.execute(select(User).where(User.email == "admin@propertyhub.ng"))
        admin = admin_res.scalars().first()
        if not admin:
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
        agent_res = await db.execute(select(User).where(User.email == "agent@apexproperties.ng"))
        agent = agent_res.scalars().first()
        if not agent:
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
        dealer_res = await db.execute(select(User).where(User.email == "dealer@autoworx.ng"))
        dealer = dealer_res.scalars().first()
        if not dealer:
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
        buyer_res = await db.execute(select(User).where(User.email == "seeker@gmail.com"))
        buyer = buyer_res.scalars().first()
        if not buyer:
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
        if admin: await db.refresh(admin)
        if agent: await db.refresh(agent)
        if dealer: await db.refresh(dealer)
        if buyer: await db.refresh(buyer)

        print("Seeding marketplace listings (Houses & Apartments, Land, Cars & Automobiles)...")
        raw_listings = []

        # =========================================================================
        # PART 1: HOUSES AND APARTMENTS (RESIDENTIAL) - 13 Total (3 base + 10 new)
        # =========================================================================

        # 1.1 Duplex in Old Ikoyi (SALE)
        raw_listings.append(Listing(
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

        # 1.2 Serviced Apartment in Victoria Island (RENT - YEARLY)
        raw_listings.append(Listing(
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

        # 1.3 Minimalist Studio Short-let in Lekki Phase 1 (RENT - NIGHTLY)
        raw_listings.append(Listing(
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

        # 1.4 Waterfront Terrace Duplex with Jetty - Banana Island (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Waterfront 4-Bedroom Luxury Terrace Duplex with Private Jetty",
            slug="waterfront-4-bed-terrace-banana-island",
            description="Rare waterfront terrace duplex in ultra-exclusive Banana Island. Features private boat slip, floor-to-ceiling soundproof glass, imported marble floors, designer kitchen, and private deck overlooking the Lagos Lagoon.",
            price=Decimal("420000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Banana Island, Ikoyi",
            address="Zone A, Banana Island, Ikoyi",
            latitude=6.4632,
            longitude=3.4475,
            attributes={
                "property_type": "terrace_duplex",
                "bedrooms": 4,
                "bathrooms": 4,
                "toilets": 5,
                "parking_spaces": 3,
                "building_size": 420,
                "furnishing_status": "semi_furnished",
                "condition": "newly_built",
                "amenities": ["Waterfront Access", "Private Boat Slip", "Swimming Pool", "24/7 Power", "Smart Security", "Fitted Kitchen", "Staff Quarters"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "caption": "Waterfront Frontage", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "caption": "Spacious Living Room", "is_cover": False}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.5 Smart Villa with Infinity Pool - Maitama, Abuja (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Ultra-Modern 5-Bedroom Smart Villa with Infinity Pool & Cinema",
            slug="ultra-modern-5-bed-smart-villa-maitama",
            description="Exquisite contemporary masterpiece in prime Maitama hills. Features integrated Control4 automation, rooftop cocktail deck, private Dolby Atmos cinema, heated infinity pool, and high-security perimeter.",
            price=Decimal("850000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Maitama",
            address="Gana Street Hilltop, Maitama",
            latitude=9.0882,
            longitude=7.4983,
            attributes={
                "property_type": "mansion",
                "bedrooms": 5,
                "bathrooms": 6,
                "toilets": 7,
                "parking_spaces": 6,
                "building_size": 750,
                "furnishing_status": "semi_furnished",
                "condition": "newly_built",
                "amenities": ["Infinity Pool", "Private Cinema", "Elevator", "Rooftop Lounge", "Smart Home Automation", "Solar Inverter System", "CCTV"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800", "caption": "Villa Exterior", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800", "caption": "Luxury Interior", "is_cover": False}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.6 Furnished Penthouse with Skyline Views - Victoria Island (RENT - YEARLY)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Executive 2-Bedroom Furnished Penthouse with Panoramic City Skyline Views",
            slug="executive-2-bed-penthouse-ocean-skyline-vi",
            description="Top-floor luxury penthouse with expansive wraparound balcony offering uninterrupted 360-degree views of Victoria Island and the Atlantic Ocean. Complete concierge, valet, and high-speed fiber.",
            price=Decimal("18000000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_YEAR,
            security_deposit=Decimal("1800000.00"),
            service_charge=Decimal("3000000.00"),
            min_rental_duration=12,
            max_rental_duration=24,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Victoria Island",
            address="Adeola Odeku Street, Victoria Island",
            latitude=6.4285,
            longitude=3.4241,
            attributes={
                "property_type": "penthouse",
                "bedrooms": 2,
                "bathrooms": 2,
                "toilets": 3,
                "parking_spaces": 2,
                "building_size": 220,
                "furnishing_status": "furnished",
                "condition": "newly_built",
                "amenities": ["Rooftop Terrace", "Panoramic Skyline Views", "24/7 Power", "Gym", "Concierge Service", "High Speed Elevator"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "caption": "Penthouse Living Area", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "caption": "Skyline Balcony", "is_cover": False}
            ],
            is_featured=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.7 Ambassadorial Mansion on 1,500 sqm Grounds - Asokoro, Abuja (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Magnificent 6-Bedroom Ambassadorial Mansion on 1,500 sqm Grounds",
            slug="magnificent-6-bed-mansion-grounds-asokoro",
            description="Sublime diplomatic residence situated in the high-security Asokoro diplomatic zone. Expansive landscaped lawns, Olympic-size pool, detached dual-unit staff quarters, bulletproof doors, and private banquet room.",
            price=Decimal("1200000000.00"),
            currency="NGN",
            is_negotiable=False,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Asokoro",
            address="Nelson Mandela Street, Asokoro",
            latitude=9.0435,
            longitude=7.5312,
            attributes={
                "property_type": "mansion",
                "bedrooms": 6,
                "bathrooms": 7,
                "toilets": 8,
                "parking_spaces": 8,
                "building_size": 1100,
                "furnishing_status": "semi_furnished",
                "condition": "newly_built",
                "amenities": ["Olympic Swimming Pool", "Security Gatehouse", "Dual BQ Quarters", "Private Banquet Hall", "Smart CCTV", "Lush Landscaped Garden"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "caption": "Palatial Residence", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800", "caption": "Grand Foyer", "is_cover": False}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.8 Semi-Detached Duplex with BQ - Lekki Phase 1 (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Contemporary 4-Bedroom Semi-Detached Duplex with BQ",
            slug="contemporary-4-bed-semi-detached-duplex-lekki",
            description="Crisp modern styling in a quiet gated street off Freedom Way. Boasts fully-fitted chef kitchen with heat extractor, stamp-concrete parking, surround audio, and expansive master suite.",
            price=Decimal("260000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Lekki Phase 1",
            address="Off Freedom Way, Lekki Phase 1",
            latitude=6.4512,
            longitude=3.4791,
            attributes={
                "property_type": "semi_detached_duplex",
                "bedrooms": 4,
                "bathrooms": 4,
                "toilets": 5,
                "parking_spaces": 3,
                "building_size": 380,
                "furnishing_status": "unfurnished",
                "condition": "newly_built",
                "amenities": ["Fitted Kitchen", "Stamp Concrete Floor", "CCTV", "Bluetooth Ceiling Speakers", "Walk-in Closets", "Family Lounge"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800", "caption": "Duplex Facade", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", "caption": "Gourmet Kitchen", "is_cover": False}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.9 Serviced 3-Bedroom Apartment - Ikeja GRA (RENT - YEARLY)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Fully Serviced 3-Bedroom Luxury Apartment in Gated Residential Estate",
            slug="serviced-3-bed-luxury-apartment-ikeja-gra",
            description="Quiet, serene upscale living in Ikeja GRA. Features central treated water, dedicated transformer with 24/7 generator backup, Olympic pool, gym, and designated parking.",
            price=Decimal("8500000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_YEAR,
            security_deposit=Decimal("850000.00"),
            service_charge=Decimal("1500000.00"),
            min_rental_duration=12,
            max_rental_duration=24,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ikeja GRA",
            address="Joel Ogunnaike Street, Ikeja GRA",
            latitude=6.5910,
            longitude=3.3540,
            attributes={
                "property_type": "apartment",
                "bedrooms": 3,
                "bathrooms": 3,
                "toilets": 4,
                "parking_spaces": 2,
                "building_size": 210,
                "furnishing_status": "semi_furnished",
                "condition": "newly_built",
                "amenities": ["24/7 Power", "Swimming Pool", "Gym", "Fitted Kitchen", "Clean Borehole Water", "Uniformed Guards"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "caption": "Estate View", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800", "caption": "Interior Hall", "is_cover": False}
            ],
            is_featured=False,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.10 Designer Short-Let Studio - Victoria Island (RENT - NIGHTLY)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Luxury 1-Bedroom Designer Short-Let Studio with City Views & Pool",
            slug="designer-1-bed-shortlet-studio-vi",
            description="Ultra-chic short-let studio designed for comfort and productivity. Equipped with ultra-fast Starlink Wi-Fi, 65-inch 4K OLED TV with streaming, workstation, and access to infinity pool.",
            price=Decimal("75000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_NIGHT,
            security_deposit=Decimal("30000.00"),
            min_rental_duration=1,
            max_rental_duration=60,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Victoria Island",
            address="Sanusi Fafunwa, Victoria Island",
            latitude=6.4320,
            longitude=3.4280,
            attributes={
                "property_type": "short_let",
                "bedrooms": 1,
                "bathrooms": 1,
                "toilets": 1,
                "parking_spaces": 1,
                "building_size": 65,
                "furnishing_status": "fully_furnished",
                "condition": "newly_built",
                "amenities": ["Fast Starlink WiFi", "Smart TV with Netflix", "24/7 Uninterrupted Power", "Infinity Pool Access", "Equipped Kitchenette", "Daily Housekeeping"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "caption": "Studio Layout", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "caption": "Lounge Area", "is_cover": False}
            ],
            is_featured=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.11 Modern 4-Bedroom Duplex with Rooftop - Guzape, Abuja (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Stunning 4-Bedroom Modern Duplex with Private Garden & Rooftop Deck",
            slug="modern-4-bed-duplex-rooftop-guzape",
            description="Perched in the picturesque hills of Guzape, Abuja. Features expansive private garden, ambient outdoor lighting, fully fitted Italian kitchen, and rooftop entertainment lounge.",
            price=Decimal("380000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Guzape",
            address="Diplomatic Zone Extension, Guzape",
            latitude=9.0321,
            longitude=7.5189,
            attributes={
                "property_type": "detached_duplex",
                "bedrooms": 4,
                "bathrooms": 4,
                "toilets": 5,
                "parking_spaces": 4,
                "building_size": 450,
                "furnishing_status": "semi_furnished",
                "condition": "newly_built",
                "amenities": ["Rooftop Lounge", "Private Garden", "Smart Lighting", "Fully Fitted Italian Kitchen", "Automated Gate", "CCTV"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "caption": "Modern Duplex Exterior", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800", "caption": "Living & Dining", "is_cover": False}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.12 Waterfront Townhouse - Lekki Phase 1 (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="Elegant 3-Bedroom Waterfront Townhouse with Private Balconies",
            slug="elegant-3-bed-waterfront-townhouse-lekki",
            description="Prime waterfront townhouse in secure enclave of Lekki Phase 1. Enjoy soothing coastal breeze, modern open layout, private ensuite bedrooms, and community pool.",
            price=Decimal("195000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Lekki Phase 1",
            address="Wole Olateju Crescent, Lekki 1",
            latitude=6.4420,
            longitude=3.4810,
            attributes={
                "property_type": "terrace_duplex",
                "bedrooms": 3,
                "bathrooms": 3,
                "toilets": 4,
                "parking_spaces": 2,
                "building_size": 300,
                "furnishing_status": "unfurnished",
                "condition": "newly_built",
                "amenities": ["Waterfront View", "24/7 Security", "Central Treated Water", "Modern Kitchen", "Balcony"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "caption": "Townhouse Exterior", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800", "caption": "Master Suite", "is_cover": False}
            ],
            is_featured=False,
            published_at=datetime.now(timezone.utc)
        ))

        # 1.13 High-End Serviced Apartment in Ocean Parade - Banana Island (RENT - YEARLY)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.RESIDENTIAL,
            status=ListingStatus.PUBLISHED,
            title="High-End 2-Bedroom Serviced Apartment in Ocean Parade Towers",
            slug="high-end-2-bed-ocean-parade-banana-island",
            description="Ultra-prestigious serviced 2-bedroom home in Banana Island's most sought after tower development. Unmatched recreational facilities including clubhouse, tennis courts, and private jetty.",
            price=Decimal("16000000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_YEAR,
            security_deposit=Decimal("1600000.00"),
            service_charge=Decimal("3500000.00"),
            min_rental_duration=12,
            max_rental_duration=36,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Banana Island, Ikoyi",
            address="Ocean Parade Towers, Banana Island",
            latitude=6.4670,
            longitude=3.4410,
            attributes={
                "property_type": "apartment",
                "bedrooms": 2,
                "bathrooms": 2,
                "toilets": 3,
                "parking_spaces": 2,
                "building_size": 190,
                "furnishing_status": "furnished",
                "condition": "newly_built",
                "amenities": ["Olympic Sized Pool", "Tennis Court", "Clubhouse", "24/7 Power", "World Class Gym", "Squash Court"]
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "caption": "Tower Living Room", "is_cover": True},
                {"url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "caption": "Balcony Lagoon View", "is_cover": False}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # =========================================================================
        # PART 2: LAND - 11 Total (1 base + 10 new)
        # =========================================================================

        # 2.1 Lekki Phase 1 Residential Land (SALE)
        raw_listings.append(Listing(
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

        # 2.2 2,000 sqm Waterfront Commercial Plot - Ibeju-Lekki (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="2,000 sqm Waterfront Commercial Plot along Lekki-Epe Expressway",
            slug="2000-sqm-waterfront-commercial-plot-ibeju-lekki",
            description="Strategic commercial plot facing expressway and adjoining coastal water. Ideal for commercial plaza, resort hotel, filling station, or corporate logistics hub with high capital appreciation potential.",
            price=Decimal("95000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ibeju-Lekki",
            address="Km 44 Lekki-Epe Expressway, Eleko Junction",
            latitude=6.4712,
            longitude=3.7540,
            attributes={
                "land_size": 2000,
                "land_unit": "sqm",
                "permitted_use": "Commercial / Mixed-Use",
                "title_document": "Governor's Consent",
                "topography": "100% Dry Table Land",
                "road_access": "Expressway Frontage",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800", "caption": "Commercial Plot Frontage", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.3 600 sqm Dry Residential Plot in Diplomatic Golf Estate - Guzape, Abuja (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="600 sqm Dry Residential Plot in Gated Diplomatic Golf Estate",
            slug="600-sqm-dry-residential-plot-golf-estate-guzape",
            description="Prime residential plot located inside an exclusive hillside estate overlooking Guzape valley. Fully serviced with underground electricity ducts, paved roads, and streetlights.",
            price=Decimal("75000000.00"),
            currency="NGN",
            is_negotiable=False,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Guzape",
            address="Hillview Crest, Guzape District",
            latitude=9.0289,
            longitude=7.5210,
            attributes={
                "land_size": 600,
                "land_unit": "sqm",
                "permitted_use": "Residential",
                "title_document": "Certificate of Occupancy (C of O)",
                "topography": "Dry Table Land",
                "road_access": "Tarred Road",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1500076656116-592718166524?w=800", "caption": "Estate Plot View", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.4 10,000 sqm Industrial Land - Lekki Free Trade Zone (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="10,000 sqm (1 Hectare) Prime Industrial Land in Lekki Free Trade Zone",
            slug="10000-sqm-industrial-land-lekki-ftz",
            description="Industrial-grade heavy duty parcel situated within the tax-free Free Zone corridor near Dangote Refinery and Lekki Deep Sea Port. Direct heavy vehicle access and uninterrupted industrial power.",
            price=Decimal("350000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Lekki Free Trade Zone",
            address="Coastal Highway, Lekki Free Trade Zone",
            latitude=6.4250,
            longitude=3.9850,
            attributes={
                "land_size": 10000,
                "land_unit": "sqm",
                "permitted_use": "Industrial / Logistics",
                "title_document": "Federal C of O",
                "topography": "Fenced & Sandfilled Land",
                "road_access": "Paved Heavy-Duty Access Road",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1524813686514-a57563d77d61?w=800", "caption": "Industrial Zone Plot", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.5 1,200 sqm Gated Corner Plot - Banana Island, Ikoyi (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="1,200 sqm Gated Corner-Piece Residential Plot with Water View",
            slug="1200-sqm-gated-residential-plot-banana-island",
            description="Trophy land investment in Nigeria's most coveted private community. 100% dry table land with dual road access and direct views over the lagoon. Title verified with Federal C of O.",
            price=Decimal("950000000.00"),
            currency="NGN",
            is_negotiable=False,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Banana Island, Ikoyi",
            address="Close 4, Banana Island, Ikoyi",
            latitude=6.4655,
            longitude=3.4440,
            attributes={
                "land_size": 1200,
                "land_unit": "sqm",
                "permitted_use": "Luxury Residential",
                "title_document": "Federal C of O",
                "topography": "100% Dry Level Land",
                "road_access": "Interlocked Road",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "caption": "Banana Island Plot", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.6 4,500 sqm Prime Commercial Plot - Jabi District, Abuja (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="4,500 sqm Prime Commercial Plot Facing Jabi Lake & Expressway",
            slug="4500-sqm-commercial-plot-jabi-lake-abuja",
            description="High-visibility commercial plot approved for 10-floor mixed commercial development, luxury hotel, or corporate headquarters right on Jabi Lake frontage. Complete FCDA statutory approvals.",
            price=Decimal("680000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Jabi",
            address="Alex Ekwueme Way, Jabi Lakefront",
            latitude=9.0732,
            longitude=7.4230,
            attributes={
                "land_size": 4500,
                "land_unit": "sqm",
                "permitted_use": "Commercial (Hotel / Mall / Offices)",
                "title_document": "FCDA Certificate of Occupancy",
                "topography": "Dry Table Land",
                "road_access": "Dual-Carriageway Expressway",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", "caption": "Jabi Lake View Plot", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.7 5 Acres Agricultural & Agri-Tech Farmland - Epe (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="5 Acres Agricultural & Agri-Tech Farmland with Natural Stream Access",
            slug="5-acres-agritech-farmland-epe",
            description="Fertile loamy agricultural farmland situated in the burgeoning Epe agricultural corridor. Natural freshwater stream provides year-round irrigation for commercial greenhouse crop and fish farming.",
            price=Decimal("25000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Epe",
            address="Agro-Allied Belt, Ketu-Epe",
            latitude=6.6120,
            longitude=3.9680,
            attributes={
                "land_size": 5,
                "land_unit": "acres",
                "permitted_use": "Agricultural / Greenhouse Farming",
                "title_document": "Registered Survey & Deed",
                "topography": "Fertile Loamy Soil",
                "road_access": "Graded Farm Access Road",
                "electricity_available": False,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800", "caption": "Farmland Greenery", "is_cover": True}
            ],
            is_featured=False,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.8 800 sqm Panoramic Hilltop Residential Plot - Asokoro Hills, Abuja (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="800 sqm Panoramic Hilltop Residential Plot with Scenic Cityscape",
            slug="800-sqm-hilltop-residential-plot-asokoro",
            description="Spectacular hillside residential parcel in Asokoro Extension. Offers breathtaking views of the National Mosque and Abuja central district. Fully registered C of O.",
            price=Decimal("120000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Asokoro",
            address="Hilltop Crescent, Asokoro Extension",
            latitude=9.0390,
            longitude=7.5450,
            attributes={
                "land_size": 800,
                "land_unit": "sqm",
                "permitted_use": "Residential",
                "title_document": "Certificate of Occupancy (C of O)",
                "topography": "Gently Elevated Dry Ground",
                "road_access": "Tarred Road",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800", "caption": "Panoramic Hilltop View", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.9 650 sqm Ready-to-Build Land in Royal Gardens Estate - Ajah, Lagos (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="650 sqm Ready-to-Build Table Land in Royal Gardens Estate",
            slug="650-sqm-ready-to-build-table-land-ajah",
            description="Located within high-security Royal Gardens Estate, Ajah. Enjoy first-rate paved roads, underground drainage, round-the-clock electricity, and beautiful garden environment.",
            price=Decimal("68000000.00"),
            currency="NGN",
            is_negotiable=False,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ajah",
            address="Royal Gardens Estate, Ajah",
            latitude=6.4680,
            longitude=3.5820,
            attributes={
                "land_size": 650,
                "land_unit": "sqm",
                "permitted_use": "Residential",
                "title_document": "Governor's Consent",
                "topography": "100% Dry Table Land",
                "road_access": "Paved Interlocked Road",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", "caption": "Estate Plot", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.10 3,000 sqm Waterfront Promenade Commercial Plot - Eko Atlantic City (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="3,000 sqm Waterfront Promenade Commercial Plot in Eko Atlantic City",
            slug="3000-sqm-waterfront-promenade-eko-atlantic",
            description="World-class commercial development plot situated directly on the Marina District of Eko Atlantic City. Unrivaled high-capacity power, advanced telecom conduits, and deep-water ocean backdrop.",
            price=Decimal("2400000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Eko Atlantic City, Victoria Island",
            address="Marina District Boulevard, Eko Atlantic",
            latitude=6.4180,
            longitude=3.4090,
            attributes={
                "land_size": 3000,
                "land_unit": "sqm",
                "permitted_use": "High-Rise Commercial / Residential",
                "title_document": "Federal Deed of Sub-Lease",
                "topography": "Engineered Reclaimed Land",
                "road_access": "Modern Multi-Lane Boulevards",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800", "caption": "Marina Boulevard Plot", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 2.11 5,000 sqm Mixed-Use Land - Epe Expressway (SALE)
        raw_listings.append(Listing(
            user_id=agent.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.LAND,
            status=ListingStatus.PUBLISHED,
            title="5,000 sqm Mixed-Use Layout Land close to Alaro City & Proposed Airport",
            slug="5000-sqm-mixed-use-layout-epe-expressway",
            description="Exponential growth corridor plot located 5 minutes from Alaro City and the proposed Lekki International Airport. Completely dry terrain suitable for residential estate schemes or warehousing.",
            price=Decimal("110000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Epe Expressway",
            address="Opposite Alaro City Corridor, Epe",
            latitude=6.5820,
            longitude=3.9210,
            attributes={
                "land_size": 5000,
                "land_unit": "sqm",
                "permitted_use": "Mixed-Use (Residential & Commercial)",
                "title_document": "Gazette & C of O in View",
                "topography": "100% Dry Solid Ground",
                "road_access": "Direct Expressway Proximity",
                "electricity_available": True,
                "water_available": True
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800", "caption": "Development Layout", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # =========================================================================
        # PART 3: CARS AND OTHER AUTOMOBILES (VEHICLE) - 12 Total (2 base + 10 new)
        # =========================================================================

        # 3.1 2022 Toyota Land Cruiser Prado TX-L (SALE)
        raw_listings.append(Listing(
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

        # 3.2 2023 Mercedes-Benz GLE 450 (RENT - DAILY)
        raw_listings.append(Listing(
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

        # 3.3 2024 Mercedes-AMG G 63 V8 Biturbo (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2024 Mercedes-AMG G 63 V8 Biturbo SUV (Obsidian Black, Zero Mileage)",
            slug="2024-mercedes-amg-g63-v8-biturbo-black",
            description="Brand-new iconic AMG G-Wagon. Handcrafted 4.0L V8 biturbo delivering 577 horsepower, dual side-exit performance exhausts, carbon-fiber trim, red Bengal leather interior, and Burmester surround sound.",
            price=Decimal("265000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Victoria Island",
            address="Akin Adesola, Victoria Island",
            latitude=6.4310,
            longitude=3.4210,
            attributes={
                "vehicle_type": "luxury_suv",
                "brand": "Mercedes-Benz",
                "model": "G 63 AMG",
                "year": 2024,
                "mileage": 120,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Brand New",
                "color": "Obsidian Black"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800", "caption": "G 63 AMG Front Profile", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.4 2023 Range Rover Autobiography LWB (RENT - DAILY)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Range Rover Autobiography LWB 4.4L V8 (Chauffeur-Driven Rental)",
            slug="2023-range-rover-autobiography-lwb-rental",
            description="The pinnacle of British luxury motoring. Long Wheelbase with executive rear seating, massaging heated seats, rear entertainment screens, and active noise cancellation. Chauffeur included.",
            price=Decimal("250000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_DAY,
            security_deposit=Decimal("100000.00"),
            min_rental_duration=1,
            max_rental_duration=14,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ikoyi",
            address="Kingsway Road, Ikoyi",
            latitude=6.4520,
            longitude=3.4350,
            attributes={
                "vehicle_type": "luxury_suv",
                "brand": "Land Rover",
                "model": "Range Rover Autobiography LWB",
                "year": 2023,
                "mileage": 8500,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Certified Pre-Owned",
                "rental_service_type": "chauffeur_driven",
                "pickup_options": "both",
                "color": "Santorini Black"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800", "caption": "Range Rover Autobiography", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.5 2023 Lexus LX 600 Ultra Luxury VIP (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Lexus LX 600 Ultra Luxury VIP 4-Seater (Foreign Used)",
            slug="2023-lexus-lx-600-vip-4-seater",
            description="Ultra Luxury trim featuring independent 4-seat VIP layout with 48-degree reclining Ottoman rear seats, wireless charging pads, cool box, Mark Levinson 25-speaker audio, and twin-turbo V6 engine.",
            price=Decimal("175000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Maitama",
            address="Shehu Shagari Way, Maitama",
            latitude=9.0820,
            longitude=7.4950,
            attributes={
                "vehicle_type": "suv",
                "brand": "Lexus",
                "model": "LX 600 VIP",
                "year": 2023,
                "mileage": 9800,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Foreign Used",
                "color": "Sonic Titanium"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800", "caption": "Lexus LX 600 Profile", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.6 2022 BMW M5 Competition (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2022 BMW M5 Competition 617HP Twin-Turbo V8 Sedan",
            slug="2022-bmw-m5-competition-twin-turbo",
            description="High-performance executive sports sedan. 4.4L M TwinPower Turbo V8 (617 hp), xDrive all-wheel-drive with rear-wheel drift mode, M carbon ceramic brakes, head-up display, and Bowers & Wilkins audio.",
            price=Decimal("95000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Lekki Phase 1",
            address="Admiralty Way, Lekki 1",
            latitude=6.4480,
            longitude=3.4730,
            attributes={
                "vehicle_type": "sedan",
                "brand": "BMW",
                "model": "M5 Competition",
                "year": 2022,
                "mileage": 14500,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Foreign Used",
                "color": "Marina Bay Blue"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", "caption": "BMW M5 Competition Front", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.7 2023 Porsche 911 Carrera S Coupe (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Porsche 911 Carrera S Coupe (Guards Red, Spotless)",
            slug="2023-porsche-911-carrera-s-coupe",
            description="Pure driving thrill. 3.0L twin-turbo flat-six, 8-speed Porsche Doppelkupplung (PDK), Sport Chrono package, active sports exhaust, Porsche Active Suspension Management (PASM), and Bose Surround.",
            price=Decimal("145000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Victoria Island",
            address="Bishop Oluwole, Victoria Island",
            latitude=6.4300,
            longitude=3.4250,
            attributes={
                "vehicle_type": "sports_car",
                "brand": "Porsche",
                "model": "911 Carrera S",
                "year": 2023,
                "mileage": 6200,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Foreign Used",
                "color": "Guards Red"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", "caption": "Porsche 911 Coupe", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.8 2023 Tesla Model X Plaid (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Tesla Model X Plaid Tri-Motor All-Wheel Drive (Falcon Doors)",
            slug="2023-tesla-model-x-plaid-tri-motor",
            description="The world's quickest accelerating SUV. 0-60 mph in 2.5 seconds, 1,020 horsepower tri-motor AWD, iconic Falcon Wing doors, yoke steering, 22-inch Turbine wheels, and Full Self-Driving computer.",
            price=Decimal("125000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ikeja GRA",
            address="Mobolaji Bank Anthony Way, Ikeja",
            latitude=6.5890,
            longitude=3.3560,
            attributes={
                "vehicle_type": "electric",
                "brand": "Tesla",
                "model": "Model X Plaid",
                "year": 2023,
                "mileage": 5400,
                "transmission": "Automatic",
                "fuel_type": "Electric",
                "condition": "Foreign Used",
                "color": "Pearl White Multi-Coat"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800", "caption": "Tesla Model X Plaid", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.9 2024 Ford F-150 Raptor 4x4 (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2024 Ford F-150 Raptor 3.5L High-Output EcoBoost 4x4 Off-Road Truck",
            slug="2024-ford-f150-raptor-high-output-ecoboost",
            description="Baja-proven off-road monster. 3.5L Twin-Turbo EcoBoost V6 (450 hp), Fox Live Valve internal bypass shocks, 37-inch all-terrain tires, panoramic twin-panel moonroof, and 360-degree camera suite.",
            price=Decimal("110000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Abuja (FCT)",
            city="Abuja",
            neighbourhood="Central Business District",
            address="Constitution Avenue, CBD",
            latitude=9.0600,
            longitude=7.4900,
            attributes={
                "vehicle_type": "pickup_truck",
                "brand": "Ford",
                "model": "F-150 Raptor",
                "year": 2024,
                "mileage": 1800,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Brand New",
                "color": "Agate Black"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800", "caption": "Ford Raptor Truck", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.10 2023 Toyota Hilux GR-Sport Double-Cabin 4WD (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Toyota Hilux GR-Sport 2.8L Turbo Diesel 4WD Double-Cabin",
            slug="2023-toyota-hilux-gr-sport-diesel-4wd",
            description="Gazoo Racing tuned chassis with monotube shock absorbers for unrivaled durability. 2.8L turbo diesel with 500Nm torque, black sports bar, GR leather steering, push button start, and dual-zone climate.",
            price=Decimal("58000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Rivers",
            city="Port Harcourt",
            neighbourhood="GRA Phase 2",
            address="Aba Road, GRA Phase 2",
            latitude=4.8156,
            longitude=7.0498,
            attributes={
                "vehicle_type": "pickup_truck",
                "brand": "Toyota",
                "model": "Hilux GR-Sport",
                "year": 2023,
                "mileage": 12000,
                "transmission": "Automatic",
                "fuel_type": "Diesel",
                "condition": "Foreign Used",
                "color": "Emotional Red"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800", "caption": "Hilux GR-Sport 4x4", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.11 2023 Toyota Coaster 30-Passenger Executive Bus (RENT - DAILY)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.RENT,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Toyota Coaster 30-Passenger Luxury Executive Bus (Fleet Rental)",
            slug="2023-toyota-coaster-30-passenger-executive-bus",
            description="Luxury commercial mobility for corporate delegations, church conventions, retreats, and airport arrivals. High-roof design, premium reclining velour seats, dual overhead AC units, and PA system.",
            price=Decimal("180000.00"),
            currency="NGN",
            rental_period=RentalPeriod.PER_DAY,
            security_deposit=Decimal("80000.00"),
            min_rental_duration=1,
            max_rental_duration=30,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Ikeja",
            address="Airport Road, Ikeja",
            latitude=6.5950,
            longitude=3.3480,
            attributes={
                "vehicle_type": "commercial_bus",
                "brand": "Toyota",
                "model": "Coaster Executive",
                "year": 2023,
                "mileage": 18000,
                "transmission": "Manual",
                "fuel_type": "Diesel",
                "condition": "Certified Pre-Owned",
                "rental_service_type": "chauffeur_driven",
                "pickup_options": "doorstep_delivery",
                "color": "White / Champagne"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800", "caption": "Executive Bus Exterior", "is_cover": True}
            ],
            is_featured=False,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # 3.12 2023 Audi RS7 Sportback Quattro (SALE)
        raw_listings.append(Listing(
            user_id=dealer.id,
            transaction_type=TransactionType.SALE,
            asset_category=AssetCategory.VEHICLE,
            status=ListingStatus.PUBLISHED,
            title="2023 Audi RS7 Sportback Quattro 600HP (Nardo Grey)",
            slug="2023-audi-rs7-sportback-quattro-nardo-grey",
            description="Aggressive four-door supercar coupe. 4.0L Twin-Turbo V8 with 48V mild hybrid (591 hp), Quattro permanent AWD with sport differential, RS sport air suspension, HD Matrix LED headlights with Audi laser light.",
            price=Decimal("118000000.00"),
            currency="NGN",
            is_negotiable=True,
            country="Nigeria",
            state="Lagos",
            city="Lagos",
            neighbourhood="Victoria Island",
            address="Adeyemo Alakija, Victoria Island",
            latitude=6.4290,
            longitude=3.4215,
            attributes={
                "vehicle_type": "sports_car",
                "brand": "Audi",
                "model": "RS7 Sportback",
                "year": 2023,
                "mileage": 8200,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "condition": "Foreign Used",
                "color": "Nardo Grey"
            },
            images=[
                {"url": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800", "caption": "Audi RS7 Front Profile", "is_cover": True}
            ],
            is_featured=True,
            is_verified_asset=True,
            published_at=datetime.now(timezone.utc)
        ))

        # =========================================================================
        # PART 4: COMMERCIAL (1 base)
        # =========================================================================

        # 4.1 Industrial Warehouse in Ikeja (LEASE)
        raw_listings.append(Listing(
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

        # Insert or update listings idempotently
        added_count = 0
        skipped_count = 0
        for l in raw_listings:
            exists_res = await db.execute(select(Listing).where(Listing.slug == l.slug))
            if exists_res.scalars().first():
                skipped_count += 1
            else:
                db.add(l)
                added_count += 1

        await db.commit()
        print(f"Listings processing complete: {added_count} added, {skipped_count} already existed.")

        # =========================================================================
        # PART 5: AI REQUIREMENTS & MATCHING
        # =========================================================================
        print("Checking/Seeding active seeker requirements...")
        raw_reqs = [
            Requirement(
                user_id=buyer.id,
                transaction_type=TransactionType.RENT,
                asset_category=AssetCategory.RESIDENTIAL,
                status=RequirementStatus.ACTIVE,
                title="Seeking Luxury 3-Bedroom Serviced Apartment in Victoria Island or Lekki",
                description="Looking for an executive serviced apartment with reliable 24/7 electricity, gym, and security for a 1-year corporate lease.",
                min_budget=Decimal("10000000.00"),
                max_budget=Decimal("18000000.00"),
                currency="NGN",
                rental_period=RentalPeriod.PER_YEAR,
                desired_duration=12,
                preferred_country="Nigeria",
                preferred_state="Lagos",
                preferred_city="Lagos",
                preferred_neighbourhoods=["Victoria Island", "Lekki Phase 1", "Banana Island, Ikoyi"],
                criteria={
                    "min_bedrooms": 3,
                    "min_bathrooms": 3,
                    "furnishing": "furnished"
                }
            ),
            Requirement(
                user_id=buyer.id,
                transaction_type=TransactionType.RENT,
                asset_category=AssetCategory.VEHICLE,
                status=RequirementStatus.ACTIVE,
                title="Require Chauffeur-driven Mercedes or Luxury SUV for Lagos Engagements",
                description="Need an executive SUV with a seasoned driver for international delegate visits around Victoria Island and Ikoyi.",
                min_budget=Decimal("100000.00"),
                max_budget=Decimal("260000.00"),
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
            ),
            Requirement(
                user_id=buyer.id,
                transaction_type=TransactionType.SALE,
                asset_category=AssetCategory.LAND,
                status=RequirementStatus.ACTIVE,
                title="Seeking 600 - 1500 sqm Prime Dry Land in Lagos or Abuja",
                description="High net worth investor acquiring verified dry plots for immediate development in prime residential corridors.",
                min_budget=Decimal("60000000.00"),
                max_budget=Decimal("200000000.00"),
                currency="NGN",
                preferred_country="Nigeria",
                preferred_state="Lagos",
                preferred_city="Lagos",
                preferred_neighbourhoods=["Lekki Phase 1", "Guzape", "Ajah"],
                criteria={
                    "permitted_use": "Residential",
                    "title_document": "Governor's Consent"
                }
            )
        ]

        for r in raw_reqs:
            req_exists = await db.execute(select(Requirement).where(Requirement.title == r.title))
            existing_r = req_exists.scalars().first()
            if not existing_r:
                db.add(r)
                await db.commit()
                await db.refresh(r)
                matches = await MatchingEngine.match_requirement_to_listings(db, r)
                print(f"Generated {len(matches)} AI matches for new requirement: '{r.title}'")
            else:
                matches = await MatchingEngine.match_requirement_to_listings(db, existing_r)
                print(f"Updated {len(matches)} AI matches for existing requirement: '{existing_r.title}'")

        # Summary of current database contents
        res_count = await db.execute(select(Listing.asset_category))
        all_cats = res_count.scalars().all()
        cat_counts = {}
        for c in all_cats:
            cat_counts[c] = cat_counts.get(c, 0) + 1

        print("\n================ MARKETPLACE DATABASE SUMMARY ================")
        for cat, cnt in sorted(cat_counts.items(), key=lambda x: str(x[0])):
            print(f"  {cat}: {cnt} listings")
        print(f"  TOTAL LISTINGS: {len(all_cats)}")
        print("==============================================================")

if __name__ == "__main__":
    asyncio.run(seed_data())
