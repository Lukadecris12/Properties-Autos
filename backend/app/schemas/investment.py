from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class InvestmentCreate(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=20)
    asset_category: str = "RESIDENTIAL"
    location: str
    target_amount: float = Field(..., gt=0)
    minimum_investment: float = Field(default=500000.0, gt=0)
    projected_roi_percentage: float = Field(..., gt=0, le=100)
    tenure_months: int = Field(default=12, ge=1)
    dividend_cycle: str = "Quarterly"
    image_urls: List[str] = Field(default_factory=list)
    documents: List[Any] = Field(default_factory=list)

class InvestmentResponse(BaseModel):
    id: int
    developer_id: Optional[int] = None
    developer_name: str
    title: str
    description: str
    asset_category: str
    location: str
    target_amount: float
    raised_amount: float
    minimum_investment: float
    projected_roi_percentage: float
    tenure_months: int
    dividend_cycle: str
    investors_count: int
    funding_progress_percentage: float
    image_urls: List[str]
    status: str
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class InvestOrderRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "escrow"

class UserInvestmentResponse(BaseModel):
    id: int
    investment_id: int
    amount_invested: float
    projected_return: float
    payout_received: float
    status: str
    invested_at: datetime
    property: Optional[InvestmentResponse] = None

    class Config:
        from_attributes = True
