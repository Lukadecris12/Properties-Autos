from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    listings,
    requirements,
    matching,
    search,
    bookings,
    inspections,
    messages,
    verification,
    ai_assistant,
    investments,
    admin,
    media
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User Accounts"])
api_router.include_router(listings.router, prefix="/listings", tags=["Listings (Sale, Rent, Lease)"])
api_router.include_router(media.router, prefix="/media", tags=["Media & File Uploads"])
api_router.include_router(requirements.router, prefix="/requirements", tags=["Marketplace Requirements"])
api_router.include_router(investments.router, prefix="/investments", tags=["Property Investment (Developers)"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Dashboard & System Audit"])
api_router.include_router(matching.router, prefix="/matching", tags=["AI Matching Engine"])
api_router.include_router(search.router, prefix="/search", tags=["Search & Discovery"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings & Availability"])
api_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections & Viewings"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages & Communication"])
api_router.include_router(verification.router, prefix="/verification", tags=["Trust & Verification"])
api_router.include_router(ai_assistant.router, prefix="/ai", tags=["AI Concierge & Marketplace Intelligence"])
