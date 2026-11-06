import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_otp_flow_and_onboarding(client: AsyncClient):
    test_email = "test.investor.prime@propertyhub.ng"
    
    # 1. Initiate Signup
    res1 = await client.post("/api/v1/auth/signup-initiate", json={
        "email": test_email,
        "password": "SecurePassword@2026"
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "success"
    verification_token = data1.get("verification_token")
    assert verification_token is not None

    # 2. Complete Onboarding directly
    res3 = await client.post("/api/v1/auth/onboarding-complete", json={
        "email": test_email,
        "verification_token": verification_token,
        "user_type": "seller",
        "entity_type": "developer",
        "asset_interests": ["residential", "land"],
        "company_name": "Lekki Sovereign Developments Ltd",
        "country_code": "+234",
        "phone_number": "8039998877",
        "country": "Nigeria",
        "state": "Lagos",
        "city": "Lekki"
    })
    assert res3.status_code == 200
    data3 = res3.json()
    assert "access_token" in data3
    assert data3["user"]["email"] == test_email
    assert data3["user"]["company_name"] == "Lekki Sovereign Developments Ltd"
    assert data3["user"]["is_email_verified"] is True

@pytest.mark.asyncio
async def test_investment_opportunities(client: AsyncClient):
    res = await client.get("/api/v1/investments/")
    assert res.status_code == 200
    items = res.json()["data"]
    assert len(items) >= 3
    # Check financial parameters
    first = items[0]
    assert "target_amount" in first
    assert "projected_roi_percentage" in first
    assert "tenure_months" in first
    assert "funding_progress_percentage" in first
