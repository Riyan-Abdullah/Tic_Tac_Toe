from fastapi import APIRouter, HTTPException, Path, Query
from app.core.database import supabase

router = APIRouter(prefix="/admin", tags=["Admin"])

async def check_admin(user_id: str):
    res = supabase.table("admins").select("*").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=403, detail="Forbidden. Admin access required.")

@router.get("/dashboard")
async def get_dashboard_stats(user_id: str = Query(...)):
    await check_admin(user_id)
    try:
        # Get basic platform stats
        users_count = supabase.table("profiles").select("id", count="exact").execute().count
        matches_count = supabase.table("match_history").select("id", count="exact").execute().count
        tournaments_count = supabase.table("tournaments").select("id", count="exact").execute().count
        reports_count = supabase.table("reports").select("id", count="exact").eq("status", "pending").execute().count
        
        return {
            "total_users": users_count,
            "total_matches": matches_count,
            "total_tournaments": tournaments_count,
            "pending_reports": reports_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
async def get_reports(user_id: str = Query(...)):
    await check_admin(user_id)
    try:
        res = supabase.table("reports").select(
            "*, reporter:profiles!reports_reporter_id_fkey(username), reported:profiles!reports_reported_id_fkey(username)"
        ).order("created_at", desc=True).execute()
        return {"reports": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/{report_id}/resolve")
async def resolve_report(report_id: str = Path(...), user_id: str = Query(...)):
    await check_admin(user_id)
    try:
        res = supabase.table("reports").update({"status": "resolved"}).eq("id", report_id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
