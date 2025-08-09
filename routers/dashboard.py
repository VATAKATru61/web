from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime, date, timedelta
import httpx
import os

router = APIRouter()
templates = Jinja2Templates(directory="app/views")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")
ADMIN_TG_ID   = os.getenv("ADMIN_TG_ID", "0")
ADMIN_TOKEN   = os.getenv("ADMIN_TOKEN", "your_admin_token")

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_view(request: Request):
    stats = {}
    async with httpx.AsyncClient() as client:
        try:
            users_resp = await client.get(
                f"{API_BASE_URL}/users/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            users = users_resp.json() if users_resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] users: {e}")
            users = []
        stats['total_users'] = len(users)
        stats['users_today'] = sum(1 for u in users if u.get('created_at', '').startswith(str(date.today())))

        try:
            payments_resp = await client.get(
                f"{API_BASE_URL}/payments/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            payments = payments_resp.json() if payments_resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] payments: {e}")
            payments = []
        stats['total_payments'] = len(payments)
        stats['payments_today'] = sum(1 for p in payments if p.get('created_at', '').startswith(str(date.today())))
        stats['payments_sum'] = sum(float(p.get('amount', 0)) for p in payments)
        stats['payments_sum_today'] = sum(float(p.get('amount', 0)) for p in payments if p.get('created_at', '').startswith(str(date.today())))

        try:
            subs_resp = await client.get(
                f"{API_BASE_URL}/keys/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            subs = subs_resp.json() if subs_resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] subs: {e}")
            subs = []
        stats['total_subs'] = len(subs)
        now = datetime.utcnow().timestamp()
        stats['expired_subs'] = sum(1 for s in subs if s.get('expiry_time', 0) and float(s['expiry_time']) < now)

        try:
            refs_resp = await client.get(
                f"{API_BASE_URL}/referrals/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            refs = refs_resp.json() if refs_resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] refs: {e}")
            refs = []
        stats['total_refs'] = len(refs)
        stats['refs_today'] = sum(
            1 for r in refs if r.get('created_at', '').startswith(str(date.today()))
        )

        try:
            servers_resp = await client.get(
                f"{API_BASE_URL}/servers/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            servers = servers_resp.json() if servers_resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] servers: {e}")
            servers = []

        stats['servers_used'] = sum(1 for s in servers if s.get('enabled'))
        stats['servers_available'] = sum(1 for s in servers if s.get('enabled') and (s.get('max_keys') or 0) > 0)
        stats['servers_disabled'] = sum(1 for s in servers if not s.get('enabled'))

        user_ids_with_subs = set(s.get('tg_id') for s in subs)
        stats['users_without_subs'] = sum(1 for u in users if u.get('tg_id') not in user_ids_with_subs)

        today = datetime.utcnow().date()
        last_30_days = [(today - timedelta(days=i)).isoformat() for i in reversed(range(30))]

        users_by_date = {d: 0 for d in last_30_days}
        for u in users:
            reg_date = u.get('created_at', '')[:10]
            if reg_date in users_by_date:
                users_by_date[reg_date] += 1
        stats['users_growth_month'] = list(users_by_date.values())
        stats['last_30_days'] = last_30_days

        subs_by_date = {d: 0 for d in last_30_days}
        for s in subs:
            created = s.get('created_at')
            sub_date = None
            if created:
                try:
                    if isinstance(created, (int, float)):
                        sub_date = datetime.utcfromtimestamp(float(created) / 1000).date().isoformat()
                    elif isinstance(created, str):
                        if len(created) >= 10 and created[:10].count('-') == 2:
                            sub_date = created[:10]
                        else:
                            sub_date = datetime.utcfromtimestamp(float(created) / 1000).date().isoformat()
                except Exception:
                    sub_date = None
            if sub_date and sub_date in subs_by_date:
                subs_by_date[sub_date] += 1
        stats['subs_growth_month'] = list(subs_by_date.values())

        try:
            gifts_resp = await client.get(
                f"{API_BASE_URL}/gifts/",
                params={"tg_id": ADMIN_TG_ID},
                headers={"X-Token": ADMIN_TOKEN}
            )
            gifts = gifts_resp.json() if gifts_resp.status_code == 200 else []
        except Exception as e:
            print(f"[ERROR] gifts: {e}")
            gifts = []
        stats['total_gifts'] = len(gifts)
        stats['gifts_today'] = sum(1 for g in gifts if g.get('created_at', '').startswith(str(date.today())))
        stats['gifts_used'] = sum(1 for g in gifts if g.get('is_used'))
        stats['gifts_unlimited'] = sum(1 for g in gifts if g.get('is_unlimited'))

    for key in [
        'total_users', 'users_today', 'total_payments', 'payments_today', 'payments_sum',
        'total_subs', 'expired_subs', 'total_refs', 'users_without_subs'
    ]:
        if key not in stats or stats[key] is None:
            stats[key] = 0

    return templates.TemplateResponse("dashboard.html", {"request": request, "stats": stats})
