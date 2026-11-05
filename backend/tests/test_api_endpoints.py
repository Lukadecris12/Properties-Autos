import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

@pytest.mark.asyncio
async def test_auth_workflow(client: AsyncClient):
    # 1. Register a user
    register_payload = {
        "email": "testuser@propertyhub.ng",
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "User",
        "country": "Nigeria",
        "state": "Lagos",
        "city": "Lagos",
        "selected_role": "buyer"
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()["data"]
    assert user_data["email"] == "testuser@propertyhub.ng"
    assert user_data["active_mode"] == "buyer"

    # 2. Login
    login_data = {
        "username": "testuser@propertyhub.ng",
        "password": "Password123!"
    }
    login_res = await client.post("/api/v1/auth/login", data=login_data)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # 3. Get /me
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["data"]["email"] == "testuser@propertyhub.ng"

    # 4. Switch account mode from buyer to seller
    switch_res = await client.post(
        "/api/v1/auth/switch-mode",
        json={"mode": "seller"},
        headers=headers
    )
    assert switch_res.status_code == 200
    assert switch_res.json()["data"]["active_mode"] == "seller"

@pytest.mark.asyncio
async def test_listings_api_and_pricing_validation(client: AsyncClient):
    # 1. Login user
    reg_payload = {
        "email": "agent_test@propertyhub.ng",
        "password": "Password123!",
        "first_name": "Agent",
        "last_name": "Tester",
        "selected_role": "agent"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)
    login_res = await client.post("/api/v1/auth/login", data={"username": "agent_test@propertyhub.ng", "password": "Password123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Creating a RENT listing without rental_period must be REJECTED with 422
    invalid_rent_payload = {
        "title": "Invalid Apartment without rental period",
        "description": "This should fail validation because rental_period is missing",
        "transaction_type": "RENT",
        "asset_category": "RESIDENTIAL",
        "price": 2500000,
        "state": "Lagos",
        "city": "Lekki"
    }
    bad_res = await client.post("/api/v1/listings/", json=invalid_rent_payload, headers=headers)
    assert bad_res.status_code == 422

    # 3. Creating a valid SALE listing succeeds
    valid_sale_payload = {
        "title": "Valid Lekki Plot for Sale",
        "description": "500 sqm residential plot with excision title",
        "transaction_type": "SALE",
        "asset_category": "LAND",
        "price": 45000000,
        "state": "Lagos",
        "city": "Lekki",
        "attributes": {"land_size": 500, "land_unit": "sqm"}
    }
    good_res = await client.post("/api/v1/listings/", json=valid_sale_payload, headers=headers)
    assert good_res.status_code == 201
    listing_id = good_res.json()["data"]["id"]

    # 4. Search and verify
    search_res = await client.get("/api/v1/search/?transaction_type=SALE&asset_category=LAND")
    assert search_res.status_code == 200
    assert search_res.json()["total"] >= 1
