from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base, utc_now

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    temp_hashed_password = Column(String(255), nullable=True)
    otp_code = Column(String(10), nullable=False)
    verification_token = Column(String(255), unique=True, index=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    expires_at = Column(DateTime, nullable=False, default=lambda: utc_now() + timedelta(minutes=15))
    created_at = Column(DateTime, default=utc_now)

    @property
    def is_expired(self) -> bool:
        now = datetime.now(timezone.utc)
        # Ensure timezone-aware comparison
        expiry = self.expires_at
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        return now > expiry
