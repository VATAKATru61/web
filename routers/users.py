from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import httpx
import os

router = APIRouter()
templates = Jinja2Templates(directory="views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3003/api")
ADMIN_TG_ID = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "your_admin_token")


def format_dt(dt):
    if not dt:
        return None
    if isinstance(dt, str):
        return dt
    return dt.strftime("%d.%m.%Y %H:%M")


@router.get("/users", response_class=HTMLResponse)
async def users_page(request: Request):
    users = []

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_BASE_URL}/users/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            response.raise_for_status()
            users = response.json()
        except Exception as e:
            print(f"[ERROR] Не удалось получить пользователей: {e}")

    return templates.TemplateResponse("users.html", {
        "request": request,
        "users": users,
        "total_users": len(users),
        "token": ADMIN_TOKEN,
        "api_base_url": API_BASE_URL,
        "admin_tg_id": ADMIN_TG_ID,
    })


@router.get("/users/{tg_id}", response_class=HTMLResponse)
async def user_detail_page(request: Request, tg_id: int):
    user = None
    payments = []
    subscriptions = []

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_BASE_URL}/users/{tg_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            response.raise_for_status()
            user = response.json()
            user['created_at'] = format_dt(user.get('created_at'))
            user['last_active'] = format_dt(user.get('updated_at'))
        except Exception as e:
            print(f"[ERROR] Не удалось получить пользователя {tg_id}: {e}")

        try:
            payments_response = await client.get(
                f"{API_BASE_URL}/payments/by_tg_id/{tg_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={
                    "X-Token": ADMIN_TOKEN
                },
                timeout=10
            )
            payments_response.raise_for_status()
            payments = payments_response.json() or []
        except Exception as e:
            print(f"[ERROR] Не удалось получить платежи пользователя {tg_id}: {e}")

        try:
            subs_response = await client.get(
                f"{API_BASE_URL}/keys/all/{tg_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={
                    "X-Token": ADMIN_TOKEN
                },
                timeout=10
            )
            subs_response.raise_for_status()
            subs_data = subs_response.json()
            subscriptions = subs_data if subs_data else []
        except Exception as e:
            print(f"[ERROR] Не удалось получить подписки пользователя {tg_id}: {e}")

        gifts = []
        try:
            gifts_response = await client.get(
                f"{API_BASE_URL}/gifts/by_tg_id/{tg_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={
                    "X-Token": ADMIN_TOKEN
                },
                timeout=10
            )
            gifts_response.raise_for_status()
            gifts_data = gifts_response.json()
            gifts = gifts_data if gifts_data else []
        except Exception as e:
            print(f"[ERROR] Не удалось получить подарки пользователя {tg_id}: {e}")

        referrals = []
        try:
            referrals_response = await client.get(
                f"{API_BASE_URL}/referrals/all/{tg_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={
                    "X-Token": ADMIN_TOKEN
                },
                timeout=10
            )
            referrals_response.raise_for_status()
            referrals_data = referrals_response.json()
            referrals = referrals_data if referrals_data else []
        except Exception as e:
            print(f"[ERROR] Не удалось получить рефералов пользователя {tg_id}: {e}")

    if not user:
        return HTMLResponse(content="Пользователь не найден", status_code=404)

    return templates.TemplateResponse("user_detail.html", {
        "request": request,
        "user": user,
        "payments": payments,
        "subscriptions": subscriptions,
        "referrals": referrals,
        "gifts": gifts,
        "token": ADMIN_TOKEN,
        "api_base_url": API_BASE_URL,
        "admin_tg_id": ADMIN_TG_ID,
    })


@router.patch("/users/{tg_id}")
async def patch_user(tg_id: int, request: Request):
    try:
        payload = await request.json()
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{API_BASE_URL}/users/{tg_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={
                    "X-Token": ADMIN_TOKEN,
                    "Content-Type": "application/json"
                },
                json=payload
            )
        response.raise_for_status()
        return JSONResponse(content={"success": True})
    except Exception as e:
        print(f"[ERROR] Ошибка при обновлении пользователя {tg_id}: {e}")
        return JSONResponse(status_code=500, content={"error": "Update failed"})


@router.delete("/users/{tg_id}")
async def delete_user(tg_id: int):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{API_BASE_URL}/users/{tg_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
        response.raise_for_status()
        return JSONResponse(content={"success": True})
    except Exception as e:
        print(f"[ERROR] Ошибка при удалении пользователя {tg_id}: {e}")
        return JSONResponse(status_code=500, content={"error": "Delete failed"})
