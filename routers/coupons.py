from fastapi import APIRouter, Request, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import httpx
import os

router = APIRouter()
templates = Jinja2Templates(directory="app/views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")
ADMIN_TG_ID   = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN   = os.getenv("ADMIN_TOKEN", "your_admin_token")

@router.get("/coupons", response_class=HTMLResponse)
async def coupons_page(request: Request):
    total_coupons = 0
    coupons_data = []
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_BASE_URL}/coupons/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            response.raise_for_status()
            coupons_data = response.json()
            total_coupons = len(coupons_data)
        except Exception as e:
            print(f"[ERROR] Не удалось получить купоны: {e}")

    return templates.TemplateResponse("coupons.html", {
        "request": request,
        "coupons": coupons_data,
        "total_coupons": total_coupons,
        "token": ADMIN_TOKEN,
        "tg_id": ADMIN_TG_ID,
    })

@router.post("/coupons")
async def create_coupon(data: dict = Body(...)):

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/coupons/",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                json=data,
                timeout=10
            )
            response.raise_for_status()
            created = response.json()
            return JSONResponse(status_code=200, content=created)
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})

@router.patch("/coupons/{code}")
async def patch_coupon(code: str, data: dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{API_BASE_URL}/coupons/{code}",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                json=data,
                timeout=10
            )
            response.raise_for_status()
            updated = response.json()
            return JSONResponse(status_code=200, content=updated)
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})

@router.delete("/coupons/{code}")
async def delete_coupon(code: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(
                f"{API_BASE_URL}/coupons/{code}",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                timeout=10
            )
            response.raise_for_status()
            return JSONResponse(status_code=200, content={"status": "deleted"})
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})
