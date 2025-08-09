from fastapi import APIRouter, Request, Path, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime
import httpx
import os

router = APIRouter()
templates = Jinja2Templates(directory="views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3003/api")
ADMIN_TG_ID = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "your_admin_token")


@router.get("/keys", response_class=HTMLResponse)
async def keys_page(request: Request):
    total = 0
    keys_data = []

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_BASE_URL}/keys/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            response.raise_for_status()
            keys_data = response.json()
            total = len(keys_data)

            for key in keys_data:
                expiry_raw = key.get("expiry_time")
                if isinstance(expiry_raw, (int, float)):
                    key["expiry_date"] = datetime.fromtimestamp(expiry_raw / 1000).strftime("%Y-%m-%d")
                else:
                    key["expiry_date"] = None

                if key['expiry_time']:
                    key['expiry_time_human'] = datetime.utcfromtimestamp(key['expiry_time'] // 1000).strftime('%d.%m.%Y %H:%M')
                else:
                    key['expiry_time_human'] = '—'

        except Exception as e:
            print(f"[ERROR] Не удалось получить ключи: {e}")

    return templates.TemplateResponse("keys.html", {
        "request": request,
        "total_keys": total,
        "keys": keys_data,
        "tg_id": ADMIN_TG_ID,
        "token": ADMIN_TOKEN
    })


@router.patch("/keys/edit/by_email/{email}")
async def edit_key_by_email(
    email: str = Path(..., description="Email клиента"),
    request: Request = None,
    body: dict = Body(...)
):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.patch(
                f"{API_BASE_URL}/keys/edit/by_email/{email}",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN, "Content-Type": "application/json"},
                json=body,
                timeout=10
            )
            return JSONResponse(status_code=resp.status_code, content=resp.json())
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": f"Ошибка при обновлении ключа: {e}"})


@router.delete("/keys/by_email/{email}")
async def delete_key_by_email(
    email: str = Path(..., description="Email клиента"),
):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.delete(
                f"{API_BASE_URL}/keys/by_email/{email}",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            return JSONResponse(status_code=resp.status_code, content=resp.json() or {})
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=e.response.status_code, content=e.response.json())
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": f"Ошибка при удалении ключа: {e}"})
