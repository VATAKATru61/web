from fastapi import APIRouter, Request, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import httpx, os

router = APIRouter()
templates = Jinja2Templates(directory="views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")
ADMIN_TG_ID   = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN   = os.getenv("ADMIN_TOKEN", "your_admin_token")


@router.get("/tariffs", response_class=HTMLResponse)
async def tariffs_page(request: Request):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{API_BASE_URL}/tariffs/",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                timeout=10
            )
            resp.raise_for_status()
            tariffs = resp.json()
        except Exception as e:
            print(f"[ERROR] get tariffs: {e}")
            tariffs = []
    return templates.TemplateResponse("tariffs.html", {
        "request": request,
        "tariffs": [
            {**t, 'subgroup_title': t.get('subgroup_title') if t.get('subgroup_title') is not None else '—'}
            for t in tariffs
        ],
        "total_tariffs": len(tariffs),
        "tg_id": ADMIN_TG_ID,
        "token": ADMIN_TOKEN,
    })


@router.post("/tariffs")
async def create_tariff(data: dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{API_BASE_URL}/tariffs/",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                json=data,
                timeout=10
            )
            resp.raise_for_status()
            return JSONResponse(status_code=201, content={"status": "created"})
        except httpx.HTTPStatusError as e:
            return JSONResponse(e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})


@router.patch("/tariffs/{tariff_name}")
async def patch_tariff(tariff_name: str, data: dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.patch(
                f"{API_BASE_URL}/tariffs/{tariff_name}",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                json=data,
                timeout=10
            )
            resp.raise_for_status()
            return JSONResponse(status_code=200, content={"status": "ok"})
        except httpx.HTTPStatusError as e:
            return JSONResponse(e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})


@router.delete("/tariffs/{name}")
async def delete_tariff(name: str):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.delete(
                f"{API_BASE_URL}/tariffs/{name}",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                timeout=10
            )
            resp.raise_for_status()
            return JSONResponse(status_code=200, content={"status": "deleted"})
        except httpx.HTTPStatusError as e:
            return JSONResponse(e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})
