import math
from datetime import datetime
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.listing import Listing
from app.models.requirement import Requirement, AIMatch
from app.models.enums import TransactionType, AssetCategory, ListingStatus, RequirementStatus

class MatchingEngine:
    """
    Intelligent Bidirectional AI Matching Engine for PropertyHub.
    Enforces strict transaction separation (SALE, RENT, LEASE),
    computes multi-factor weighted compatibility (0-100),
    and generates natural-language explanations.
    """

    @staticmethod
    def calculate_location_score(
        req_state: str,
        req_city: str,
        req_neighbourhoods: List[str],
        listing_state: str,
        listing_city: str,
        listing_neighbourhood: str
    ) -> float:
        # Normalize strings
        req_state = (req_state or "").strip().lower()
        req_city = (req_city or "").strip().lower()
        listing_state = (listing_state or "").strip().lower()
        listing_city = (listing_city or "").strip().lower()
        listing_neighbourhood = (listing_neighbourhood or "").strip().lower()
        
        # State mismatch = 0
        if req_state and listing_state and req_state != listing_state:
            return 0.0

        # State matches
        score = 60.0
        
        # City matches
        if req_city and listing_city and req_city == listing_city:
            score += 25.0
            
        # Neighbourhood matches
        normalized_req_hoods = [h.strip().lower() for h in (req_neighbourhoods or [])]
        if listing_neighbourhood and any(listing_neighbourhood in h or h in listing_neighbourhood for h in normalized_req_hoods):
            score += 15.0
            
        return min(100.0, score)

    @staticmethod
    def calculate_budget_score(
        min_budget: float,
        max_budget: float,
        price: float
    ) -> float:
        if price <= 0 or max_budget <= 0:
            return 0.0
            
        # If price is within budget
        if price <= max_budget:
            if min_budget and price < min_budget:
                # Below minimum budget (possible under-specification, e.g. lower quality)
                ratio = price / min_budget
                return max(50.0, ratio * 90.0)
            return 100.0
        else:
            # Over budget: penalize based on percentage exceeded
            excess_ratio = (price - max_budget) / max_budget
            if excess_ratio > 0.4:  # More than 40% over budget
                return 0.0
            score = 100.0 - (excess_ratio * 200.0)
            return max(10.0, score)

    @staticmethod
    def calculate_specs_score(
        category: AssetCategory,
        criteria: Dict[str, Any],
        attributes: Dict[str, Any]
    ) -> float:
        if not criteria:
            return 85.0  # General match if user did not specify fine-grained criteria
            
        total_checks = 0
        passed_checks = 0
        
        if category == AssetCategory.RESIDENTIAL:
            # Bedrooms check
            if "min_bedrooms" in criteria and criteria["min_bedrooms"]:
                total_checks += 1
                if attributes.get("bedrooms", 0) >= criteria["min_bedrooms"]:
                    passed_checks += 1
            # Bathrooms check
            if "min_bathrooms" in criteria and criteria["min_bathrooms"]:
                total_checks += 1
                if attributes.get("bathrooms", 0) >= criteria["min_bathrooms"]:
                    passed_checks += 1
            # Furnishing check
            if "furnishing" in criteria and criteria["furnishing"]:
                total_checks += 1
                if attributes.get("furnishing_status") == criteria["furnishing"]:
                    passed_checks += 1

        elif category == AssetCategory.VEHICLE:
            # Brand check
            if "brand" in criteria and criteria["brand"]:
                total_checks += 1
                if str(attributes.get("brand", "")).lower() == str(criteria["brand"]).lower():
                    passed_checks += 1
            # Model check
            if "model" in criteria and criteria["model"]:
                total_checks += 1
                if str(criteria["model"]).lower() in str(attributes.get("model", "")).lower():
                    passed_checks += 1
            # Transmission check
            if "transmission" in criteria and criteria["transmission"]:
                total_checks += 1
                if str(attributes.get("transmission", "")).lower() == str(criteria["transmission"]).lower():
                    passed_checks += 1
            # Year check
            if "min_year" in criteria and criteria["min_year"]:
                total_checks += 1
                if attributes.get("year", 0) >= criteria["min_year"]:
                    passed_checks += 1

        elif category == AssetCategory.LAND:
            # Land size check
            if "min_size" in criteria and criteria["min_size"]:
                total_checks += 1
                if attributes.get("land_size", 0) >= criteria["min_size"]:
                    passed_checks += 1

        elif category == AssetCategory.COMMERCIAL:
            if "min_floor_area" in criteria and criteria["min_floor_area"]:
                total_checks += 1
                if attributes.get("floor_area", 0) >= criteria["min_floor_area"]:
                    passed_checks += 1

        if total_checks == 0:
            return 90.0
            
        return round((passed_checks / total_checks) * 100.0, 1)

    @classmethod
    def generate_explanation(
        cls,
        req: Requirement,
        listing: Listing,
        total_score: float,
        breakdown: Dict[str, float]
    ) -> str:
        transaction_desc = {
            TransactionType.SALE: "purchase",
            TransactionType.RENT: "rental",
            TransactionType.LEASE: "lease"
        }.get(req.transaction_type, "match")

        reasons = []
        if breakdown.get("budget_score", 0) >= 90:
            reasons.append(f"fits well within your {req.currency} {req.max_budget:,.2f} budget")
        elif breakdown.get("budget_score", 0) >= 60:
            reasons.append("is competitively priced relative to your target budget")

        if breakdown.get("location_score", 0) >= 85:
            reasons.append(f"is directly located in {listing.city}, {listing.state}")
        elif breakdown.get("location_score", 0) >= 60:
            reasons.append(f"is situated in your preferred state of {listing.state}")

        if breakdown.get("specs_score", 0) >= 80:
            reasons.append("satisfies your core specifications and amenity criteria")

        explanation = f"Recommended {transaction_desc} match with an overall {total_score:.0f}% compatibility score. This asset "
        if reasons:
            explanation += ", and ".join(reasons) + "."
        else:
            explanation += "aligns closely with your specified marketplace requirements."
            
        return explanation

    @classmethod
    async def match_requirement_to_listings(
        cls,
        db: AsyncSession,
        requirement: Requirement
    ) -> List[AIMatch]:
        """
        Direction A: Find compatible published listings for a given user requirement.
        Strictly enforces:
        1. transaction_type must match exactly (SALE->SALE, RENT->RENT, LEASE->LEASE)
        2. asset_category must match exactly
        3. status must be PUBLISHED
        4. rental_period must align for RENT / LEASE
        """
        # Strict compatibility query
        query = select(Listing).where(
            Listing.transaction_type == requirement.transaction_type,
            Listing.asset_category == requirement.asset_category,
            Listing.status == ListingStatus.PUBLISHED,
            Listing.user_id != requirement.user_id  # Do not match user to their own listings
        )

        if requirement.transaction_type in [TransactionType.RENT, TransactionType.LEASE] and requirement.rental_period:
            query = query.where(Listing.rental_period == requirement.rental_period)

        result = await db.execute(query)
        candidate_listings = result.scalars().all()

        created_matches: List[AIMatch] = []

        for listing in candidate_listings:
            # Calculate component scores
            loc_score = cls.calculate_location_score(
                requirement.preferred_state,
                requirement.preferred_city,
                requirement.preferred_neighbourhoods,
                listing.state,
                listing.city,
                listing.neighbourhood
            )
            # If location score is 0 (wrong state), skip
            if loc_score == 0:
                continue

            budg_score = cls.calculate_budget_score(
                float(requirement.min_budget) if requirement.min_budget else 0.0,
                float(requirement.max_budget),
                float(listing.price)
            )
            if budg_score == 0:
                continue

            specs_score = cls.calculate_specs_score(
                requirement.asset_category,
                requirement.criteria or {},
                listing.attributes or {}
            )

            # Weighted overall score (0 - 100)
            # Budget: 35%, Location: 35%, Specs: 30%
            total_score = round(
                (budg_score * 0.35) + (loc_score * 0.35) + (specs_score * 0.30),
                1
            )

            if total_score >= 50.0:  # Threshold for qualified match
                breakdown = {
                    "budget_score": budg_score,
                    "location_score": loc_score,
                    "specs_score": specs_score
                }
                explanation = cls.generate_explanation(requirement, listing, total_score, breakdown)

                # Check if match already exists
                existing_stmt = select(AIMatch).where(
                    AIMatch.requirement_id == requirement.id,
                    AIMatch.listing_id == listing.id
                )
                existing_res = await db.execute(existing_stmt)
                match = existing_res.scalars().first()

                if match:
                    match.compatibility_score = total_score
                    match.score_breakdown = breakdown
                    match.explanation = explanation
                else:
                    match = AIMatch(
                        requirement_id=requirement.id,
                        listing_id=listing.id,
                        compatibility_score=total_score,
                        score_breakdown=breakdown,
                        explanation=explanation
                    )
                    db.add(match)
                created_matches.append(match)

        await db.commit()
        return created_matches

    @classmethod
    async def match_listing_to_requirements(
        cls,
        db: AsyncSession,
        listing: Listing
    ) -> List[AIMatch]:
        """
        Direction B: Find compatible active requirements when a new listing is published.
        Strictly enforces transaction and category separation.
        """
        query = select(Requirement).where(
            Requirement.transaction_type == listing.transaction_type,
            Requirement.asset_category == listing.asset_category,
            Requirement.status == RequirementStatus.ACTIVE,
            Requirement.user_id != listing.user_id
        )

        if listing.transaction_type in [TransactionType.RENT, TransactionType.LEASE] and listing.rental_period:
            query = query.where(Requirement.rental_period == listing.rental_period)

        result = await db.execute(query)
        candidate_requirements = result.scalars().all()

        created_matches: List[AIMatch] = []

        for req in candidate_requirements:
            loc_score = cls.calculate_location_score(
                req.preferred_state,
                req.preferred_city,
                req.preferred_neighbourhoods,
                listing.state,
                listing.city,
                listing.neighbourhood
            )
            if loc_score == 0:
                continue

            budg_score = cls.calculate_budget_score(
                float(req.min_budget) if req.min_budget else 0.0,
                float(req.max_budget),
                float(listing.price)
            )
            if budg_score == 0:
                continue

            specs_score = cls.calculate_specs_score(
                listing.asset_category,
                req.criteria or {},
                listing.attributes or {}
            )

            total_score = round(
                (budg_score * 0.35) + (loc_score * 0.35) + (specs_score * 0.30),
                1
            )

            if total_score >= 50.0:
                breakdown = {
                    "budget_score": budg_score,
                    "location_score": loc_score,
                    "specs_score": specs_score
                }
                explanation = cls.generate_explanation(req, listing, total_score, breakdown)

                existing_stmt = select(AIMatch).where(
                    AIMatch.requirement_id == req.id,
                    AIMatch.listing_id == listing.id
                )
                existing_res = await db.execute(existing_stmt)
                match = existing_res.scalars().first()

                if match:
                    match.compatibility_score = total_score
                    match.score_breakdown = breakdown
                    match.explanation = explanation
                else:
                    match = AIMatch(
                        requirement_id=req.id,
                        listing_id=listing.id,
                        compatibility_score=total_score,
                        score_breakdown=breakdown,
                        explanation=explanation
                    )
                    db.add(match)
                created_matches.append(match)

        await db.commit()
        return created_matches
