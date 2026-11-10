import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.subscription import SubscriptionPlan, SubscriptionPayment, ListingBoost
from app.schemas.subscription import (
    SubscriptionPlanResponse,
    UserSubscriptionUsageResponse,
    SubscribeRequest,
    PaymentVerifyRequest,
    FeatureListingRequest,
    BoostListingRequest,
    BoostTransactionResponse
)
from app.schemas.common import ResponseModel
from app.services.subscription_service import SubscriptionService
from app.services.paystack_service import PaystackService

router = APIRouter()

@router.get("/plans", response_model=ResponseModel[List[SubscriptionPlanResponse]])
async def get_subscription_plans(
    tier: Optional[str] = Query(None, description="Optional tier category: FREE, ENTRY, GROWTH, BUSINESS, ENTERPRISE"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all available marketplace subscription plans."""
    await SubscriptionService.ensure_plans_seeded(db)

    stmt = select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)
    if tier:
        stmt = stmt.where(SubscriptionPlan.tier_category == tier.upper())
    stmt = stmt.order_by(SubscriptionPlan.display_order.asc(), SubscriptionPlan.price_ngn.asc())

    plans = (await db.execute(stmt)).scalars().all()
    return ResponseModel(
        message="Available subscription plans retrieved successfully.",
        data=plans
    )

@router.get("/my-subscription", response_model=ResponseModel[UserSubscriptionUsageResponse])
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the current user's active subscription, real-time quotas, usage, and active boosts."""
    usage = await SubscriptionService.get_subscription_usage(db, current_user.id)
    return ResponseModel(
        message="Current subscription and quota usage retrieved.",
        data=usage
    )

@router.post("/subscribe", response_model=ResponseModel[Dict[str, Any]])
async def initiate_subscription(
    req: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiates subscription for a chosen plan.
    Returns invoice details and payment reference for Flutterwave / Paystack or corporate bank transfer.
    """
    stmt = select(SubscriptionPlan).where(SubscriptionPlan.slug == req.plan_slug, SubscriptionPlan.is_active == True)
    plan = (await db.execute(stmt)).scalars().first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan '{req.plan_slug}' does not exist or is inactive."
        )

    # If Free plan requested, directly activate
    if plan.price_ngn == 0:
        ref = f"FREE-SUB-{current_user.id}-{int(datetime.now(timezone.utc).timestamp())}"
        success, msg, sub = await SubscriptionService.activate_subscription(
            db=db,
            user_id=current_user.id,
            plan_slug="free",
            provider="SYSTEM",
            reference=ref,
            amount_ngn=0.0
        )
        return ResponseModel(
            message=msg,
            data={
                "status": "COMPLETED",
                "reference": ref,
                "plan_name": plan.name,
                "amount_ngn": 0,
                "payment_required": False
            }
        )

    # Generate unique transaction reference
    tx_ref = f"SUB-{req.plan_slug.upper()}-{current_user.id}-{int(datetime.now(timezone.utc).timestamp())}"
    
    paystack_init_data = {}
    if req.payment_method.upper() == "PAYSTACK" and settings.PAYSTACK_SECRET_KEY:
        ok, p_msg, p_data = await PaystackService.initialize_payment(
            email=current_user.email,
            amount_ngn=float(plan.price_ngn),
            reference=tx_ref,
            metadata={
                "user_id": current_user.id,
                "plan_slug": plan.slug,
                "plan_name": plan.name
            }
        )
        if ok:
            paystack_init_data = p_data

    return ResponseModel(
        message="Subscription invoice generated successfully. Proceed with payment verification.",
        data={
            "status": "PENDING_PAYMENT",
            "reference": tx_ref,
            "plan_slug": plan.slug,
            "plan_name": plan.name,
            "amount_ngn": float(plan.price_ngn),
            "payment_required": True,
            "provider": req.payment_method,
            "paystack_authorization_url": paystack_init_data.get("authorization_url"),
            "paystack_access_code": paystack_init_data.get("access_code"),
            "paystack_public_key": settings.PAYSTACK_PUBLIC_KEY,
            "designated_bank": {
                "bank_name": "Zenith Bank PLC",
                "account_name": "Properties & Autos Technologies Ltd - Subscription Clearing",
                "account_number": "1018899223",
                "routing_code": "057"
            }
        }
    )

@router.post("/verify-payment", response_model=ResponseModel[UserSubscriptionUsageResponse])
async def verify_subscription_payment(
    req: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Server-side verification of payment reference and activation of subscription.
    Validates directly with Paystack API if provider is PAYSTACK.
    """
    stmt = select(SubscriptionPlan).where(SubscriptionPlan.slug == req.plan_slug)
    plan = (await db.execute(stmt)).scalars().first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified subscription plan was not found."
        )

    verified_amount = float(plan.price_ngn)

    # If provider is Paystack and secret key configured, verify directly with Paystack API
    if req.provider.upper() == "PAYSTACK" and settings.PAYSTACK_SECRET_KEY:
        verified, v_msg, v_data = await PaystackService.verify_payment(req.reference)
        if not verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Paystack verification failed: {v_msg}"
            )
        verified_amount = v_data.get("amount_ngn", verified_amount)

    success, msg, sub = await SubscriptionService.activate_subscription(
        db=db,
        user_id=current_user.id,
        plan_slug=req.plan_slug,
        provider=req.provider,
        reference=req.reference,
        amount_ngn=verified_amount
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    usage = await SubscriptionService.get_subscription_usage(db, current_user.id)
    return ResponseModel(
        message=msg,
        data=usage
    )

@router.post("/paystack-webhook")
async def paystack_subscription_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Paystack Webhook listener.
    Receives charge.success and activates the user subscription automatically.
    """
    signature = request.headers.get("x-paystack-signature", "")
    body_bytes = await request.body()
    
    if not PaystackService.verify_webhook_signature(body_bytes, signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Paystack signature."
        )

    try:
        event_data = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON")

    event_type = event_data.get("event")
    if event_type == "charge.success":
        data = event_data.get("data", {})
        reference = data.get("reference")
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        plan_slug = metadata.get("plan_slug")
        amount_ngn = data.get("amount", 0) / 100.0

        if user_id and plan_slug and reference:
            await SubscriptionService.activate_subscription(
                db=db,
                user_id=int(user_id),
                plan_slug=plan_slug,
                provider="PAYSTACK",
                reference=reference,
                amount_ngn=amount_ngn
            )

    return {"status": "success"}

@router.post("/listings/{listing_id}/feature")
async def toggle_listing_featured(
    listing_id: int,
    req: FeatureListingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Designate an active listing as Featured or remove featured status within subscription allowance."""
    success, msg, listing = await SubscriptionService.toggle_featured_listing(
        db=db,
        user_id=current_user.id,
        listing_id=listing_id,
        make_featured=req.is_featured
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    return ResponseModel(
        message=msg,
        data={
            "listing_id": listing.id,
            "title": listing.title,
            "is_featured": listing.is_featured,
            "featured_at": listing.featured_at
        }
    )

@router.post("/listings/{listing_id}/boost")
async def boost_listing(
    listing_id: int,
    req: BoostListingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Apply a promotional boost credit to an active listing (elevating search ranking for 72h)."""
    success, msg, boost = await SubscriptionService.boost_listing(
        db=db,
        user_id=current_user.id,
        listing_id=listing_id,
        duration_hours=req.duration_hours
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    return ResponseModel(
        message=msg,
        data={
            "boost_id": boost.id,
            "listing_id": boost.listing_id,
            "started_at": boost.started_at,
            "expires_at": boost.expires_at,
            "duration_hours": boost.duration_hours,
            "is_active": boost.is_active
        }
    )

@router.get("/my-boosts", response_model=ResponseModel[List[BoostTransactionResponse]])
async def get_my_boosts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active and past boost promotional records for the authenticated user."""
    await SubscriptionService.process_expired_boosts(db)
    stmt = (
        select(ListingBoost)
        .where(ListingBoost.user_id == current_user.id)
        .order_by(desc(ListingBoost.started_at))
    )
    boosts = (await db.execute(stmt)).scalars().all()
    
    data = []
    for b in boosts:
        data.append({
            "id": b.id,
            "listing_id": b.listing_id,
            "listing_title": b.listing.title if b.listing else "Listing",
            "started_at": b.started_at,
            "expires_at": b.expires_at,
            "duration_hours": b.duration_hours,
            "is_active": b.is_active
        })

    return ResponseModel(
        message="Promotional boosts history retrieved.",
        data=data
    )

@router.get("/payments/history")
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all subscription payment invoices and transaction receipts."""
    stmt = (
        select(SubscriptionPayment)
        .where(SubscriptionPayment.user_id == current_user.id)
        .order_by(desc(SubscriptionPayment.created_at))
    )
    payments = (await db.execute(stmt)).scalars().all()
    
    data = []
    for p in payments:
        data.append({
            "id": p.id,
            "reference": p.reference,
            "plan_name": p.plan.name if p.plan else "Subscription Plan",
            "amount_ngn": float(p.amount_ngn),
            "provider": p.provider,
            "status": p.status,
            "paid_at": p.paid_at,
            "created_at": p.created_at
        })

    return ResponseModel(
        message="Subscription payment history retrieved.",
        data=data
    )
