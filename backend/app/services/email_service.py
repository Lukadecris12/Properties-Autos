import os
import random
import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

def generate_otp_code() -> str:
    """Generate a random 6-digit numeric verification code."""
    return f"{random.randint(100000, 999999)}"

async def send_verification_otp_email(to_email: str, otp_code: str) -> dict:
    """
    Sends a 6-digit OTP verification email via Resend HTTP API.
    Gracefully falls back to local simulation if no RESEND_API_KEY is configured.
    """
    subject = f"{otp_code} is your PropertyHub Verification Code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b0f19;
          color: #f3f4f6;
          margin: 0;
          padding: 24px;
        }}
        .container {{
          max-width: 540px;
          margin: 0 auto;
          background-color: #111827;
          border: 1px solid #1f2937;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }}
        .logo {{
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }}
        .logo span {{
          color: #10b981;
        }}
        .title {{
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }}
        .desc {{
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 24px;
        }}
        .otp-box {{
          background-color: #064e3b;
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          margin-bottom: 24px;
        }}
        .otp-code {{
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #ffffff;
          font-family: monospace;
        }}
        .footer {{
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #1f2937;
          padding-top: 16px;
          margin-top: 24px;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          Property<span>Hub</span>
        </div>
        <div class="title">Verify Your Registration</div>
        <div class="desc">
          Thank you for initiating signup on PropertyHub — the Premier Real Estate & Automotive Marketplace. 
          Please use the 6-digit verification code below to verify your email and continue your onboarding.
        </div>
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        <div class="desc">
          This verification code expires in <strong>10 minutes</strong>. If you did not initiate this request, please safely disregard this email.
        </div>
        <div class="footer">
          &copy; 2026 PropertyHub Technologies. All rights reserved.<br>
          AI-Powered Property & Automobile Marketplace • Escrow Protected
        </div>
      </div>
    </body>
    </html>
    """

    resend_api_key = settings.RESEND_API_KEY or os.environ.get("RESEND_API_KEY", "")

    if resend_api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": settings.RESEND_FROM_EMAIL,
                        "to": [to_email],
                        "subject": subject,
                        "html": html_content,
                    },
                )
                if response.status_code in [200, 201]:
                    logger.info(f"Resend email sent successfully to {to_email}")
                    return {"status": "sent", "provider": "resend", "data": response.json()}
                else:
                    logger.warning(f"Resend API returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error calling Resend API: {e}")

    # Fallback / Development Simulation mode
    logger.info(f"[DEV / SIMULATION] Resend OTP for {to_email}: {otp_code}")
    return {
        "status": "simulated",
        "provider": "development_logger",
        "otp_debug": otp_code,
        "message": f"Verification code sent to {to_email}"
    }
