from fastapi import APIRouter, HTTPException, Path, Body
from app.core.database import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    sound_volume: Optional[int] = None
    music_volume: Optional[int] = None
    notifications_enabled: Optional[bool] = None
    language: Optional[str] = None
    privacy: Optional[str] = None

@router.get("/{user_id}")
async def get_settings(user_id: str = Path(...)):
    try:
        res = supabase.table("settings").select("*").eq("user_id", user_id).execute()
        if not res.data:
            # Create default if not exists
            new_res = supabase.table("settings").insert({"user_id": user_id}).execute()
            return new_res.data[0]
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}")
async def update_settings(user_id: str = Path(...), req: SettingsUpdate = Body(...)):
    try:
        update_data = {k: v for k, v in req.model_dump().items() if v is not None}
        if not update_data:
            return {"status": "success"}
            
        update_data["updated_at"] = "now()"
        
        res = supabase.table("settings").update(update_data).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Settings not found")
        return {"status": "success", "settings": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
