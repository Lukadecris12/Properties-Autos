"""
Bulk-create (and optionally activate) all PropertyHub paid subscription plans
in Google Play Console via the Google Play Developer API (v3).

Usage:
    1. Install Google API dependencies (if not already installed):
       pip install google-api-python-client google-auth

    2. Preview all 61 plans without making API calls:
       python scripts/sync_play_subscriptions.py --dry-run

    3. Create all plans in Google Play Console (in Draft state):
       python scripts/sync_play_subscriptions.py --credentials path/to/service-account.json

    4. Create AND activate base plans (includes optional annual base plan):
       python scripts/sync_play_subscriptions.py --credentials path/to/service-account.json --annual --activate
"""

import argparse
import os
import sys
import time
from typing import Any, Callable, Dict, List, TypeVar


def build_default_plans_catalogue() -> List[Dict[str, Any]]:
    """Mirror of app.services.subscription_service.build_default_plans_catalogue() without DB/ORM deps."""
    plans: List[Dict[str, Any]] = [
        {
            "slug": "explorer",
            "name": "Explorer",
            "tier_category": "ENTRY",
            "price_ngn": 4200,
            "tagline": "Ideal for active individual sellers and private vehicle owners",
            "features": [
                "Up to 5 active published listings",
                "1 featured listing placement",
                "Standard search ranking",
                "WhatsApp & call inquiries",
            ],
        },
        {
            "slug": "starter",
            "name": "Starter",
            "tier_category": "ENTRY",
            "price_ngn": 6300,
            "tagline": "For rising property agents and boutique car dealers",
            "features": [
                "Up to 10 active published listings",
                "3 featured listing placements",
                "1 promotional search boost credit per month (72h duration)",
                "Priority buyer match notifications",
            ],
        },
        {
            "slug": "growth",
            "name": "Growth",
            "tier_category": "GROWTH",
            "price_ngn": 11200,
            "tagline": "Powering high-volume real estate brokers and automotive merchants",
            "features": [
                "Up to 40 active published listings",
                "10 featured listing placements",
                "5 promotional search boost credits per month",
                "Official Verified Partner badge eligible",
            ],
        },
    ]

    for count in range(100, 2501, 50):
        step = (count - 100) // 50
        price = 14560 + (step * 3360)
        featured = 20 + (step * 10)
        boosts = 10 + (step * 5)
        plans.append({
            "slug": f"business-{count}",
            "name": f"Business {count}",
            "tier_category": "BUSINESS",
            "price_ngn": price,
            "tagline": f"Enterprise-grade throughput with {count} active listings & {boosts} monthly boosts",
            "features": [
                f"Up to {count:,} active listings",
                f"{featured:,} featured listing slots",
                f"{boosts:,} search boost credits per monthly cycle",
                "Dedicated Agency Storefront in Directory",
            ],
        })

    ent_data = [
        (2750, 192640, 550, 275),
        (3000, 209440, 600, 300),
        (3250, 226240, 650, 325),
        (3500, 243040, 700, 350),
        (4000, 276640, 800, 400),
        (4500, 310240, 900, 450),
        (5000, 343840, 1000, 500),
        (5500, 377440, 1100, 550),
        (6000, 411040, 1200, 600),
    ]
    for count, price, featured, boosts in ent_data:
        plans.append({
            "slug": f"enterprise-{count}",
            "name": f"Enterprise {count:,}",
            "tier_category": "ENTERPRISE",
            "price_ngn": price,
            "tagline": f"Master developer & dealership nationwide portfolio ({count:,} slots)",
            "features": [
                f"Up to {count:,} active listings capacity",
                f"{featured:,} featured listing slots",
                f"{boosts:,} boost credits per month",
                "Full developer API & feed syndication access",
            ],
        })

    return plans

PACKAGE_NAME = "com.propertyhub.luxury.app"
REGIONS_VERSION = "2026/01"
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]
T = TypeVar("T")


def execute_with_retry(fn: Callable[[], T], HttpError: Any, retries: int = 3) -> T:
    """Retry transient 500/503 Google Play API errors with exponential backoff."""
    for attempt in range(retries):
        try:
            return fn()
        except HttpError as e:
            if e.resp.status in (429, 500, 503) and attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  -> Transient {e.resp.status}, retrying in {wait}s...")
                time.sleep(wait)
                continue
            raise
    raise RuntimeError("Unreachable")


def to_product_id(slug: str) -> str:
    """Convert backend plan slug (e.g. 'business-500') to Google Play productId."""
    return f"propertyhub_{slug.replace('-', '_').lower()}"


def build_regional_configs(service: Any, package_name: str, price_ngn: int) -> Dict[str, Any]:
    """Use Google Play's convertRegionPrices API to generate prices for all supported regions."""
    resp = (
        service.monetization()
        .convertRegionPrices(
            packageName=package_name,
            body={
                "price": {
                    "currencyCode": "NGN",
                    "units": str(price_ngn),
                    "nanos": 0,
                }
            },
        )
        .execute()
    )

    regional_configs: List[Dict[str, Any]] = []
    for region_code, cfg in resp.get("convertedRegionPrices", {}).items():
        regional_configs.append(
            {
                "regionCode": region_code,
                "newSubscriberAvailability": True,
                "price": cfg["price"],
            }
        )

    other_prices = resp.get("convertedOtherRegionsPrice", {})
    other_regions_config = {
        "usdPrice": other_prices.get("usdPrice"),
        "eurPrice": other_prices.get("eurPrice"),
        "newSubscriberAvailability": True,
    }

    return {
        "regionsVersion": resp.get("regionVersion", {}).get("version", REGIONS_VERSION),
        "regionalConfigs": regional_configs,
        "otherRegionsConfig": other_regions_config,
    }


