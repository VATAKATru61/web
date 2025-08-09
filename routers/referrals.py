from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
import httpx
import os

router = APIRouter()
templates = Jinja2Templates(directory="views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")
ADMIN_TG_ID = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "your_admin_token")


@router.get("/referrals")
async def referrals_page(request: Request):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{API_BASE_URL}/referrals/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            referrals = resp.json() if resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] referrals: {e}")
            referrals = []
    return templates.TemplateResponse(
        "referrals.html",
        {
            "request": request,
            "referrals": referrals,
            "tg_id": ADMIN_TG_ID,
            "token": ADMIN_TOKEN
        }
    )


@router.delete("/referrals/one")
async def delete_referral_one(
    referrer_tg_id: int,
    referred_tg_id: int,
    tg_id: int,
    request: Request
):
    """
    Удаляет одну запись о реферале через внешний API.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.delete(
                f"{API_BASE_URL}/referrals/one",
                params={
                    "referrer_tg_id": referrer_tg_id,
                    "referred_tg_id": referred_tg_id,
                    "tg_id": tg_id
                },
                headers={"X-Token": ADMIN_TOKEN}
            )
            if resp.status_code == 200:
                return {"success": True}
            return {"success": False, "detail": resp.text}
        except Exception as e:
            return {"success": False, "detail": str(e)}


