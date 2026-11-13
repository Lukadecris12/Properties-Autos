from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, or_
from decimal import Decimal

from app.core.database import utc_now

from app.models.subscription import (
    SubscriptionPlan,
    UserSubscription,
    SubscriptionPayment,
    ListingBoost,
    SubscriptionAuditLog,
    SystemSetting
)
from app.models.listing import Listing
from app.models.enums import ListingStatus
from app.models.user import User

DEFAULT_BOOST_HOURS = 72  # 3 days default

def build_default_plans_catalogue() -> List[Dict[str, Any]]:
    plans = []
    
    # A. Free Plan
    plans.append({
        "slug": "free",
        "name": "Free Plan",
        "tier_category": "FREE",
        "price_ngn": Decimal("0.00"),
        "listing_allowance": 1,
        "featured_allowance": 0,
        "boost_allowance": 0,
        "duration_days": 30,
        "display_order": 1,
        "badge": "Starter",
        "tagline": "Free basic access for individual property & vehicle listers",
        "features": [
            "1 active published listing",
            "Standard search & AI discovery matching",
            "Direct contact & inquiry messaging",
            "Helpdesk customer support",
            "Up to 5 photos per listing"
        ]
    })

    # B. Explorer
    plans.append({
        "slug": "explorer",
        "name": "Explorer",
        "tier_category": "ENTRY",
        "price_ngn": Decimal("4200.00"),
        "listing_allowance": 5,
        "featured_allowance": 1,
        "boost_allowance": 0,
        "duration_days": 30,
        "display_order": 2,
        "badge": "Entry",
        "tagline": "Ideal for active individual sellers and private vehicle owners",
        "features": [
            "Up to 5 active published listings",
            "1 featured listing placement",
            "Standard search ranking",
            "WhatsApp & call inquiries",
            "Monthly recurring renewal"
        ]
    })

    # C. Starter
    plans.append({
        "slug": "starter",
        "name": "Starter",
        "tier_category": "ENTRY",
        "price_ngn": Decimal("6300.00"),
        "listing_allowance": 10,
        "featured_allowance": 3,
        "boost_allowance": 1,
        "duration_days": 30,
        "display_order": 3,
        "badge": "Popular Entry",
        "tagline": "For rising property agents and boutique car dealers",
        "features": [
            "Up to 10 active published listings",
            "3 featured listing placements",
            "1 promotional search boost credit per month (72h duration)",
            "Priority buyer match notifications",
            "Standard analytics"
        ]
    })

    # D. Growth
    plans.append({
        "slug": "growth",
        "name": "Growth",
        "tier_category": "GROWTH",
        "price_ngn": Decimal("11200.00"),
        "listing_allowance": 40,
        "featured_allowance": 10,
        "boost_allowance": 5,
        "duration_days": 30,
        "display_order": 4,
        "badge": "Best Value",
        "tagline": "Powering high-volume real estate brokers and automotive merchants",
        "features": [
            "Up to 40 active published listings",
            "10 featured listing placements",
            "5 promotional search boost credits per month",
            "Official Verified Partner badge eligible",
            "Priority client concierge support"
        ]
    })

    # E. Business Plans: from 100 listings to 2,500 listings in increments of 50
    # Business 100: ₦14,560, 100 listings, 20 featured, 10 boosts
    # Increment per 50 listings: +₦3,360, +10 featured, +5 boosts
    # Business 2,500: ₦175,840, 2,500 listings, 500 featured, 250 boosts
    display_order_idx = 10
    for count in range(100, 2501, 50):
        step = (count - 100) // 50
        price = 14560 + (step * 3360)
        featured = 20 + (step * 10)
        boosts = 10 + (step * 5)
        
        plans.append({
            "slug": f"business-{count}",
            "name": f"Business {count}",
            "tier_category": "BUSINESS",
            "price_ngn": Decimal(str(price)),
            "listing_allowance": count,
            "featured_allowance": featured,
            "boost_allowance": boosts,
            "duration_days": 30,
            "display_order": display_order_idx,
            "badge": "Business",
            "tagline": f"Enterprise-grade throughput with {count} active listings & {boosts} monthly boosts",
            "features": [
                f"Up to {count:,} active listings",
                f"{featured:,} featured listing slots",
                f"{boosts:,} search boost credits per monthly cycle",
                "Dedicated Agency Storefront in Directory",
                "Direct lead routing & priority support"
            ]
        })
        display_order_idx += 1

    # F. Enterprise Plans
    # Enterprise 2,750: ₦192,640 — 2,750 listings, 550 featured, 275 boosts
    # Enterprise 3,000: ₦209,440 — 3,000 listings, 600 featured, 300 boosts
    # Enterprise 3,250: ₦226,240 — 3,250 listings, 650 featured, 325 boosts
    # Enterprise 3,500: ₦243,040 — 3,500 listings, 700 featured, 350 boosts
    # Enterprise 4,000: ₦276,640 — 4,000 listings, 800 featured, 400 boosts
    # Enterprise 4,500: ₦310,240 — 4,500 listings, 900 featured, 450 boosts
    # Enterprise 5,000: ₦343,840 — 5,000 listings, 1,000 featured, 500 boosts
    # Enterprise 5,500: ₦377,440 — 5,500 listings, 1,100 featured, 550 boosts
    # Enterprise 6,000: ₦411,040 — 6,000 listings, 1,200 featured, 600 boosts
    ent_data = [
        (2750, 192640, 550, 275),
        (3000, 209440, 600, 300),
        (3250, 226240, 650, 325),
        (3500, 243040, 700, 350),
        (4000, 276640, 800, 400),
        (4500, 310240, 900, 450),
        (5000, 343840, 1000, 500),
        (5500, 377440, 1100, 550),
        (6000, 411040, 1200, 600),
    ]

    for count, price, featured, boosts in ent_data:
        plans.append({
            "slug": f"enterprise-{count}",
            "name": f"Enterprise {count:,}",
            "tier_category": "ENTERPRISE",
            "price_ngn": Decimal(str(price)),
            "listing_allowance": count,
            "featured_allowance": featured,
            "boost_allowance": boosts,
            "duration_days": 30,
            "display_order": display_order_idx,
            "badge": "Enterprise Elite",
            "tagline": f"Master developer & dealership nationwide portfolio ({count:,} slots)",
            "features": [
                f"Up to {count:,} active listings capacity",
                f"{featured:,} featured listing slots",
                f"{boosts:,} boost credits per month",
                "Full developer API & feed syndication access",
                "Executive VIP Account Director & title verification priority"
            ]
        })
        display_order_idx += 1

    return plans