def build_base_plan(
    base_plan_id: str,
    billing_period: str,
    pricing: Dict[str, Any],
) -> Dict[str, Any]:
    return {
        "basePlanId": base_plan_id,
        "autoRenewingBasePlanType": {
            "billingPeriodDuration": billing_period,
            "gracePeriodDuration": "P7D",
            "resubscribeState": "RESUBSCRIBE_STATE_ACTIVE",
        },
        "regionalConfigs": pricing["regionalConfigs"],
        "otherRegionsConfig": pricing["otherRegionsConfig"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync PropertyHub subscription plans to Google Play Console.")
    parser.add_argument("--credentials", help="Path to Google Play Service Account JSON key.")
    parser.add_argument("--package-name", default=PACKAGE_NAME, help=f"Android package name (default: {PACKAGE_NAME}).")
    parser.add_argument("--annual", action="store_true", help="Also add an 'annual' base plan at 10x the monthly price.")
    parser.add_argument("--activate", action="store_true", help="Activate base plans immediately after creation.")
    parser.add_argument(
        "--tier",
        choices=["ENTRY", "GROWTH", "BUSINESS", "ENTERPRISE"],
        help="Optional filter to sync only a specific tier category.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print plans that would be created without calling Google Play.")
    args = parser.parse_args()

    catalogue = [p for p in build_default_plans_catalogue() if p["slug"] != "free"]
    if args.tier:
        catalogue = [p for p in catalogue if p["tier_category"] == args.tier]

    print(f"Loaded {len(catalogue)} paid plans for package '{args.package_name}'.")

    if args.dry_run:
        for idx, plan in enumerate(catalogue, start=1):
            pid = to_product_id(plan["slug"])
            monthly_ngn = int(plan["price_ngn"])
            annual_info = f" | annual: NGN {monthly_ngn * 10:,}" if args.annual else ""
            print(f"[{idx:02d}/{len(catalogue)}] {pid:<32} | {plan['name']:<18} | monthly: NGN {monthly_ngn:,}{annual_info}")
        return

    if not args.credentials:
        parser.error("--credentials is required unless --dry-run is specified.")

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
    except ImportError:
        print("Missing dependencies. Install with:\n  pip install google-api-python-client google-auth")
        sys.exit(1)

    creds = service_account.Credentials.from_service_account_file(args.credentials, scopes=SCOPES)
    service = build("androidpublisher", "v3", credentials=creds)

    created, skipped, failed = 0, 0, 0

    for idx, plan in enumerate(catalogue, start=1):
        product_id = to_product_id(plan["slug"])
        monthly_ngn = int(plan["price_ngn"])
        title = f"PropertyHub {plan['name']}"[:55]
        description = (plan.get("tagline") or plan["name"])[:80]

        print(f"[{idx:02d}/{len(catalogue)}] Processing {product_id} (NGN {monthly_ngn:,}/mo)...")

        try:
            monthly_pricing = execute_with_retry(
                lambda: build_regional_configs(service, args.package_name, monthly_ngn),
                HttpError,
            )
            base_plans = [build_base_plan("monthly", "P1M", monthly_pricing)]

            if args.annual:
                annual_pricing = execute_with_retry(
                    lambda: build_regional_configs(service, args.package_name, monthly_ngn * 10),
                    HttpError,
                )
                base_plans.append(build_base_plan("annual", "P1Y", annual_pricing))

            body = {
                "packageName": args.package_name,
                "productId": product_id,
                "listings": [
                    {
                        "languageCode": "en-US",
                        "title": title,
                        "description": description,
                        "benefits": [b[:40] for b in (plan.get("features") or [])[:4]],
                    }
                ],
                "basePlans": base_plans,
            }

            execute_with_retry(
                lambda: service.monetization()
                .subscriptions()
                .create(
                    packageName=args.package_name,
                    productId=product_id,
                    regionsVersion_version=monthly_pricing["regionsVersion"],
                    body=body,
                )
                .execute(),
                HttpError,
            )
            created += 1
            print(f"  -> Created {product_id}")

            if args.activate:
                for bp in base_plans:
                    bp_id = bp["basePlanId"]
                    execute_with_retry(
                        lambda bp_id=bp_id: service.monetization()
                        .subscriptions()
                        .basePlans()
                        .activate(
                            packageName=args.package_name,
                            productId=product_id,
                            basePlanId=bp_id,
                            body={},
                        )
                        .execute(),
                        HttpError,
                    )
                    print(f"  -> Activated base plan '{bp_id}'")

        except HttpError as e:
            if e.resp.status == 409:
                skipped += 1
                print(f"  -> Already exists, skipping ({product_id})")
            else:
                failed += 1
                print(f"  -> ERROR ({e.resp.status}): {e.error_details or e}")
        except Exception as e:
            failed += 1
            print(f"  -> ERROR: {e}")

    print(f"\nDone. Created: {created}, Skipped (existing): {skipped}, Failed: {failed}")


if __name__ == "__main__":
    main()
