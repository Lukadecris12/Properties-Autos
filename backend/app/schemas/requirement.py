from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, model_validator
from decimal import Decimal

from app.models.enums import (
    TransactionType, AssetCategory, RequirementStatus, RentalPeriod
)

class RequirementBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    transaction_type: TransactionType
    asset_category: AssetCategory
    
    min_budget: Optional[Decimal] = None
    max_budget: Decimal = Field(..., gt=0)
    currency: str = "NGN"
    
    rental_period: Optional[RentalPeriod] = None
    desired_duration: Optional[int] = None
    move_in_date: Optional[datetime] = None
    
    preferred_country: str = "Nigeria"
    preferred_state: str
    preferred_city: str
    preferred_neighbourhoods: List[str] = Field(default_factory=list)
    max_distance_km: float = 25.0
    
    criteria: Dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode='after')
    def validate_transaction_requirement(self):
        if self.transaction_type in [TransactionType.RENT, TransactionType.LEASE]:
            if not self.rental_period:
                raise ValueError("Rental period must be specified for rent or lease requirements.")
        elif self.transaction_type == TransactionType.SALE:
            if self.rental_period is not None:
                raise ValueError("Sale requirements cannot have a recurring rental period.")
        return self

class RequirementCreate(RequirementBase):
    status: Optional[RequirementStatus] = RequirementStatus.ACTIVE

class RequirementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    currency: Optional[str] = None
    rental_period: Optional[RentalPeriod] = None
    status: Optional[RequirementStatus] = None
    preferred_state: Optional[str] = None
    preferred_city: Optional[str] = None
    preferred_neighbourhoods: Optional[List[str]] = None
    criteria: Optional[Dict[str, Any]] = None

class RequirementResponse(RequirementBase):
    id: int
    user_id: int
    status: RequirementStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
