"""Authentication flow tests: register, login, refresh, me, protected routes."""
from httpx import AsyncClient


async def test_register_returns_token_pair(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "secretpass1"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["access_token"]
    assert data["refresh_token"]
    assert data["token_type"] == "bearer"


async def test_register_duplicate_email_conflict(client: AsyncClient) -> None:
    payload = {"name": "Bob", "email": "bob@example.com", "password": "secretpass1"}
    first = await client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201
    second = await client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


async def test_login_and_me(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Carol", "email": "carol@example.com", "password": "secretpass1"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "carol@example.com", "password": "secretpass1"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "carol@example.com"


async def test_update_profile_persists_fields(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Grace", "email": "grace@example.com", "password": "secretpass1"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "grace@example.com", "password": "secretpass1"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    updated = await client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={
            "name": "Grace Hopper",
            "headline": "Senior Backend Engineer",
            "bio": "I build fast APIs.",
            "location": "Bengaluru, India",
            "skills": ["Python", "FastAPI", "PostgreSQL"],
            "experience": 8,
        },
    )
    assert updated.status_code == 200
    body = updated.json()
    assert body["name"] == "Grace Hopper"
    assert body["headline"] == "Senior Backend Engineer"
    assert body["bio"] == "I build fast APIs."
    assert body["location"] == "Bengaluru, India"
    assert body["skills"] == ["Python", "FastAPI", "PostgreSQL"]
    assert body["experience"] == 8

    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["name"] == "Grace Hopper"
    assert me.json()["skills"] == ["Python", "FastAPI", "PostgreSQL"]


async def test_login_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Dave", "email": "dave@example.com", "password": "secretpass1"},
    )
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "dave@example.com", "password": "wrongpass"},
    )
    assert resp.status_code == 401


async def test_refresh_rotates_tokens(client: AsyncClient) -> None:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"name": "Eve", "email": "eve@example.com", "password": "secretpass1"},
    )
    refresh = reg.json()["refresh_token"]
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert resp.status_code == 200
    assert resp.json()["access_token"]


async def test_protected_route_rejects_bad_token(client: AsyncClient) -> None:
    resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not-a-valid-token"},
    )
    assert resp.status_code == 401


async def test_register_short_password_rejected(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"name": "Frank", "email": "frank@example.com", "password": "short"},
    )
    assert resp.status_code == 422