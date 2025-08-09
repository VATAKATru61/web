from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import httpx
import os

router = APIRouter()
templates = Jinja2Templates(directory="views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")
ADMIN_TG_ID = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "your_admin_token")

@router.get("/payments", response_class=HTMLResponse)
async def payments_view(request: Request):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{API_BASE_URL}/payments/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            payments = resp.json() if resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] payments: {e}")
            payments = []
    return templates.TemplateResponse("payments.html", {"request": request, "payments": payments})