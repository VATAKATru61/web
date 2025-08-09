from fastapi import APIRouter, Request, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import httpx, os

router = APIRouter()
templates = Jinja2Templates(directory="app/views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3003/api")
ADMIN_TG_ID   = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN   = os.getenv("ADMIN_TOKEN", "your_admin_token")


@router.get("/servers", response_class=HTMLResponse)
async def servers_page(request: Request):
    async with httpx.AsyncClient() as client:
        try:
            r1 = await client.get(
                f"{API_BASE_URL}/servers/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            r1.raise_for_status()
            servers = r1.json()
        except Exception as e:
            print(f"[ERROR] GET /servers: {e}")
            servers = []

        try:
            r2 = await client.get(
                f"{API_BASE_URL}/tariffs/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN},
                timeout=10
            )
            r2.raise_for_status()
            tariffs = r2.json()
            group_codes = sorted({t.get("group_code") or "" for t in tariffs})
        except Exception as e:
            print(f"[ERROR] GET /tariffs: {e}")
            group_codes = []

    return templates.TemplateResponse("servers.html", {
        "request":       request,
        "servers":       servers,
        "total_servers": len(servers),
        "group_codes":   group_codes,
        "token":         ADMIN_TOKEN,
        "tg_id":         ADMIN_TG_ID,
    })


@router.post("/servers")
async def create_server(data: dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{API_BASE_URL}/servers/",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                json=data,
                timeout=10
            )
            resp.raise_for_status()
            return JSONResponse(status_code=200, content=resp.json())
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})


@router.patch("/servers/{server_name}")
async def patch_server(server_name: str, data: dict = Body(...)):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.patch(
                f"{API_BASE_URL}/servers/{server_name}",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                json=data,
                timeout=10
            )
            resp.raise_for_status()
            return JSONResponse(status_code=200, content=resp.json())
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})


@router.delete("/servers/{server_name}")
async def delete_server(server_name: str):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.delete(
                f"{API_BASE_URL}/servers/{server_name}",
                headers={"X-Token": ADMIN_TOKEN},
                params={"tg_id": ADMIN_TG_ID},
                timeout=10
            )
            resp.raise_for_status()
            return JSONResponse(status_code=200, content={"status": "deleted"})
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=e.response.status_code, content={"error": e.response.text})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})