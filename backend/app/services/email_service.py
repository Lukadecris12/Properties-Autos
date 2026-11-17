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

async def send_verification_otp_email(to_email: str, otp_code: str, purpose: str = "signup") -> dict:
    """
    Sends a 6-digit OTP verification email via Resend HTTP API.
    Gracefully falls back to local simulation if no RESEND_API_KEY is configured.
    """
    if purpose == "reset":
        subject = f"{otp_code} is your Properties & Autos Password Reset Code"
        email_title = "Reset Your Password"
        email_intro = ("We received a request to reset the password on your Properties &amp; Autos account. "
                       "Use the 6-digit code below to set a new password.")
    else:
        subject = f"{otp_code} is your Properties & Autos Verification Code"
        email_title = "Verify Your Registration"
        email_intro = ("Thank you for initiating signup on Properties &amp; Autos — the Premier Real Estate &amp; Automotive Marketplace. "
                       "Please use the 6-digit verification code below to verify your email and continue your onboarding.")
    
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
          Properties <span>&amp; Autos</span>
        </div>
        <div class="title">{email_title}</div>
        <div class="desc">
          {email_intro}
        </div>
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        <div class="desc">
          This verification code expires in <strong>15 minutes</strong>. If you did not initiate this request, please safely disregard this email.
        </div>
        <div class="footer">
          &copy; 2026 Properties &amp; Autos Technologies. All rights reserved.<br>
          AI-Powered Property &amp; Automobile Marketplace • Verified Platform
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
                
                # If custom domain is not yet verified in Resend, fall back to onboarding@resend.dev
                if response.status_code in [403, 422]:
                    logger.warning(f"Domain sending failed ({response.status_code}), retrying via onboarding@resend.dev: {response.text}")
                    fallback_response = await client.post(
                        "https://api.resend.com/emails",
                        headers={
                            "Authorization": f"Bearer {resend_api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "from": "Properties & Autos <onboarding@resend.dev>",
                            "to": [to_email],
                            "subject": subject,
                            "html": html_content,
                        },
                    )
                    if fallback_response.status_code in [200, 201]:
                        logger.info(f"Resend fallback email sent successfully to {to_email}")
                        return {"status": "sent", "provider": "resend_onboarding", "data": fallback_response.json()}
                    else:
                        logger.warning(f"Resend fallback failed: {fallback_response.text}")
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


async def send_platform_notification_email(
    to_email: str,
    subject: str,
    title: str,
    message_html: str,
    cta_label: str = "Open Dashboard",
    cta_url: str = "https://propertiesandautos.online/dashboard",
) -> dict:
    """Sends a branded Resend notification email for subscriptions, featured listings, and boosts."""
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
        }}
        .logo {{
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 20px;
        }}
        .logo span {{ color: #10b981; }}
        .title {{
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
        }}
        .desc {{
          font-size: 14px;
          color: #d1d5db;
          line-height: 1.6;
          margin-bottom: 24px;
        }}
        .cta {{
          display: inline-block;
          background-color: #059669;
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 10px;
        }}
        .footer {{
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #1f2937;
          padding-top: 16px;
          margin-top: 28px;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Properties <span>&amp; Autos</span></div>
        <div class="title">{title}</div>
        <div class="desc">{message_html}</div>
        <a href="{cta_url}" class="cta">{cta_label}</a>
        <div class="footer">
          &copy; 2026 Properties &amp; Autos Technologies. All rights reserved.<br>
          AI-Powered Property &amp; Automobile Marketplace • <a href="https://propertiesandautos.online" style="color:#10b981;">propertiesandautos.online</a>
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
                    return {"status": "sent", "provider": "resend"}
        except Exception as e:
            logger.warning(f"Failed to send platform notification email to {to_email}: {e}")

    return {"status": "simulated", "provider": "development_logger"}
