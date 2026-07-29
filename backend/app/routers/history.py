from fastapi import APIRouter, HTTPException, Path, Query
from app.core.database import supabase
from typing import Optional

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/{user_id}")
async def get_history(
    user_id: str = Path(..., title="User ID"),
    limit: int = 50,
    offset: int = 0,
    mode: Optional[str] = None
):
    try:
        query = supabase.table("match_history").select(
            "id, player_x, player_o, winner_id, result, game_mode, difficulty, duration_seconds, moves, room_code, created_at, "
            "px:profiles!match_history_player_x_fkey(username, avatar), "
            "po:profiles!match_history_player_o_fkey(username, avatar)"
        ).or_(f"player_x.eq.{user_id},player_o.eq.{user_id}")
        
        if mode:
            query = query.eq("game_mode", mode)
            
        res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return {"history": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
