from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

from app.schemas.listing import ListingResponse
from app.schemas.requirement import RequirementResponse

class AIMatchResponse(BaseModel):
    id: int
    requirement_id: int
    listing_id: int
    compatibility_score: float
    score_breakdown: Dict[str, Any]
    explanation: str
    is_viewed: bool
    is_contacted: bool
    is_dismissed: bool
    created_at: datetime
    listing: Optional[ListingResponse] = None
    requirement: Optional[RequirementResponse] = None

    class Config:
        from_attributes = True

class MatchTriggerRequest(BaseModel):
    target_id: int
    target_type: str  # "requirement" or "listing"
