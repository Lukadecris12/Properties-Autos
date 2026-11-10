import hmac
import hashlib
import json
import logging
from typing import Dict, Any, Optional, Tuple
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

PAYSTACK_BASE_URL = "https://api.paystack.co"

class PaystackService:
    """
    Paystack Payment Integration Service.
    Handles transaction initialization, server-to-server verification,
    and webhook signature validation.
    """

    @classmethod
    def get_headers(cls) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    @classmethod
    async def initialize_payment(
        cls,
        email: str,
        amount_ngn: float,
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        channels: Optional[list] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Initializes a Paystack transaction.
        Amount must be converted to kobo (integer).
        """
        if not settings.PAYSTACK_SECRET_KEY:
            return False, "Paystack secret key is not configured.", {}

        # Convert Naira to Kobo (multiply by 100)
        amount_kobo = int(round(amount_ngn * 100))
        if amount_kobo <= 0:
            return False, "Payment amount must be greater than zero.", {}

        payload: Dict[str, Any] = {
            "email": email,
            "amount": amount_kobo,
            "reference": reference,
            "currency": "NGN",
        }

        if callback_url:
            payload["callback_url"] = callback_url

        if metadata:
            payload["metadata"] = metadata

        if channels:
            payload["channels"] = channels

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{PAYSTACK_BASE_URL}/transaction/initialize",
                    headers=cls.get_headers(),
                    json=payload
                )
                data = res.json()
                if res.status_code == 200 and data.get("status"):
                    res_data = data.get("data", {})
                    return True, "Payment initialized successfully.", {
                        "authorization_url": res_data.get("authorization_url"),
                        "access_code": res_data.get("access_code"),
                        "reference": res_data.get("reference", reference),
                        "public_key": settings.PAYSTACK_PUBLIC_KEY
                    }
                else:
                    msg = data.get("message", "Paystack initialization failed.")
                    logger.warning(f"Paystack init failed: {msg}")
                    return False, msg, {}
        except Exception as e:
            logger.error(f"Paystack initialize network exception: {e}")
            return False, f"Could not reach Paystack gateway: {str(e)}", {}

    @classmethod
    async def verify_payment(cls, reference: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Verifies a transaction directly with Paystack via server-to-server API.
        """
        if not settings.PAYSTACK_SECRET_KEY:
            return False, "Paystack secret key is not configured.", {}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(
                    f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
                    headers=cls.get_headers()
                )
                data = res.json()
                if res.status_code == 200 and data.get("status"):
                    tx_data = data.get("data", {})
                    gateway_status = tx_data.get("status")

                    if gateway_status == "success":
                        amount_paid_ngn = tx_data.get("amount", 0) / 100.0
                        return True, "Payment successfully verified by Paystack.", {
                            "reference": reference,
                            "status": "SUCCESS",
                            "amount_ngn": amount_paid_ngn,
                            "currency": tx_data.get("currency", "NGN"),
                            "paid_at": tx_data.get("paid_at"),
                            "channel": tx_data.get("channel"),
                            "customer_email": tx_data.get("customer", {}).get("email"),
                            "metadata": tx_data.get("metadata", {}),
                            "gateway_response": tx_data.get("gateway_response")
                        }
                    else:
                        return False, f"Transaction is not completed (status: {gateway_status}).", {
                            "reference": reference,
                            "status": gateway_status,
                            "gateway_response": tx_data.get("gateway_response")
                        }
                else:
                    return False, data.get("message", "Paystack verification failed."), {}
        except Exception as e:
            logger.error(f"Paystack verify network exception: {e}")
            return False, f"Could not reach Paystack verification gateway: {str(e)}", {}

    @classmethod
    def verify_webhook_signature(cls, payload_bytes: bytes, signature: str) -> bool:
        """
        Validates the HMAC SHA512 signature from Paystack webhook headers.
        """
        if not settings.PAYSTACK_SECRET_KEY or not signature:
            return False

        computed_signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
            payload_bytes,
            hashlib.sha512
        ).hexdigest()

        return hmac.compare_digest(computed_signature, signature)