class SubscriptionService:

    @staticmethod
    async def ensure_plans_seeded(db: AsyncSession):
        """Seed all standard subscription plans and system settings into the database."""
        # 1. System Settings
        setting = await db.get(SystemSetting, "default_boost_duration_hours")
        if not setting:
            db.add(SystemSetting(
                key="default_boost_duration_hours",
                value=str(DEFAULT_BOOST_HOURS),
                description="Default duration in hours for an active listing boost (e.g. 72)"
            ))

        # 2. Seed Plans
        stmt = select(SubscriptionPlan)
        res = await db.execute(stmt)
        existing_plans = {p.slug: p for p in res.scalars().all()}

        default_catalogue = build_default_plans_catalogue()
        for pdata in default_catalogue:
            slug = pdata["slug"]
            if slug not in existing_plans:
                plan = SubscriptionPlan(**pdata)
                db.add(plan)
            else:
                # Update allowances and pricing if changed
                plan = existing_plans[slug]
                plan.price_ngn = pdata["price_ngn"]
                plan.listing_allowance = pdata["listing_allowance"]
                plan.featured_allowance = pdata["featured_allowance"]
                plan.boost_allowance = pdata["boost_allowance"]
                plan.tier_category = pdata["tier_category"]
                plan.features = pdata["features"]
        
        await db.commit()

    @staticmethod
    async def get_configured_boost_duration_hours(db: AsyncSession) -> int:
        setting = await db.get(SystemSetting, "default_boost_duration_hours")
        if setting and setting.value.isdigit():
            return int(setting.value)
        return DEFAULT_BOOST_HOURS

    @staticmethod
    async def process_expired_boosts(db: AsyncSession):
        """Expire any boosts whose expiry time has passed and update listing promotional state."""
        now = utc_now()
        stmt = select(ListingBoost).where(ListingBoost.is_active == True, ListingBoost.expires_at <= now)
        expired_boosts = (await db.execute(stmt)).scalars().all()
        
        affected_listing_ids = set()
        for b in expired_boosts:
            b.is_active = False
            affected_listing_ids.add(b.listing_id)
        
        # For affected listings, check if they have any remaining active boost
        for lid in affected_listing_ids:
            active_chk = select(ListingBoost).where(
                ListingBoost.listing_id == lid,
                ListingBoost.is_active == True,
                ListingBoost.expires_at > now
            )
            has_other_boost = (await db.execute(active_chk)).scalars().first()
            if not has_other_boost:
                listing = await db.get(Listing, lid)
                if listing:
                    listing.is_boosted = False
                    listing.boosted_until = None
        
        if expired_boosts:
            await db.commit()

    @staticmethod
    async def get_or_create_user_subscription(db: AsyncSession, user_id: int) -> UserSubscription:
        """
        Retrieves the user's active subscription.
        If expired, automatically downgrades to Free Plan and handles quota adjustments safely.
        If user has no subscription record, creates one with the Free Plan.
        """
        await SubscriptionService.process_expired_boosts(db)
        
        stmt = (
            select(UserSubscription)
            .where(UserSubscription.user_id == user_id)
            .order_by(desc(UserSubscription.current_period_end))
        )
        sub = (await db.execute(stmt)).scalars().first()

        now = utc_now()

        # Retrieve Free Plan template
        free_plan_stmt = select(SubscriptionPlan).where(SubscriptionPlan.slug == "free")
        free_plan = (await db.execute(free_plan_stmt)).scalars().first()
        if not free_plan:
            await SubscriptionService.ensure_plans_seeded(db)
            free_plan = (await db.execute(free_plan_stmt)).scalars().first()

        if not sub:
            # Create default Free Plan subscription
            sub = UserSubscription(
                user_id=user_id,
                plan_id=free_plan.id,
                status="ACTIVE",
                current_period_start=now,
                current_period_end=now + timedelta(days=3650),  # Free plan recurring access
                remaining_boost_credits=0,
                used_boost_credits=0,
                auto_renew=False
            )
            db.add(sub)
            await db.commit()
            await db.refresh(sub)
            return sub

        # Check for expiry on paid subscriptions
        plan = await db.get(SubscriptionPlan, sub.plan_id)
        if plan and plan.slug != "free":
            if sub.current_period_end <= now and sub.status == "ACTIVE":
                # Expire subscription and revert to Free Plan
                sub.status = "EXPIRED"
                
                # Log audit
                audit = SubscriptionAuditLog(
                    user_id=user_id,
                    action="PLAN_EXPIRED",
                    details={
                        "previous_plan": plan.name,
                        "expired_at": now.isoformat(),
                        "reason": "Monthly cycle elapsed without renewal"
                    }
                )
                db.add(audit)

                # Revert to Free Plan
                new_sub = UserSubscription(
                    user_id=user_id,
                    plan_id=free_plan.id,
                    status="ACTIVE",
                    current_period_start=now,
                    current_period_end=now + timedelta(days=3650),
                    remaining_boost_credits=0,
                    used_boost_credits=0,
                    auto_renew=False,
                    notes=f"Reverted to Free Plan after {plan.name} expired"
                )
                db.add(new_sub)

                # Remove paid featured status: Free plan permits 0 featured
                featured_stmt = select(Listing).where(
                    Listing.user_id == user_id,
                    Listing.is_featured == True
                )
                featured_listings = (await db.execute(featured_stmt)).scalars().all()
                for fl in featured_listings:
                    fl.is_featured = False

                # Deactivate any active boosts
                boost_stmt = select(ListingBoost).where(
                    ListingBoost.user_id == user_id,
                    ListingBoost.is_active == True
                )
                active_boosts = (await db.execute(boost_stmt)).scalars().all()
                for b in active_boosts:
                    b.is_active = False

                await db.commit()
                await db.refresh(new_sub)
                return new_sub

        return sub

    @staticmethod
    async def get_subscription_usage(db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """Calculates real-time subscription quotas, usage, and active boosts."""
        sub = await SubscriptionService.get_or_create_user_subscription(db, user_id)
        plan = await db.get(SubscriptionPlan, sub.plan_id)
        
        # Count active PUBLISHED listings
        pub_stmt = select(func.count(Listing.id)).where(
            Listing.user_id == user_id,
            Listing.status == ListingStatus.PUBLISHED
        )
        active_listings_count = (await db.execute(pub_stmt)).scalar() or 0
        
        # Count featured listings
        feat_stmt = select(func.count(Listing.id)).where(
            Listing.user_id == user_id,
            Listing.status == ListingStatus.PUBLISHED,
            Listing.is_featured == True
        )
        used_featured_count = (await db.execute(feat_stmt)).scalar() or 0
        
        # Active boosts
        now = utc_now()
        boost_stmt = (
            select(ListingBoost)
            .where(
                ListingBoost.user_id == user_id,
                ListingBoost.is_active == True,
                ListingBoost.expires_at > now
            )
            .order_by(ListingBoost.expires_at.asc())
        )
        active_boosts = (await db.execute(boost_stmt)).scalars().all()
        
        # Populate listing titles for active boosts
        boosts_data = []
        for b in active_boosts:
            listing = await db.get(Listing, b.listing_id)
            boosts_data.append({
                "id": b.id,
                "listing_id": b.listing_id,
                "listing_title": listing.title if listing else "Listing",
                "started_at": b.started_at,
                "expires_at": b.expires_at,
                "duration_hours": b.duration_hours,
                "is_active": b.is_active
            })

        listing_allowance = plan.listing_allowance
        remaining_listings = max(0, listing_allowance - active_listings_count)
        excess_listings_count = max(0, active_listings_count - listing_allowance)

        featured_allowance = plan.featured_allowance
        remaining_featured = max(0, featured_allowance - used_featured_count)

        return {
            "plan_id": plan.id,
            "plan_slug": plan.slug,
            "plan_name": plan.name,
            "tier_category": plan.tier_category,
            "price_ngn": float(plan.price_ngn),
            "status": sub.status,
            "current_period_start": sub.current_period_start,
            "current_period_end": sub.current_period_end,
            "auto_renew": sub.auto_renew,
            
            # Quotas
            "listing_allowance": listing_allowance,
            "active_listings_count": active_listings_count,
            "remaining_listings": remaining_listings,
            "excess_listings_count": excess_listings_count,
            
            "featured_allowance": featured_allowance,
            "used_featured_count": used_featured_count,
            "remaining_featured": remaining_featured,
            
            "monthly_boost_allowance": plan.boost_allowance,
            "remaining_boost_credits": sub.remaining_boost_credits,
            "used_boost_credits": sub.used_boost_credits,
            "active_boosts_count": len(boosts_data),
            "active_boosts": boosts_data
        }

    @staticmethod
    async def can_publish_listing(db: AsyncSession, user_id: int) -> Tuple[bool, str, Dict[str, Any]]:
        """Validates if user has available quota to publish an active listing."""
        usage = await SubscriptionService.get_subscription_usage(db, user_id)
        if usage["active_listings_count"] >= usage["listing_allowance"]:
            reason = (
                f"You have reached your listing allowance of {usage['listing_allowance']} "
                f"active listing(s) on the {usage['plan_name']} tier. "
                f"Please upgrade your subscription or archive an existing listing."
            )
            return False, reason, usage
        return True, "Allowed", usage

    @staticmethod
    async def toggle_featured_listing(
        db: AsyncSession, 
        user_id: int, 
        listing_id: int, 
        make_featured: bool
    ) -> Tuple[bool, str, Listing]:
        """Toggles featured status for a user's listing, validating subscription allowance."""
        listing = await db.get(Listing, listing_id)
        if not listing:
            return False, "Listing not found.", None
        if listing.user_id != user_id:
            return False, "Unauthorized: you do not own this listing.", None
        if listing.status != ListingStatus.PUBLISHED:
            return False, "Only active, published listings can be designated as featured.", None

        usage = await SubscriptionService.get_subscription_usage(db, user_id)

        if make_featured:
            if usage["used_featured_count"] >= usage["featured_allowance"]:
                return (
                    False, 
                    f"You have used all {usage['featured_allowance']} featured slot(s) for your {usage['plan_name']}. Upgrade your plan to feature more listings.", 
                    listing
                )
            listing.is_featured = True
            listing.featured_at = utc_now()
            action_msg = "Listing successfully designated as Featured."
        else:
            listing.is_featured = False
            listing.featured_at = None
            action_msg = "Listing featured status removed."

        await db.commit()
        await db.refresh(listing)
        return True, action_msg, listing

    @staticmethod
    async def boost_listing(
        db: AsyncSession, 
        user_id: int, 
        listing_id: int, 
        duration_hours: Optional[int] = None
    ) -> Tuple[bool, str, Optional[ListingBoost]]:
        """Applies a boost credit to elevate an active listing for a configured duration."""
        listing = await db.get(Listing, listing_id)
        if not listing:
            return False, "Listing not found.", None
        if listing.user_id != user_id:
            return False, "Unauthorized: you do not own this listing.", None
        if listing.status != ListingStatus.PUBLISHED:
            return False, "Only active, published listings can be boosted.", None

        sub = await SubscriptionService.get_or_create_user_subscription(db, user_id)
        if sub.remaining_boost_credits <= 0:
            return (
                False, 
                "You have 0 promotional boost credits remaining in this subscription period. Upgrade your plan to receive additional boosts.", 
                None
            )

        duration = duration_hours or await SubscriptionService.get_configured_boost_duration_hours(db)
        now = utc_now()
        expires_at = now + timedelta(hours=duration)

        # Deduct credit safely
        sub.remaining_boost_credits -= 1
        sub.used_boost_credits += 1

        # Create boost record
        boost = ListingBoost(
            user_id=user_id,
            listing_id=listing_id,
            subscription_id=sub.id,
            started_at=now,
            expires_at=expires_at,
            duration_hours=duration,
            is_active=True
        )
        db.add(boost)

        # Update listing promotion state
        listing.is_boosted = True
        listing.boosted_until = expires_at

        # Audit log
        audit = SubscriptionAuditLog(
            user_id=user_id,
            action="BOOST_APPLIED",
            details={
                "listing_id": listing_id,
                "listing_title": listing.title,
                "duration_hours": duration,
                "expires_at": expires_at.isoformat()
            }
        )
        db.add(audit)

        await db.commit()
        await db.refresh(boost)
        return True, f"Listing boosted successfully! Elevated in search rankings for {duration} hours.", boost

    @staticmethod
    async def activate_subscription(
        db: AsyncSession,
        user_id: int,
        plan_slug: str,
        provider: str,
        reference: str,
        amount_ngn: float,
        admin_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> Tuple[bool, str, UserSubscription]:
        """
        Activates or upgrades a paid subscription.
        Idempotent: prevents duplicate payment processing with the same reference.
        """
        # Idempotency check
        existing_pmt = (await db.execute(
            select(SubscriptionPayment).where(SubscriptionPayment.reference == reference)
        )).scalars().first()
        
        if existing_pmt and existing_pmt.status == "SUCCESS":
            existing_sub = await db.get(UserSubscription, existing_pmt.subscription_id)
            return True, "Subscription already verified and active.", existing_sub

        # Fetch Plan
        plan_stmt = select(SubscriptionPlan).where(SubscriptionPlan.slug == plan_slug)
        plan = (await db.execute(plan_stmt)).scalars().first()
        if not plan:
            return False, f"Subscription plan '{plan_slug}' does not exist.", None

        now = utc_now()
        period_end = now + timedelta(days=plan.duration_days)

        # Get current subscription
        stmt = (
            select(UserSubscription)
            .where(UserSubscription.user_id == user_id, UserSubscription.status == "ACTIVE")
            .order_by(desc(UserSubscription.current_period_end))
        )
        current_sub = (await db.execute(stmt)).scalars().first()

        if current_sub:
            # Upgrade existing subscription
            current_sub.plan_id = plan.id
            current_sub.status = "ACTIVE"
            current_sub.current_period_start = now
            current_sub.current_period_end = period_end
            current_sub.remaining_boost_credits = plan.boost_allowance
            current_sub.used_boost_credits = 0
            current_sub.last_payment_reference = reference
            if notes:
                current_sub.notes = notes
            target_sub = current_sub
        else:
            # Create new subscription
            target_sub = UserSubscription(
                user_id=user_id,
                plan_id=plan.id,
                status="ACTIVE",
                current_period_start=now,
                current_period_end=period_end,
                remaining_boost_credits=plan.boost_allowance,
                used_boost_credits=0,
                last_payment_reference=reference,
                notes=notes
            )
            db.add(target_sub)

        # Record payment transaction
        payment = SubscriptionPayment(
            user_id=user_id,
            subscription=target_sub,
            plan_id=plan.id,
            reference=reference,
            amount_ngn=Decimal(str(amount_ngn)),
            provider=provider,
            status="SUCCESS",
            paid_at=now
        )
        db.add(payment)

        # Audit log
        audit = SubscriptionAuditLog(
            user_id=user_id,
            admin_id=admin_id,
            action="PLAN_UPGRADED" if admin_id else "SUBSCRIPTION_ACTIVATED",
            details={
                "plan": plan.name,
                "amount": amount_ngn,
                "reference": reference,
                "provider": provider,
                "listing_allowance": plan.listing_allowance,
                "featured_allowance": plan.featured_allowance,
                "boost_allowance": plan.boost_allowance
            }
        )
        db.add(audit)

        await db.commit()
        await db.refresh(target_sub)
        return True, f"Successfully activated {plan.name}! Your listing capacity is now {plan.listing_allowance:,}.", target_sub
