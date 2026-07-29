from fastapi import APIRouter, HTTPException, Path
from app.core.database import supabase

router = APIRouter(prefix="/achievements", tags=["Achievements"])

@router.get("/{user_id}")
async def get_achievements(user_id: str = Path(...)):
    try:
        # Get all achievements
        all_ach_res = supabase.table("achievements").select("*").execute()
        all_achievements = all_ach_res.data
        
        # Get user's unlocked achievements
        unlocked_res = supabase.table("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user_id).execute()
        unlocked_map = {row["achievement_id"]: row["unlocked_at"] for row in unlocked_res.data}
        
        results = []
        for ach in all_achievements:
            ach["unlocked"] = ach["id"] in unlocked_map
            ach["unlocked_at"] = unlocked_map.get(ach["id"])
            results.append(ach)
            
        return {"achievements": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
