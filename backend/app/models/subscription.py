from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    JSON, Text, ForeignKey, Numeric
)
from sqlalchemy.orm import relationship
from app.core.database import Base, utc_now

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    tier_category = Column(String(50), default="BUSINESS", index=True, nullable=False)  # FREE, ENTRY, GROWTH, BUSINESS, ENTERPRISE
    
    price_ngn = Column(Numeric(14, 2), default=0.0, nullable=False)
    listing_allowance = Column(Integer, default=1, nullable=False)
    featured_allowance = Column(Integer, default=0, nullable=False)
    boost_allowance = Column(Integer, default=0, nullable=False)
    duration_days = Column(Integer, default=30, nullable=False)
    
    is_active = Column(Boolean, default=True, index=True)
    display_order = Column(Integer, default=0)
    tagline = Column(String(255), nullable=True)
    badge = Column(String(50), nullable=True)
    features = Column(JSON, default=list)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    subscriptions = relationship("UserSubscription", back_populates="plan")


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id", ondelete="RESTRICT"), nullable=False)
    
    status = Column(String(50), default="ACTIVE", index=True, nullable=False)  # ACTIVE, EXPIRED, CANCELLED, PENDING_PAYMENT
    current_period_start = Column(DateTime, default=utc_now, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    auto_renew = Column(Boolean, default=False)
    
    # Boost credits tracking for current monthly cycle
    remaining_boost_credits = Column(Integer, default=0, nullable=False)
    used_boost_credits = Column(Integer, default=0, nullable=False)
    
    last_payment_reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", backref="user_subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    boosts = relationship("ListingBoost", back_populates="subscription", cascade="all, delete-orphan")
    payments = relationship("SubscriptionPayment", back_populates="subscription")


class SubscriptionPayment(Base):
    __tablename__ = "subscription_payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subscription_id = Column(Integer, ForeignKey("user_subscriptions.id", ondelete="SET NULL"), nullable=True)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id", ondelete="RESTRICT"), nullable=False)
    
    reference = Column(String(120), unique=True, index=True, nullable=False)
    amount_ngn = Column(Numeric(14, 2), nullable=False)
    provider = Column(String(50), default="PAYSTACK", nullable=False)  # PAYSTACK, FLUTTERWAVE, BANK_TRANSFER, ADMIN_ASSIGNED
    status = Column(String(50), default="PENDING", index=True, nullable=False)  # PENDING, SUCCESS, FAILED
    
    gateway_response = Column(JSON, default=dict)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", backref="subscription_payments")
    subscription = relationship("UserSubscription", back_populates="payments")
    plan = relationship("SubscriptionPlan")


class ListingBoost(Base):
    __tablename__ = "listing_boosts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False)
    subscription_id = Column(Integer, ForeignKey("user_subscriptions.id", ondelete="CASCADE"), nullable=False)
    
    started_at = Column(DateTime, default=utc_now, nullable=False)
    expires_at = Column(DateTime, index=True, nullable=False)
    duration_hours = Column(Integer, default=72, nullable=False)
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User")
    listing = relationship("Listing", backref="boosts")
    subscription = relationship("UserSubscription", back_populates="boosts")


class SubscriptionAuditLog(Base):
    __tablename__ = "subscription_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # PLAN_ASSIGNED, PLAN_UPGRADED, PLAN_DOWNGRADED, PLAN_EXPIRED, BOOST_APPLIED, FEATURED_TOGGLED
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
