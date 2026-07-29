from fastapi import APIRouter, HTTPException, Path
from app.core.database import supabase

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/{user_id}")
async def get_notifications(user_id: str = Path(...)):
    try:
        res = supabase.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
        return {"notifications": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/read/{notification_id}")
async def mark_read(notification_id: str = Path(...)):
    try:
        res = supabase.table("notifications").update({
            "read_at": "now()"
        }).eq("id", notification_id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/read-all/{user_id}")
async def mark_all_read(user_id: str = Path(...)):
    try:
        res = supabase.table("notifications").update({
            "read_at": "now()"
        }).eq("user_id", user_id).is_("read_at", "null").execute()
        return {"status": "success", "updated": len(res.data) if res.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
