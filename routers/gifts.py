from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta
from dateutil import parser
import httpx
import os

router = APIRouter()
templates = Jinja2Templates(directory="views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3003/api")
ADMIN_TG_ID = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "your_admin_token")


@router.get("/gifts", response_class=HTMLResponse)
async def gifts_page(request: Request):
    gifts_data = []
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_BASE_URL}/gifts/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            response.raise_for_status()
            gifts_data = response.json()
            for gift in gifts_data:
                created = gift.get("created_at")
                if created:
                    try:
                        dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                        gift["created_at_human"] = dt.strftime('%d.%m.%Y %H:%M')
                    except Exception:
                        gift["created_at_human"] = created
                else:
                    gift["created_at_human"] = "—"
        except Exception as e:
            print(f"[ERROR] Не удалось получить подарки: {e}")

    tariffs_data = []
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{API_BASE_URL}/tariffs/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            resp.raise_for_status()
            tariffs_data = resp.json()
        except Exception as e:
            print(f"[ERROR] Не удалось получить тарифы: {e}")

    return templates.TemplateResponse("gifts.html", {
        "request": request,
        "gifts": gifts_data,
        "tariffs": tariffs_data,
        "tg_id": ADMIN_TG_ID,     
        "token": ADMIN_TOKEN      
    })


@router.patch("/gifts/{gift_id}")
async def patch_gift(gift_id: str, request: Request):
    try:
        payload = await request.json()
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{API_BASE_URL}/gifts/{gift_id}",
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
        print(f"[ERROR] Ошибка при обновлении подарка {gift_id}: {e}")
        return JSONResponse(status_code=500, content={"error": "Update failed"})


@router.delete("/gifts/{gift_id}")
async def delete_gift(gift_id: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{API_BASE_URL}/gifts/{gift_id}",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
        response.raise_for_status()
        return JSONResponse(content={"success": True})
    except Exception as e:
        print(f"[ERROR] Ошибка при удалении подарка {gift_id}: {e}")
        return JSONResponse(status_code=500, content={"error": "Delete failed"})


def make_naive(dt: datetime) -> datetime:
    if dt and dt.tzinfo:
        return dt.replace(tzinfo=None)
    return dt


@router.post("/gifts")
async def create_gift(request: Request):
    try:
        payload = await request.json()
        expiry_raw = payload.get("expiry_time")
        if expiry_raw:
            dt = parser.parse(expiry_raw)
            if dt.tzinfo:
                dt = dt.replace(tzinfo=None)
            payload["expiry_time"] = dt.isoformat(sep=' ')
        else:
            payload["expiry_time"] = (datetime.utcnow() + timedelta(days=30)).isoformat(sep=' ')
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/gifts/",
                params={"tg_id": ADMIN_TG_ID},
                headers={
                    "X-Token": ADMIN_TOKEN,
                    "Content-Type": "application/json"
                },
                json=payload
            )
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except Exception as e:
        print(f"[ERROR] Ошибка при создании подарка: {e}")
        return JSONResponse(status_code=500, content={"error": "Create failed"})