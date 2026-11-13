from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base, utc_now

class InvestmentProperty(Base):
    __tablename__ = "investment_properties"

    id = Column(Integer, primary_key=True, index=True)
    developer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    developer_name = Column(String(200), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    asset_category = Column(String(50), default="RESIDENTIAL")  # RESIDENTIAL, COMMERCIAL, LAND
    location = Column(String(255), nullable=False)
    
    # Financials & Returns
    target_amount = Column(Float, nullable=False)
    raised_amount = Column(Float, default=0.0)
    minimum_investment = Column(Float, default=500000.0)
    projected_roi_percentage = Column(Float, nullable=False)  # e.g. 28.0 (for 28%)
    tenure_months = Column(Integer, default=12)  # e.g. 12, 18, 24
    dividend_cycle = Column(String(50), default="Quarterly")  # Monthly, Quarterly, Bi-Annually, At Maturity
    
    investors_count = Column(Integer, default=0)
    image_urls = Column(JSON, default=list)
    documents = Column(JSON, default=list)  # Legal prospectus, land title C of O, trust deed
    
    status = Column(String(50), default="active")  # active, fully_funded, completed
    is_approved = Column(Boolean, default=True)  # Admin approval flag
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    investments = relationship("UserInvestment", back_populates="property", cascade="all, delete-orphan")

    @property
    def funding_progress_percentage(self) -> float:
        if self.target_amount <= 0:
            return 0.0
        return min(round((self.raised_amount / self.target_amount) * 100, 1), 100.0)

class UserInvestment(Base):
    __tablename__ = "user_investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    investment_id = Column(Integer, ForeignKey("investment_properties.id", ondelete="CASCADE"), nullable=False)
    
    amount_invested = Column(Float, nullable=False)
    projected_return = Column(Float, nullable=False)
    payout_received = Column(Float, default=0.0)
    
    status = Column(String(50), default="active")  # active, matured, liquidated
    invested_at = Column(DateTime, default=utc_now)

    # Relationships
    property = relationship("InvestmentProperty", back_populates="investments")
    user = relationship("User")
