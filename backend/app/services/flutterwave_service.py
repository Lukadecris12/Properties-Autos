import logging
from typing import Dict, Any, Optional, Tuple
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3"


class FlutterwaveService:
    """
    Flutterwave v3 Payment Integration Service.
    Supports USD international settlement as well as NGN and multi-currency checkouts.
    """

    @classmethod
    def get_headers(cls) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    @classmethod
    async def initialize_payment(
        cls,
        email: str,
        amount: float,
        currency: str,
        tx_ref: str,
        redirect_url: str,
        customer_name: Optional[str] = None,
        meta: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """Initializes a Flutterwave Standard hosted checkout link."""
        if not settings.FLUTTERWAVE_SECRET_KEY:
            return False, "Flutterwave secret key is not configured.", {}

        if amount <= 0:
            return False, "Payment amount must be greater than zero.", {}

        payload: Dict[str, Any] = {
            "tx_ref": tx_ref,
            "amount": str(amount),
            "currency": currency.upper(),
            "redirect_url": redirect_url,
            "customer": {
                "email": email,
                "name": customer_name or email,
            },
            "customizations": {
                "title": "Properties & Autos",
                "description": "Marketplace Subscription Plan",
            },
        }
        if meta:
            payload["meta"] = meta

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{FLUTTERWAVE_BASE_URL}/payments",
                    headers=cls.get_headers(),
                    json=payload,
                )
                data = res.json()
                if res.status_code == 200 and data.get("status") == "success":
                    res_data = data.get("data", {})
                    return True, "Flutterwave checkout initialized.", {
                        "payment_link": res_data.get("link"),
                        "tx_ref": tx_ref,
                        "public_key": settings.FLUTTERWAVE_PUBLIC_KEY,
                    }
                msg = data.get("message", "Flutterwave initialization failed.")
                logger.warning(f"Flutterwave init failed: {msg}")
                return False, msg, {}
        except Exception as e:
            logger.error(f"Flutterwave initialize network exception: {e}")
            return False, f"Could not reach Flutterwave gateway: {str(e)}", {}

    @classmethod
    async def verify_payment(
        cls,
        tx_ref: str,
        transaction_id: Optional[str] = None,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """Verifies a Flutterwave transaction server-to-server by transaction ID or tx_ref."""
        if not settings.FLUTTERWAVE_SECRET_KEY:
            return False, "Flutterwave secret key is not configured.", {}

        url = (
            f"{FLUTTERWAVE_BASE_URL}/transactions/{transaction_id}/verify"
            if transaction_id
            else f"{FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref={tx_ref}"
        )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(url, headers=cls.get_headers())
                data = res.json()
                if res.status_code == 200 and data.get("status") == "success":
                    tx_data = data.get("data", {})
                    if tx_data.get("status") == "successful":
                        return True, "Payment successfully verified by Flutterwave.", {
                            "reference": tx_data.get("tx_ref", tx_ref),
                            "transaction_id": tx_data.get("id"),
                            "status": "SUCCESS",
                            "amount": float(tx_data.get("amount", 0)),
                            "currency": tx_data.get("currency", "USD"),
                            "customer_email": tx_data.get("customer", {}).get("email"),
                            "meta": tx_data.get("meta", {}),
                        }
                    return False, f"Flutterwave transaction status: {tx_data.get('status')}", {}
                return False, data.get("message", "Flutterwave verification failed."), {}
        except Exception as e:
            logger.error(f"Flutterwave verify network exception: {e}")
            return False, f"Could not verify payment with Flutterwave: {str(e)}", {}

    @classmethod
    def verify_webhook_hash(cls, verif_hash: Optional[str]) -> bool:
        """Validates Flutterwave's verif-hash header."""
        if not verif_hash or not settings.FLUTTERWAVE_SECRET_KEY:
            return False
        return verif_hash == settings.FLUTTERWAVE_SECRET_KEY
